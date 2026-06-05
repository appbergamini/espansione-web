import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Logo from '../../components/Logo';

// Entrevista guiada por IA — Slice 1.
// Página pública acessada pelo respondente via token (mesmo token dos forms).
// Faz, uma a uma, as perguntas derivadas do roteiro (Agente 1/3); o respondente
// responde por TEXTO — e pode usar o ditado nativo do teclado (cel/PC) para
// falar em vez de digitar. Sem transcrição no servidor neste slice.

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
  const [consentido, setConsentido] = useState(false);

  const storageKey = token ? `entrevista:${token}` : null;

  // ── Carrega token + perguntas ──────────────────────────────────────
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

        // Retoma snapshot salvo neste device — inclui as perguntas, para
        // garantir que o índice das respostas continue alinhado no reload
        // (e evita re-chamar o LLM ao retomar).
        let saved = null;
        try {
          saved = storageKey && JSON.parse(sessionStorage.getItem(storageKey) || 'null');
        } catch { /* ignora */ }

        if (saved && Array.isArray(saved.perguntas) && saved.perguntas.length > 0) {
          if (!active) return;
          setPerguntas(saved.perguntas);
          setRespostas(saved.respostas || {});
          setIdx(Math.min(saved.idx || 0, saved.perguntas.length - 1));
          setFase('intro');
          return;
        }

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
        if (!active) return;
        setPerguntas(qj.perguntas || []);
        setFase('intro');
      } catch (err) {
        if (!active) return;
        setErro(err.message);
        setFase('erro');
      }
    })();

    return () => { active = false; };
  }, [router.isReady, token]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Persiste progresso (inclui perguntas p/ retomar alinhado) ──────
  useEffect(() => {
    if (!storageKey || perguntas.length === 0) return;
    if (fase !== 'intro' && fase !== 'entrevista') return;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ idx, respostas, perguntas }));
    } catch { /* ignora */ }
  }, [idx, respostas, perguntas, fase, storageKey]);

  const setResposta = (i, val) => setRespostas((prev) => ({ ...prev, [i]: val }));

  const enviar = async () => {
    setFase('enviando');
    const pares = perguntas.map((p, i) => ({
      pergunta: p.pergunta,
      resposta: (respostas[i] || '').trim(),
    }));
    const transcricao = pares
      .map((p) => `P: ${p.pergunta}\nR: ${p.resposta || '(sem resposta)'}`)
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
        <h1 style={{ marginTop: 0, color: 'var(--accent-purple, #a78bfa)' }}>
          Conversa sobre {marca}
        </h1>
        <p style={txtSec}>
          Olá{respondente?.nome ? `, ${respondente.nome.split(' ')[0]}` : ''}! Vamos fazer uma conversa guiada,
          como {PAPEL_LABEL[respondente?.papel] || 'convidado'}, com {perguntas.length} perguntas. Leva cerca de
          15–25 minutos. Não há resposta certa — quanto mais honesto e concreto, melhor.
        </p>
        <div style={dica}>
          💡 Você pode <strong>digitar</strong> ou <strong>falar</strong>: toque no ícone de microfone do teclado
          do seu celular (ou use o ditado por voz no computador) e responda falando.
        </div>
        <label style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', margin: '1.4rem 0', cursor: 'pointer', ...txtSec }}>
          <input type="checkbox" checked={consentido} onChange={(e) => setConsentido(e.target.checked)} style={{ marginTop: '0.2rem' }} />
          <span>Autorizo que minhas respostas sejam registradas e usadas, de forma confidencial, no diagnóstico de marca.</span>
        </label>
        <button
          className="btn-primary"
          disabled={!consentido}
          onClick={() => setFase('entrevista')}
          style={{ opacity: consentido ? 1 : 0.5 }}
        >
          {Object.keys(respostas).length > 0 ? 'Retomar entrevista' : 'Começar'}
        </button>
      </Shell>
    );
  }

  // fase === 'entrevista' | 'enviando'
  const total = perguntas.length;
  const atual = perguntas[idx];
  const respondidas = perguntas.filter((_, i) => (respostas[i] || '').trim().length > 0).length;
  const ultima = idx === total - 1;
  const enviando = fase === 'enviando';

  return (
    <Shell wide>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #9aa)' }}>
          Pergunta {idx + 1} de {total}
        </span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #9aa)' }}>
          {respondidas} respondida{respondidas === 1 ? '' : 's'}
        </span>
      </div>
      <div style={barraOut}>
        <div style={{ ...barraIn, width: `${Math.round(((idx + 1) / total) * 100)}%` }} />
      </div>

      <h2 style={{ fontSize: '1.25rem', lineHeight: 1.4, margin: '1.2rem 0 0.8rem' }}>
        {atual?.pergunta}
      </h2>

      <textarea
        className="form-input"
        autoFocus
        value={respostas[idx] || ''}
        onChange={(e) => setResposta(idx, e.target.value)}
        placeholder="Escreva ou fale sua resposta…"
        disabled={enviando}
        style={{ width: '100%', minHeight: '180px', resize: 'vertical', padding: '0.85rem', fontSize: '1rem', lineHeight: 1.5 }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.6rem', marginTop: '1rem' }}>
        <button
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={idx === 0 || enviando}
          style={btnGhost(idx === 0 || enviando)}
        >
          ← Anterior
        </button>
        {ultima ? (
          <button className="btn-primary" onClick={enviar} disabled={enviando}>
            {enviando ? 'Enviando…' : 'Concluir e enviar'}
          </button>
        ) : (
          <button className="btn-primary" onClick={() => setIdx((i) => Math.min(total - 1, i + 1))} disabled={enviando}>
            Próxima →
          </button>
        )}
      </div>
    </Shell>
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
