// patches/pages/dashboard/projetos.js
// Substitui pages/dashboard/projetos.js
// Mudanças: voz Governante (Protocolos, Inicie o Protocolo 01),
// paleta da marca (#00326D btn primário, #Da3144 accent), Icon em vez de emoji ⚙️,
// empty state institucional, modal com linguagem correta.

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import DashboardLayout from '../../components/DashboardLayout';
import Icon from '../../components/Icon';

// ─── Status da marca (sem verde externo) ───────────────────────────────────
const STATUS_MAP = {
  em_andamento: { label: 'Em andamento', color: '#6BA3FF', bg: 'rgba(107,163,255,0.1)', border: 'rgba(107,163,255,0.25)' },
  concluido:    { label: 'Concluído',    color: '#004198', bg: 'rgba(0,65,152,0.1)',     border: 'rgba(0,65,152,0.25)' },
  planejamento: { label: 'Planejamento', color: '#6E7480', bg: 'rgba(110,116,128,0.1)',  border: 'rgba(110,116,128,0.25)' },
};

function StatusChip({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.planejamento;
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      fontSize: '10px', fontWeight: 700,
      letterSpacing: '0.14em', textTransform: 'uppercase',
      fontFamily: 'var(--font-ui)',
      color: s.color, background: s.bg,
      border: `1px solid ${s.border}`,
      borderRadius: '999px',
    }}>
      {s.label}
    </span>
  );
}

