import { db } from '../../lib/db';
import { Pipeline } from '../../lib/ai/pipeline';

// Rate mock ou utilitário similar a POST /api/intake
// Corpo esperado: { campos: { nome_empresa: "...", visao_marca: "..." } }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const data = req.body;
    const campos = data.campos || {};

    // 1. Criar projeto no Supabase
    const projetoId = await db.createProject({
      cliente: campos.nome_empresa || "",
      segmento: campos.produtos_publico || "",
      tempo_mercado: campos.tempo_mercado || "",
      colaboradores: campos.organizacao || "",
      motivacao: campos.visao_marca || "",
      contato: campos.contato || ""
    });

    // 2. Salvar todos os campos do intake (Blablas) na tabela intake_data
    await db.saveIntake(projetoId, campos);

    // 3. Rodar o Agente 00 automaticamente pelo Pipeline
    // Ele faz o fetch para a LLM, cria o Documento Inicial de Contexto e grava na tabela Outputs
    const output = await Pipeline.runAgent(projetoId, 0, data.modelKey || "gemini-flash");

    return res.status(200).json({
      success: true,
      projetoId,
      output
    });
  } catch (error) {
    console.error("ERRO Intake API:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
