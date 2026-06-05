import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import Logo from '../../components/Logo';

// Entrevista guiada por IA — Slices 1 a 4.
// Página pública acessada pelo respondente via token (mesmo token dos forms).
// Faz, uma a uma, as perguntas derivadas do roteiro (Agente 1/3). O respondente
// responde por TEXTO, por VOZ (Web Speech API, grátis) ou, em devices sem Web
// Speech (iOS), gravando áudio que o servidor transcreve via Whisper. Após cada
// resposta, uma análise (1 chamada) decide um follow-up E detecta quais
// perguntas seguintes já foram respondidas — que aparecem reformuladas, sem
// repetir o que a pessoa já disse.

const TIPO_BY_PAPEL = {
  socios: 'entrevista_socios',
  colaboradores: 'entrevista_colaboradores',
  clientes: 'entrevista_cliente',
};

const PAPEL_LABEL = {
  socios: 'sócio(a)',
  colaboradores: 'colaborador(a)',
  clientes: 'cliente',
};

const MIN_PARA_ANALISE = 40;     // só analisa respostas com algum corpo
const MAX_FOLLOWUPS_TOTAL = 4;   // teto global de aprofundamentos (controle de tempo)

export default function EntrevistaPage() {
  const router = useRouter();
  const token = (router.query.token || '').toString();

  const [fase, setFase] = useState('loading'); // loading | erro | intro | entrevista | enviando | concluido
  const [erro, setErro] = useState(null);
  const [respondente, setRespondente] = useState(null);
  const [projetoMeta, setProjetoMeta] = useState(null);
  const [perguntas, setPerguntas] = useState([]);
  const [idx, setIdx] = useState(0);
  const [respostas, setRespostas] = useState({});
  const [followups, setFollowups] = useState({});   // { [idx]: { pergunta, resposta } }
  const [coberturas, setCoberturas] = useState({}); // { [idx]: { reconhecimento } } — já respondida adiantado
  const [analisados, setAnalisados] = useState({}); // { [idx]: true } — análise já feita
  const [subAtivo, setSubAtivo] = useState(false);  // exibindo follow-up da pergunta atual
  const [carregando, setCarregando] = useState(false);
  const [consentido, setConsentido] = useState(false);

  const storageKey = token ? `entrevista:${token}` : null;

  // ── Carrega token + sessão (servidor) + perguntas ──────────────────
  useEffect(() => {
    if (!router.isReady || !token) return;
    let active = true;

    (async () => {
      try {
        const rt = await fetch(`/api/respondentes/by-token?token=${encodeURIComponent(token)}`);
        if (!rt.ok) {
          const e = await rt.json().catch(() => ({}));
          if (!active) return;
          setErro(rt.status === 410
            ? 'Este link expirou. Solicite um novo convite.'
            : (e.mensagem || e.error || 'Link inválido. Verifique o endereço recebido.'));
          setFase('erro');
          return;
        }
        const rj = await rt.json();
        const r = rj.respondente || rj;
        if (!TIPO_BY_PAPEL[r.papel]) {
          if (!active) return;
          setErro('Este tipo de convite não comporta entrevista.');
          setFase('erro');
          return;
        }
        if (active) {
          setRespondente(r);
          setProjetoMeta(rj.projeto || { nome_marca: r.projeto_nome || 'a marca' });
        }

        // Fonte do estado: o SERVIDOR guarda perguntas + progresso (exceto o
        // conteúdo de colaboradores, anônimo). O sessionStorage é cache de
        // device / fallback offline e p/ retomar respostas anônimas.
        let local = null;
        try { local = storageKey && JSON.parse(sessionStorage.getItem(storageKey) || 'null'); } catch { /* ignora */ }

        let serverSession = null;
        try {
          const sr = await fetch(`/api/entrevista/session?token=${encodeURIComponent(token)}`);
          if (sr.ok) { const sj = await sr.json(); serverSession = sj.session || null; }
        } catch { /* offline ok */ }

        let pgs = null;
        if (serverSession?.perguntas?.length) pgs = serverSession.perguntas;
        else if (local?.perguntas?.length) pgs = local.perguntas;

        if (!pgs) {
          const qr = await fetch('/api/entrevista/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          });
          const qj = await qr.json();
          if (!qr.ok || !qj.success) {
            if (!active) return;
            setErro(qj.error || 'Não foi possível preparar as perguntas.');
            setFase('erro');
            return;
          }
          pgs = qj.perguntas || [];
          try {
            await fetch('/api/entrevista/session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token, perguntas: pgs, source: qj.source }),
            });
          } catch { /* offline ok */ }
        }
        if (!active) return;
        setPerguntas(pgs);

        // Restaura progresso: prefere o servidor (quando tem conteúdo), senão o cache local.
        const sp = serverSession?.progresso;
        const prog = (sp && (sp.respostas || sp.followups || sp.coberturas)) ? sp : (local || {});
        setRespostas(prog.respostas || {});
        setFollowups(prog.followups || {});
        setCoberturas(prog.coberturas || {});
        setAnalisados(local?.analisados || {});
        setIdx(Math.min(prog.idx || 0, pgs.length - 1));
        setFase('intro');
      } catch (err) {
        if (!active) return;
        setErro(err.message);
        setFase('erro');
      }
    })();

    return () => { active = false; };
  }, [router.isReady, token]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Persiste progresso no device (cache / fallback) ────────────────
  useEffect(() => {
    if (!storageKey || perguntas.length === 0) return;
    if (fase !== 'intro' && fase !== 'entrevista') return;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ idx, respostas, perguntas, followups, coberturas, analisados }));
    } catch { /* ignora */ }
  }, [idx, respostas, perguntas, followups, coberturas, analisados, fase, storageKey]);

  // ── Salva progresso no servidor a cada NAVEGAÇÃO (não a cada tecla) ─
  useEffect(() => {
    if (fase !== 'entrevista' || perguntas.length === 0 || !token) return;
    (async () => {
      try {
        await fetch('/api/entrevista/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, idx, respostas, followups, coberturas, status: 'em_andamento' }),
        });
      } catch { /* offline ok */ }
    })();
  }, [idx, subAtivo, fase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Acrescenta texto (vindo de voz) ao campo atual — base ou follow-up.
  const appendAoCampo = (txt) => {
    const limpo = (txt || '').trim();
    if (!limpo) return;
    if (subAtivo) {
      setFollowups((prev) => {
        const cur = prev[idx]?.resposta || '';
        const sep = cur && !/\s$/.test(cur) ? ' ' : '';
        return { ...prev, [idx]: { ...(prev[idx] || { pergunta: '' }), resposta: cur + sep + limpo } };
      });
    } else {
      setRespostas((prev) => {
        const cur = prev[idx] || '';
        const sep = cur && !/\s$/.test(cur) ? ' ' : '';
        return { ...prev, [idx]: cur + sep + limpo };
      });
    }
  };

  const setCampoAtual = (val) => {
    if (subAtivo) {
      setFollowups((prev) => ({ ...prev, [idx]: { ...(prev[idx] || { pergunta: '' }), resposta: val } }));
    } else {
      setRespostas((prev) => ({ ...prev, [idx]: val }));
    }
  };

  const total = perguntas.length;
  const ultimaBase = idx === total - 1;
  const coberturaAtual = !subAtivo ? coberturas[idx] : null;

  const irProxima = () => { if (idx < total - 1) setIdx(idx + 1); else enviar(); };

  const avancar = async () => {
    if (fase === 'enviando' || carregando) return;

    // Concluindo um follow-up → segue para a próxima base (ou envia).
    if (subAtivo) {
      setSubAtivo(false);
      irProxima();
      return;
    }

    // Se já existe follow-up gerado para esta pergunta, exibe-o.
    if (followups[idx]) {
      setSubAtivo(true);
      return;
    }

    const ans = (respostas[idx] || '').trim();

    // Analisa a resposta UMA vez (follow-up + cobertura das perguntas seguintes).
    // Não analisa perguntas que já vieram marcadas como cobertas.
    if (!analisados[idx] && !coberturas[idx] && ans.length >= MIN_PARA_ANALISE) {
      const proximas = [];
      for (let j = idx + 1; j < total; j++) {
        if (coberturas[j]) continue;
        if ((respostas[j] || '').trim()) continue;
        proximas.push({ i: j, pergunta: perguntas[j].pergunta });
      }
      setCarregando(true);
      try {
        const r = await fetch('/api/entrevista/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, pergunta: perguntas[idx]?.pergunta, hipotese: perguntas[idx]?.hipotese, resposta: ans, proximas }),
        });
        const j = await r.json();
        setAnalisados((prev) => ({ ...prev, [idx]: true }));

        if (Array.isArray(j?.cobertas) && j.cobertas.length) {
          setCoberturas((prev) => {
            const next = { ...prev };
            j.cobertas.forEach((c) => {
              if (typeof c.i === 'number' && c.i > idx && c.i < total) next[c.i] = { reconhecimento: c.reconhecimento || '' };
            });
            return next;
          });
        }

        if (j?.followup && Object.keys(followups).length < MAX_FOLLOWUPS_TOTAL) {
          setFollowups((prev) => ({ ...prev, [idx]: { pergunta: j.followup, resposta: '' } }));
          setSubAtivo(true);
          setCarregando(false);
          return;
        }
      } catch { /* segue sem análise */ }
      setCarregando(false);
    }

    irProxima();
  };

  const voltar = () => {
    if (carregando) return;
    if (subAtivo) { setSubAtivo(false); return; }
    setIdx((i) => Math.max(0, i - 1));
  };

  const enviar = async () => {
    setFase('enviando');
    const pares = [];
    perguntas.forEach((p, i) => {
      const ans = (respostas[i] || '').trim();
      if (!ans && coberturas[i]) {
        pares.push({ pergunta: p.pergunta, resposta: `(já abordada: ${coberturas[i].reconhecimento || 'coberta em outra resposta'})`, coberta: true });
      } else {
        pares.push({ pergunta: p.pergunta, resposta: ans || '(sem resposta)' });
      }
      const fu = followups[i];
      if (fu && (fu.resposta || '').trim()) {
        pares.push({ pergunta: fu.pergunta, resposta: fu.resposta.trim(), follow_up: true });
      }
    });
    const transcricao = pares
      .map((p) => `${p.follow_up ? '↳ ' : ''}P: ${p.pergunta}\nR: ${p.resposta || '(sem resposta)'}`)
      .join('\n\n');

    try {
      const res = await fetch('/api/formularios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          tipo: TIPO_BY_PAPEL[respondente.papel],
          respostas: {
            respondente: respondente.nome,
            transcricao,
            perguntas_respostas: pares,
            origem: 'entrevista_ia',
          },
        }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || 'Falha ao enviar');
      }
      try {
        await fetch('/api/entrevista/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, status: 'concluida' }),
        });
      } catch { /* offline ok */ }
      try { if (storageKey) sessionStorage.removeItem(storageKey); } catch { /* ignora */ }
      setFase('concluido');
    } catch (err) {
      setErro(err.message);
      setFase('erro');
    }
  };

  // ── Render ─────────────────────────────────────────────────────────
  const marca = projetoMeta?.nome_marca || 'a marca';

  if (fase === 'loading') {
    return <Shell><p style={txtSec}>Preparando sua entrevista…</p></Shell>;
  }

  if (fase === 'erro') {
    return (
      <Shell>
        <h2 style={{ marginTop: 0 }}>Não foi possível abrir a entrevista</h2>
        <p style={txtSec}>{erro}</p>
      </Shell>
    );
  }

  if (fase === 'concluido') {
    return (
      <Shell>
        <h2 style={{ marginTop: 0, color: 'var(--success, #34d399)' }}>Entrevista enviada 🙌</h2>
        <p style={txtSec}>
          Obrigado pelo seu tempo, {respondente?.nome?.split(' ')[0] || ''}. Suas respostas foram registradas
          e serão lidas com cuidado pela equipe.
        </p>
      </Shell>
    );
  }

  if (fase === 'intro') {
    return (
      <Shell wide>
        <h1 style={{ marginTop: 0, color: 'var(--accent-purple, #a78bfa)' }}>Conversa sobre {marca}</h1>
        <p style={txtSec}>
          Olá{respondente?.nome ? `, ${respondente.nome.split(' ')[0]}` : ''}! Vamos fazer uma conversa guiada,
          como {PAPEL_LABEL[respondente?.papel] || 'convidado'}, com {perguntas.length} perguntas. Leva cerca de
          15–25 minutos. Não há resposta certa — quanto mais honesto e concreto, melhor.
        </p>
        <div style={dica}>
          💡 Você pode <strong>digitar</strong> ou <strong>falar</strong>: toque em <strong>🎤 Falar</strong> e
          responda com a voz (ou use o microfone do teclado do seu celular).
        </div>
        <label style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', margin: '1.4rem 0', cursor: 'pointer', ...txtSec }}>
          <input type="checkbox" checked={consentido} onChange={(e) => setConsentido(e.target.checked)} style={{ marginTop: '0.2rem' }} />
          <span>Autorizo que minhas respostas sejam registradas e usadas, de forma confidencial, no diagnóstico de marca.</span>
        </label>
        <button className="btn-primary" disabled={!consentido} onClick={() => setFase('entrevista')} style={{ opacity: consentido ? 1 : 0.5 }}>
          {Object.keys(respostas).length > 0 ? 'Retomar entrevista' : 'Começar'}
        </button>
      </Shell>
    );
  }

  // fase === 'entrevista' | 'enviando'
  const enviando = fase === 'enviando';
  const tratadas = perguntas.filter((_, i) => (respostas[i] || '').trim().length > 0 || coberturas[i]).length;
  const perguntaAtual = subAtivo ? followups[idx]?.pergunta : perguntas[idx]?.pergunta;
  const valorAtual = subAtivo ? (followups[idx]?.resposta || '') : (respostas[idx] || '');
  const semResposta = !(respostas[idx] || '').trim();
  const labelAvancar = carregando ? 'Analisando resposta…'
    : enviando ? 'Enviando…'
    : (coberturaAtual && semResposta) ? (ultimaBase ? 'Pular e concluir' : 'Pular, já respondi →')
    : ultimaBase ? 'Concluir e enviar'
    : 'Próxima →';

  return (
    <Shell wide>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #9aa)' }}>Pergunta {idx + 1} de {total}</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #9aa)' }}>{tratadas} de {total}</span>
      </div>
      <div style={barraOut}>
        <div style={{ ...barraIn, width: `${Math.round(((idx + 1) / total) * 100)}%` }} />
      </div>

      {subAtivo && (
        <div style={{ ...dica, marginTop: '1rem', marginBottom: 0 }}>↳ Só um aprofundamento rápido:</div>
      )}
      {coberturaAtual && (
        <div style={{ ...dica, marginTop: '1rem', marginBottom: 0 }}>
          ↳ {coberturaAtual.reconhecimento || 'Você já tocou nisso em uma resposta anterior.'} Quer complementar, ou pode pular.
        </div>
      )}

      <h2 style={{ fontSize: '1.25rem', lineHeight: 1.4, margin: '1.2rem 0 0.8rem' }}>{perguntaAtual}</h2>

      <textarea
        className="form-input"
        value={valorAtual}
        onChange={(e) => setCampoAtual(e.target.value)}
        placeholder={coberturaAtual ? 'Se quiser, acrescente algo — ou pule.' : 'Escreva ou fale sua resposta…'}
        disabled={enviando}
        style={{ width: '100%', minHeight: '170px', resize: 'vertical', padding: '0.85rem', fontSize: '1rem', lineHeight: 1.5 }}
      />

      <div style={{ marginTop: '0.6rem' }}>
        <BotaoVoz key={`${idx}-${subAtivo}`} token={token} onAppend={appendAoCampo} disabled={enviando} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.6rem', marginTop: '1rem' }}>
        <button onClick={voltar} disabled={(idx === 0 && !subAtivo) || enviando || carregando} style={btnGhost((idx === 0 && !subAtivo) || enviando || carregando)}>
          ← Anterior
        </button>
        <button className="btn-primary" onClick={avancar} disabled={enviando || carregando}>
          {labelAvancar}
        </button>
      </div>
    </Shell>
  );
}

