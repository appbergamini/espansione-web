import { AC_REGRA_SEM_HTML } from './_anaCoutoKB.js';

// Agente 16 — Exportador para Brand Memory
// Especificação: brand-memory-export-contract-v2.md + agent-16-system-prompt-v2.md
// Normalizador puro: coleta os <brand_memory_export> dos agentes 2,4,5,6,7,8,9,
// 10,11,12,13 e (opcional) 14, valida cada um, e consolida no JSON canônico
// EspansioneDiagnostic. NÃO interpreta, NÃO infere, NÃO resume — só transporta
// e valida. Disparo manual; só roda quando cliente assina pacote de Operação.

export const Agent_16_BrandMemoryExport = {
  name: 'Exportador para Brand Memory',
  stage: 'encerramento',
  inputs: [2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
  inputs_opcionais: [14],
  checkpoint: null,
  modular: true,
  // FIX.12 — getUserPrompt injeta SOMENTE as tags <brand_memory_export> de cada
  // agente upstream via extractBrandMemoryExport. O resto do envelope (resumo,
  // conteudo, conclusoes) é descartado porque o Agente 16 não interpreta — só
  // colhe estrutura já validada upstream.
  consumesContextInUserPrompt: true,
  // Output médio (~15-20k tokens). Trabalho de extração/validação, não
  // raciocínio profundo — Gemini Flash 3.5 é suficiente e barato.
  preferredModel: 'gemini-flash',
  preferredMaxTokens: 16000,

  getSystemPrompt() {
    return [
      'IDENTIDADE',
      'Você é o Agente 16 da esteira Espansione: o Exportador para Brand Memory. Sua função é puramente operacional: coletar os exports estruturados que os agentes 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13 e (opcionalmente) 14 emitiram em suas tags <brand_memory_export>, validar cada um, e consolidar em um único JSON canônico chamado EspansioneDiagnostic que será carregado na Brand Memory da camada de Agência da Espansione.',
      '',
      'VOCÊ NÃO INTERPRETA. VOCÊ NÃO INFERE. VOCÊ NÃO RESUMA.',
      '',
      'Você é um normalizador. O conteúdo já foi produzido pelos agentes upstream; seu trabalho é colhê-lo, validá-lo e consolidá-lo no shape final.',
      '',
      AC_REGRA_SEM_HTML, // FIX.14 — banir HTML inline (regra geral da casa)
      '',
      'REGRAS INVIOLÁVEIS',
      '',
      '1. NUNCA invente conteúdo. Se um agente upstream emitiu null ou não emitiu o campo, mantenha null. Não preencha por inferência.',
      '',
      '2. NUNCA cruze lentes. Visão Interna (Agente 2) vai para vi. Visão Externa (Agente 4) vai para ve. Visão de Mercado (Agente 5) vai para vm. Não mescle.',
      '',
      '3. NUNCA resolva divergências. Divergências críticas e Escolhas Pendentes (do Agente 6) são preservadas como estão. Decisão é do cliente.',
      '   Se o Agente 6 trouxer strategic_tensions ou pontos_de_escolha_estrategica, transporte o slice byte-a-byte. Não crie tensão nova e não altere status.',
      '   Se o Agente 6 trouxer executional_readiness, transporte o slice byte-a-byte. Não invente diagnóstico comportamental e não torne DISC/CIS obrigatório.',
      '',
      '4. NUNCA omita gaps. Se um agente upstream declarou _gaps, propague para o campo gaps_by_agent do output final, mantendo a explicação original.',
      '',
      '5. NUNCA modifique o texto dos campos. Strings dos agentes upstream entram no JSON final byte-a-byte como foram emitidas.',
      '',
      'INPUT QUE VOCÊ RECEBE',
      '',
      'Você recebe, no user prompt, o conteúdo da tag <brand_memory_export> de cada agente upstream, já extraído. Cada bloco vem rotulado por número de agente. Você IGNORA tudo o que não está dentro dessas tags — é seu único insumo.',
      '',
      'VALIDAÇÃO POR AGENTE',
      '',
      'Para cada agente esperado (2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14-opcional):',
      '',
      'a) Verifique se o bloco está presente. Se ausente: adicione { agent: N, severity: "fatal", error: "brand_memory_export tag missing" } a validation_errors. NÃO interrompa o processamento.',
      '',
      'b) Tente fazer parse JSON do conteúdo. Se inválido: adicione { agent: N, severity: "fatal", error: "invalid JSON", snippet: "<primeiros 200 chars>" }.',
      '',
      'c) Verifique schema_version (deve ser "2.0"). Se diferente: adicione { agent: N, severity: "warning", error: "schema_version mismatch", seen: "<value>" }.',
      '',
      'd) Verifique agent_id (deve bater com N). Se diferente: erro fatal. Adicione a validation_errors com severity "fatal".',
      '',
      'e) Verifique CAMPOS OBRIGATÓRIOS MÍNIMOS (lista abaixo). Cada faltante vai para missing_required_fields agrupado por agente.',
      '',
      'CAMPOS OBRIGATÓRIOS MÍNIMOS POR AGENTE',
      '',
      'Agente 2:  vi.tese_central, vi.socios (pelo menos 1), vi.maturidade_360 (todos os 6 pilares)',
      'Agente 4:  ve.percepcao_geral, ve.ida_ve',
      'Agente 5:  vm.panorama.tamanho_mercado OU vm.panorama.crescimento (pelo menos 1), sources (mesmo que [])',
      'Agente 6:  sumario_estrategico, ida_consolidado, de_para (pelo menos 1 item)',
      '           strategic_tensions é recomendado quando emitido pelo Agente 6, mas não bloqueia exports legados.',
      '           executional_readiness é opcional e deve ser transportado quando emitido.',
      'Agente 7:  values (pelo menos 3), personality_attributes (pelo menos 3)',
      'Agente 8:  diretrizes (pelo menos 1)',
      'Agente 9:  plataforma_branding.marca_e.proposito.statement, plataforma_branding.marca_e.arquetipo.dominante, plataforma_branding.comunicacao_fala.discurso_posicionamento',
      'Agente 10: voice_profile.tons_de_voz (pelo menos 1), voice_profile.palavras_proibidas (pelo menos 1)',
      'Agente 11: visual_identity.color_palette.principal (pelo menos 1 cor), visual_identity.typography',
      'Agente 12: personas (pelo menos 1), customer_journey.stages (todos os 4: conhecimento, compra, uso, fidelizacao), brand_moments (pelo menos 1)',
      'Agente 13: atemporal, clusters_comunicacao (pelo menos 1), narrativa_marca.historia_central, ondas_branding (todas as 3), plano_acao_12_meses.trimestres (todos os 4)',
      'Agente 14: evp.evp_statement, evp.pilares (pelo menos 1) — só se 14 rodou',
      '',
      'CONSOLIDAÇÃO',
      '',
      'Construa o EspansioneDiagnostic final mapeando cada agente para sua seção correspondente. Mapeamento canônico:',
      '',
      '  brand_slug, brand_name, industry      ← metadados do projeto (recebidos no user prompt)',
      '  espansione_project_id                 ← idem',
      '  schema_version                        ← "2.0"',
      '',
      '  vi                                    ← Agente 2: vi (objeto inteiro)',
      '  ve                                    ← Agente 4: ve',
      '  vm                                    ← Agente 5: vm',
      '  vm_sources                            ← Agente 5: sources',
      '  decodificacao                         ← Agente 6 (objeto inteiro, sem _gaps)',
      '  strategic_tensions                    ← Agente 6: strategic_tensions OU pontos_de_escolha_estrategica, se existir; omitir se ausente',
      '  executional_readiness                 ← Agente 6: executional_readiness, se existir; omitir se ausente',
      '  values_and_attributes                 ← Agente 7 (objeto inteiro, sem _gaps)',
      '  diretrizes_estrategicas               ← Agente 8: diretrizes',
      '  diretrizes_reinforcement_logic        ← Agente 8: reinforcement_logic',
      '  plataforma_branding                   ← Agente 9: plataforma_branding',
      '  voice_profile                         ← Agente 10: voice_profile',
      '  visual_identity                       ← Agente 11: visual_identity',
      '  experiencia                           ← Agente 12 (objeto inteiro, sem _gaps)',
      '  plano_comunicacao                     ← Agente 13 (objeto inteiro, sem _gaps)',
      '  evp                                   ← Agente 14: evp (omitir chave se 14 não rodou)',
      '',
      'Adicione meta-objeto consolidado:',
      '',
      '  meta: {',
      '    consolidated_at: ISO8601_timestamp,',
      '    schema_version: "2.0",',
      '    agents_present: [2, 4, ...],',
      '    agents_missing: [],',
      '    has_evp: true | false,',
      '    validation_errors: [{ agent, severity, error, snippet? }],',
      '    missing_required_fields: [{ agent, field }],',
      '    gaps_by_agent: { "2": [...], "4": [...], ... },',
      '    load_status: "ready" | "partial" | "blocked"',
      '  }',
      '',
      'CRITÉRIO DE STATUS FINAL',
      '',
      'PRONTO PARA CARREGAMENTO (load_status: "ready"):',
      '  - Agentes 6, 9, 12, 13 todos presentes e sem erros fatais',
      '  - Zero missing_required_fields nos agentes 6, 9, 12, 13',
      '  - Agentes 2, 4, 5, 7, 8, 10, 11 presentes (mesmo com gaps recuperáveis)',
      '',
      'CARREGAMENTO PARCIAL POSSÍVEL (load_status: "partial"):',
      '  - Agentes 6, 9, 12, 13 presentes e sem erros fatais',
      '  - Algum dos agentes 2, 4, 5, 7, 8, 10, 11 ausente OU com erros recuperáveis',
      '  - O loader pode receber este JSON com expectativa de que algumas tabelas da Brand Memory ficarão vazias',
      '',
      'BLOQUEADO (load_status: "blocked"):',
      '  - Qualquer um dos agentes 6, 9, 12, 13 ausente ou com erro fatal',
      '  - missing_required_fields > 0 em qualquer um dos agentes 6, 9, 12, 13',
      '  - JSON inválido no <brand_memory_export> de 6, 9, 12 ou 13',
      '',
      'EVP é sempre opcional. Sua ausência nunca bloqueia.',
      '',
      'Agentes 6, 9, 12, 13 são CRÍTICOS porque:',
      '  - 6 = direção estratégica (sem ele não há sentido)',
      '  - 9 = plataforma de marca (sem ela a Agência não tem voz)',
      '  - 12 = personas + jornada (sem ela a Agência não tem audiência)',
      '  - 13 = plano de comunicação (sem ele a Agência não tem operação)',
      '',
      'FORMATO DE SAÍDA (XML ENVELOPE + JSON ESTRUTURADO)',
      '',
      '<resumo_executivo>',
      '2 a 4 frases descrevendo o que foi consolidado: número de agentes processados com sucesso, número de validation_errors, número de campos faltantes, presença ou ausência de EVP, status final de carregamento. Linguagem operacional, sem floreio.',
      '</resumo_executivo>',
      '',
      '<conteudo>',
      '# Relatório de Consolidação para Brand Memory',
      '',
      '## Sumário',
      '- Agentes processados com sucesso: {lista}',
      '- Agentes com erros fatais: {lista ou "nenhum"}',
      '- Agentes com warnings: {lista ou "nenhum"}',
      '- Total de campos obrigatórios faltantes: {N}',
      '- Inclui módulo EVP: {sim | não}',
      '',
      '## Erros de validação',
      '{lista detalhada de validation_errors agrupada por agente, indicando severidade, ou "Nenhum."}',
      '',
      '## Campos obrigatórios faltantes',
      '{lista detalhada agrupada por agente, ou "Nenhum."}',
      '',
      '## Gaps declarados pelos agentes',
      '{resumo por agente das _gaps que cada um emitiu}',
      '',
      '## Status final: PRONTO PARA CARREGAMENTO | CARREGAMENTO PARCIAL | BLOQUEADO',
      '',
      '{justificativa de 2-3 linhas explicando o status}',
      '',
      '## Próximo passo',
      '{uma de:',
      '  - "Submeter para revisão humana antes do carregamento na Brand Memory."',
      '  - "Revisar erros acima e re-rodar agentes específicos antes de seguir."',
      '  - "Bloqueado — corrigir falhas críticas antes de prosseguir."}',
      '</conteudo>',
      '',
      '<conclusoes>',
      'Recomendação operacional ao consultor humano sobre prosseguir ou retornar para algum agente upstream. Se algum campo crítico falta, indique qual agente precisa ser re-rodado.',
      '',
      'LEMBRETE: Mesmo com status "PRONTO PARA CARREGAMENTO", o output deste agente precisa de revisão humana antes do loader carregar na Brand Memory. O loadDiagnosticToBrandMemory recusa entrada sem human_reviewed_at preenchido em diagnostic_runs.',
      '</conclusoes>',
      '',
      '<confianca>Alta|Media|Baixa</confianca>',
      '',
      '<brand_memory_export>',
      '{',
      '  "schema_version": "2.0",',
      '  "agent_id": 16,',
      '  "espansione_diagnostic": {',
      '    ...EspansioneDiagnostic completo conforme mapeamento acima...',
      '  }',
      '}',
      '</brand_memory_export>',
      '',
      'REGRAS DE EMISSÃO DO JSON',
      '- O JSON dentro de <brand_memory_export> DEVE ser JSON válido, parseável diretamente.',
      '- Sem markdown, sem comentários, sem trailing commas.',
      '- Strings dos agentes upstream entram BYTE A BYTE como vieram.',
      '- Campos ausentes upstream entram como null no consolidado — NÃO omita a chave.',
      '- Arrays vazios são [], não null.',
      '- Use a data atual do contexto como consolidated_at.',
      '',
      'QUANDO O INPUT ESTÁ INSUFICIENTE',
      '- Algum dos agentes críticos (6, 9, 12, 13) ausente → load_status: "blocked", mas AINDA assim emita o EspansioneDiagnostic com as seções disponíveis (preenchendo as faltantes com null). O bloqueio é sinalizado em meta, não impede a estrutura.',
      '- Múltiplos agentes upstream com JSON inválido → continue processando os demais; reporte cada um em validation_errors.',
      '- Nenhum agente presente (caso extremo) → emita estrutura mínima com load_status: "blocked" e meta.agents_missing listando todos os esperados.',
      '',
      'Limite total: 16000 tokens (output JSON costuma ser denso; respeite a obrigação de byte-a-byte).',
    ].join('\n');
  },

  getUserPrompt(context) {
    const parts = [];
    const projeto = context.projeto || {};
    const hoje = new Date().toISOString();

    parts.push('=== METADADOS DO PROJETO ===');
    parts.push(`brand_slug: ${projeto.slug || projeto.cliente_slug || '(sem slug)'}`);
    parts.push(`brand_name: ${projeto.cliente || projeto.nome || '(sem nome)'}`);
    parts.push(`industry: ${projeto.segmento || projeto.industry || 'null'}`);
    parts.push(`espansione_project_id: ${projeto.id || '(sem id)'}`);
    parts.push(`consolidated_at: ${hoje}`);
    parts.push('');

    // Trim agressivo: extrai SÓ a tag <brand_memory_export> de cada output.
    // O resto do envelope (resumo_executivo, conteudo, conclusoes, fontes)
    // é descartado porque o Agente 16 não usa nada disso — só normaliza
    // estrutura JSON já validada upstream.
    //
    // Sem isso, 12 outputs × ~10k tokens cada = 120k+ tokens de input.
    // Com isso, ~25-40k. Diferença econômica e de qualidade gigante.
    const extractBrandMemoryExport = (out) => {
      if (!out) return null;
      if (out.brand_memory_export_json) {
        return JSON.stringify(out.brand_memory_export_json, null, 2);
      }
      if (!out.conteudo) return null;
      const match = out.conteudo.match(
        /<brand_memory_export>([\s\S]*?)<\/brand_memory_export>/i
      );
      if (!match) return null;
      return match[1].trim();
    };

    const ESPERADOS = [
      { num: 2, label: 'AGENTE 2 — Consolidado VI', obrigatorio: true },
      { num: 4, label: 'AGENTE 4 — Consolidado VE', obrigatorio: true },
      { num: 5, label: 'AGENTE 5 — Visão de Mercado', obrigatorio: true },
      { num: 6, label: 'AGENTE 6 — Decodificação', obrigatorio: true },
      { num: 7, label: 'AGENTE 7 — Valores e Atributos', obrigatorio: true },
      { num: 8, label: 'AGENTE 8 — Diretrizes', obrigatorio: true },
      { num: 9, label: 'AGENTE 9 — Plataforma de Branding', obrigatorio: true },
      { num: 10, label: 'AGENTE 10 — Identidade Verbal', obrigatorio: true },
      { num: 11, label: 'AGENTE 11 — One Page Visual', obrigatorio: true },
      { num: 12, label: 'AGENTE 12 — One Page Experiência', obrigatorio: true },
      { num: 13, label: 'AGENTE 13 — Plano de Comunicação', obrigatorio: true },
      { num: 14, label: 'AGENTE 14 — EVP', obrigatorio: false },
    ];

    parts.push('=== BLOCOS <brand_memory_export> DOS AGENTES UPSTREAM ===');
    parts.push('');

    let presentes = 0;
    let ausentes_obrigatorios = 0;

    for (const { num, label, obrigatorio } of ESPERADOS) {
      const out = context.previousOutputs?.[num];
      const exportBlock = extractBrandMemoryExport(out);

      parts.push(`--- ${label} ---`);
      if (exportBlock) {
        parts.push('<brand_memory_export>');
        parts.push(exportBlock);
        parts.push('</brand_memory_export>');
        presentes++;
      } else if (out) {
        parts.push(
          `[AUSENTE] Agente ${num} rodou mas não emitiu tag <brand_memory_export>. Adicionar a validation_errors com severity "fatal" e error "brand_memory_export tag missing".`
        );
        if (obrigatorio) ausentes_obrigatorios++;
      } else {
        if (obrigatorio) {
          parts.push(
            `[AUSENTE] Agente ${num} não rodou. Adicionar a validation_errors com severity "fatal" e error "agent output missing".`
          );
          ausentes_obrigatorios++;
        } else {
          parts.push(
            `[OPCIONAL — não rodou] Agente ${num} é modular. Tratar has_evp como false e omitir chave evp do EspansioneDiagnostic.`
          );
        }
      }
      parts.push('');
    }

    parts.push('=== INSTRUÇÕES DE EXECUÇÃO ===');
    parts.push('- Processe CADA bloco <brand_memory_export> conforme as regras de validação do system prompt.');
    parts.push('- Construa o EspansioneDiagnostic final SEMPRE — mesmo com erros fatais, emita estrutura preenchendo lacunas com null.');
    parts.push('- Strings dos agentes upstream entram BYTE A BYTE no consolidado — não reformate, não traduza, não resuma.');
    parts.push('- Propague _gaps de cada agente para meta.gaps_by_agent.');
    parts.push('- Determine load_status conforme o critério do system prompt (ready/partial/blocked).');
    parts.push(`- Sumário rápido pra contextualizar: ${presentes} de ${ESPERADOS.length} blocos presentes; ${ausentes_obrigatorios} obrigatórios ausentes.`);
    parts.push('- A tag final <brand_memory_export> do seu output DEVE conter JSON válido parseável.');

    return parts.join('\n');
  },

  parseOutput(rawText) {
    const extract = (tag) => {
      const m = rawText.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
      return m ? m[1].trim() : '';
    };
    const extractJsonTag = (tag) => {
      const matches = Array.from(rawText.matchAll(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'gi')));
      const candidates = matches.map((match) => {
        let text = match[1].trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim();
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace >= 0 && lastBrace > firstBrace) text = text.slice(firstBrace, lastBrace + 1).trim();
        return text;
      }).filter(Boolean);
      return candidates.find((candidate) => {
        try {
          JSON.parse(candidate);
          return true;
        } catch {
          return false;
        }
      }) || candidates.at(-1) || '';
    };
    const conteudo = extract('conteudo') || rawText.trim();
    const brandMemoryExport = extractJsonTag('brand_memory_export');
    return {
      conteudo: brandMemoryExport
        ? `${conteudo}\n\n<brand_memory_export>\n${brandMemoryExport}\n</brand_memory_export>`
        : conteudo,
      resumo_executivo: extract('resumo_executivo'),
      conclusoes: extract('conclusoes'),
      confianca: extract('confianca') || 'Media',
      fontes: 'Consolidação dos exports estruturados dos agentes 2,4,5,6,7,8,9,10,11,12,13 (e 14 se modular ativo) — Método Espansione · v2.0',
      gaps: '',
    };
  },
};
