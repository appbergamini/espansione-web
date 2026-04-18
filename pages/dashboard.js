import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Logo from '../components/Logo';
import { supabase } from '../lib/supabaseClient';

export default function Dashboard() {
  const router = useRouter();
  const [projetos, setProjetos] = useState([]);
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
        .from('profiles')
        .select('nome_completo, role')
        .eq('id', session.user.id)
        .single();
      if (!active) return;

      setUserName(profile?.nome_completo || session.user.email?.split('@')[0] || '');
      if (profile?.role === 'master') { router.replace('/adm'); return; }

      loadProjetos();
    })();
    return () => { active = false; };
  }, [router]);

  async function loadProjetos() {
    try {
      const res = await fetch('/api/adm/projetos');
      const data = await res.json();
      if (data.success) {
        setProjetos(data.projetos || []);
      } else {
        setErrorMsg(data.error);
      }
    } catch {
      setErrorMsg('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  const STATUS_LABELS = {
    planejamento: 'Planejamento',
    em_andamento: 'Em Andamento',
    concluido: 'Concluido',
  };

  const STATUS_COLORS = {
    planejamento: { bg: 'rgba(96, 165, 250, 0.1)', color: '#60a5fa' },
    em_andamento: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
    concluido: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' },
  };

  return (
    <div className="min-h-screen bg-[#040812] text-slate-200 font-sans">
      <Head>
        <title>Dashboard | Espansione</title>
      </Head>

      {/* Header */}
      <header className="border-b border-slate-800/50 bg-[#0a1122]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <div style={{ height: '32px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <span className="text-sm text-slate-400">Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
                {userName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="text-sm text-slate-300 hidden sm:inline">{userName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-rose-400 hover:text-rose-300 font-semibold transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">
            Ola, {userName?.split(' ')[0] || 'Gestor'}
          </h1>
          <p className="text-slate-500 text-sm">Aqui estao os projetos sob sua responsabilidade.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : errorMsg ? (
          <div className="glass-card p-6 text-center">
            <p className="text-rose-400 text-sm">{errorMsg}</p>
          </div>
        ) : projetos.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-slate-500 text-lg mb-2">Nenhum projeto encontrado</p>
            <p className="text-slate-600 text-sm">Voce sera notificado quando um projeto for atribuido a voce.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projetos.map(proj => {
              const sc = STATUS_COLORS[proj.status] || STATUS_COLORS.planejamento;
              const progress = Math.min(100, ((proj.etapa_atual || 0) / 10) * 100);
              return (
                <div
                  key={proj.id}
                  onClick={() => router.push(`/dashboard/projetos/${proj.id}`)}
                  className="glass-card p-6 cursor-pointer hover:border-blue-500/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors">
                      {proj.cliente || proj.nome}
                    </h3>
                    <span style={{
                      padding: '0.2rem 0.6rem',
                      fontSize: '0.7rem',
                      borderRadius: '12px',
                      background: sc.bg,
                      color: sc.color,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      {STATUS_LABELS[proj.status] || proj.status}
                    </span>
                  </div>

                  {proj.empresas?.nome && (
                    <p className="text-slate-500 text-xs mb-3">{proj.empresas.nome}</p>
                  )}

                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Progresso</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-3">
                    Criado em {new Date(proj.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
