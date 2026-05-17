import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { projetoId, versao, campos } = req.body;
    if (!projetoId || !campos) {
      return res.status(400).json({ success: false, error: 'Projeto e Campos são obrigatórios.' });
    }

    const db = supabaseAdmin;

    const { data: projeto, error: projErr } = await db
      .from('projetos')
      .select('id')
      .eq('id', projetoId)
      .single();

    if (projErr && projErr.code !== 'PGRST116') throw projErr;
    if (!projeto) {
      return res.status(404).json({ success: false, error: 'Projeto não encontrado.' });
    }

    campos.form_version = versao || 'express';

    const inserts = Object.keys(campos).map(k => ({
      projeto_id: projetoId,
      campo: k,
      valor: typeof campos[k] === 'string' ? campos[k] : JSON.stringify(campos[k]),
    }));

    if (inserts.length > 0) {
      const { error } = await db.from('intake_data').insert(inserts);
      if (error) throw error;
    }

    return res.status(200).json({
      success: true,
      message: 'Intake salvo com sucesso. Agente pronto para execução manual no painel.',
    });
  } catch (error) {
    console.error('ERRO Intake API:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
