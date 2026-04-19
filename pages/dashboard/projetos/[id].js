// patches/pages/dashboard/projetos/[id].js
// Substitui pages/dashboard/projetos/[id].js
// Mudanças: paleta da marca (sem verde, sem blue-500 genérico), StatusIcon,
// linguagem Governante ("Protocolo", "Documento", "Diagnóstico"), header azul marinho.

import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Logo from '../../../components/Logo';
import Icon from '../../../components/Icon';
import { supabase } from '../../../lib/supabaseClient';

// ─── StatusIcon: inline, sem emoji ─────────────────────────────────────────
function StatusIcon({ done }) {
  return done ? (
    <span aria-label="Concluído" style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: '18px', height: '18px', borderRadius: '50%',
      background: 'rgba(0,65,152,0.12)', flexShrink: 0,
    }}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M2 5l2.5 2.5L8 3" stroke="#004198" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  ) : (
    <span aria-label="Pendente" style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: '18px', height: '18px', borderRadius: '50%',
      background: 'rgba(218,49,68,0.08)', flexShrink: 0,
    }}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <circle cx="5" cy="5" r="3" stroke="#Da3144" strokeWidth="1.5"/>
      </svg>
    </span>
  );
}

// ─── Mapa de status (paleta oficial) ───────────────────────────────────────
const STATUS_MAP = {
  planejamento: { label: 'Planejamento', color: '#6E7480', bg: 'rgba(110,116,128,0.1)', border: 'rgba(110,116,128,0.25)' },
  em_andamento: { label: 'Em andamento', color: '#6BA3FF', bg: 'rgba(107,163,255,0.1)', border: 'rgba(107,163,255,0.3)' },
  concluido:    { label: 'Concluído',    color: '#004198', bg: 'rgba(0,65,152,0.1)',     border: 'rgba(0,65,152,0.3)' },
};

const renderText = (text) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => <span key={i}>{line}<br /></span>);
};