export default function ProjetosPage() {
  const [projetos, setProjetos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ nome: '', descricao: '' });

  useEffect(() => { fetchProjetos(); }, []);

  async function fetchProjetos() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projetos').select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProjetos(data || []);
    } catch (err) {
      console.error('Erro ao carregar projetos:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProject(e) {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles').select('empresa_id').eq('id', user.id).single();
      const { error } = await supabase.from('projetos').insert([{
        nome: newProject.nome,
        descricao: newProject.descricao,
        empresa_id: profile.empresa_id,
      }]);
      if (error) throw error;
      setShowModal(false);
      setNewProject({ nome: '', descricao: '' });
      fetchProjetos();
    } catch (err) { alert(err.message); }
  }

  return (
    <DashboardLayout title="Protocolos">
      {/* ── Cabeçalho da seção ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <p style={{
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: '#Da3144',
            fontFamily: 'var(--font-ui)', marginBottom: '4px',
          }}>
            Protocolos ativos
          </p>
          <p style={{ fontSize: '14px', color: '#6E7480', fontFamily: 'var(--font-body)' }}>
            Diagnóstico e estruturação de marca por protocolo.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#00326D', color: '#FEFEFE',
            padding: '10px 20px', border: 'none', borderRadius: '8px',
            fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-ui)',
            letterSpacing: '0.02em', cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span> Abrir novo Protocolo
        </button>
      </div>

      {/* ── Tabela / Empty state ── */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '64px', textAlign: 'center', color: '#6E7480', fontFamily: 'var(--font-ui)' }}>
            Carregando protocolos…
          </div>
        ) : projetos.length === 0 ? (
          /* ── Empty state Governante ── */
          <div style={{ padding: '80px 40px', textAlign: 'center' }}>
            <div style={{ marginBottom: '16px', opacity: 0.18 }}>
              <Icon name="folder" size={48} style={{ color: '#00326D' }} />
            </div>
            <p style={{
              fontFamily: 'var(--font-heading)', fontWeight: 800,
              fontSize: '22px', color: '#00326D', letterSpacing: '-0.01em',
              marginBottom: '8px',
            }}>
              Nenhum Protocolo iniciado.
            </p>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '15px',
              color: '#6E7480', marginBottom: '24px', maxWidth: '36ch', margin: '0 auto 24px',
            }}>
              Inicie o Protocolo 01 — diagnóstico e posicionamento de marca.
            </p>
            <button
              onClick={() => setShowModal(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: '#00326D', color: '#FEFEFE',
                padding: '10px 20px', border: 'none', borderRadius: '8px',
                fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-ui)', cursor: 'pointer',
              }}
            >
              + Abrir Protocolo 01
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', background: 'rgba(0,0,0,0.02)' }}>
                  {['Protocolo', 'Status', 'Progresso', 'Abertura', ''].map(h => (
                    <th key={h} style={{
                      padding: '14px 24px', fontSize: '10px', fontWeight: 700,
                      letterSpacing: '0.22em', textTransform: 'uppercase',
                      color: '#6E7480', fontFamily: 'var(--font-ui)',
                      textAlign: h === '' ? 'right' : 'left',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projetos.map((proj) => (
                  <tr
                    key={proj.id}
                    style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,50,109,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '18px 24px' }}>
                      <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '14px', color: '#00326D' }}>
                        {proj.nome}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6E7480', marginTop: '2px', fontFamily: 'var(--font-body)' }}>
                        {proj.descricao || '—'}
                      </div>
                    </td>
                    <td style={{ padding: '18px 24px' }}>
                      <StatusChip status={proj.status} />
                    </td>
                    <td style={{ padding: '18px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '80px', height: '4px', background: '#F0F0F0', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: '#00326D', borderRadius: '2px', width: `${proj.progresso}%` }} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#1A1A1A', fontFamily: 'var(--font-ui)' }}>
                          {proj.progresso}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '18px 24px', fontSize: '12px', color: '#6E7480', fontFamily: 'var(--font-ui)' }}>
                      {new Date(proj.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                      <button
                        title="Configurações"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6E7480', padding: '6px' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#00326D'}
                        onMouseLeave={e => e.currentTarget.style.color = '#6E7480'}
                      >
                        <Icon name="settings" size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal: Abrir novo Protocolo ── */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '40px' }}>
            {/* linha vermelha topo */}
            <div style={{ height: '3px', width: '40px', background: '#Da3144', marginBottom: '20px' }} />
            <p style={{
              fontSize: '10px', fontWeight: 700, letterSpacing: '0.24em',
              textTransform: 'uppercase', color: '#Da3144',
              fontFamily: 'var(--font-ui)', marginBottom: '8px',
            }}>Novo Protocolo</p>
            <h3 style={{
              fontFamily: 'var(--font-heading)', fontWeight: 900,
              fontSize: '26px', color: '#00326D', letterSpacing: '-0.01em', marginBottom: '28px',
            }}>
              Abrir Protocolo
            </h3>

            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{
                  display: 'block', fontSize: '10px', fontWeight: 700,
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: '#6E7480', fontFamily: 'var(--font-ui)', marginBottom: '8px',
                }}>
                  Nome do cliente / marca
                </label>
                <input
                  required
                  style={{
                    width: '100%', padding: '12px 16px',
                    border: '1px solid rgba(0,0,0,0.15)', borderRadius: '6px',
                    fontSize: '14px', fontFamily: 'var(--font-ui)',
                    outline: 'none', color: '#1A1A1A', background: '#FEFEFE',
                  }}
                  value={newProject.nome}
                  onChange={e => setNewProject({ ...newProject, nome: e.target.value })}
                  placeholder="Ex: Acme Corp"
                  onFocus={e => e.target.style.borderColor = '#00326D'}
                  onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.15)'}
                />
              </div>
              <div>
                <label style={{
                  display: 'block', fontSize: '10px', fontWeight: 700,
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: '#6E7480', fontFamily: 'var(--font-ui)', marginBottom: '8px',
                }}>
                  Escopo (opcional)
                </label>
                <textarea
                  style={{
                    width: '100%', padding: '12px 16px', height: '88px',
                    border: '1px solid rgba(0,0,0,0.15)', borderRadius: '6px',
                    fontSize: '14px', fontFamily: 'var(--font-body)',
                    outline: 'none', resize: 'none', color: '#1A1A1A', background: '#FEFEFE',
                  }}
                  value={newProject.descricao}
                  onChange={e => setNewProject({ ...newProject, descricao: e.target.value })}
                  placeholder="Objetivos e contexto do protocolo…"
                  onFocus={e => e.target.style.borderColor = '#00326D'}
                  onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.15)'}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1, padding: '12px',
                    border: '1px solid rgba(0,0,0,0.15)', borderRadius: '6px',
                    fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-ui)',
                    background: 'transparent', cursor: 'pointer', color: '#6E7480',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1, padding: '12px',
                    background: '#00326D', color: '#FEFEFE',
                    border: 'none', borderRadius: '6px',
                    fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-ui)', cursor: 'pointer',
                  }}
                >
                  Abrir Protocolo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
