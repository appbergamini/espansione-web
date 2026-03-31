import Head from 'next/head';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import Logo from '../components/Logo';

export default function Dashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profile, setProfile] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // 1. Verificar sessão
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // 2. Buscar perfil e empresa
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*, empresas(*)')
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;

        setProfile(profileData);
        setEmpresa(profileData.empresas);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  // Mock stats
  const stats = [
    { label: 'Projetos Ativos', value: '12', icon: '📁', trend: '+2 este mês', color: 'text-blue-400' },
    { label: 'Respondentes CIS', value: '148', icon: '🧠', trend: '+15 hoje', color: 'text-purple-400' },
    { label: 'Checkpoints Pendentes', value: '5', icon: '🛑', trend: 'Ações requeridas', color: 'text-rose-400' },
    { label: 'Engajamento Médio', value: '94%', icon: '📊', trend: '+4% vs média', color: 'text-emerald-400' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040812] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040812] text-slate-200 font-sans selection:bg-blue-500/30">
      <Head>
        <title>Dashboard | {empresa?.nome || 'Espansione'}</title>
      </Head>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full z-40 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} bg-[#0a1122] border-r border-slate-800/50 flex flex-col`}>
        <div className="p-6 flex items-center gap-3 overflow-hidden">
          <Logo size="sm" />
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-2">
          {[
            { label: 'Dashboard', icon: '🏠', active: true, href: '/dashboard' },
            { label: 'Meus Projetos', icon: '📁', active: false, href: '#' },
            { label: 'Equipe', icon: '👥', active: false, href: '#' },
            { label: 'Cultura & IA', icon: '🧠', active: false, href: '#' },
            { label: 'Configurações', icon: '⚙️', active: false, href: '#' },
          ].map((item) => (
            <Link key={item.label} href={item.href} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${item.active ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800/50 space-y-2">
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all">
            <span className="text-xl">🚪</span>
            {sidebarOpen && <span className="font-medium text-sm">Sair</span>}
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-full flex items-center justify-center p-2 rounded-lg bg-slate-800/30 hover:bg-slate-800/60 transition-colors">
             <span className="text-xs text-slate-500 font-bold tracking-widest uppercase">{sidebarOpen ? 'Recolher' : '≫'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'} p-8`}>
        {/* Header */}
        <header className="flex justify-between items-start mb-10">
          <div>
            <div className="mb-6">
              <Logo size="lg" />
            </div>
            <p className="text-blue-400 font-bold text-xs uppercase tracking-[0.2em] mb-1">{empresa?.nome || 'Minha Empresa'}</p>
            <h1 className="text-3xl font-bold text-white tracking-tight">Bom dia, {profile?.nome_completo?.split(' ')[0] || 'Gestor'}</h1>
            <p className="text-slate-500 mt-1">Aqui está a visão estratégica do seu ambiente hoje.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex bg-slate-800/30 border border-slate-700/30 rounded-full px-4 py-2 items-center gap-2">
              <span className="text-slate-500">🔍</span>
              <input type="text" placeholder="Buscar..." className="bg-transparent border-none outline-none text-sm w-40" />
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              {profile?.nome_completo?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-[#0a1122] border border-slate-800/50 p-6 rounded-2xl hover:border-slate-700 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <span className={`text-3xl bg-slate-800/30 w-12 h-12 flex items-center justify-center rounded-xl`}>{stat.icon}</span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">KPI</span>
              </div>
              <h3 className="text-slate-400 text-sm font-medium">{stat.label}</h3>
              <div className="flex items-end gap-3 mt-1">
                <span className="text-3xl font-bold text-white leading-none">{stat.value}</span>
                <span className={`text-xs mb-1 font-semibold ${stat.color}`}>{stat.trend}</span>
              </div>
            </div>
          ))}
        </section>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 bg-[#0a1122] border border-slate-800/50 rounded-2xl p-8">
            <h2 className="font-bold text-lg text-white mb-6">Status da Transição</h2>
            <div className="bg-[#040812] border border-slate-800 rounded-xl p-6 text-center">
              <p className="text-slate-400 text-sm mb-4">Bem-vindo ao novo ambiente Multi-Tenant da Espansione.</p>
              <div className="inline-block px-4 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">
                ✅ Tenant Configurado: {empresa?.id}
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-br from-blue-600/20 to-rose-600/20 border border-slate-800/50 p-6 rounded-2xl">
            <h3 className="font-bold text-white mb-2">Suporte Estratégico</h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">Você está logado como <strong>Administrador</strong> do workspace {empresa?.nome}.</p>
            <button className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-all">
              Acessar Guia do Admin
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}
