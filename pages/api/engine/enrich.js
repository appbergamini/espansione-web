// pages/api/engine/enrich.js
//
// Etapa 1 do split de agentes caros (p.ex. Agente 5 com deep research):
// roda APENAS o enrichContext do agent e devolve o payload JSON pro
// frontend. Na etapa 2, o frontend chama /api/engine/run passando
// `precomputedEnrichment` no body, pulando a pesquisa cara.
//
// Motivação: Vercel serverless tem cap de 300s. Agent 5 sozinho estoura
// esse limite quando deep research + síntese rodam sequencial na mesma
// função. Split em 2 chamadas resolve sem precisar de infra nova
// (queues, workers, etc.).

import { Pipeline } from '../../../lib/ai/pipeline';
import { getServerUser } from '../../../lib/getServerUser';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export const maxDuration = 300;
export const config = { maxDuration: 300 };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { user } = await getServerUser(req, res);
  if (!user) return res.status(401).json({ success: false, error: 'Não autenticado' });

  const { projetoId, agentNum } = req.body;
  if (!projetoId || agentNum === undefined) {
    return res.status(400).json({ success: false, error: 'Faltando projetoId ou agentNum' });
  }

  const db = supabaseAdmin;
  const [{ data: profile }, { data: projeto }] = await Promise.all([
    db.from('profiles').select('empresa_id, role').eq('id', user.id).single(),
    db.from('projetos').select('empresa_id, responsavel_email').eq('id', projetoId).single(),
  ]);

  if (!projeto) return res.status(404).json({ success: false, error: 'Projeto não encontrado' });

  const isMaster = profile?.role === 'master';
  const sameEmpresa = profile?.empresa_id === projeto.empresa_id;
  const isResponsavel = projeto.responsavel_email && projeto.responsavel_email === user.email;
  if (!isMaster && !sameEmpresa && !isResponsavel) {
    return res.status(403).json({ success: false, error: 'Acesso negado a este projeto' });
  }

  try {
    const parsedAgentNum = parseInt(agentNum, 10);
    const enrichment = await Pipeline.enrichOnly(projetoId, parsedAgentNum);
    return res.status(200).json({ success: true, agentNum: parsedAgentNum, enrichment });
  } catch (err) {
    console.error(`[API Enrich] Erro no agente ${agentNum}:`, err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
