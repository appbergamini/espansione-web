// pages/api/outputs/delete.js
//
// TASK FIX.4 — exclusão de output com cascata explícita.
//
// Rotas:
//   GET  /api/outputs/delete?projetoId=...&agentNum=N
//        → preview da cascata (quais outros outputs seriam afetados).
//
//   POST /api/outputs/delete
//        body: { projetoId, agentNum, confirmar_cascata? }
//        → se `agentNum` tem dependentes presentes, exige
//          `confirmar_cascata: true` — caso contrário 409.
//          Apaga o alvo + todos os dependentes (transitivos) que têm
//          output no projeto. Recalcula `etapa_atual` / `status` do
//          projeto a partir da ÚLTIMA etapa consecutiva (não max).
//
// Mantemos POST (não DELETE) para casar com o cliente atual no painel
// admin — troca de método daria regressão em produção durante rollout
// sem ganho prático.

import { getServerUser } from '../../../lib/getServerUser';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { AGENT_CONFIGS } from '../../../lib/ai/pipeline';
import {
  analisarCascataExclusao,
  determinarProximoAgente,
  ultimaEtapaConsecutiva,
} from '../../../lib/deliverable/esteiraHelpers';
import { getAgenteByNum } from '../../../lib/agents/catalog';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { user } = await getServerUser(req, res);
  if (!user) return res.status(401).json({ success: false, error: 'Não autenticado' });

  // ── Parse input (GET usa query, POST/DELETE usa body) ────────────
  const src = req.method === 'GET' ? req.query : (req.body || {});
  const projetoId = src.projetoId;
  const agentNumRaw = src.agentNum;
  const confirmarCascata = src.confirmar_cascata === true || src.confirmar_cascata === 'true';

  if (!projetoId || agentNumRaw === undefined || agentNumRaw === null) {
    return res.status(400).json({ success: false, error: 'Faltando projetoId ou agentNum' });
  }

  const db = supabaseAdmin;

  // ── Auth + permissão (idêntico ao padrão do projeto) ─────────────
  const [{ data: profile }, { data: projeto }] = await Promise.all([
    db.from('profiles').select('role, empresa_id').eq('id', user.id).single(),
    db.from('projetos').select('empresa_id, responsavel_email').eq('id', projetoId).single(),
  ]);
  if (!projeto) return res.status(404).json({ success: false, error: 'Projeto não encontrado' });

  const isMaster = profile?.role === 'master';
  const sameEmpresa = profile?.empresa_id === projeto.empresa_id;
  const isResponsavel = projeto.responsavel_email && projeto.responsavel_email === user.email;
  if (!isMaster && !sameEmpresa && !isResponsavel) {
    return res.status(403).json({ success: false, error: 'Acesso negado' });
  }

  const parsedNum = parseInt(agentNumRaw, 10);
  if (!AGENT_CONFIGS[parsedNum]) {
    return res.status(400).json({ success: false, error: `Agente ${agentNumRaw} inválido` });
  }

  // ── Carrega outputs do projeto (alvo + potenciais dependentes) ──
  const { data: outputsDoProjeto, error: loadErr } = await db
    .from('outputs')
    .select('id, agent_num, created_at')
    .eq('projeto_id', projetoId);
  if (loadErr) return res.status(500).json({ success: false, error: loadErr.message });

  const outputsRows = outputsDoProjeto || [];
  const cascata = analisarCascataExclusao(parsedNum, outputsRows);

  // Enrich o preview com nomes exibíveis — facilita a UI
  const decorarNomes = (nums) =>
    nums.map(n => ({
      agent_num: n,
      nome: getAgenteByNum(n)?.nome_exibicao || `Agente ${n}`,
    }));

  // ── GET: apenas preview, nada é apagado ─────────────────────────
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      alvo: {
        agent_num: parsedNum,
        nome: getAgenteByNum(parsedNum)?.nome_exibicao || `Agente ${parsedNum}`,
        existe: outputsRows.some(o => o.agent_num === parsedNum),
      },
      cascata: {
        ...cascata,
        dependentes_detalhados: decorarNomes(cascata.dependentes),
      },
      mensagem: cascata.tem_cascata
        ? `Excluir o Agente ${parsedNum} também invalidará ${cascata.dependentes.length} output${cascata.dependentes.length > 1 ? 's' : ''} dependente${cascata.dependentes.length > 1 ? 's' : ''} (${cascata.dependentes.join(', ')}). Serão apagados em cascata.`
        : `Nenhum output dependente no projeto. Exclusão segura.`,
    });
  }

  // ── POST/DELETE: exige confirmação quando há cascata ────────────
  if (cascata.tem_cascata && !confirmarCascata) {
    return res.status(409).json({
      success: false,
      error: 'CASCATA_NAO_CONFIRMADA',
      cascata: {
        ...cascata,
        dependentes_detalhados: decorarNomes(cascata.dependentes),
      },
      mensagem: `Exclusão tem ${cascata.total_afetados} output${cascata.total_afetados > 1 ? 's' : ''} afetado${cascata.total_afetados > 1 ? 's' : ''}. Envie confirmar_cascata=true para prosseguir.`,
    });
  }

  // ── Deleção efetiva: alvo + dependentes ────────────────────────
  const numsParaApagar = [parsedNum, ...cascata.dependentes];
  try {
    const { error: delErr } = await db
      .from('outputs')
      .delete()
      .eq('projeto_id', projetoId)
      .in('agent_num', numsParaApagar);
    if (delErr) throw new Error(delErr.message);

    // Logs do alvo + dependentes (agente é string no schema)
    await db
      .from('logs_execucao')
      .delete()
      .eq('projeto_id', projetoId)
      .in('agente', numsParaApagar.map(n => String(n)));

    // Checkpoints associados a QUALQUER agente removido
    const checkpointsParaApagar = numsParaApagar
      .map(n => AGENT_CONFIGS[n]?.checkpoint)
      .filter(cp => cp !== null && cp !== undefined);
    if (checkpointsParaApagar.length > 0) {
      await db
        .from('checkpoints')
        .delete()
        .eq('projeto_id', projetoId)
        .in('checkpoint_num', checkpointsParaApagar);
    }

    // Recalcula etapa_atual/status — última etapa CONSECUTIVA (sem gaps),
    // não o maior agent_num. Se ficar [1,2,4], etapa_atual=2, não 4.
    const outputsRestantes = outputsRows.filter(o => !numsParaApagar.includes(o.agent_num));
    const ultimaEtapa = ultimaEtapaConsecutiva(outputsRestantes);
    const newStatus = ultimaEtapa === 0 ? 'criado' : `agente_${ultimaEtapa}_concluido`;
    await db
      .from('projetos')
      .update({ status: newStatus, etapa_atual: ultimaEtapa })
      .eq('id', projetoId);

    // Sugere próximo agente (primeiro faltante + dep-aware)
    const projetoTemEvp = outputsRestantes.some(o => o.agent_num === 14);
    const proximo = determinarProximoAgente(outputsRestantes, projetoTemEvp);

    return res.status(200).json({
      success: true,
      apagados: numsParaApagar,
      total_apagados: numsParaApagar.length,
      newStatus,
      lastAgent: ultimaEtapa,
      proximo_agente: proximo,
    });
  } catch (err) {
    console.error('[API outputs/delete] FIX.4 err:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
