import { getServerUser } from '../../../lib/getServerUser';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import {
  createCuratedEvidencePack,
  getLatestCuratedEvidencePack,
  markCuratedEvidencePackReady,
  updateCuratedEvidencePack,
} from '../../../lib/curated-evidence/pack';

export default async function handler(req, res) {
  const { user } = await getServerUser(req, res);
  if (!user) return res.status(401).json({ success: false, error: 'Não autenticado' });

  const db = supabaseAdmin;
  const { data: profile } = await db
    .from('profiles')
    .select('role,empresa_id')
    .eq('id', user.id)
    .single();

  if (!profile || !['master', 'admin'].includes(profile.role)) {
    return res.status(403).json({ success: false, error: 'Apenas master/admin' });
  }

  try {
    if (req.method === 'GET') {
      const projectId = req.query.project_id;
      if (!projectId) return res.status(400).json({ success: false, error: 'project_id obrigatório' });
      await assertProjectAccess(db, profile, projectId);
      const pack = await getLatestCuratedEvidencePack(db, projectId);
      return res.status(200).json({ success: true, pack });
    }

    if (req.method === 'POST') {
      const { project_id: projectId, id, action } = req.body || {};
      if (!projectId) return res.status(400).json({ success: false, error: 'project_id obrigatório' });
      await assertProjectAccess(db, profile, projectId);

      if (action === 'mark_ready') {
        if (!id) return res.status(400).json({ success: false, error: 'id obrigatório' });
        const pack = await markCuratedEvidencePackReady(db, id);
        return res.status(200).json({ success: true, pack });
      }

      const payload = req.body?.pack || req.body;
      const pack = id
        ? await updateCuratedEvidencePack(db, id, payload)
        : await createCuratedEvidencePack(db, payload);
      return res.status(200).json({ success: true, pack });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('[API curated-evidence-packs]', error);
    return res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
}

async function assertProjectAccess(db, profile, projectId) {
  const { data: project, error } = await db
    .from('projetos')
    .select('empresa_id')
    .eq('id', projectId)
    .single();

  if (error || !project) {
    const notFound = new Error('Projeto não encontrado');
    notFound.statusCode = 404;
    throw notFound;
  }

  if (profile.role !== 'master' && project.empresa_id !== profile.empresa_id) {
    const denied = new Error('Acesso negado a este projeto');
    denied.statusCode = 403;
    throw denied;
  }
}