export default function ProjetoDashboard() {
  const router = useRouter();
  const { id } = router.query;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;
      if (!session) { router.push('/login'); return; }
      const { data: profile } = await supabase
        .from('profiles').select('nome_completo, role').eq('id', session.user.id).single();
      if (!active) return;
      if (profile?.role === 'master') { router.replace(`/adm/${id}`); return; }
      setUserName(profile?.nome_completo || session.user.email?.split('@')[0] || '');
    })();
    return () => { active = false; };
  }, [router, id]);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const res = await fetch(`/api/adm/${id}`);
        const json = await res.json();
        if (json.success) { setData(json.data); }
        else { setErrorMsg(json.error || 'Erro ao carregar protocolo'); }
      } catch { setErrorMsg('Falha de conexão.'); }
      finally { setLoading(false); }
    }
    load();
  }, [id]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F3EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #F0F0F0', borderTopColor: '#00326D', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F3EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', maxWidth: '400px' }}>
          <p style={{ color: '#Da3144', marginBottom: '16px', fontFamily: 'var(--font-body)' }}>{errorMsg}</p>
          <button onClick={() => router.push('/dashboard')} style={{ color: '#00326D', fontFamily: 'var(--font-ui)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px' }}>
            Voltar ao painel
          </button>
        </div>
      </div>
    );
  }

  if (!data?.projeto) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F3EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6E7480', fontFamily: 'var(--font-ui)' }}>Protocolo não encontrado.</p>
      </div>
    );
  }

  const { projeto, outputs = [], formularios = [], intake, cisParticipantes = [] } = data;
  const sc = STATUS_MAP[projeto.status] || STATUS_MAP.planejamento;
  const etapaAtual = projeto.etapa_atual || 0;
  const progress = Math.min(100, (etapaAtual / 13) * 100);
  const cisRespondidos = cisParticipantes.filter(p => p.respondido).length;

  return (
    <div style={{ minHeight: '100vh', background: '#F5F3EE', color: '#1A1A1A', fontFamily: 'var(--font-ui)' }}>
      <Head><title>{projeto.cliente} · Protocolo | Espansione</title></Head>

      {/* ── Header institucional ── */}
      <header style={{ borderBottom: '1px solid #1A1A1A', background: '#00326D' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', height: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Logo size="sm" variant="light" />
            <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.2)' }} />
            <button
              onClick={() => router.push('/dashboard')}
              style={{ fontSize: '12px', color: '#EE969D', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', letterSpacing: '0.06em' }}
            >
              Painel
            </button>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>/</span>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', fontFamily: 'var(--font-ui)' }}>{projeto.cliente}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-ui)' }}>{userName}</span>
            <button
              onClick={handleLogout}
              style={{ fontSize: '12px', color: '#EE969D', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)' }}
            >
              Encerrar sessão
            </button>
          </div>
        </div>
        {/* linha vermelha topo */}
        <div style={{ height: '3px', background: '#Da3144' }} />
      </header>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>

        {/* ── Título + Status ── */}
        <div style={{ paddingBottom: '24px', marginBottom: '32px', borderBottom: '1px solid #1A1A1A', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#Da3144', fontFamily: 'var(--font-ui)', marginBottom: '6px' }}>
              Protocolo · {new Date(projeto.created_at).getFullYear()}
            </p>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '36px', color: '#00326D', letterSpacing: '-0.02em', lineHeight: 1.05, marginBottom: '10px' }}>
              {projeto.cliente}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{
                display: 'inline-block', padding: '3px 10px',
                fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
                color: sc.color, background: sc.bg, border: `1px solid ${sc.border}`,
                borderRadius: '999px', fontFamily: 'var(--font-ui)',
              }}>
                {sc.label}
              </span>
              <span style={{ fontSize: '12px', color: '#6E7480', fontFamily: 'var(--font-ui)' }}>
                Etapa {etapaAtual} / 13 · {Math.round(progress)}% concluído
              </span>
            </div>
          </div>

          {/* Barra de progresso */}
          <div style={{ minWidth: '200px' }}>
            <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#6E7480', textAlign: 'right', marginBottom: '6px', fontFamily: 'var(--font-ui)' }}>
              Progresso geral
            </p>
            <div style={{ height: '6px', background: '#F0F0F0', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#00326D', borderRadius: '3px', width: `${progress}%`, transition: 'width 0.4s ease' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>

          {/* ── Coluna esquerda ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Diagnósticos */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#6E7480', fontFamily: 'var(--font-ui)', marginBottom: '16px' }}>
                Diagnósticos
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Formulário Inicial', done: intake && Object.keys(intake).length > 2 },
                  { label: 'Liderança — Propósito', done: formularios.some(f => f.tipo === 'proposito') },
                  { label: 'Equipe — Clima', done: formularios.some(f => f.tipo === 'pesquisa_colaboradores') },
                ].map(item => (
                  <li key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontFamily: 'var(--font-ui)', color: '#1A1A1A' }}>
                    <StatusIcon done={item.done} />
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>

            {/* Mapeamento comportamental */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#6E7480', fontFamily: 'var(--font-ui)', marginBottom: '16px' }}>
                Mapeamento Comportamental
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '32px', color: '#00326D', letterSpacing: '-0.02em' }}>
                  {cisRespondidos}<span style={{ fontSize: '18px', color: '#6E7480', fontWeight: 400 }}>/{cisParticipantes.length}</span>
                </span>
                <span style={{ fontSize: '11px', color: '#6E7480', fontFamily: 'var(--font-ui)' }}>respondidos</span>
              </div>

              {cisParticipantes.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {cisParticipantes.map(p => (
                    <div key={p.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 12px', background: 'rgba(0,0,0,0.03)', borderRadius: '6px',
                    }}>
                      <div>
                        <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '12px', color: '#1A1A1A' }}>{p.nome}</span>
                        {p.cargo && <span style={{ marginLeft: '8px', fontSize: '11px', color: '#6E7480', fontFamily: 'var(--font-ui)' }}>{p.cargo}</span>}
                      </div>
                      <StatusIcon done={p.respondido} />
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '12px', color: '#6E7480', fontFamily: 'var(--font-body)' }}>Nenhum participante cadastrado.</p>
              )}
            </div>
          </div>

          {/* ── Coluna direita: documentos/outputs ── */}
          <div>
            <div className="glass-card" style={{ padding: '24px' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#6E7480', fontFamily: 'var(--font-ui)', marginBottom: '20px' }}>
                Documentos gerados
              </p>

              {outputs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <div style={{ marginBottom: '12px', opacity: 0.15 }}>
                    <Icon name="file" size={36} style={{ color: '#00326D' }} />
                  </div>
                  <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '18px', color: '#00326D', marginBottom: '6px' }}>
                    Nenhum documento gerado.
                  </p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: '#6E7480' }}>
                    Os documentos aparecem conforme os Agents são executados.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[...outputs].sort((a, b) => b.agent_num - a.agent_num).map(out => (
                    <div key={out.id} style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px', overflow: 'hidden' }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '12px 20px', background: 'rgba(0,50,109,0.04)',
                        borderBottom: '1px solid rgba(0,0,0,0.06)',
                      }}>
                        <h3 style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '13px', color: '#00326D' }}>
                          Documento nº {String(out.agent_num + 1).padStart(2, '0')}
                        </h3>
                        <span style={{
                          padding: '2px 8px', fontSize: '9px', fontWeight: 700,
                          letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: 'var(--font-ui)',
                          background: 'rgba(0,65,152,0.08)', color: '#004198',
                          border: '1px solid rgba(0,65,152,0.2)', borderRadius: '999px',
                        }}>Concluído</span>
                      </div>
                      <div style={{ padding: '16px 20px', fontSize: '13px', color: '#1A1A1A', lineHeight: 1.6 }}>
                        {out.resumo_executivo && (
                          <div style={{ marginBottom: '12px' }}>
                            <strong style={{ display: 'block', fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#6E7480', fontFamily: 'var(--font-ui)', marginBottom: '4px' }}>
                              Resumo executivo
                            </strong>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px' }}>{renderText(out.resumo_executivo)}</div>
                          </div>
                        )}
                        <details style={{ cursor: 'pointer' }}>
                          <summary style={{ color: '#00326D', fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-ui)', letterSpacing: '0.06em', listStyle: 'none' }}>
                            Ver documento completo ↓
                          </summary>
                          <div style={{ marginTop: '12px', padding: '16px', background: 'rgba(0,0,0,0.02)', borderRadius: '6px', fontSize: '12px', lineHeight: 1.65, fontFamily: 'var(--font-body)' }}>
                            {renderText(out.conteudo)}
                            {out.conclusoes && (
                              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                                <strong style={{ fontFamily: 'var(--font-ui)', color: '#00326D' }}>Conclusões:</strong>
                                <div style={{ marginTop: '4px' }}>{renderText(out.conclusoes)}</div>
                              </div>
                            )}
                          </div>
                        </details>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
