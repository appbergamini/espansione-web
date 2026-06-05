import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { tokenValido } from '../../../lib/tokens/respondenteToken';

// Entrevista guiada por IA — Slice 3.
// Persistência server-side da sessão (perguntas + progresso + status) por token.
// - GET  ?token=  → carrega a sessão (ou null).
// - POST { token, perguntas?, source?, idx?, respostas?, followups?, status? }
//        → cria/atualiza. Para colaboradores, o CONTEÚDO das respostas é
//          descartado (anonimato): grava-se apenas o índice + status.

const TIPO_BY_PAPEL = {
  socios: 'entrevista_socios',
  colaboradores: 'entrevista_colaboradores',
  clientes: 'entrevista_cliente',
};

async function resolveRespondente(token) {
  const { data, error } = await supabaseAdmin
    .from('respondentes')
    .select('id, projeto_id, nome, papel, token_expira_em')
    .eq('token', token)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

export default async function handler(req, res) {
  if (!supabaseAdmin) {
    return res.status(500).json({ success: false, error: 'Supabase indisponível' });
  }

  const token = (req.method === 'GET' ? req.query.token : req.body?.token || '').toString().trim();
  if (!token) return res.status(400).json({ success: false, error: 'token obrigatório' });

  try {
    const resp = await resolveRespondente(token);
    if (!resp) return res.status(404).json({ success: false, error: 'Token inválido' });
    if (!tokenValido(resp.token_expira_em)) {
      return res.status(410).json({ success: false, error: 'Link expirado' });
    }
    const tipo = TIPO_BY_PAPEL[resp.papel];
    if (!tipo) return res.status(400).json({ success: false, error: `Papel sem entrevista: ${resp.papel}` });
    const anonimo = resp.papel === 'colaboradores';

    const db = supabaseAdmin;

    if (req.method === 'GET') {
      const { data: sess } = await db
        .from('entrevista_sessoes')
        .select('perguntas_json, progresso_json, status, source')
        .eq('respondente_id', resp.id)
        .maybeSingle();
      return res.status(200).json({
        success: true,
        respondente: { nome: resp.nome, papel: resp.papel },
        session: sess
          ? { perguntas: sess.perguntas_json || [], progresso: sess.progresso_json || {}, status: sess.status, source: sess.source }
          : null,
      });
    }

    if (req.method === 'POST') {
      const { perguntas, source, idx, respostas, followups, coberturas, status } = req.body || {};

      const { data: existing } = await db
        .from('entrevista_sessoes')
        .select('id, progresso_json')
        .eq('respondente_id', resp.id)
        .maybeSingle();

      const temProgresso = typeof idx === 'number' || respostas != null || followups != null || coberturas != null;
      const novoProgresso = anonimo
        ? { idx: typeof idx === 'number' ? idx : (existing?.progresso_json?.idx || 0) }
        : { idx: typeof idx === 'number' ? idx : 0, respostas: respostas || {}, followups: followups || {}, coberturas: coberturas || {} };

      if (existing) {
        const patch = {};
        if (status) patch.status = status;
        if (Array.isArray(perguntas)) { patch.perguntas_json = perguntas; if (source) patch.source = source; }
        if (temProgresso) patch.progresso_json = novoProgresso;
        if (Object.keys(patch).length > 0) {
          const { error } = await db.from('entrevista_sessoes').update(patch).eq('id', existing.id);
          if (error) throw error;
        }
      } else {
        const { error } = await db.from('entrevista_sessoes').insert({
          projeto_id: resp.projeto_id,
          respondente_id: resp.id,
          tipo,
          anonimo,
          source: source || null,
          perguntas_json: Array.isArray(perguntas) ? perguntas : [],
          progresso_json: temProgresso ? novoProgresso : {},
          status: status || 'em_andamento',
        });
        if (error) throw error;
      }
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (err) {
    console.error('[entrevista/session] erro:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
