import { getServerUser } from '../../../lib/getServerUser';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id) return res.status(400).json({ success: false, error: 'ID is missing' });

  const { user } = await getServerUser(req, res);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Não autenticado' });
  }

  const db = supabaseAdmin;

  try {
    const { data: projeto, error: projError } = await db
      .from('projetos')
      .select('*')
      .eq('id', id)
      .single();

    if (projError || !projeto) {
      return res.status(404).json({ success: false, error: 'Projeto não encontrado' });
    }

    // Verificar acesso (master ou mesma empresa)
    const { data: profile } = await db
      .from('profiles')
      .select('empresa_id, role')
      .eq('id', user.id)
      .single();

    const isMaster = profile?.role === 'master';

    const isResponsavel = projeto.responsavel_email && projeto.responsavel_email === user.email;
    const sameEmpresa = profile?.empresa_id === projeto.empresa_id;

    if (!profile || (!isMaster && !isResponsavel && !sameEmpresa)) {
      return res.status(403).json({ success: false, error: 'Acesso negado a este projeto' });
    }

    const [intakeRes, formRes, outputsRes, checkpointsRes, cisRes, respRes, cisAssessRes] = await Promise.all([
      db.from('intake_data').select('campo, valor').eq('projeto_id', id),
      db.from('formularios').select('*').eq('projeto_id', id).order('created_at', { ascending: true }),
      db.from('outputs').select('*').eq('projeto_id', id).order('agent_num', { ascending: true }),
      db.from('checkpoints').select('*').eq('projeto_id', id).eq('status', 'pendente'),
      db.from('cis_participantes').select('*').eq('projeto_id', id).order('created_at', { ascending: false }),
      db.from('respondentes').select('*').eq('projeto_id', id).order('created_at', { ascending: true }),
      db.from('cis_assessments').select('*').eq('projeto_id', id).order('created_at', { ascending: true }),
    ]);

    const intake = {};
    if (intakeRes.data) {
      intakeRes.data.forEach(row => { intake[row.campo] = row.valor; });
    }

    return res.status(200).json({
      success: true,
      data: {
        projeto,
        intake,
        formularios: formRes.data || [],
        outputs: outputsRes.data || [],
        pendingCheckpoints: checkpointsRes.data || [],
        cisParticipantes: cisRes.data || [],
        cisAssessments: cisAssessRes.data || [],
        respondentes: respRes.data || [],
      }
    });
  } catch (err) {
    console.error("Erro API /adm/[id]:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
