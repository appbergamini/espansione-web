// GET /api/adm/cockpit/[id] — admin (master/admin)
// Agrega o estado da jornada da empresa (maturidade, identidade, pessoas,
// entregáveis) e devolve o JSON do cockpit já com status, bloqueios e ações.

import { getServerUser } from '../../../../lib/getServerUser';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { computeCockpit } from '../../../../lib/cockpit/journey';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' });
  if (!supabaseAdmin) return res.status(500).json({ success: false, error: 'Supabase indisponível' });

  const { id } = req.query;
  if (!id) return res.status(400).json({ success: false, error: 'id obrigatório' });

  const { user } = await getServerUser(req, res);
  if (!user) return res.status(401).json({ success: false, error: 'Não autenticado' });

  const db = supabaseAdmin;
  const { data: profile } = await db.from('profiles').select('role,empresa_id').eq('id', user.id).single();
  if (!profile || !['master', 'admin'].includes(profile.role)) {
    return res.status(403).json({ success: false, error: 'Apenas master/admin' });
  }

  const { data: projeto } = await db.from('projetos').select('*').eq('id', id).single();
  if (!projeto) return res.status(404).json({ success: false, error: 'Projeto não encontrado' });
  if (profile.role === 'admin' && projeto.empresa_id !== profile.empresa_id) {
    return res.status(403).json({ success: false, error: 'Projeto de outra empresa' });
  }

  try {
    const [matRes, idnRes, respRes, outRes] = await Promise.all([
      db.from('mapa_assessments').select('status, general_score, general_level, result_json, completed_at, created_at').eq('projeto_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      db.from('identity_assessments').select('id, status, result_json, completed_at, created_at').eq('projeto_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      db.from('respondentes').select('papel, respondido').eq('projeto_id', id),
      db.from('outputs').select('agent_num, status').eq('projeto_id', id),
    ]);

    const maturidade = matRes.data || null;
    const identidade = idnRes.data || null;

    // status por formulário de identidade
    const identidadeForms = {};
    if (identidade) {
      const { data: subs } = await db
        .from('identity_submissions')
        .select('form_type, status, is_anonymous')
        .eq('identity_assessment_id', identidade.id);
      for (const s of subs || []) {
        if (s.is_anonymous) continue; // mirrors tratados via agregados abaixo
        if (s.status === 'completed' || !identidadeForms[s.form_type]) identidadeForms[s.form_type] = s.status;
      }
      const r = identidade.result_json || {};
      identidadeForms.identity_internal_mirror_v1 = (r.internal_mirror?.respondents_count || 0) > 0 ? 'in_progress' : 'not_started';
      identidadeForms.identity_external_mirror_v1 = (r.external_mirror?.respondents_count || 0) > 0 ? 'in_progress' : 'not_started';
    }

    // pessoas (aproximação: respondentes por papel + flag respondido)
    const resp = respRes.data || [];
    const tally = (papel) => {
      const lst = resp.filter((r) => r.papel === papel);
      return { total: lst.length, concluidos: lst.filter((r) => r.respondido).length };
    };
    const pessoas = { socios: tally('socios'), equipe: tally('colaboradores') };

    const cockpit = computeCockpit({
      projeto,
      maturidade,
      identidade,
      identidadeForms,
      pessoas,
      outputs: outRes.data || [],
    });

    return res.status(200).json({ success: true, cockpit });
  } catch (e) {
    console.error('[adm/cockpit]', e);
    return res.status(500).json({ success: false, error: e.message || 'Erro' });
  }
}
