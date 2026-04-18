import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import DashboardLayout from '../../components/DashboardLayout';

export default function EquipePage() {
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailToInvite, setEmailToInvite] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [inviting, setInviting] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', msg }

  useEffect(() => {
    loadEquipe();
  }, []);

  // Limpa feedback após 5s
  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 5000);
    return () => clearTimeout(t);
  }, [feedback]);

  async function loadEquipe() {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setUserProfile(profile);

      const { data: membersData } = await supabase
        .from('profiles')
        .select('*')
        .eq('empresa_id', profile.empresa_id);
      setMembers(membersData || []);

      const { data: invitesData } = await supabase
        .from('convites')
        .select('*')
        .eq('empresa_id', profile.empresa_id)
        .eq('status', 'pendente');
      setInvites(invitesData || []);

    } catch (err) {
      console.error('Erro ao carregar equipe:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendInvite(e) {
    e.preventDefault();
    if (!emailToInvite) return;
    setInviting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/convites/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToInvite }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao enviar convite.');
      }

      setFeedback({ type: 'success', msg: `Magic Link enviado para ${emailToInvite}` });
      setEmailToInvite('');
      loadEquipe();
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message });
    } finally {
      setInviting(false);
    }
  }

  if (userProfile?.role !== 'admin' && !loading) {
    return (
      <DashboardLayout title="Acesso Negado">
        <div className="p-12 text-center">Somente administradores podem gerenciar a equipe.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Gestao de Equipe">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Lado Esquerdo: Listagem de Membros */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-slate-800/50">
              <h2 className="font-bold text-white">Membros Ativos</h2>
              <p className="text-slate-500 text-sm mt-1">Pessoas vinculadas a sua empresa no Espansione.</p>
            </div>

            <div className="overflow-x-auto text-left">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-800/10 border-b border-slate-800/30">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Nome</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">E-mail</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Nivel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/20">
                  {members.map(member => (
                    <tr key={member.id} className="hover:bg-slate-800/10 transition-colors">
                      <td className="px-6 py-4 font-bold text-white">{member.nome_completo || 'Sem Nome'}</td>
                      <td className="px-6 py-4 text-slate-400 text-sm truncate">{member.email}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          member.role === 'admin' ? 'text-amber-400 border-amber-400/20 bg-amber-400/5' : 'text-slate-400 border-slate-400/20 bg-slate-400/5'
                        }`}>
                          {member.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {members.length === 0 && !loading && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-slate-600 text-sm">Nenhum membro encontrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Convites Pendentes */}
          {invites.length > 0 && (
            <div className="glass-card">
              <div className="p-6 border-b border-slate-800/50">
                <h3 className="font-bold text-white">Convites Aguardando Aceite</h3>
                <p className="text-slate-500 text-sm mt-1">Magic Links enviados que ainda nao foram utilizados.</p>
              </div>
              <div className="divide-y divide-slate-800/20">
                {invites.map(invite => (
                  <div key={invite.id} className="p-6 flex justify-between items-center bg-slate-800/5">
                    <div>
                      <span className="text-slate-200 text-sm">{invite.email}</span>
                      <span className="ml-3 text-[10px] text-slate-600">
                        {new Date(invite.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1 rounded-full uppercase font-bold tracking-widest">
                      Aguardando
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Lado Direito: Formulario de Convite */}
        <div className="space-y-6">
          <div className="glass-card p-8 bg-gradient-to-br from-blue-600/10 to-rose-600/10">
            <h3 className="text-lg font-bold text-white mb-2">Convidar Membro</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Um <strong>Magic Link</strong> sera enviado por e-mail. Ao clicar, o convidado sera autenticado e vinculado automaticamente a sua empresa como <strong>Membro</strong>.
            </p>

            {/* Feedback */}
            {feedback && (
              <div className={`mb-4 p-3 rounded-lg text-xs text-center border ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}>
                {feedback.msg}
              </div>
            )}

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">E-mail do Convidado</label>
                <input
                  required
                  type="email"
                  className="w-full bg-[#0a1122] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
                  value={emailToInvite}
                  onChange={e => setEmailToInvite(e.target.value)}
                  placeholder="parceiro@empresa.com"
                />
              </div>
              <button
                disabled={inviting}
                type="submit"
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/40"
              >
                {inviting ? 'Enviando Magic Link...' : 'Enviar Magic Link'}
              </button>
            </form>
          </div>

          <div className="glass-card p-6 border-dashed border-slate-800">
             <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Como funciona</h4>
             <ol className="text-xs text-slate-500 leading-relaxed space-y-2 list-decimal list-inside">
               <li>Voce digita o e-mail e envia o convite</li>
               <li>O convidado recebe um Magic Link por e-mail</li>
               <li>Ao clicar, ele e autenticado automaticamente</li>
               <li>O perfil e criado com acesso a sua empresa</li>
             </ol>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
