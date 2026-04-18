import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { projetoId, tipo, respostas } = req.body;
    if (!projetoId || !tipo || !respostas) {
      return res.status(400).json({ error: 'Faltando parâmetros' });
    }

    const db = supabaseAdmin;

    const { data: projeto, error: projErr } = await db
      .from('projetos')
      .select('id')
      .eq('id', projetoId)
      .single();

    if (projErr && projErr.code !== 'PGRST116') throw projErr;
    if (!projeto) {
      return res.status(404).json({ error: 'Projeto não encontrado.' });
    }

    const respondente = respostas.respondente || 'Anonimo';
    const { respondente: _r, ...respostasLimpas } = respostas;

    const { error } = await db.from('formularios').insert([{
      projeto_id: projetoId,
      tipo,
      respondente,
      respostas_json: respostasLimpas,
    }]);
    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('ERRO Form API:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
