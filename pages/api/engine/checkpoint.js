import { db } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  
  const { projetoId, checkpointNum, status, notas } = req.body;
  
  if (!projetoId || checkpointNum === undefined) {
    return res.status(400).json({ success: false, error: 'Faltando projetoId ou checkpointNum' });
  }

  try {
    console.log(`[API Engine] Recebida requisicao para aprovar checkpoint ${checkpointNum}`);
    await db.updateCheckpoint(projetoId, checkpointNum, status || 'aprovado', notas || '');
    
    // Atualiza o status do projeto para refletir aprovação para facilitar na UI depois se quiser
    await db.updateProjectStatus(projetoId, `checkpoint_${checkpointNum}_${status || 'aprovado'}`);

    return res.status(200).json({ success: true, checkpointNum, status });
  } catch (err) {
    console.error(`[API Engine] Erro ao atualizar checkpoint ${checkpointNum}:`, err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