// ── Botão de voz: Web Speech (grátis) com fallback MediaRecorder→Whisper ──
function BotaoVoz({ token, onAppend, disabled }) {
  const [estado, setEstado] = useState('idle'); // idle | ouvindo | transcrevendo
  const recRef = useRef(null);
  const mrRef = useRef(null);
  const streamRef = useRef(null);

  const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

  const pararTudo = () => {
    try { recRef.current?.stop(); } catch { /* */ }
    try { if (mrRef.current?.state === 'recording') mrRef.current.stop(); } catch { /* */ }
  };

  useEffect(() => () => {
    pararTudo();
    try { streamRef.current?.getTracks().forEach((t) => t.stop()); } catch { /* */ }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleWebSpeech = () => {
    if (estado === 'ouvindo') { pararTudo(); return; }
    const rec = new SR();
    rec.lang = 'pt-BR';
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
      }
      if (final.trim()) onAppend(final);
    };
    rec.onerror = () => setEstado('idle');
    rec.onend = () => setEstado('idle');
    recRef.current = rec;
    try { rec.start(); setEstado('ouvindo'); } catch { setEstado('idle'); }
  };

  const toggleGravacao = async () => {
    if (estado === 'ouvindo') { pararTudo(); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream);
      const chunks = [];
      mr.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
      mr.onstop = async () => {
        try { stream.getTracks().forEach((t) => t.stop()); } catch { /* */ }
        const blob = new Blob(chunks, { type: mr.mimeType || 'audio/webm' });
        if (!blob.size) { setEstado('idle'); return; }
        setEstado('transcrevendo');
        try {
          const r = await fetch(`/api/entrevista/transcribe?token=${encodeURIComponent(token)}`, {
            method: 'POST',
            headers: { 'Content-Type': blob.type },
            body: blob,
          });
          const j = await r.json();
          if (j?.success && j.text) onAppend(j.text);
        } catch { /* */ }
        setEstado('idle');
      };
      mrRef.current = mr;
      mr.start();
      setEstado('ouvindo');
    } catch {
      setEstado('idle');
    }
  };

  const onClick = SR ? toggleWebSpeech : toggleGravacao;
  const label = estado === 'ouvindo' ? '⏹ Parar' : estado === 'transcrevendo' ? '⏳ Transcrevendo…' : '🎤 Falar';
  const ativo = estado === 'ouvindo';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || estado === 'transcrevendo'}
      style={{
        padding: '0.5rem 1rem',
        borderRadius: 8,
        border: `1px solid ${ativo ? 'rgba(239,68,68,0.6)' : 'rgba(167,139,250,0.4)'}`,
        background: ativo ? 'rgba(239,68,68,0.15)' : 'rgba(167,139,250,0.12)',
        color: ativo ? '#fca5a5' : '#c4b5fd',
        cursor: disabled ? 'default' : 'pointer',
        fontSize: '0.9rem',
      }}
    >
      {label}
    </button>
  );
}

// ── UI helpers ───────────────────────────────────────────────────────
function Shell({ children, wide }) {
  return (
    <>
      <Head><title>Espansione | Entrevista</title></Head>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem 1rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Logo size="md" showTagline={false} center />
        </div>
        <div className="glass-card" style={{ maxWidth: wide ? 720 : 560, width: '100%', padding: '2rem' }}>
          {children}
        </div>
      </div>
    </>
  );
}

const txtSec = { color: 'var(--text-secondary, #9aa)', lineHeight: 1.6 };
const dica = {
  fontSize: '0.9rem',
  color: 'var(--text-secondary, #9aa)',
  background: 'rgba(167,139,250,0.08)',
  border: '1px solid rgba(167,139,250,0.2)',
  borderRadius: 8,
  padding: '0.8rem 1rem',
  marginTop: '1rem',
};
const barraOut = { height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' };
const barraIn = { height: '100%', background: 'var(--accent-purple, #a78bfa)', transition: 'width 0.3s ease' };
const btnGhost = (disabled) => ({
  padding: '0.6rem 1rem',
  background: 'none',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 8,
  color: 'var(--text-secondary, #9aa)',
  cursor: disabled ? 'default' : 'pointer',
  opacity: disabled ? 0.4 : 1,
});
