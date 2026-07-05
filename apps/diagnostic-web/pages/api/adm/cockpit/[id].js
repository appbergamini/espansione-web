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
      db.from('id_v2_assessments').select('id, status, result_json, completed_at, created_at').eq('projeto_id', id).eq('produto', 'identidade_final').order('created_at', { ascending: false }).limit(1).maybeSingle(),
      db.from('respondentes').select('papel, respondido').eq('projeto_id', id),
      db.from('outputs').select('agent_num, status').eq('projeto_id', id),
    ]);

    const maturidade = matRes.data || null;
    const identidade = idnRes.data || null;

    // status por público do Mapa de Identidade (FINAL): completo se ≥1
    // respondente concluído; em andamento se há respondente; senão não iniciado.
    const identidadeForms = {};
    if (identidade) {
      const { data: reps } = await db
        .from('id_v2_respondents')
        .select('publico, status')
        .eq('assessment_id', identidade.id);
      const byPub = {};
      for (const r of reps || []) {
        (byPub[r.publico] = byPub[r.publico] || { total: 0, done: 0 }).total++;
        if (r.status === 'completed') byPub[r.publico].done++;
      }
      for (const p of ['socios', 'colaboradores', 'clientes']) {
        const b = byPub[p];
        identidadeForms[p] = !b ? 'not_started' : b.done > 0 ? 'completed' : 'in_progress';
      }
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
