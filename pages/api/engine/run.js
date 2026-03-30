import { Pipeline } from '../../../lib/ai/pipeline';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  
  const { projetoId, agentNum, modelKey } = req.body;
  if (!projetoId || agentNum === undefined) {
    return res.status(400).json({ success: false, error: 'Faltando projetoId ou agentNum' });
  }

  try {
    const parsedAgentNum = parseInt(agentNum, 10);
    // Pipeline.runAgent executará a chamada AI, validará dependências, e salvará no banco
    const result = await Pipeline.runAgent(projetoId, parsedAgentNum, modelKey);
    
    return res.status(200).json({ success: true, agentNum: parsedAgentNum, output: result });
  } catch (err) {
    console.error(`[API Engine] Erro ao rodar agente ${agentNum}:`, err);
    // Envia a mensagem de erro direto pro UI (útil para exibir que falta preencher algo)
    return res.status(500).json({ success: false, error: err.message });
  }
}
