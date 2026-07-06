import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import TreinamentosPlayer from '../../components/TreinamentosPlayer';
import { MapaShell, MapaCard as Card, CORES } from '../../components/mapa/mapaTheme';

// Setup self-serve do Mapa de Identidade após a compra (redirect do checkout).
// Faz polling de /api/identidade-final/acesso?order=... até o pagamento ser
// confirmado (webhook), define o nome da empresa e entrega os 3 links.

const PUBLICO = {
  socios: { nome: 'Sócios e Diretores', hint: 'Você e os demais sócios/diretores respondem.' },
  colaboradores: { nome: 'Colaboradores e Líderes', hint: 'Envie para a equipe — várias pessoas podem responder.' },
  clientes: { nome: 'Clientes e Fornecedores', hint: 'Envie para clientes/fornecedores de confiança.' },
};

export default function IdentidadeSetup() {
  const router = useRouter();
  const order = (router.query.order || '').toString();

  const [fase, setFase] = useState('loading'); // loading|aguardando|dados|pronto|erro
  const [dados, setDados] = useState(null); // { cliente, status, links }
  const [empresa, setEmpresa] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);
  const [copiado, setCopiado] = useState(null);

  const consultar = useCallback(async () => {
    const r = await fetch(`/api/identidade-final/acesso?order=${encodeURIComponent(order)}`);
    return r.json();
  }, [order]);

  useEffect(() => {
    if (!order) return;
    let ativo = true;
    let tentativas = 0;
    async function loop() {
      try {
        const j = await consultar();
        if (!ativo) return;
        if (!j.success) { setErro(j.error || 'Erro'); setFase('erro'); return; }
        if (j.paid) {
          setDados(j);
          setFase(j.precisa_empresa || j.precisa_email ? 'dados' : 'pronto');
          return;
        }
        if (j.recusado) { setErro('O pagamento não foi aprovado.'); setFase('erro'); return; }
        // aguardando confirmação do pagamento → poll
        setFase('aguardando');
        if (tentativas++ < 45) setTimeout(loop, 4000);
        else { setErro('Ainda não recebemos a confirmação do pagamento. Se já pagou, aguarde alguns minutos e recarregue.'); setFase('erro'); }
      } catch {
        if (ativo && tentativas++ < 45) setTimeout(loop, 4000);
      }
    }
    loop();
    return () => { ativo = false; };
  }, [order, consultar]);

  async function salvarDados() {
    const emailOk = /.+@.+\..+/.test(emailInput.trim());
    if (!empresa.trim() || !emailOk) return;
    setSalvando(true);
    const r = await fetch('/api/identidade-final/acesso', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order, empresa: empresa.trim(), email: emailInput.trim() }),
    });
    const j = await r.json();
    setSalvando(false);
    if (j.success) { setDados(j); setFase('pronto'); }
  }

  function copiar(publico, link) {
    const abs = `${typeof window !== 'undefined' ? window.location.origin : ''}${link}`;
    navigator.clipboard.writeText(abs);
    setCopiado(publico);
    setTimeout(() => setCopiado(null), 1800);
  }

  return (
    <MapaShell title="Configurar o Mapa de Identidade · Espansione">
        {fase === 'loading' && <Card><p style={sx.txt}>Carregando…</p></Card>}
        {fase === 'erro' && <Card><h2 style={{ marginTop: 0 }}>Ops</h2><p style={sx.txt}>{erro}</p></Card>}

        {fase === 'aguardando' && (
          <Card>
            <div style={sx.accent} />
            <div style={sx.eyebrow}>Compra confirmada</div>
            <h1 style={sx.h1}>Preparando o seu Mapa de Identidade…</h1>
            <p style={sx.txt}>Estamos confirmando o seu pagamento. Isso costuma levar poucos segundos — esta página atualiza sozinha.</p>
            <div style={sx.spinner} />
          </Card>
        )}

        {fase === 'dados' && (
          <Card>
            <div style={sx.accent} />
            <div style={sx.eyebrow}>Último passo</div>
            <h1 style={sx.h1}>Só confirmar seus dados</h1>
            <p style={sx.txt}>Usamos para identificar o seu diagnóstico e enviar o acesso — inclusive aos treinamentos.</p>
            <input value={empresa} onChange={(e) => setEmpresa(e.target.value)} placeholder="Nome da sua empresa"
              style={{ ...sx.input, marginTop: '1.1rem' }} />
            <input value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="Seu melhor e-mail" type="email"
              style={{ ...sx.input, marginTop: '0.7rem' }} onKeyDown={(e) => e.key === 'Enter' && salvarDados()} />
            <button className="mapa-btn" onClick={salvarDados}
              style={{ marginTop: '1rem', opacity: empresa.trim() && /.+@.+\..+/.test(emailInput.trim()) && !salvando ? 1 : 0.6 }}>
              {salvando ? 'Salvando…' : 'Continuar →'}
            </button>
          </Card>
        )}

        {fase === 'pronto' && dados && (
          <div style={{ width: '100%', maxWidth: 680, display: 'grid', gap: '1rem' }}>
          <Card wide>
            <div style={sx.accent} />
            <div style={sx.eyebrow}>Mapa de Identidade Estratégica · configurado</div>
            <h1 style={sx.h1}>Tudo pronto{dados.cliente ? `, ${dados.cliente}` : ''}!</h1>
            <p style={sx.txt}>
              O Mapa de Identidade cruza <b>três olhares</b> sobre a sua empresa. Compartilhe cada link com
              o público certo — quanto mais respostas, mais rica a triangulação.
            </p>

            <div style={{ display: 'grid', gap: '0.7rem', marginTop: '1.2rem' }}>
              {dados.links.map((l) => (
                <div key={l.publico} style={sx.linkRow}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600 }}>{PUBLICO[l.publico]?.nome || l.publico}</div>
                    <div style={{ fontSize: '0.8rem', color: CORES.textSec }}>{PUBLICO[l.publico]?.hint}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                    <button onClick={() => copiar(l.publico, l.link)} style={sx.btnAccent}>{copiado === l.publico ? '✓ Copiado' : '🔗 Copiar'}</button>
                    <a href={l.link} target="_blank" rel="noreferrer" style={sx.btnGhost}>Abrir →</a>
                  </div>
                </div>
              ))}
            </div>

            <div style={sx.dica}>
              <b>Comece por você:</b> abra o link dos <b>Sócios</b> e responda primeiro. Depois envie os links da
              Equipe e dos Clientes. Quando os três públicos tiverem respostas, o <b>relatório de triangulação</b>
              fica disponível.
            </div>

            <a className="mapa-btn" href={dados.links.find((l) => l.publico === 'socios')?.link || '#'} target="_blank" rel="noreferrer"
              style={{ marginTop: '1.2rem', textDecoration: 'none', display: 'inline-block' }}>
              Começar agora (responder como Sócio) →
            </a>
            <p style={{ ...sx.txt, fontSize: '0.85rem', marginTop: '1.1rem' }}>
              Para voltar depois e acompanhar tudo (diagnóstico + treinamentos), acesse a sua{' '}
              <a href="/area" style={{ color: CORES.red }}>área do cliente</a> com este mesmo e-mail.
            </p>
          </Card>
          <Card wide>
            <div style={sx.accent} />
            <div style={sx.eyebrow}>Treinamentos · incluídos na sua compra</div>
            <div style={{ marginTop: '0.9rem' }}><TreinamentosPlayer /></div>
          </Card>
          </div>
        )}
    </MapaShell>
  );
}

