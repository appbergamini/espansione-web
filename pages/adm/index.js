import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Logo from '../../components/Logo';

export default function AdminPanel() {
  const router = useRouter();
  const [projetos, setProjetos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/adm/projetos');
        const data = await res.json();
        if (data.success) {
          setProjetos(data.projetos || []);
        } else {
          setErrorMsg(data.error);
        }
      } catch (err) {
        setErrorMsg("Erro de conexão com a API.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <>
      <Head>
        <title>Espansione | Administrador</title>
      </Head>
      <div className="page-container">
        <main className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <Logo size="sm" showTagline={false} />
              <div style={{ height: '32px', width: '1px', background: 'var(--glass-border)' }}></div>
              <h1 className="animate-fade-in" style={{ fontSize: '1.5rem' }}>Painel Gerencial</h1>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ padding: '0.35rem 0.85rem', background: 'var(--brand-red-glow)', color: 'var(--brand-red)', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 600 }}>
                Visão de Administrador
              </span>
              <button className="btn-primary" onClick={() => router.push('/adm/novo')} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                + Novo Projeto
              </button>
            </div>
          </div>
          
          <div className="glass-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Projetos em Andamento</h2>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                Carregando projetos do Supabase...
              </div>
            ) : errorMsg ? (
              <div style={{ background: 'var(--error)', padding: '1rem', borderRadius: '8px', color: '#fff' }}>
                {errorMsg}
              </div>
            ) : projetos.length === 0 ? (
              <div style={{ background: 'var(--bg-tertiary)', padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Nenhum projeto encontrado. O banco de dados está vazio. Vá para a página inicial e preencha um Intake!
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '1rem', fontWeight: 500 }}>Empresa</th>
                      <th style={{ padding: '1rem', fontWeight: 500 }}>Segmento</th>
                      <th style={{ padding: '1rem', fontWeight: 500 }}>Status</th>
                      <th style={{ padding: '1rem', fontWeight: 500 }}>Progresso</th>
                      <th style={{ padding: '1rem', fontWeight: 500, textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projetos.map(proj => (
                      <tr key={proj.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                        <td style={{ padding: '1.25rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{proj.cliente}</td>
                        <td style={{ padding: '1.25rem 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{proj.segmento}</td>
                        <td style={{ padding: '1.25rem 1rem' }}>
                          <span style={{ 
                            padding: '0.3rem 0.8rem', 
                            fontSize: '0.8rem', 
                            borderRadius: '12px', 
                            background: proj.status.includes('concluido') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            color: proj.status.includes('concluido') ? 'var(--success)' : 'var(--warning)',
                            whiteSpace: 'nowrap'
                          }}>
                            {proj.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '1.25rem 1rem', minWidth: '150px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '100px', height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${Math.min(100, (proj.etapa_atual / 10) * 100)}%`, background: 'var(--accent-blue)' }} />
                            </div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Agent {proj.etapa_atual}/10</span>
                          </div>
                        </td>
                        <td style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>
                          <button className="btn-secondary" onClick={() => router.push(`/adm/${proj.id}`)} style={{ padding: '0.4rem 0.75rem', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>Ver Detalhes</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
