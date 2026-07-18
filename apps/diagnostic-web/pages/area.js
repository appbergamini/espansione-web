import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import TreinamentosPlayer from '../components/TreinamentosPlayer';
import { MapaShell, MapaCard as Card, CORES } from '../components/mapa/mapaTheme';

// Área do cliente: login por e-mail (magic link) → abas Diagnóstico + Treinamentos.
export default function AreaCliente() {
  const [sessao, setSessao] = useState('checando'); // checando|deslogado|logado
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [verificando, setVerificando] = useState(false);
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
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s?.user) { setSessao('logado'); carregar(); }
      else { setSessao('deslogado'); setDados(null); setEnviado(false); setEmail(''); }
    });
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
    setErro(null); setEnviando(true);
    try {
      const r = await fetch('/api/area/enviar-codigo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const j = await r.json();
      if (j.success) setEnviado(true);
      else setErro(j.error || 'Não foi possível enviar o código.');
    } catch { setErro('Erro de conexão.'); }
    setEnviando(false);
  }

  async function verificar() {
    const token = codigo.replace(/\D/g, '');
    if (token.length < 6) return;
    setVerificando(true); setErro(null);
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token, type: 'email' });
    setVerificando(false);
    if (error) setErro('Código inválido ou expirado. Confira ou peça um novo.');
    // sucesso → onAuthStateChange assume e carrega a área
  }

  return (
    <MapaShell title="Área do cliente · Espansione">
        {sessao === 'checando' && <Card><p style={sx.txt}>Carregando…</p></Card>}

        {sessao === 'deslogado' && (
          <Card>
            <div style={sx.accent} />
            <div style={sx.eyebrow}>Área do cliente</div>
            <h1 style={sx.h1}>Acesse com o seu e-mail</h1>
            {enviado ? (
              <>
                <p style={sx.txt}>Enviamos um <b>código de acesso</b> para <b>{email}</b>. Digite ele abaixo:</p>
                <input value={codigo} onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))} placeholder="Código do e-mail" inputMode="numeric" maxLength={8}
                  style={{ ...sx.input, letterSpacing: '0.3em', textAlign: 'center', fontSize: '1.4rem' }}
                  onKeyDown={(e) => e.key === 'Enter' && verificar()} autoFocus />
                <button className="mapa-btn" onClick={verificar} style={{ marginTop: '1rem', opacity: codigo.replace(/\D/g, '').length >= 6 && !verificando ? 1 : 0.6 }}>
                  {verificando ? 'Entrando…' : 'Entrar →'}
                </button>
                <button onClick={() => { setEnviado(false); setCodigo(''); setErro(null); }}
                  style={{ ...sx.ghost, marginTop: '0.7rem', width: '100%' }}>Usar outro e-mail / reenviar</button>
              </>
            ) : (
              <>
                <p style={sx.txt}>Use o mesmo e-mail da sua compra. Enviaremos um <b>código de acesso</b>, sem senha.</p>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" type="email"
                  style={sx.input} onKeyDown={(e) => e.key === 'Enter' && entrar()} />
                <button className="mapa-btn" onClick={entrar} style={{ marginTop: '1rem', opacity: email.trim() && !enviando ? 1 : 0.6 }}>
                  {enviando ? 'Enviando…' : 'Enviar código →'}
                </button>
              </>
            )}
            {erro && <p style={{ color: CORES.red, fontSize: '0.82rem', marginTop: '0.6rem' }}>{erro}</p>}
          </Card>
        )}

        {sessao === 'logado' && dados && (
          !dados.temAcesso ? (
            <Card>
              <div style={sx.accent} />
              <h1 style={sx.h1}>Nenhuma compra encontrada</h1>
              <p style={sx.txt}>Não encontramos uma compra do Mapa do Crescimento Integrado v2 no e-mail <b>{dados.email}</b>.
                Se você comprou com outro e-mail, saia e entre com ele.</p>
              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.2rem', flexWrap: 'wrap' }}>
                <a className="mapa-btn" href="/crescimento" style={{ textDecoration: 'none' }}>Conhecer o Mapa</a>
                <button onClick={() => supabase.auth.signOut()} style={sx.ghost}>Sair</button>
              </div>
            </Card>
          ) : (
            <div style={{ width: '100%', maxWidth: 860 }}>
              <div style={sx.tabs}>
                <button onClick={() => setAba('diagnostico')} style={sx.tab(aba === 'diagnostico')}>Meu diagnóstico</button>
                <button onClick={() => setAba('treinamentos')} style={sx.tab(aba === 'treinamentos')}>Treinamentos</button>
                <button onClick={() => supabase.auth.signOut()} style={{ marginLeft: 'auto', border: '1px solid rgba(255,255,255,.35)', borderRadius: 10, color: '#fff', padding: '0.6rem 1rem', background: 'none', cursor: 'pointer', fontSize: '0.88rem' }}>Sair</button>
              </div>

              {aba === 'diagnostico' && <Diagnostico dados={dados} />}
              {aba === 'treinamentos' && (dados.temTreinamentos ? <Treinamentos /> : (
                <Card wide>
                  <div style={sx.accent} />
                  <h2 style={{ marginTop: 0 }}>Treinamentos</h2>
                  <p style={sx.txt}>Os treinamentos fazem parte do <b>Mapa do Crescimento Integrado v2</b>.{' '}
                    <a href="/crescimento" style={{ color: CORES.red }}>Conhecer →</a></p>
                </Card>
              ))}
            </div>
          )
        )}
    </MapaShell>
  );
}

