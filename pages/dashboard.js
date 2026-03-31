import Head from 'next/head';
import { useState } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Mock data conforme solicitado
  const stats = [
    { label: 'Projetos Ativos', value: '12', icon: '📁', trend: '+2 este mês', color: 'text-blue-400' },
    { label: 'Respondentes CIS', value: '148', icon: '🧠', trend: '+15 hoje', color: 'text-purple-400' },
    { label: 'Checkpoints Pendentes', value: '5', icon: '🛑', trend: 'Ações requeridas', color: 'text-rose-400' },
    { label: 'Engajamento Médio', value: '94%', icon: '📊', trend: '+4% vs média', color: 'text-emerald-400' },
  ];

  const recentActivities = [
    { id: 1, user: 'João Silva', action: 'concluiu o Mapeamento CIS', project: 'Projeto Alpha', time: 'Há 12 min' },
    { id: 2, user: 'Admin', action: 'aprovou Checkpoint 02', project: 'Nexa Corp', time: 'Há 45 min' },
    { id: 3, user: 'Maria Souza', action: 'iniciou o Intake', project: 'Espansione Int.', time: 'Há 2 horas' },
    { id: 4, user: 'IA Orquestrador', action: 'gerou Diretrizes Estratégicas', project: 'Projeto Delta', time: 'Há 3 horas' },
  ];

  return (
    <div className="min-h-screen bg-[#040812] text-slate-200 font-sans selection:bg-blue-500/30">
      <Head>
        <title>Espansione | Dashboard</title>
      </Head>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full z-40 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} bg-[#0a1122] border-r border-slate-800/50 flex flex-col`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-rose-600 flex-shrink-0 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 text-xl italic">E</div>
          {sidebarOpen && <span className="font-bold text-xl tracking-tight text-white italic">ESPANSIONE</span>}
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-2">
          {[
            { label: 'Dashboard', icon: '🏠', active: true },
            { label: 'Projetos', icon: '📁', active: false },
            { label: 'Participantes', icon: '👥', active: false },
            { label: 'Relatórios', icon: '📈', active: false },
            { label: 'Configurações', icon: '⚙️', active: false },
          ].map((item) => (
            <Link key={item.label} href="#" className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${item.active ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800/50">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-full flex items-center justify-center p-2 rounded-lg bg-slate-800/30 hover:bg-slate-800/60 transition-colors">
             <span className="text-xs text-slate-500 font-bold tracking-widest uppercase">{sidebarOpen ? 'Recolher' : '≫'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'} p-8`}>
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Bom dia, Administrador</h1>
            <p className="text-slate-500 mt-1">Aqui está o resumo dos projetos ativos hoje.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex bg-slate-800/30 border border-slate-700/30 rounded-full px-4 py-2 items-center gap-2">
              <span className="text-slate-500">🔍</span>
              <input type="text" placeholder="Buscar..." className="bg-transparent border-none outline-none text-sm w-40" />
            </div>
            <div className="relative group">
               <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors overflow-hidden">
                  <img src="https://ui-avatars.com/api/?name=Admin&background=004198&color=fff" alt="Avatar" />
               </div>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-[#0a1122] border border-slate-800/50 p-6 rounded-2xl hover:border-slate-700 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <span className={`text-3xl bg-slate-800/30 w-12 h-12 flex items-center justify-center rounded-xl`}>{stat.icon}</span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Resumo</span>
              </div>
              <h3 className="text-slate-400 text-sm font-medium">{stat.label}</h3>
              <div className="flex items-end gap-3 mt-1">
                <span className="text-3xl font-bold text-white leading-none">{stat.value}</span>
                <span className={`text-xs mb-1 font-semibold ${stat.color}`}>{stat.trend}</span>
              </div>
            </div>
          ))}
        </section>

        {/* Big Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <section className="lg:col-span-2 bg-[#0a1122] border border-slate-800/50 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800/50 flex justify-between items-center">
              <h2 className="font-bold text-lg text-white">Atividades Recentes</h2>
              <button className="text-xs text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider">Ver tudo</button>
            </div>
            <div className="divide-y divide-slate-800/30">
              {recentActivities.map((act) => (
                <div key={act.id} className="p-6 flex items-center justify-between hover:bg-slate-800/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-400">
                      {act.user.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm text-slate-200">
                        <span className="font-bold">{act.user}</span> {act.action}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{act.project}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap">{act.time}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Stats / Right Panel */}
          <section className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600/20 to-rose-600/20 border border-slate-800/50 p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
              <h3 className="font-bold text-white mb-2">Novo Projeto</h3>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">Pronto para iniciar um novo branding? Cadastre aqui e nossa IA cuidará do resto.</p>
              <Link href="/adm/novo">
                <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/40">
                  + Iniciar Agora
                </button>
              </Link>
            </div>

            <div className="bg-[#0a1122] border border-slate-800/50 p-6 rounded-2xl">
              <h3 className="font-bold text-white mb-4">Mapeamentos Ativos</h3>
              <div className="space-y-4">
                {[
                  { name: 'Alpha Project', p: 85 },
                  { name: 'Nexa Corp', p: 30 },
                  { name: 'Delta Branding', p: 60 }
                ].map(item => (
                  <div key={item.name}>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-slate-400">{item.name}</span>
                      <span className="text-white font-bold">{item.p}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${item.p}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
