import { db } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { projetoId, versao, campos } = req.body;
    
    if (!projetoId || !campos) {
      return res.status(400).json({ success: false, error: 'Projeto e Campos são obrigatórios.' });
    }

    campos.form_version = versao || 'express';

    // Salva o Intake preenchido pelo cliente no Supabase
    await db.saveIntake(projetoId, campos);

    return res.status(200).json({
      success: true,
      message: 'Intake salvo com sucesso. Agente pronto para execução manual no painel.'
    });
  } catch (error) {
    console.error("ERRO Intake API:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
