import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import Logo from '../components/Logo';
import { supabase } from '../lib/supabaseClient';
import { TREINAMENTOS, aulas as todasAulas, embedUrl, BUNNY_LIBRARY_ID } from '../lib/treinamentos';

// Área do cliente: login por e-mail (magic link) → abas Diagnóstico + Treinamentos.
export default function AreaCliente() {
  const [sessao, setSessao] = useState('checando'); // checando|deslogado|logado
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [dados, setDados] = useState(null);
  const [aba, setAba] = useState('diagnostico');
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let ativo = true;
    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!ativo) return;
      if (user) { setSessao('logado'); carregar(); } else { setSessao('deslogado'); }
    }
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { if (s?.user) { setSessao('logado'); carregar(); } });
    check();
    return () => { ativo = false; sub?.subscription?.unsubscribe?.(); };
  }, []);

  async function carregar() {
    try {
      const r = await fetch('/api/area/dados');
      const j = await r.json();
      if (j.success) setDados(j); else setErro(j.error);
    } catch { setErro('Erro ao carregar'); }
  }

  async function entrar() {
    if (!email.trim()) return;
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/area` : undefined, shouldCreateUser: true },
    });
    if (error) setErro(error.message); else setEnviado(true);
  }

  return (
    <>
      <Head><title>Área do cliente · Espansione</title><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
      <div style={sx.page}>
        <div style={{ marginBottom: '1.6rem' }}><Logo size="md" center /></div>

        {sessao === 'checando' && <Card><p style={sx.txt}>Carregando…</p></Card>}

        {sessao === 'deslogado' && (
          <Card>
            <div style={sx.accent} />
            <div style={sx.eyebrow}>Área do cliente</div>
            <h1 style={sx.h1}>Acesse com o seu e-mail</h1>
            {enviado ? (
              <p style={sx.txt}>Enviamos um link de acesso para <b>{email}</b>. Abra o e-mail e clique para entrar.</p>
            ) : (
              <>
                <p style={sx.txt}>Use o mesmo e-mail da sua compra. Enviaremos um link mágico — sem senha.</p>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" type="email"
                  style={sx.input} onKeyDown={(e) => e.key === 'Enter' && entrar()} />
                <button className="btn-primary" onClick={entrar} style={{ marginTop: '1rem', opacity: email.trim() ? 1 : 0.6 }}>
                  Enviar link de acesso →
                </button>
              </>
            )}
            {erro && <p style={{ color: '#fca5a5', fontSize: '0.82rem', marginTop: '0.6rem' }}>{erro}</p>}
          </Card>
        )}

        {sessao === 'logado' && dados && (
          !dados.temAcesso ? (
            <Card>
              <div style={sx.accent} />
              <h1 style={sx.h1}>Nenhuma compra encontrada</h1>
              <p style={sx.txt}>Não encontramos uma compra do Mapa de Identidade no e-mail <b>{dados.email}</b>.
                Se você comprou com outro e-mail, saia e entre com ele.</p>
              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.2rem', flexWrap: 'wrap' }}>
                <a className="btn-primary" href="/crescimento" style={{ textDecoration: 'none' }}>Conhecer o Mapa</a>
                <button onClick={() => supabase.auth.signOut()} style={sx.ghost}>Sair</button>
              </div>
            </Card>
          ) : (
            <div style={{ width: '100%', maxWidth: 860 }}>
              <div style={sx.tabs}>
                <button onClick={() => setAba('diagnostico')} style={sx.tab(aba === 'diagnostico')}>Meu diagnóstico</button>
                <button onClick={() => setAba('treinamentos')} style={sx.tab(aba === 'treinamentos')}>Treinamentos</button>
                <button onClick={() => supabase.auth.signOut()} style={{ ...sx.ghost, marginLeft: 'auto' }}>Sair</button>
              </div>

              {aba === 'diagnostico' && <Diagnostico dados={dados} />}
              {aba === 'treinamentos' && <Treinamentos />}
            </div>
          )
        )}
      </div>
    </>
  );
}

function Diagnostico({ dados }) {
  const [copiado, setCopiado] = useState(null);
  function copiar(id, link) {
    navigator.clipboard.writeText(`${window.location.origin}${link}`);
    setCopiado(id); setTimeout(() => setCopiado(null), 1600);
  }
  if (!dados.diagnosticos.length) return <Card wide><p style={sx.txt}>Seu diagnóstico está sendo preparado. Atualize em instantes.</p></Card>;
  return (
    <>
      {dados.diagnosticos.map((d) => (
        <div key={d.assessment_id} className="glass-card" style={sx.cardWide}>
          <div style={sx.accent} />
          <div style={sx.eyebrow}>Mapa de Identidade Estratégica</div>
          <h2 style={{ margin: '0.3rem 0 0.2rem' }}>{d.cliente || 'Seu diagnóstico'}</h2>
          <p style={{ ...sx.txt, fontSize: '0.9rem' }}>Compartilhe cada link com o público certo — quanto mais respostas, mais rica a triangulação.</p>
          <div style={{ display: 'grid', gap: '0.6rem', marginTop: '1rem' }}>
            {d.publicos.map((p) => (
              <div key={p.key} style={sx.row}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>{p.nome}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary,#9aa)' }}>
                    {p.respondentes} respondente(s){p.concluidos ? ` · ${p.concluidos} concluído(s)` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  <button onClick={() => copiar(p.key, p.link)} style={sx.btnAccent}>{copiado === p.key ? '✓' : '🔗 Copiar'}</button>
                  <a href={p.link} target="_blank" rel="noreferrer" style={sx.btnGhost}>Abrir →</a>
                </div>
              </div>
            ))}
          </div>
          {d.relatorio_pronto ? (
            <a className="btn-primary" href={`/api/identidade-final/report?token=${d.report_token}`} target="_blank" rel="noreferrer"
              style={{ marginTop: '1.2rem', textDecoration: 'none', display: 'inline-block' }}>📄 Ver relatório de triangulação</a>
          ) : (
            <div style={sx.aviso}>O <b>relatório de triangulação</b> fica disponível quando os três públicos tiverem ao menos uma resposta concluída.</div>
          )}
        </div>
      ))}
    </>
  );
}

function Treinamentos() {
  const lista = useMemo(() => todasAulas(), []);
  const [atual, setAtual] = useState(() => lista.find((a) => a.videoId) || lista[0] || null);
  const url = atual ? embedUrl(atual.videoId) : null;
  return (
    <div className="glass-card" style={sx.cardWide}>
      <div style={sx.accent} />
      <div style={sx.eyebrow}>Treinamentos</div>
      <h2 style={{ margin: '0.3rem 0 1rem' }}>{atual?.titulo || 'Trilha de treinamento'}</h2>

      <div style={sx.player}>
        {url ? (
          <iframe src={url} loading="lazy" style={sx.iframe} allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;fullscreen" allowFullScreen title={atual?.titulo} />
        ) : (
          <div style={sx.playerVazio}>
            {!BUNNY_LIBRARY_ID ? 'Vídeos em configuração — em breve.' : 'Esta aula estará disponível em breve.'}
          </div>
        )}
      </div>
      {atual?.descricao && <p style={{ ...sx.txt, fontSize: '0.9rem', marginTop: '0.9rem' }}>{atual.descricao}</p>}

      <div style={{ marginTop: '1.4rem', display: 'grid', gap: '1.2rem' }}>
        {TREINAMENTOS.map((m) => (
          <div key={m.modulo}>
            <div style={sx.modulo}>{m.modulo}</div>
            <div style={{ display: 'grid', gap: '0.45rem', marginTop: '0.5rem' }}>
              {m.aulas.map((a) => {
                const ativo = atual?.id === a.id;
                const disp = !!(BUNNY_LIBRARY_ID && a.videoId);
                return (
                  <button key={a.id} onClick={() => setAtual({ ...a, modulo: m.modulo })} style={sx.aula(ativo, disp)}>
                    <span style={{ fontSize: '1rem' }}>{disp ? (ativo ? '▶' : '○') : '⏳'}</span>
                    <span style={{ flex: 1 }}>{a.titulo}</span>
                    {a.duracao && <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary,#9aa)' }}>{a.duracao}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Card({ children, wide }) {
  return <div className="glass-card" style={{ maxWidth: wide ? 680 : 480, width: '100%', padding: '2.2rem', position: 'relative', overflow: 'hidden' }}>{children}</div>;
}

const sx = {
  page: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '2.5rem 1rem' },
  cardWide: { padding: '2rem', position: 'relative', overflow: 'hidden', marginBottom: '1rem' },
  accent: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #Da3144, rgba(218,49,68,0.08))' },
  eyebrow: { fontSize: '0.66rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-secondary, #9aa)', fontWeight: 600 },
  h1: { margin: '0.3rem 0 0.6rem', fontSize: '1.55rem' },
  txt: { color: 'var(--text-secondary, #9aa)', lineHeight: 1.6 },
  input: { width: '100%', boxSizing: 'border-box', padding: '0.8rem 0.9rem', fontSize: '1rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(255,255,255,0.03)', color: 'inherit', marginTop: '1rem' },
  ghost: { border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, color: 'var(--text-secondary, #9aa)', padding: '0.6rem 1rem', textDecoration: 'none', fontSize: '0.88rem', background: 'none', cursor: 'pointer' },
  tabs: { display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' },
  tab: (on) => ({ padding: '0.6rem 1.1rem', borderRadius: 9, border: on ? '1px solid #Da3144' : '1px solid rgba(255,255,255,0.14)', background: on ? 'rgba(218,49,68,0.15)' : 'transparent', color: on ? '#fca5b0' : 'var(--text-secondary,#9aa)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }),
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.7rem', padding: '0.8rem 0.9rem', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' },
  btnAccent: { background: 'rgba(218,49,68,0.15)', border: '1px solid rgba(218,49,68,0.32)', color: '#fca5b0', borderRadius: 8, padding: '0.45rem 0.7rem', cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap' },
  btnGhost: { border: '1px solid rgba(255,255,255,0.18)', color: 'var(--text-secondary)', borderRadius: 8, padding: '0.45rem 0.7rem', fontSize: '0.8rem', textDecoration: 'none', whiteSpace: 'nowrap' },
  aviso: { marginTop: '1.1rem', padding: '0.8rem 1rem', borderRadius: 10, background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.22)', color: 'var(--text-secondary, #9aa)', fontSize: '0.86rem' },
  player: { position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: 12, overflow: 'hidden', background: '#0b1220', border: '1px solid rgba(255,255,255,0.08)' },
  iframe: { position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 },
  playerVazio: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary, #9aa)', fontSize: '0.95rem' },
  modulo: { fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fca5b0', fontWeight: 700 },
  aula: (on, disp) => ({ display: 'flex', alignItems: 'center', gap: '0.7rem', textAlign: 'left', padding: '0.7rem 0.9rem', borderRadius: 9, border: on ? '1px solid #Da3144' : '1px solid rgba(255,255,255,0.08)', background: on ? 'rgba(218,49,68,0.12)' : 'rgba(255,255,255,0.03)', color: disp ? 'inherit' : 'var(--text-secondary,#9aa)', cursor: 'pointer', fontSize: '0.9rem' }),
};
