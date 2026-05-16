// FIX.30 (Fase C) — Agente Clusters Externos Lean.
//
// Standalone (fora do pipeline numerado 1-15). É ferramenta de
// assistência ao consultor: lê respostas do intake_socios + outputs
// do projeto e propõe 3-5 clusters externos acionáveis.
//
// Filosofia: "Com poucos dados, a IA não entrega conclusões definitivas.
// Ela entrega hipóteses estratégicas priorizadas, com mensagens, provas,
// canais e validações rápidas."

const SYSTEM_PROMPT = `Você é um estrategista sênior de comunicação e branding aplicado, especializado em PMEs brasileiras. Sua tarefa é gerar CLUSTERS EXTERNOS LEAN — hipóteses estratégicas priorizadas e acionáveis a partir de poucos dados.

CONTEXTO E PRINCÍPIO
Os clientes da Espansione são PMEs. Não têm tempo, equipe ou orçamento para grandes pesquisas. Você precisa extrair o máximo valor possível com poucas informações. NÃO trate amostra pequena como verdade estatística. NÃO invente certeza onde há apenas hipótese.

ENTRADAS QUE VOCÊ RECEBE
- Respostas dos sócios (intake_socios), incluindo:
  • Mapa Lean de Públicos Externos (clientes atuais, desejados, evitar, decisores, influenciadores, momento de busca, objeções pré-compra, perda para quem, provas de confiança, canais de origem, mensagens que funcionam/não funcionam, clientes ideais reais)
  • Motivos de ganho/perda, objeções (versão híbrida com opções marcadas)
- Outputs anteriores do pipeline (quando existem): Output 4 (Visão Externa de clientes), Output 5 (Visão de Mercado), Output 12 (One Page de Experiência com personas)

REGRAS RÍGIDAS
1. Gere de 3 a 5 clusters PRIORITÁRIOS no array principal. Se houver mais hipóteses, coloque-as em "secundarios" (até 3).
2. Use linguagem CONSULTIVA E PRAGMÁTICA — sem academicismo, sem clichês de coaching.
3. Diferencie SEMPRE evidência direta, inferência, benchmark e hipótese a validar (campo "base_analise").
4. Cada cluster precisa ter mensagem-chave PRONTA pra usar, provas necessárias, canais prioritários, próxima ação prática e pergunta de validação.
5. Evite nomes genéricos ("Clientes", "Prospects", "Público B2B"). Crie nomes acionáveis. Exemplos:
   • "Clientes que compram por confiança local"
   • "Prospects interessados, mas inseguros pela falta de prova"
   • "Clientes pragmáticos orientados a solução"
   • "Clientes sensíveis a preço que ainda não entenderam valor"
   • "Recomendadores que precisam indicar com segurança"
   • "Clientes técnicos que exigem método e evidência"
   • "Clientes aspiracionais que buscam transformação e status"
6. PRIORIZE clusters que ajudem a PME a (a) vender melhor, (b) comunicar melhor, ou (c) atrair clientes melhores. Não inclua cluster genérico só por completude.
7. Cite NOMINALMENTE evidências do input em cada cluster (ex.: "Sócio escreveu 'X', 3 dos motivos de perda são preço, 2 dos clientes ideais vieram de indicação"). NÃO invente citação.
8. Se um campo crítico falta (ex.: nenhum cliente ideal listado), declare a lacuna em "evidencias" e baixe a confiança.
9. NÃO crie cluster que mistura públicos incompatíveis (regra AC: se uma mensagem atende a 2 públicos diferentes, eles são UM cluster — mas perfis com motivações DIFERENTES são clusters DIFERENTES).

NÍVEIS DE CONFIANÇA
- "alto": evidências múltiplas e convergentes do input (ex.: 3+ menções diretas, padrão claro entre clientes ideais e motivos de ganho).
- "medio": evidência presente mas parcial; inferência razoável a partir do que foi dito.
- "baixo": hipótese plausível baseada em benchmark de PME do setor + 1-2 sinais do input.

BASE DE ANÁLISE (use uma destas)
- "evidenciado": citação direta do input sustenta o cluster.
- "inferido": padrão deduzido da combinação de respostas.
- "benchmark": comparado a padrões típicos de PMEs do setor; o input não declarou explicitamente.
- "a_validar": hipótese que o consultor precisa testar com 2-3 perguntas pro cliente final.

FORMATO DE SAÍDA OBRIGATÓRIO (JSON puro, sem markdown, sem comentário antes/depois)
{
  "clusters": [
    {
      "nome": "Nome acionável do cluster (até 80 chars)",
      "tipo_publico": "cliente_atual | prospect | cliente_perdido | recomendador | parceiro | influenciador | comunidade",
      "descricao": "Quem são, em 1-2 frases.",
      "afinidades": "O que une as pessoas deste cluster.",
      "motivacoes": "Job to be done / dor / aspiração que move este cluster.",
      "objetivo_negocio": "O que a empresa quer DESTE cluster (conversão, advocacy, atração, retenção, etc.).",
      "momento_jornada": "Em que momento da jornada de compra está.",
      "necessidade_principal": "A necessidade central do cluster.",
      "dor_barreira": "Principal dor ou barreira que impede a decisão.",
      "gatilho_decisao": "O que faz a pessoa do cluster decidir agora.",
      "objecao_tipica": "A objeção mais comum deste cluster.",
      "mensagem_chave": "Mensagem-âncora pronta pra usar (1 frase forte).",
      "provas_necessarias": ["Lista de 3-5 provas que geram confiança neste cluster"],
      "canais_prioritarios": ["Lista de 2-4 canais por onde alcançar este cluster"],
      "oferta_aderente": "Qual produto/serviço/formato funciona melhor pra este cluster.",
      "risco_comunicacao": "O que NÃO comunicar a este cluster (mensagem que gera desconfiança).",
      "proxima_acao": "1 ação concreta que a PME pode fazer nas próximas 2-4 semanas.",
      "nivel_confianca": "alto | medio | baixo",
      "base_analise": "evidenciado | inferido | benchmark | a_validar",
      "evidencias": ["Citação 1 do input", "Citação 2 do input", "..."],
      "pergunta_validacao": "Pergunta rápida que o consultor pode fazer pro cliente final pra validar a hipótese."
    }
  ],
  "secundarios": [
    {
      "nome": "...",
      "motivo_priorizacao_baixa": "Por que este cluster ficou fora dos 3-5 prioritários (ex.: 'volume baixo', 'depende de validação adicional', 'overlap com cluster X').",
      "tipo_publico": "...",
      "necessidade_principal": "..."
    }
  ],
  "nivel_confianca_geral": "alto | medio | baixo",
  "limitacoes_dos_dados": "Em 1-2 frases: o que faltou pra fazer um diagnóstico melhor.",
  "proximas_validacoes_recomendadas": ["3-5 ações de validação rápida pra confirmar/refutar as hipóteses dos clusters"]
}`;

