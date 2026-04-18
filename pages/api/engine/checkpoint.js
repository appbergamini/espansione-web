import { getServerUser } from '../../../lib/getServerUser';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { user } = await getServerUser(req, res);
  if (!user) return res.status(401).json({ success: false, error: 'Não autenticado' });

  const { projetoId, checkpointNum, status, notas } = req.body;
  if (!projetoId || checkpointNum === undefined) {
    return res.status(400).json({ success: false, error: 'Faltando projetoId ou checkpointNum' });
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

  const finalStatus = status || 'aprovado';

  try {
    const { data: ckpt } = await db
      .from('checkpoints')
      .select('id')
      .eq('projeto_id', projetoId)
      .eq('checkpoint_num', checkpointNum)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (ckpt) {
      const { error: updErr } = await db
        .from('checkpoints')
        .update({ status: finalStatus, notas: notas || '' })
        .eq('id', ckpt.id);
      if (updErr) throw updErr;
    }

    const { error: projErr } = await db
      .from('projetos')
      .update({ status: `checkpoint_${checkpointNum}_${finalStatus}` })
      .eq('id', projetoId);
    if (projErr) throw projErr;

    return res.status(200).json({ success: true, checkpointNum, status: finalStatus });
  } catch (err) {
    console.error(`[API Engine] Erro ao atualizar checkpoint ${checkpointNum}:`, err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
