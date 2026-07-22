// GET /api/adm/leads — admin (master/admin). Lista os leads do funil do Mapa:
// quem preencheu o cadastro em /mapa (mapa_assessments sem projeto vinculado).
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { createApiHandler } from '../../../lib/api/http';
import { requireRole } from '../../../lib/api/auth';
import { perguntasQuePontuam } from '../../../lib/mapa-maturidade/catalog';

export default createApiHandler({
  async GET(req, res) {
    await requireRole(req, res);
    const db = supabaseAdmin;

    const { data, error } = await db
      .from('mapa_assessments')
      .select('id, token, status, cadastro_json, result_json, started_at, completed_at')
      .is('projeto_id', null)
      .order('started_at', { ascending: false })
      .limit(500);
    if (error) return res.status(500).json({ success: false, error: error.message });

    // progresso dos não concluídos (quantas perguntas já responderam)
    const pendentes = (data || []).filter((a) => a.status !== 'concluido').map((a) => a.id);
    const respostasPor = {};
    if (pendentes.length) {
      const { data: resp } = await db
        .from('mapa_answers')
        .select('assessment_id')
        .in('assessment_id', pendentes);
      for (const r of resp || []) respostasPor[r.assessment_id] = (respostasPor[r.assessment_id] || 0) + 1;
    }

    const totalPerguntas = perguntasQuePontuam().length;
    const leads = (data || []).map((a) => {
      const c = a.cadastro_json || {};
      return {
        id: a.id,
        token: a.token,
        status: a.status,
        started_at: a.started_at,
        completed_at: a.completed_at,
        nome: c['CAD-MM-001'] || null,
        empresa: c['CAD-MM-002'] || c.empresa || null,
        papel: c['CAD-MM-003'] || null,
        porte: c['CAD-MM-004'] || null,
        segmento: c['CAD-MM-005'] || null,
        contato: c['CAD-MM-006'] || null,
        respondidas: a.status === 'concluido' ? totalPerguntas : respostasPor[a.id] || 0,
        total_perguntas: totalPerguntas,
        score: a.result_json?.general_score ?? null,
        nivel: a.result_json?.general_level ?? null,
      };
    });

    return res.status(200).json({ success: true, leads });
  },
});
