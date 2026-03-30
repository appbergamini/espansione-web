import { db } from '../../../lib/db';
import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  
  const { id } = req.query;
  if (!id) return res.status(400).json({ success: false, error: 'ID is missing' });

  try {
    const projeto = await db.getProject(id);
    if (!projeto) {
      return res.status(404).json({ success: false, error: 'Projeto não encontrado' });
    }

    const intake = await db.getIntake(id);
    const formularios = await db.getFormularios(id);
    
    // Obter todos os outputs do projeto ordenados pelo número do agente
    const { data: outputs, error: outError } = await supabase
      .from('outputs')
      .select('*')
      .eq('projeto_id', id)
      .order('agent_num', { ascending: true });
      
    if (outError) throw outError;
    
    // Obter checkpoints pendentes
    const pendingCheckpoints = await db.getPendingCheckpoints(id);

    return res.status(200).json({
      success: true,
      data: {
        projeto,
        intake,
        formularios,
        outputs,
        pendingCheckpoints
      }
    });
  } catch (err) {
    console.error("Erro API Consultor / ID:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
