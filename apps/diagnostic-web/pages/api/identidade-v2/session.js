// /api/identidade-v2/session — PÚBLICO, por token de link (por público)
// GET  ?token=&rid=        → perguntas do formulário + respostas salvas
// POST { token, rid?, answers } → upsert das respostas (salva progressivo)
//
// Sócios: 1 respondente (não anônimo) por assessment. Colaboradores/Clientes:
// multi-respondente — cada pessoa é um respondente; o client guarda o rid.

import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { montarFormulario } from '../../../lib/identidade-v2/forms';

const TOKEN_RE = /^[a-f0-9]{32,64}$/;

// roteia o valor da resposta para a coluna certa
function toCells(value) {
  if (Array.isArray(value)) return { value_num: null, value_text: null, value_json: value };
  if (typeof value === 'number' && Number.isFinite(value)) return { value_num: value, value_text: null, value_json: null };
  return { value_num: null, value_text: value == null ? null : String(value), value_json: null };
}
function fromRow(r) {
  if (r.value_json !== null && r.value_json !== undefined) return r.value_json;
  if (r.value_num !== null && r.value_num !== undefined) return r.value_num;
  return r.value_text;
}

async function resolver(db, token) {
  const { data } = await db
    .from('id_v2_assessments')
    .select('id, produto, status, projeto_id, socios_token, colaboradores_token, clientes_token')
    .or(`socios_token.eq.${token},colaboradores_token.eq.${token},clientes_token.eq.${token}`)
    .maybeSingle();
  if (!data) return null;
  const publico = data.socios_token === token ? 'socios'
    : data.colaboradores_token === token ? 'colaboradores'
    : data.clientes_token === token ? 'clientes' : null;
  if (!publico) return null;
  return { assessment: data, publico };
}

// sócios: 1 respondente. Outros: por rid (ou cria novo no POST).
async function getRespondenteSocios(db, assessmentId, { criar } = {}) {
  const { data } = await db
    .from('id_v2_respondents')
    .select('id, status')
    .eq('assessment_id', assessmentId)
    .eq('publico', 'socios')
    .order('started_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (data || !criar) return data || null;
  const { data: nova, error } = await db
    .from('id_v2_respondents')
    .insert([{ assessment_id: assessmentId, publico: 'socios', subperfil: 'todos', is_anonymous: false, status: 'in_progress' }])
    .select('id, status')
    .single();
  if (error) throw error;
  return nova;
}

async function answersOf(db, respondentId) {
  if (!respondentId) return {};
  const { data } = await db
    .from('id_v2_answers')
    .select('question_id, value_num, value_text, value_json')
    .eq('respondent_id', respondentId);
  const map = {};
  for (const r of data || []) map[r.question_id] = fromRow(r);
  return map;
}

function slimPerguntas(perguntas) {
  return perguntas.map((p) => ({
    id: p.id, sistema: p.sistema, objetivo: p.objetivo, indicador: p.indicador,
    pergunta: p.pergunta, response_type: p.response_type, opcoes: p.opcoes,
    max_escolhas: p.max_escolhas, obrigatoria: p.obrigatoria, score_family: p.score_family,
    regra_condicional: p.regra_condicional || null,
  }));
}

export default async function handler(req, res) {
  if (!supabaseAdmin) return res.status(500).json({ success: false, error: 'Supabase indisponível' });
  const db = supabaseAdmin;
  const token = (req.method === 'GET' ? req.query.token : req.body?.token || '').toString().trim();
  if (!TOKEN_RE.test(token)) return res.status(400).json({ success: false, error: 'token inválido' });

  const r = await resolver(db, token);
  if (!r) return res.status(404).json({ success: false, error: 'Link inválido' });
  const { assessment, publico } = r;

  const { data: proj } = await db.from('projetos').select('cliente').eq('id', assessment.projeto_id).maybeSingle();
  const perguntas = montarFormulario(publico, { lider: false });

  if (req.method === 'GET') {
    const rid = (req.query.rid || '').toString().trim() || null;
    const respondente = publico === 'socios'
      ? await getRespondenteSocios(db, assessment.id, { criar: false })
      : (rid ? { id: rid } : null);
    const answers = await answersOf(db, respondente?.id);
    return res.status(200).json({
      success: true, publico, cliente: proj?.cliente || '',
      perguntas: slimPerguntas(perguntas), answers, rid: respondente?.id || null,
      status: respondente?.status || 'not_started',
    });
  }

  if (req.method === 'POST') {
    const { answers, rid } = req.body || {};
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ success: false, error: 'answers obrigatório' });
    }
    try {
      let respondenteId;
      if (publico === 'socios') {
        const resp = await getRespondenteSocios(db, assessment.id, { criar: true });
        if (resp.status === 'completed') return res.status(409).json({ success: false, error: 'Formulário já concluído' });
        respondenteId = resp.id;
      } else if (rid) {
        respondenteId = rid.toString();
      } else {
        const { data: nova, error } = await db
          .from('id_v2_respondents')
          .insert([{ assessment_id: assessment.id, publico, subperfil: 'todos', is_anonymous: publico === 'colaboradores', status: 'in_progress' }])
          .select('id')
          .single();
        if (error) throw error;
        respondenteId = nova.id;
      }

      const rows = Object.entries(answers).map(([question_id, value]) => ({
        respondent_id: respondenteId, question_id, ...toCells(value),
      }));
      if (rows.length) {
        const { error } = await db.from('id_v2_answers').upsert(rows, { onConflict: 'respondent_id,question_id' });
        if (error) throw error;
      }
      if (assessment.status === 'not_started') {
        await db.from('id_v2_assessments').update({ status: 'in_progress' }).eq('id', assessment.id);
      }
      return res.status(200).json({ success: true, rid: respondenteId });
    } catch (e) {
      console.error('[identidade-v2/session]', e);
      return res.status(500).json({ success: false, error: 'Erro ao salvar' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
