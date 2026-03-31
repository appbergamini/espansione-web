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
      const body = req.body;
      if (Array.isArray(body)) {
        const data = await db.addCisParticipantesBatch(projeto_id, body);
        return res.status(200).json({ success: true, participantes: data });
      }
      const { nome, email, cargo } = body;
      const p = await db.addCisParticipante(projeto_id, nome, email, cargo);
      return res.status(200).json({ success: true, participante: p });
    }

    if (req.method === 'PUT') {
      const { id, nome, email, cargo, liberado } = req.body;
      const p = await db.updateCisParticipante(id, { nome, email, cargo, liberado });
      return res.status(200).json({ success: true, participante: p });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await db.deleteCisParticipante(id);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (err) {
    console.error("[API CIS Participantes] Erro:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