const C = CORES;
const sx = {
  accent: { position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${C.red}, rgba(199,38,56,.15))` },
  eyebrow: { fontSize: '0.66rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.red, fontWeight: 700 },
  h1: { margin: '0.3rem 0 0.6rem', fontSize: '1.55rem', color: C.text, fontWeight: 700 },
  txt: { color: C.textSec, lineHeight: 1.6 },
  input: { width: '100%', boxSizing: 'border-box', padding: '0.8rem 0.9rem', fontSize: '1rem', borderRadius: 10, border: `1px solid ${C.border}`, background: '#F8FAFC', color: C.text, marginTop: '1rem' },
  spinner: { width: 34, height: 34, margin: '1.4rem 0 0.2rem', borderRadius: '50%', border: `3px solid ${C.track}`, borderTopColor: C.red, animation: 'spin 0.9s linear infinite' },
  linkRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.7rem', padding: '0.8rem 0.9rem', borderRadius: 10, background: '#F8FAFC', border: `1px solid ${C.border}` },
  btnAccent: { background: C.redSoft, border: `1px solid ${C.redBorder}`, color: C.red, borderRadius: 8, padding: '0.45rem 0.7rem', cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap', fontWeight: 600 },
  btnGhost: { border: `1px solid ${C.border}`, color: C.textSec, borderRadius: 8, padding: '0.45rem 0.7rem', fontSize: '0.8rem', textDecoration: 'none', whiteSpace: 'nowrap' },
  dica: { marginTop: '1.2rem', padding: '0.9rem 1.1rem', borderRadius: 12, background: C.redSoft, border: `1px solid ${C.redBorder}`, color: C.textSec, fontSize: '0.88rem', lineHeight: 1.55 },
};
