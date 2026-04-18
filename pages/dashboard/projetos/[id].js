import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Logo from '../../../components/Logo';
import { supabase } from '../../../lib/supabaseClient';

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
        .from('profiles')
        .select('nome_completo, role')
        .eq('id', session.user.id)
        .single();
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
        if (json.success) {
          setData(json.data);
        } else {
          setErrorMsg(json.error || 'Erro ao carregar projeto');
        }
      } catch {
        setErrorMsg('Falha de conexão.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040812] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-[#040812] flex items-center justify-center text-white">
        <div className="glass-card p-8 text-center max-w-md">
          <p className="text-rose-400 mb-4">{errorMsg}</p>
          <button onClick={() => router.push('/dashboard')} className="text-blue-400 hover:underline text-sm">
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!data?.projeto) {
    return (
      <div className="min-h-screen bg-[#040812] flex items-center justify-center text-white">
        <p className="text-slate-500">Projeto nao encontrado.</p>
      </div>
    );
  }

  const { projeto, outputs = [], formularios = [], intake, cisParticipantes = [] } = data;
  const sc = STATUS_COLORS[projeto.status] || STATUS_COLORS.planejamento;
  const progress = Math.min(100, ((projeto.etapa_atual || 0) / 13) * 100);
  const cisRespondidos = cisParticipantes.filter(p => p.respondido).length;

  const renderText = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => <span key={i}>{line}<br /></span>);
  };

  return (
    <div className="min-h-screen bg-[#040812] text-slate-200 font-sans">
      <Head>
        <title>{projeto.cliente} | Espansione</title>
      </Head>

      {/* Header */}
      <header className="border-b border-slate-800/50 bg-[#0a1122]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <div style={{ height: '32px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <button onClick={() => router.push('/dashboard')} className="text-sm text-blue-400 hover:underline">
              Dashboard
            </button>
            <span className="text-slate-600">/</span>
            <span className="text-sm text-slate-400">{projeto.cliente}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-300 hidden sm:inline">{userName}</span>
            <button onClick={handleLogout} className="text-sm text-rose-400 hover:text-rose-300 font-semibold">Sair</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Titulo + Status */}
        <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{projeto.cliente}</h1>
            <div className="flex items-center gap-3">
              <span style={{
                padding: '0.25rem 0.75rem', fontSize: '0.75rem', borderRadius: '12px',
                background: sc.bg, color: sc.color, fontWeight: 700, textTransform: 'uppercase',
              }}>
                {STATUS_LABELS[projeto.status] || projeto.status}
              </span>
              <span className="text-slate-500 text-sm">{Math.round(progress)}% concluido</span>
            </div>
          </div>
          <div className="w-48">
            <div className="text-xs text-slate-500 mb-1 text-right">Progresso geral</div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna esquerda: Status + CIS */}
          <div className="space-y-6">
            {/* Diagnosticos */}
            <div className="glass-card p-6">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Diagnosticos</h2>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between">
                  <span>{intake && Object.keys(intake).length > 2 ? '✅' : '⏳'} Formulario Inicial</span>
                </li>
                <li className="flex justify-between">
                  <span>{formularios.some(f => f.tipo === 'proposito') ? '✅' : '⏳'} Lideranca (Proposito)</span>
                </li>
                <li className="flex justify-between">
                  <span>{formularios.some(f => f.tipo === 'pesquisa_colaboradores') ? '✅' : '⏳'} Equipe (Clima)</span>
                </li>
              </ul>
            </div>

            {/* CIS */}
            <div className="glass-card p-6">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Mapeamento Comportamental</h2>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold text-white">{cisRespondidos}/{cisParticipantes.length}</span>
                <span className="text-xs text-slate-500">respondidos</span>
              </div>
              {cisParticipantes.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {cisParticipantes.map(p => (
                    <div key={p.id} className="flex justify-between items-center text-xs bg-slate-800/30 rounded-lg px-3 py-2">
                      <div>
                        <span className="text-white font-semibold">{p.nome}</span>
                        {p.cargo && <span className="text-slate-500 ml-2">{p.cargo}</span>}
                      </div>
                      <span>{p.respondido ? '✅' : '⏳'}</span>
                    </div>
                  ))}
                </div>
              )}
              {cisParticipantes.length === 0 && (
                <p className="text-slate-600 text-xs">Nenhum participante cadastrado.</p>
              )}
            </div>
          </div>

          {/* Coluna direita: Outputs/Relatorios */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Relatorios Gerados</h2>

              {outputs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-600">Nenhum relatorio gerado ainda.</p>
                  <p className="text-slate-700 text-xs mt-1">Os relatorios aparecerao aqui conforme os agentes forem executados.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {[...outputs].sort((a, b) => b.agent_num - a.agent_num).map(out => (
                    <div key={out.id} className="bg-slate-800/20 border border-slate-800/40 rounded-xl overflow-hidden">
                      <div className="flex justify-between items-center px-5 py-3 bg-slate-800/20 border-b border-slate-800/30">
                        <h3 className="text-sm font-bold text-white">
                          Relatorio {out.agent_num + 1}
                        </h3>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">Concluido</span>
                      </div>
                      <div className="px-5 py-4 text-sm text-slate-400 leading-relaxed">
                        {out.resumo_executivo && (
                          <div className="mb-3">
                            <strong className="text-white text-xs uppercase tracking-widest">Resumo Executivo</strong>
                            <div className="mt-1">{renderText(out.resumo_executivo)}</div>
                          </div>
                        )}
                        <details className="cursor-pointer">
                          <summary className="text-blue-400 text-xs font-semibold hover:underline">Ver documento completo</summary>
                          <div className="mt-3 p-4 bg-black/20 rounded-lg text-xs leading-relaxed">
                            {renderText(out.conteudo)}
                            {out.conclusoes && (
                              <div className="mt-3 pt-3 border-t border-slate-800/30">
                                <strong className="text-white">Conclusoes:</strong>
                                <div className="mt-1">{renderText(out.conclusoes)}</div>
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
