import { db } from '../../../lib/db';

export default async function handler(req, res) {
  const { projeto_id } = req.query;

  if (!projeto_id) {
    return res.status(400).json({ success: false, error: 'projeto_id is missing' });
  }

  try {
    if (req.method === 'GET') {
      const participantes = await db.getCisParticipantes(projeto_id);
      return res.status(200).json({ success: true, participantes });
    } 
    
    if (req.method === 'POST') {
      const { nome, email, cargo } = req.body;
      if (!nome || !email) {
        return res.status(400).json({ success: false, error: 'Nome e email são obrigatórios' });
      }
      
      const p = await db.addCisParticipante(projeto_id, nome, email, cargo);
      return res.status(200).json({ success: true, participante: p });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (err) {
    console.error("[API CIS Participantes] Erro:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
