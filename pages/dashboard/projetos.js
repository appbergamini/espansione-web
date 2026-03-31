import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import DashboardLayout from '../../components/DashboardLayout';

export default function ProjetosPage() {
  const [projetos, setProjetos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ nome: '', descricao: '' });

  useEffect(() => {
    fetchProjetos();
  }, []);

  async function fetchProjetos() {
    setLoading(true);
    try {
      // O RLS cuidará de filtrar apenas os projetos da empresa do usuário
      const { data, error } = await supabase
        .from('projetos')
        .select('*')
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
      
      // Precisamos pegar o empresa_id do perfil do usuário para inserir
      const { data: profile } = await supabase
        .from('profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single();

      const { error } = await supabase.from('projetos').insert([
        { 
          nome: newProject.nome, 
          descricao: newProject.descricao,
          empresa_id: profile.empresa_id 
        }
      ]);

      if (error) throw error;
      
      setShowModal(false);
      setNewProject({ nome: '', descricao: '' });
      fetchProjetos();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <DashboardLayout title="Meus Projetos">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-bold text-white">Listagem de Projetos</h2>
          <p className="text-slate-500 text-sm">Gerencie os projetos estratégicos da sua empresa.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
        >
          <span className="text-xl leading-none">+</span> Novo Projeto
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Carregando projetos estratégicos...</div>
        ) : projetos.length === 0 ? (
          <div className="p-20 text-center">
            <div className="text-4xl mb-4 opacity-20">📁</div>
            <p className="text-slate-400">Nenhum projeto encontrado para esta empresa.</p>
            <button onClick={() => setShowModal(true)} className="text-blue-400 hover:underline mt-2 text-sm font-medium">Clique para criar o primeiro</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/20 border-b border-slate-800/50">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Projeto</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Progresso</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Criado em</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {projetos.map((proj) => (
                  <tr key={proj.id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="px-6 py-5">
                      <div className="font-bold text-white">{proj.nome}</div>
                      <div className="text-xs text-slate-500 mt-1 line-clamp-1">{proj.descricao || 'Sem descrição.'}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-current ${
                        proj.status === 'em_andamento' ? 'text-blue-400 bg-blue-500/10' : 
                        proj.status === 'concluido' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 bg-slate-500/10'
                      }`}>
                        {proj.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${proj.progresso}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-white">{proj.progresso}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-500">
                      {new Date(proj.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="text-slate-500 hover:text-white transition-colors p-2">⚙️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Simples para Novo Projeto */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-8 animate-fade-in shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <h3 className="text-xl font-bold text-white mb-6">Novo Projeto Estratégico</h3>
            <form onSubmit={handleCreateProject} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nome do Projeto</label>
                <input 
                  required
                  className="w-full bg-[#0a1122] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none" 
                  value={newProject.nome}
                  onChange={e => setNewProject({...newProject, nome: e.target.value})}
                  placeholder="Ex: Rebranding 2024"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Descrição Curta</label>
                <textarea 
                  className="w-full bg-[#0a1122] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none h-24 resize-none" 
                  value={newProject.descricao}
                  onChange={e => setNewProject({...newProject, descricao: e.target.value})}
                  placeholder="Objetivos e escopo do projeto..."
                />
              </div>
              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border border-slate-800 rounded-xl text-sm font-bold hover:bg-slate-800/30 transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all">Criar Projeto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
