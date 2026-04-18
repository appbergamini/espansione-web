import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import Logo from './Logo';

export default function DashboardLayout({ children, title = 'Espansione' }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profile, setProfile] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

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
        console.error("Erro no layout:", err);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040812] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const menuItems = [
    { label: 'Visão Geral', icon: '🏠', active: router.pathname === '/dashboard', href: '/dashboard' },
    { label: 'Meus Projetos', icon: '📁', active: router.pathname === '/dashboard/projetos', href: '/dashboard/projetos' },
    { label: 'Equipe & Perfis', icon: '👥', active: router.pathname === '/dashboard/equipe', href: '/dashboard/equipe' },
    { label: 'Configurações', icon: '⚙️', active: false, href: '#' },
  ];

  return (
    <div className="min-h-screen bg-[#040812] text-slate-200 font-sans selection:bg-blue-500/30">
      <Head>
        <title>{title} | {empresa?.nome || 'Espansione'}</title>
      </Head>

      {/* Sidebar Reutilizável */}
      <aside className={`fixed top-0 left-0 h-full z-40 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} bg-[#0a1122] border-r border-slate-800/50 flex flex-col shadow-2xl`}>
        <div className="p-6 flex items-center gap-3 overflow-hidden">
          <Logo size="sm" />
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link key={item.label} href={item.href} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${item.active ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800/50 space-y-2">
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all">
            <span className="text-xl">🚪</span>
            {sidebarOpen && <span className="font-medium text-sm font-bold">Sair</span>}
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-full flex items-center justify-center p-2 rounded-lg bg-slate-800/30 hover:bg-slate-800/60 transition-colors">
             <span className="text-xs text-slate-500 font-bold tracking-widest uppercase">{sidebarOpen ? 'Recolher' : '≫'}</span>
          </button>
        </div>
      </aside>

      {/* Área de Conteúdo Principal */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'} p-8`}>
        <header className="flex justify-between items-start mb-10">
          <div>
            <p className="text-blue-400 font-bold text-xs uppercase tracking-[0.2em] mb-1">{empresa?.nome}</p>
            <h1 className="text-3xl font-bold text-white tracking-tight">{title}</h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              {profile?.nome_completo?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
