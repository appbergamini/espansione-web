import { Pipeline } from '../../../lib/ai/pipeline';
import { getServerUser } from '../../../lib/getServerUser';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

// 300s é o default Fluid Compute e o teto do Pro plan. Plans Hobby
// têm teto menor (60s); se estiver em Hobby, o pipeline quebra em
// agentes longos e é hora de subir de plano.
export const maxDuration = 300;
export const config = { maxDuration: 300 };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { user } = await getServerUser(req, res);
  if (!user) return res.status(401).json({ success: false, error: 'Não autenticado' });

  const { projetoId, agentNum, modelKey } = req.body;
  if (!projetoId || agentNum === undefined) {
    return res.status(400).json({ success: false, error: 'Faltando projetoId ou agentNum' });
  }

  const db = supabaseAdmin;
  const [{ data: profile }, { data: projeto }] = await Promise.all([
    db.from('profiles').select('empresa_id, role').eq('id', user.id).single(),
    db.from('projetos').select('empresa_id, responsavel_email').eq('id', projetoId).single(),
  ]);

  if (!projeto) return res.status(404).json({ success: false, error: 'Projeto não encontrado' });

  const isMaster = profile?.role === 'master';
  const sameEmpresa = profile?.empresa_id === projeto.empresa_id;
  const isResponsavel = projeto.responsavel_email && projeto.responsavel_email === user.email;
  if (!isMaster && !sameEmpresa && !isResponsavel) {
    return res.status(403).json({ success: false, error: 'Acesso negado a este projeto' });
  }

  try {
    const parsedAgentNum = parseInt(agentNum, 10);
    const result = await Pipeline.runAgent(projetoId, parsedAgentNum, modelKey);
    return res.status(200).json({ success: true, agentNum: parsedAgentNum, output: result });
  } catch (err) {
    console.error(`[API Engine] Erro ao rodar agente ${agentNum}:`, err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
