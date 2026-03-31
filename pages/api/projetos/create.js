import { db } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  
  try {
    const { nome_empresa } = req.body;
    
    // Cria um registro de projeto apenas com a "casca"
    const projetoId = await db.createProject({
      cliente: nome_empresa || "Novo Cliente"
    });

    return res.status(200).json({ success: true, projetoId });
  } catch (err) {
    console.error("[API] Erro ao criar projeto:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
