import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { email, projeto_id } = req.query;
    if (!email || !projeto_id) {
      return res.status(400).json({ exists: false, error: 'email e projeto_id são obrigatórios.' });
    }

    const emailTratado = String(email).trim().toLowerCase();
    const db = supabaseAdmin;

    const { data: participante, error: partErr } = await db
      .from('cis_participantes')
      .select('id')
      .eq('projeto_id', projeto_id)
      .eq('email', emailTratado)
      .limit(1)
      .single();

    if (partErr && partErr.code !== 'PGRST116') throw partErr;
    if (!participante) {
      return res.status(403).json({ exists: false, error: 'E-mail não autorizado para este projeto.' });
    }

    const { data: resultado, error } = await db
      .from('cis_assessments')
      .select('*')
      .eq('email', emailTratado)
      .eq('projeto_id', projeto_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!resultado) return res.status(200).json({ exists: false });

    return res.status(200).json({
      exists: true,
      profileLabel: resultado.perfil_label,
      disc: resultado.scores_json?.disc || {},
      discAdapted: resultado.scores_json?.discA || {},
      leadership: resultado.scores_json?.leadership || {},
      competencies: resultado.scores_json?.competencies || {},
      learnPrefs: resultado.learn_prefs_json || {},
    });
  } catch (error) {
    console.error('Erro na API /cis/consultar:', error);
    return res.status(500).json({ exists: false, error: error.message || 'Erro interno do servidor' });
  }
}