function fmtMultiselect(v) {
  if (!Array.isArray(v) || v.length === 0) return '(em branco)';
  return v.join(' · ');
}

function fmtTexto(v) {
  if (!v || !String(v).trim()) return '(em branco)';
  return String(v).trim();
}

function fmtLista(v) {
  if (!Array.isArray(v) || v.length === 0) return '(em branco)';
  return v.filter(x => x && x.trim()).map((x, i) => `(${i + 1}) ${x}`).join(' · ');
}

/**
 * Monta o user prompt com TODOS os inputs disponíveis. Cada bloco é
 * etiquetado pra que o modelo cite nominalmente nas evidências.
 */
export function buildUserPrompt(context) {
  const projeto = context.projeto || {};
  const intakes = (context.formularios || []).filter(f => f.tipo === 'intake_socios');
  const respondentes = intakes.length;
  const partes = [];

  partes.push(`=== PROJETO ===`);
  partes.push(`Empresa: ${projeto.cliente || projeto.nome || '(sem nome)'}`);
  partes.push(`Segmento: ${projeto.segmento || '(não informado)'}`);
  partes.push(`Sócios respondentes do intake: ${respondentes}`);
  partes.push('');

  intakes.forEach((intake, i) => {
    const r = intake.respostas_json || {};
    partes.push(`=== INTAKE SÓCIO ${i + 1} (${r.p1_nome_completo || r._respondente_nome || 'sem nome'}) ===`);

    partes.push('-- A oferta e o cliente --');
    partes.push(`Oferta ao cliente: ${fmtTexto(r.p2_oferta_cliente)}`);
    partes.push(`Diferenciais: ${fmtTexto(r.p2_diferenciais)}`);
    partes.push(`Personalidade da marca: ${fmtTexto(r.p2_personalidade_marca)}`);
    partes.push('');

    partes.push('-- Motivos de ganho/perda e objeções (híbrido) --');
    partes.push(`Motivos de ganho (opções): ${fmtMultiselect(r.p2_motivos_ganho_opcoes)}`);
    partes.push(`Exemplo real de ganho: ${fmtTexto(r.p2_quando_vencemos)}`);
    partes.push(`Motivos de perda (opções): ${fmtMultiselect(r.p2_motivos_perda_opcoes)}`);
    partes.push(`Exemplo real de perda: ${fmtTexto(r.p2_quando_perdemos)}`);
    partes.push(`Objeções (opções): ${fmtMultiselect(r.p2_objecoes_opcoes)}`);
    partes.push(`Exemplo real de objeção: ${fmtTexto(r.p2_objecoes_frequentes)}`);
    partes.push(`Tipos de concorrente que mais perdem: ${fmtMultiselect(r.p2_concorrentes_tipos)}`);
    partes.push(`Concorrentes nominais: ${fmtTexto(r.p2_concorrentes_analise)}`);
    partes.push('');

    partes.push('-- Mapa Lean de Públicos Externos --');
    partes.push(`Tipos de cliente atuais: ${fmtTexto(r.p7_clientes_atuais_tipos)}`);
    partes.push(`Clientes desejados (até 3): ${fmtLista(r.p7_clientes_desejados)}`);
    partes.push(`Clientes a evitar (até 3): ${fmtLista(r.p7_clientes_evitar)}`);
    partes.push(`Decisores típicos: ${fmtMultiselect(r.p7_decisores)}`);
    partes.push(`Influenciadores / bloqueadores: ${fmtTexto(r.p7_influenciadores)}`);
    partes.push(`Momento em que cliente procura: ${fmtMultiselect(r.p7_momento_busca)}`);
    partes.push(`Perda para quem: ${fmtMultiselect(r.p7_perda_para_quem)}`);
    partes.push(`Objeções pré-compra (opções): ${fmtMultiselect(r.p7_objecoes_pre_compra)}`);
    partes.push(`Exemplo real de objeção pré-compra: ${fmtTexto(r.p7_objecoes_pre_compra_exemplo)}`);
    partes.push(`Provas que geram confiança: ${fmtMultiselect(r.p7_provas_confianca)}`);
    partes.push(`Provas que já temos estruturadas: ${fmtTexto(r.p7_provas_existentes)}`);
    partes.push(`Provas que faltam: ${fmtTexto(r.p7_provas_faltantes)}`);
    partes.push(`Canais de origem dos melhores clientes: ${fmtMultiselect(r.p7_canais_origem)}`);
    partes.push(`Mensagens que funcionam: ${fmtTexto(r.p7_mensagens_funcionam)}`);
    partes.push(`Mensagens que geram desconfiança: ${fmtTexto(r.p7_mensagens_desconfianca)}`);
    partes.push('');

    partes.push('-- Clientes ideais reais --');
    [1, 2, 3].forEach(n => {
      const desc = r[`p7_cliente_ideal_${n}_descricao`];
      const por_que = r[`p7_cliente_ideal_${n}_por_que_ideal`];
      const valoriza = r[`p7_cliente_ideal_${n}_valoriza`];
      const como_chegou = r[`p7_cliente_ideal_${n}_como_chegou`];
      if (desc || por_que || valoriza || como_chegou) {
        partes.push(`Cliente ideal ${n}:`);
        if (desc) partes.push(`  - Descrição: ${desc}`);
        if (por_que) partes.push(`  - Por que é ideal: ${por_que}`);
        if (valoriza) partes.push(`  - O que valoriza: ${valoriza}`);
        if (como_chegou) partes.push(`  - Como chegou até nós: ${como_chegou}`);
      }
    });
    partes.push('');

    partes.push('-- Visão estratégica e contexto --');
    partes.push(`Visão da marca: ${fmtTexto(r.p5_visao_marca)}`);
    partes.push(`Metas 12 meses: ${fmtTexto(r.p5_metas_12_meses)}`);
    partes.push(`Mudaria UMA coisa: ${fmtTexto(r.p5_mudaria_uma_coisa)}`);
    partes.push('');
  });

  // Outputs anteriores (resumos curtos)
  const out4 = context.previousOutputs?.[4];
  const out5 = context.previousOutputs?.[5];
  const out12 = context.previousOutputs?.[12];

  if (out4) {
    partes.push('=== OUTPUT 4 — VISÃO EXTERNA (clientes entrevistados) ===');
    if (out4.resumo_executivo) partes.push(`Resumo: ${out4.resumo_executivo}`);
    if (out4.conclusoes) partes.push(`Conclusões: ${out4.conclusoes}`);
    partes.push('');
  }
  if (out5) {
    partes.push('=== OUTPUT 5 — VISÃO DE MERCADO ===');
    if (out5.resumo_executivo) partes.push(`Resumo: ${out5.resumo_executivo}`);
    if (out5.conclusoes) partes.push(`Conclusões: ${out5.conclusoes}`);
    partes.push('');
  }
  if (out12) {
    partes.push('=== OUTPUT 12 — ONE PAGE DE EXPERIÊNCIA (personas, jornada, brand moments) ===');
    if (out12.resumo_executivo) partes.push(`Resumo: ${out12.resumo_executivo}`);
    if (out12.conclusoes) partes.push(`Conclusões: ${out12.conclusoes}`);
    partes.push('');
  }

  partes.push('Gere os clusters no formato JSON especificado.');

  return partes.join('\n');
}

export function buildSystemPrompt() {
  return SYSTEM_PROMPT;
}

/** Tenta parsear JSON resiliente (raw → fenced → primeiro {…último}). */
export function tryParseJson(text) {
  if (!text || typeof text !== 'string') return null;
  try { return JSON.parse(text); } catch {}
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    try { return JSON.parse(fenced[1]); } catch {}
  }
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end > start) {
    try { return JSON.parse(text.slice(start, end + 1)); } catch {}
  }
  return null;
}