function Diagnostico({ dados }) {
  const [copiado, setCopiado] = useState(null);
  function copiar(id, link) {
    navigator.clipboard.writeText(`${window.location.origin}${link}`);
    setCopiado(id); setTimeout(() => setCopiado(null), 1600);
  }
  const maturidades = dados.maturidades || [];
  if (!dados.diagnosticos.length && !maturidades.length) return <Card wide><p style={sx.txt}>Seu diagnóstico está sendo preparado. Atualize em instantes.</p></Card>;
  return (
    <>
      {maturidades.map((m) => (
        <div key={m.token} style={sx.cardWide}>
          <div style={sx.accent} />
          <div style={sx.eyebrow}>Mapa do Crescimento Integrado</div>
          <h2 style={{ margin: '0.3rem 0 0.2rem' }}>{m.empresa || 'Seu Mapa do Crescimento Integrado'}</h2>
          <p style={{ ...sx.txt, fontSize: '0.9rem' }}>
            {m.nivel ? <>Nível <b>{m.nivel}</b>{m.score != null ? ` · ${m.score} pts` : ''}. </> : ''}
            Seu relatório completo está pronto.
          </p>
          <a className="mapa-btn" href={m.report_link} target="_blank" rel="noreferrer"
            style={{ marginTop: '1rem', textDecoration: 'none', display: 'inline-block' }}>📄 Ver relatório de Maturidade</a>
        </div>
      ))}
      {maturidades.length === 0 && (
        <div style={sx.cardWide}>
          <div style={sx.accent} />
          <div style={sx.eyebrow}>Mapa do Crescimento Integrado · grátis</div>
          <h2 style={{ margin: '0.3rem 0 0.2rem' }}>Faça o seu Mapa do Crescimento Integrado</h2>
          <p style={{ ...sx.txt, fontSize: '0.9rem' }}>Um diagnóstico rápido do seu negócio em 4 sistemas: Marca, Negócios, Comunicação e Pessoas. Leva poucos minutos e gera um relatório na hora.</p>
          <a className="mapa-btn" href={`/mapa?email=${encodeURIComponent(dados.email || '')}`} target="_blank" rel="noreferrer"
            style={{ marginTop: '1rem', textDecoration: 'none', display: 'inline-block' }}>Fazer o Mapa do Crescimento Integrado →</a>
        </div>
      )}
      {dados.diagnosticos.map((d) => (
        <div key={d.assessment_id} style={sx.cardWide}>
          <div style={sx.accent} />
          <div style={sx.eyebrow}>Mapa do Crescimento Integrado v2</div>
          <h2 style={{ margin: '0.3rem 0 0.2rem' }}>{d.cliente || 'Seu diagnóstico'}</h2>
          <p style={{ ...sx.txt, fontSize: '0.9rem' }}>Compartilhe cada link com o público certo, quanto mais respostas, mais rica a triangulação.</p>
          <div style={{ display: 'grid', gap: '0.6rem', marginTop: '1rem' }}>
            {d.publicos.map((p) => (
              <div key={p.key} style={sx.row}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>{p.nome}</div>
                  <div style={{ fontSize: '0.78rem', color: CORES.textSec }}>
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
            <a className="mapa-btn" href={`/api/identidade-final/report?token=${d.report_token}`} target="_blank" rel="noreferrer"
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
  return (
    <div style={sx.cardWide}>
      <div style={sx.accent} />
      <TreinamentosPlayer />
    </div>
  );
}


const C = CORES;
const sx = {
  cardWide: { padding: '2rem', position: 'relative', overflow: 'hidden', marginBottom: '1rem', background: C.card, borderRadius: 18, boxShadow: '0 30px 60px -30px rgba(0,10,30,.55)', border: '1px solid rgba(255,255,255,.5)' },
  accent: { position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${C.red}, rgba(199,38,56,.15))` },
  eyebrow: { fontSize: '0.66rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.red, fontWeight: 700 },
  h1: { margin: '0.3rem 0 0.6rem', fontSize: '1.55rem', color: C.text, fontWeight: 700 },
  txt: { color: C.textSec, lineHeight: 1.6 },
  input: { width: '100%', boxSizing: 'border-box', padding: '0.8rem 0.9rem', fontSize: '1rem', borderRadius: 10, border: `1px solid ${C.border}`, background: '#F8FAFC', color: C.text, marginTop: '1rem' },
  ghost: { border: `1px solid ${C.border}`, borderRadius: 10, color: C.textSec, padding: '0.6rem 1rem', textDecoration: 'none', fontSize: '0.88rem', background: 'none', cursor: 'pointer' },
  tabs: { display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'nowrap' },
  tab: (on) => ({ padding: '0.6rem 1.1rem', borderRadius: 10, border: on ? `1.5px solid ${C.red}` : '1px solid rgba(255,255,255,.25)', background: on ? '#fff' : 'rgba(255,255,255,.08)', color: on ? C.red : '#fff', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0, lineHeight: 1.2 }),
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.7rem', padding: '0.8rem 0.9rem', borderRadius: 10, background: '#F8FAFC', border: `1px solid ${C.border}` },
  btnAccent: { background: C.redSoft, border: `1px solid ${C.redBorder}`, color: C.red, borderRadius: 8, padding: '0.45rem 0.7rem', cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap', fontWeight: 600 },
  btnGhost: { border: `1px solid ${C.border}`, color: C.textSec, borderRadius: 8, padding: '0.45rem 0.7rem', fontSize: '0.8rem', textDecoration: 'none', whiteSpace: 'nowrap' },
  aviso: { marginTop: '1.1rem', padding: '0.8rem 1rem', borderRadius: 10, background: 'rgba(234,179,8,0.10)', border: '1px solid rgba(234,179,8,0.35)', color: '#8a6d1a', fontSize: '0.86rem' },
  modulo: { fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.red, fontWeight: 700 },
};
