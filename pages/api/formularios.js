import { db } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { projetoId, tipo, respostas } = req.body;
    
    if (!projetoId || !tipo) {
      return res.status(400).json({ error: 'Faltando parms' });
    }

    const respondente = respostas.respondente || "Anonimo";
    delete respostas.respondente;
    
    await db.saveFormulario(projetoId, tipo, respondente, respostas);
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("ERRO Form API:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
