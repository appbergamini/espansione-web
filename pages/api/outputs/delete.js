import { getServerUser } from '../../../lib/getServerUser';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { AGENT_CONFIGS } from '../../../lib/ai/pipeline';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { user } = await getServerUser(req, res);
  if (!user) return res.status(401).json({ success: false, error: 'Não autenticado' });

  const { projetoId, agentNum } = req.body || {};
  if (!projetoId || agentNum === undefined || agentNum === null) {
    return res.status(400).json({ success: false, error: 'Faltando projetoId ou agentNum' });
  }

  const db = supabaseAdmin;

  const [{ data: profile }, { data: projeto }] = await Promise.all([
    db.from('profiles').select('role, empresa_id').eq('id', user.id).single(),
    db.from('projetos').select('empresa_id, responsavel_email').eq('id', projetoId).single(),
  ]);
  if (!projeto) return res.status(404).json({ success: false, error: 'Projeto não encontrado' });

  const isMaster = profile?.role === 'master';
  const sameEmpresa = profile?.empresa_id === projeto.empresa_id;
  const isResponsavel = projeto.responsavel_email && projeto.responsavel_email === user.email;
  if (!isMaster && !sameEmpresa && !isResponsavel) {
    return res.status(403).json({ success: false, error: 'Acesso negado' });
  }

  const parsedNum = parseInt(agentNum, 10);
  if (!AGENT_CONFIGS[parsedNum]) {
    return res.status(400).json({ success: false, error: `Agente ${agentNum} inválido` });
  }

  try {
    const { error: delErr } = await db
      .from('outputs')
      .delete()
      .eq('projeto_id', projetoId)
      .eq('agent_num', parsedNum);
    if (delErr) throw new Error(delErr.message);

    await db
      .from('logs_execucao')
      .delete()
      .eq('projeto_id', projetoId)
      .eq('agente', String(parsedNum));

    const cfg = AGENT_CONFIGS[parsedNum];
    if (cfg?.checkpoint) {
      await db
        .from('checkpoints')
        .delete()
        .eq('projeto_id', projetoId)
        .eq('checkpoint_num', cfg.checkpoint);
    }

    const { data: remaining } = await db
      .from('outputs')
      .select('agent_num')
      .eq('projeto_id', projetoId)
      .order('agent_num', { ascending: false })
      .limit(1);

    const lastAgent = remaining && remaining.length > 0 ? remaining[0].agent_num : 0;
    const newStatus = lastAgent === 0 ? 'criado' : `agente_${lastAgent}_concluido`;
    await db
      .from('projetos')
      .update({ status: newStatus, etapa_atual: lastAgent })
      .eq('id', projetoId);

    return res.status(200).json({ success: true, agentNum: parsedNum, newStatus, lastAgent });
  } catch (err) {
    console.error('[API outputs/delete]', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
