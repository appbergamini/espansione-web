// patches/components/DashboardLayout.v2.js
// Variação GOVERNANTE: sidebar sólida azul marinho #00326D ocupando o território
// da marca. Selo vermelho indica projeto ativo. Eyebrow usa "Cliente · Protocolo".
// Substitua o import do DashboardLayout pelo atual de components/DashboardLayout.js.

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import Logo from './Logo';
import Icon from './Icon';

export default function DashboardLayout({ children, title = 'Espansione' }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profile, setProfile] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      try {
        const { data: p, error } = await supabase
          .from('profiles').select('*, empresas(*)')
          .eq('id', session.user.id).single();
        if (error) throw error;
        setProfile(p); setEmpresa(p.empresas);
      } catch (err) { console.error('Erro no layout:', err); }
      finally { setLoading(false); }
    }
    loadData();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F0F0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00326D]"></div>
      </div>
    );
  }

  const menuItems = [
    { label: 'Visão Geral',     icon: 'home',     href: '/dashboard',          active: router.pathname === '/dashboard' },
    { label: 'Protocolos',      icon: 'folder',   href: '/dashboard/projetos', active: router.pathname === '/dashboard/projetos' },
    { label: 'Equipe & Perfis', icon: 'users',    href: '/dashboard/equipe',   active: router.pathname === '/dashboard/equipe' },
    { label: 'Configurações',   icon: 'settings', href: '#',                   active: false },
  ];

  return (
    <div className="min-h-screen bg-[#F5F3EE] text-[#1A1A1A] font-sans selection:bg-[#00326D]/15">
      <Head><title>{title} | {empresa?.nome || 'Espansione'}</title></Head>

      {/* ─── SIDEBAR · Azul marinho sólido (Governante) ─── */}
      <aside
        className={`fixed top-0 left-0 h-full z-40 transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-64' : 'w-20'}`}
        style={{ background: '#00326D', color: '#FEFEFE' }}
      >
        {/* topo: logo + linha de corte vermelha */}
        <div className="relative">
          <div className="p-6 flex items-center gap-3 overflow-hidden">
            <Logo size="sm" variant="light" />
          </div>
          <div className="h-[3px] w-10 ml-6" style={{ background: '#Da3144' }} />
        </div>

        {/* identificador institucional */}
        {sidebarOpen && (
          <div className="px-6 pt-6 pb-4">
            <p className="text-[10px] font-bold tracking-[0.24em] uppercase" style={{ color: '#EE969D', fontFamily: 'var(--font-ui)' }}>
              Protocolo · 2026
            </p>
            <p className="text-[11px] mt-1 leading-tight" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-body)' }}>
              Método Espansione de diagnóstico e estruturação de marca.
            </p>
          </div>
        )}

        <nav className="flex-1 mt-2 px-3 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex items-center gap-4 px-4 py-3 rounded-md transition-colors ${
                item.active
                  ? 'text-white'
                  : 'text-white/65 hover:text-white hover:bg-white/5'
              }`}
              style={item.active ? { background: 'rgba(255,255,255,0.08)' } : undefined}
            >
              {/* selo vermelho no ativo */}
              {item.active && (
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r"
                  style={{ background: '#Da3144' }}
                />
              )}
              <Icon name={item.icon} size={18} aria-label={item.label} />
              {sidebarOpen && (
                <span className="text-[13px] tracking-wide" style={{ fontFamily: 'var(--font-ui)', fontWeight: item.active ? 700 : 500 }}>
                  {item.label}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* rodapé: assinatura institucional */}
        {sidebarOpen && (
          <div className="px-6 py-4 border-t border-white/10">
            <p className="text-[9px] tracking-[0.22em] uppercase font-bold" style={{ color: '#EE969D', fontFamily: 'var(--font-ui)' }}>
              Em operação
            </p>
            <p className="text-[11px] mt-1 leading-snug" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'var(--font-body)' }}>
              {profile?.nome_completo || 'Usuário'}
              <br />
              <span style={{ color: 'rgba(255,255,255,0.45)' }}>{empresa?.nome || '—'}</span>
            </p>
          </div>
        )}

        <div className="p-3 border-t border-white/10 space-y-1">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-2.5 rounded-md transition-colors text-white/70 hover:text-white hover:bg-[#Da3144]/30"
            aria-label="Sair"
          >
            <Icon name="logout" size={18} />
            {sidebarOpen && <span className="text-[13px] font-bold tracking-wide" style={{ fontFamily: 'var(--font-ui)' }}>Encerrar sessão</span>}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center p-2 rounded bg-white/5 hover:bg-white/10 transition-colors"
            aria-label={sidebarOpen ? 'Recolher' : 'Expandir'}
          >
            <Icon name="chevronRight" size={12} style={{ transform: sidebarOpen ? 'rotate(180deg)' : 'none', color: '#FEFEFE' }} />
          </button>
        </div>
      </aside>

      {/* ─── MAIN · papel claro com hierarquia institucional ─── */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'} p-10`} style={{ background: '#F5F3EE', minHeight: '100vh' }}>
        <header className="pb-6 mb-10" style={{ borderBottom: '1px solid #1A1A1A' }}>
          <div className="flex justify-between items-end gap-6">
            <div>
              <p
                className="text-[10px] font-bold uppercase mb-2"
                style={{ color: '#Da3144', letterSpacing: '0.24em', fontFamily: 'var(--font-ui)' }}
              >
                {empresa?.nome || 'Cliente'} · Protocolo ativo
              </p>
              <h1
                className="text-[34px] leading-[1.05] tracking-tight"
                style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, color: '#00326D' }}
              >
                {title}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {/* selo de data/versão */}
              <div className="text-right" style={{ fontFamily: 'var(--font-ui)' }}>
                <p className="text-[9px] font-bold tracking-[0.22em] uppercase" style={{ color: '#6E7480' }}>Hoje</p>
                <p className="text-[13px] font-bold" style={{ color: '#1A1A1A' }}>
                  {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                style={{ background: '#00326D', fontFamily: 'var(--font-ui)' }}
              >
                {profile?.nome_completo?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
