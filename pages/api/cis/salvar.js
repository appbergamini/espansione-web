import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { userData, scores, rawRankings, learnPrefs, projetoId } = req.body;

    if (!userData || !userData.email) {
      return res.status(400).json({ error: 'Faltam dados do usuário (email é obrigatório).' });
    }
    if (!projetoId) {
      return res.status(400).json({ error: 'projetoId é obrigatório.' });
    }

    const emailTratado = String(userData.email).trim().toLowerCase();
    const db = supabaseAdmin;

    const { data: participante, error: partErr } = await db
      .from('cis_participantes')
      .select('id, liberado, respondido')
      .eq('projeto_id', projetoId)
      .eq('email', emailTratado)
      .limit(1)
      .single();

    if (partErr && partErr.code !== 'PGRST116') throw partErr;
    if (!participante) {
      return res.status(403).json({ error: 'E-mail não autorizado para este projeto.' });
    }
    if (!participante.liberado) {
      return res.status(403).json({ error: 'Acesso bloqueado.' });
    }
    if (participante.respondido) {
      return res.status(403).json({ error: 'Mapeamento já respondido.' });
    }

    const { error: insErr } = await db.from('cis_assessments').insert([{
      projeto_id: projetoId,
      email: emailTratado,
      nome: userData.name || 'Desconhecido',
      genero: userData.gender || '',
      perfil_label: scores?.profileLabel || '',
      scores_json: scores || {},
      raw_rankings_json: rawRankings || {},
      learn_prefs_json: learnPrefs || {},
    }]);
    if (insErr) throw insErr;

    await db
      .from('cis_participantes')
      .update({ respondido: true })
      .eq('id', participante.id);

    return res.status(200).json({ success: true, message: 'Assessment salvo com sucesso.', email: emailTratado });
  } catch (error) {
    console.error('Erro na API /cis/salvar:', error);
    return res.status(500).json({ error: error.message || 'Erro interno do servidor' });
  }
}
