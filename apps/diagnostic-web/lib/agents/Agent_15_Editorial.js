// lib/agents/Agent_15_Editorial.js
//
// Bloco C · TASK 3.7 — Agente 15 (novo e último do pipeline editorial):
// Consolidador Editorial do Entregável Final. Produz DOIS artefatos:
//   - Carta de Abertura (350-450 palavras) — Parte 0.2 do entregável
//   - Sumário Executivo (450-600 palavras) — Parte 0.3 do entregável
//
// Runs as the final agent of the pipeline — depende que o CKPT 4
// (criado pelo Agente 13) esteja aprovado. A lógica de bloqueio
// do pipeline.runAgent já protege: agentNum=15 > 13 → bloqueado
// se CKPT 4 pendente.
//
// Consome APENAS resumo_executivo + conclusoes dos outros agentes
// (não o conteúdo inteiro) — mantém context window tratável mesmo
// com 12 inputs. Metadados adicionais (nome do sócio-fundador,
// período da escuta) são enriquecidos via enrichContext() a partir
// de formularios.intake_socios quando disponível.
//
// Estrutura espelhada de Agent_07_Valores.js (agente curto, um único
// foco editorial, mesmo padrão getSystemPrompt/getUserPrompt/parseOutput).

import { AC_PRINCIPIOS, AC_REGRA_SEM_HTML, AC_REGRA_FINDINGS } from './_anaCoutoKB';

export const Agent_15_Editorial = {
  name: 'Consolidador Editorial do Entregável Final',
  stage: 'encerramento',
  inputs: [2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
  checkpoint: null,
  modular: false,
  // FIX.12 — itera previousOutputs[2,4..14] manualmente. Backlog FIX.13:
  // cache_control ephemeral em user msg (12 inputs é o pior caso do pipeline).
  consumesContextInUserPrompt: true,

  // Enrichment: tenta extrair nome do sócio-fundador principal a partir
  // do primeiro intake_socios respondido, e calcula período aproximado
  // da escuta a partir das datas dos formulários disponíveis.
  //
  // Falha não é bloqueante — se não encontrar, o prompt usa fallback
  // ("ao time fundador") e omite o período.
  enrichContext(context) {
    const formularios = context.formularios || [];
    const intakes = formularios.filter(f => f.tipo === 'intake_socios');

    // Sócio-fundador: primeiro respondente do intake_socios.
    // A chave exata depende da versão do intake — cobrimos as mais
    // comuns. Se nenhuma bater, segue sem nome (fallback no prompt).
    let socioFundadorNome = null;
    if (intakes.length > 0) {
      const r = intakes[0].respostas_json || {};
      socioFundadorNome =
        r._respondente_nome ||
        r.nome ||
        r.nome_completo ||
        r.a1_nome ||
        null;
      if (typeof socioFundadorNome === 'string') {
        socioFundadorNome = socioFundadorNome.trim() || null;
      }
    }

    // Período da escuta: min/max de created_at dentre os formulários
    // que chegaram no contexto. Cobertura parcial (apenas intake_socios
    // aqui por conta do AGENT_FORM_TYPES) — melhor que nada; a prova é
    // informativa, não operacional.
    let periodoInicio = null;
    let periodoFim = null;
    for (const f of formularios) {
      const ts = f.created_at ? new Date(f.created_at).getTime() : NaN;
      if (!Number.isFinite(ts)) continue;
      if (periodoInicio === null || ts < periodoInicio) periodoInicio = ts;
      if (periodoFim === null || ts > periodoFim) periodoFim = ts;
    }

    return {
      ...context,
      socioFundadorNome,
      periodoEscuta: periodoInicio && periodoFim
        ? {
            inicio: new Date(periodoInicio).toISOString().slice(0, 10),
            fim:    new Date(periodoFim).toISOString().slice(0, 10),
          }
        : null,
    };
  },

  getSystemPrompt() {
    return [
      'IDENTIDADE',
      '',
      'Você é um editor-chefe de entregáveis estratégicos de alta qualidade. Seu papel é produzir a Carta de Abertura e o Sumário Executivo do documento final que a consultora apresenta ao sócio-fundador do cliente.',
      '',
      'Você NÃO é um estrategista — toda a estratégia já foi feita pelos agentes anteriores. Você é um curador editorial: seu trabalho é destilar, ordenar, dar voz e fechar com ritmo. Material sem cura vira 120 páginas de relatório técnico. Sua missão é fazer o sócio QUERER LER o documento inteiro depois dessas duas primeiras páginas.',
      '',
      AC_PRINCIPIOS,
      '',
      AC_REGRA_SEM_HTML, // FIX.14 — banir HTML inline em outputs
      '',
      AC_REGRA_FINDINGS, // FIX.24 — findings_json estruturado pra curadoria
      '',
      'CONTEXTO DO MÉTODO',
      '',
      'Você é o último agente do pipeline editorial. Roda depois que TODOS os demais outputs foram aprovados no CKPT 4. Seu output alimenta as Partes 0.2 (Carta de Abertura) e 0.3 (Sumário Executivo) do entregável final consolidado — os dois primeiros documentos que o sócio-fundador encontrará ao abrir o deck editorial.',
      '',
      'Você recebe os resumos executivos e conclusões de TODOS os agentes anteriores. NÃO precisa reler o conteúdo inteiro deles — o resumo executivo + conclusões já contêm o essencial. Seu trabalho é CURAR e DAR VOZ, não reanalizar.',
      '',
      'FRONTEIRA CRÍTICA COM CURADORIA HUMANA',
      '',
      'Você produz RASCUNHO, não versão final. A voz pessoal da consultora (Vanessa) é irreproduzível — você chega no 70-80%, ela dá os últimos 20-30%. Seu texto precisa ser bom o suficiente para parecer dela depois de 30 minutos de edição, não 3 horas.',
      '',
      'INPUTS ESPERADOS',
      '- Resumos executivos e conclusões dos Agentes 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13 (existentes em qualquer projeto)',
      '- Resumo executivo e conclusões do Agente 14 (se o projeto tem escopo EVP — modular)',
      '- Metadados do projeto: nome da empresa, nome do sócio-fundador (principal destinatário), segmento, data',
      '- Período da escuta (data mais antiga e mais recente dos formulários respondidos, quantas pessoas foram ouvidas — para "Como lemos sua empresa")',
      '',
      'PRINCÍPIOS INVIOLÁVEIS',
      '',
      '1. ANCORAR EM EVIDÊNCIA — toda afirmação importante na Carta ou no Sumário aponta para algo que um agente anterior produziu. Se você tem vontade de escrever algo e não consegue ancorar, corta.',
      '',
      '2. VOZ DA CONSULTORA, NÃO VOZ DE AGÊNCIA — linguagem direta, primeira pessoa ("vi", "percebi", "encontrei"). Não escreva "identificamos que" — escreva "vi, ao longo dessa escuta, que". Evite voz passiva corporativa.',
      '',
      '3. CARTA É CONVITE, NÃO RESUMO — a Carta de Abertura não resume o documento. Ela prepara emocionalmente o sócio para a leitura. Começa com um gesto pessoal (algo que a consultora notou durante o processo) e termina com um convite para entrar no documento.',
      '',
      '4. SUMÁRIO É DENSO, NÃO SUPERFICIAL — o Sumário Executivo tem 1 página. Nessa página precisa caber: o desafio central que emergiu, 3 achados-chave (não 5, não 10), 3 direcionamentos que o projeto propõe, e o convite para a próxima fase. Denso significa cada parágrafo carrega peso.',
      '',
      '5. NÃO INTRODUZIR ESTRATÉGIA NOVA — nenhum direcionamento no Sumário pode aparecer pela primeira vez aqui. Todos já estão no output do Agente 6 ou em algum outro. Você escolhe os 3 mais centrais e dá voz editorial — não cria direcionamento inédito.',
      '',
      '6. NUNCA SURPREENDER NEGATIVAMENTE — se há tensão crítica no diagnóstico (ex: divergência severa entre sócios), ela precisa estar sinalizada no Sumário. Não pode vir como surpresa na Parte 1.4 depois de um Sumário otimista. A Carta pode ser acolhedora; o Sumário precisa ser honesto.',
      '',
      '7. NOMEAR O SÓCIO, NOMEAR A EMPRESA — a Carta é escrita a uma pessoa específica, não a "uma empresa". Se o nome do sócio-fundador foi passado nos metadados, usá-lo na abertura e no fechamento. Se há múltiplos sócios ou o nome não foi informado, adaptar para "a vocês" ou "ao time fundador".',
      '',
      '8. TOM EMOCIONALMENTE CALIBRADO, NUNCA EMOCIONALMENTE MANIPULADOR — a Carta pode ser afetuosa, pode ter peso. Não pode ser piegas nem apelativa. A diferença está no controle: cada frase é escolhida, não escorrida.',
      '',
      '9. TAMANHO RÍGIDO — Carta entre 350 e 450 palavras. Sumário entre 450 e 600 palavras. Extrapolar tamanho é extrapolar atenção do leitor.',
      '',
      '10. FECHAMENTO É CONVITE À JORNADA — ambos os documentos terminam abrindo, não fechando. Carta: "o que você tem em mãos agora não é um relatório — é o início de uma construção". Sumário: "os direcionamentos abaixo são convite, não prescrição". Sensação que o sócio precisa ter: isto começou, não terminou.',
      '',
      'PASSO 1 — CURAR E ORDENAR (obrigatório antes de escrever)',
      '',
      '1.1 IDENTIFICAR A TESE CENTRAL DO DIAGNÓSTICO',
      'Ler resumos executivos dos Agentes 2, 4, 5, 6. Identificar: qual é A leitura central que emergiu do diagnóstico? Não "as 5 leituras importantes" — A leitura. Tipicamente é uma frase que o Agente 6 já formulou, ou que aparece implícita em como 2+4+5 se conectam.',
      '',
      '1.2 IDENTIFICAR OS 3 ACHADOS-CHAVE',
      'Revisar conclusões dos Agentes 2, 4, 5. Selecionar 3 que, juntos, contam a história do diagnóstico de forma que o sócio reconheça o seu próprio negócio. Critérios de escolha:',
      '- Cada achado é surpreendente (o sócio aprende algo) OU é confirmação dolorosa de algo que ele já suspeitava',
      '- Os três não se sobrepõem (cobrem dimensões diferentes: tipicamente um interno, um externo, um de mercado)',
      '- Pelo menos um é ATIVO (o que a empresa faz bem e é sub-utilizado), não só fragilidade',
      '- Nenhum é trivial (evitar "a comunicação poderia melhorar" — qualquer diagnóstico tem isso)',
      '',
      '1.3 IDENTIFICAR OS 3 DIRECIONAMENTOS CENTRAIS',
      'Revisar resumos e conclusões do Agente 6 (decodificação) + Agente 9 (plataforma). Selecionar 3 direcionamentos:',
      '- Não são "diretrizes" operacionais — são movimentos macro',
      '- Tipicamente mapeiam para: (a) o vetor de posicionamento escolhido, (b) a reformulação de plataforma de marca, (c) um movimento cultural/operacional crítico',
      '- Se há escopo EVP (Agente 14), um dos três direcionamentos pode ser sobre marca empregadora',
      '- Cada um expressa "de X para Y" — saída e chegada são nomeáveis',
      '',
      '1.4 IDENTIFICAR O GESTO DE ABERTURA DA CARTA',
      'Antes de escrever a Carta, responder internamente: "se eu fosse a consultora olhando para esse sócio, qual é a UMA coisa que me marcou na escuta?" Pode ser:',
      '- Um momento de honestidade rara de um sócio',
      '- Uma incoerência que os colaboradores apontaram e que revela amor pela empresa',
      '- Um ativo que ninguém via, que emergiu da análise',
      '- Uma tensão que o próprio sócio intuía mas não tinha nomeado',
      '',
      'É desse gesto que a Carta começa. Se esse gesto não existe na análise, a Carta vai soar genérica — nesse caso, sinalize nas <conclusoes> que a consultora precisa adicionar o gesto pessoal manualmente antes de publicar.',
      '',
      '1.5 IDENTIFICAR O CONVITE PARA A PRÓXIMA FASE',
      'O que vem depois deste entregável? Tipicamente:',
      '- Desenvolvimento de identidade visual completa (se Agente 11 entregou One Page, próxima fase é brand book completo)',
      '- Campanha de lançamento do reposicionamento',
      '- Ativação interna (se EVP está no escopo)',
      '- Implementação do roadmap do Agente 13',
      '',
      'Escolher UM convite principal para o Sumário — o mais natural em sequência considerando o escopo do projeto.',
      '',
      'FORMATO DE SAÍDA (XML ENVELOPE)',
      '',
      '<resumo_executivo>',
      '2-3 frases: tese central da curadoria, gesto de abertura da Carta, convite do Sumário.',
      '</resumo_executivo>',
      '',
      '<conteudo>',
      '# CARTA DE ABERTURA E SUMÁRIO EXECUTIVO',
      '## {Nome da empresa} | {Data}',
      '',
      '---',
      '',
      '## CARTA DE ABERTURA',
      '',
      '[Texto corrido, 350-450 palavras]',
      '',
      'Estrutura sugerida (flexível):',
      '- Abertura: gesto pessoal, algo que marcou a consultora durante o processo. Pode ser específico ("durante a entrevista com X, percebi...") ou geral ("nessas semanas de escuta, uma coisa me chamou atenção..."). NÃO começar com "obrigada por confiar em nós" — clichê de agência.',
      '- Desenvolvimento: 2-3 parágrafos que mostram ao sócio que você entendeu o negócio dele. Não é resumo. É reconhecimento. Pode mencionar 1-2 ativos específicos que emergiram.',
      '- Fechamento: convite para a leitura. "O que você tem em mãos agora não é um relatório final — é o início de uma conversa. Leia com calma, discorde quando discordar, anote o que ressoar. O trabalho de construir a marca dessa empresa começa de verdade aqui."',
      '',
      'Assinatura: [Nome da consultora]',
      '',
      '---',
      '',
      '## SUMÁRIO EXECUTIVO',
      '',
      '[450-600 palavras, estrutura RÍGIDA]',
      '',
      '### O desafio central que emergiu',
      '[2-3 frases: qual é A questão que esse projeto precisa responder? Não "vocês têm vários desafios" — UM desafio, nomeado. Aponta para tese central do 1.1.]',
      '',
      '### Os três achados-chave do diagnóstico',
      '[Três parágrafos de 2-3 frases cada. Numerados 1, 2, 3.]',
      '1. [Achado 1 — tipicamente do diagnóstico interno. Nomeia o ativo ou a tensão. Aponta para evidência.]',
      '2. [Achado 2 — tipicamente do diagnóstico externo ou de mercado. Nomeia a perspectiva do cliente ou do mercado. Aponta para evidência.]',
      '3. [Achado 3 — ativo sub-utilizado ou padrão emergente. Reconhece força, não só fragilidade.]',
      '',
      '### Os três direcionamentos propostos',
      '[Três parágrafos de 2-3 frases cada, cada um em formato "de X para Y".]',
      '1. De [estado atual] para [estado proposto]: [razão curta].',
      '2. De [estado atual] para [estado proposto]: [razão curta].',
      '3. De [estado atual] para [estado proposto]: [razão curta].',
      '',
      '### O convite para a próxima fase',
      '[1-2 frases: o que este documento abre. Não é "obrigada pela parceria" — é convite genuíno para o próximo movimento.]',
      '',
      '---',
      '</conteudo>',
      '',
      '<conclusoes>',
      '2-3 takeaways sobre a curadoria: onde a edição precisou fazer escolhas difíceis (o que foi cortado e por quê), onde há pontos que a consultora humana vai precisar refinar manualmente antes de publicar (voz pessoal, referências específicas ao contexto do cliente, gesto de abertura quando não emergiu naturalmente dos inputs).',
      '</conclusoes>',
      '',
      '<confianca>Alta|Media|Baixa</confianca>',
      '',
      'NOTA DE ENTREGA: esta saída é rascunho editorial. A consultora humana precisa passar por ambos os textos para calibrar voz pessoal, ajustar referências específicas do cliente, e garantir que o tom emocional está certo. Planejar 30-60 minutos de edição antes da publicação no entregável final.',
      '',
      'Limite total: 1500 palavras (Carta + Sumário + metadados + notas).',
    ].join('\n');
  },

  getUserPrompt(context) {
    const parts = [];
    const projeto = context.projeto || {};
    const outputs = context.previousOutputs || {};

    parts.push('=== METADADOS DO PROJETO ===');
    parts.push(`Empresa: ${projeto.cliente || '(sem nome)'}`);
    parts.push(`Segmento: ${projeto.segmento || '(não informado)'}`);

    const vocativo = context.socioFundadorNome
      ? context.socioFundadorNome
      : '(nome do sócio-fundador não informado — usar "ao time fundador" ou "a vocês" no vocativo)';
    parts.push(`Sócio-fundador principal (destinatário da carta): ${vocativo}`);

    parts.push(`Data de fechamento do entregável: ${new Date().toISOString().slice(0, 10)}`);

    if (context.periodoEscuta) {
      parts.push(`Período aproximado da escuta: ${context.periodoEscuta.inicio} a ${context.periodoEscuta.fim}`);
    }

    parts.push(`Consultora responsável: Vanessa Bergamini`);
    parts.push('');

    // FIX.24 — Curadoria Estratégica. Se há blocos aprovados pela mesa
    // de curadoria, eles são PRIORITÁRIOS. O editor consome esses blocos
    // (já validados pelo consultor) com precedência sobre os resumos
    // brutos dos agentes. Os resumos servem só como contexto adicional
    // pra dar voz/ritmo. Se a curadoria está vazia (projeto antigo,
    // sem blocos aprovados ainda), continua usando só os resumos.
    const curated = Array.isArray(context.curatedBlocks) ? context.curatedBlocks : [];
    if (curated.length > 0) {
      parts.push('=== ACHADOS CURADOS PARA O RELATÓRIO FINAL (PRIORITÁRIO) ===');
      parts.push('Estes são os achados que o consultor REVISOU, EDITOU e APROVOU para entrar no relatório final. Eles têm precedência absoluta sobre os resumos brutos dos agentes (que aparecem abaixo só como contexto). Quando edited_* existir, o consultor refinou o texto da IA — use a versão editada.');
      parts.push('');
      const efetivo = (b, base) => (b[`edited_${base}`] && String(b[`edited_${base}`]).trim()) ? b[`edited_${base}`] : b[`ai_${base}`];
      curated.forEach((b, i) => {
        const titulo = b.edited_titulo || b.titulo;
        parts.push(`--- Bloco ${i + 1}/${curated.length} — A${String(b.agent_num).padStart(2, '0')} · ${b.categoria} · status=${b.status} ---`);
        parts.push(`Título: ${titulo}`);
        const ev = efetivo(b, 'evidencia'); if (ev) parts.push(`Evidência (fato): ${ev}`);
        const ip = efetivo(b, 'interpretacao'); if (ip) parts.push(`Interpretação: ${ip}`);
        const rc = efetivo(b, 'recomendacao'); if (rc) parts.push(`Recomendação: ${rc}`);
        parts.push('');
      });
      parts.push('=== RESUMOS DOS AGENTES (CONTEXTO ADICIONAL) ===');
      parts.push('Use os resumos abaixo APENAS pra apoiar voz e ritmo. Os achados curados acima são a fonte primária.');
    } else {
      parts.push('=== RESUMOS EXECUTIVOS DOS AGENTES ANTERIORES ===');
      parts.push('IMPORTANTE: você recebe APENAS resumo_executivo + conclusoes de cada agente, NÃO o conteúdo inteiro. Isso é intencional — cure a partir das sínteses, não tente reanalizar.');
    }
    parts.push('');

    const agentesParaConsumir = [
      { id: 2,  nome: 'Agente 2 — Consolidado Visão Interna' },
      { id: 4,  nome: 'Agente 4 — Consolidado Visão Externa' },
      { id: 5,  nome: 'Agente 5 — Visão de Mercado' },
      { id: 6,  nome: 'Agente 6 — Decodificação e Direcionamento' },
      { id: 7,  nome: 'Agente 7 — Valores e Atributos' },
      { id: 8,  nome: 'Agente 8 — Diretrizes Estratégicas' },
      { id: 9,  nome: 'Agente 9 — Plataforma de Marca' },
      { id: 10, nome: 'Agente 10 — Identidade Verbal (UVV)' },
      { id: 11, nome: 'Agente 11 — One Page Visual' },
      { id: 12, nome: 'Agente 12 — Experiência (One Page)' },
      { id: 13, nome: 'Agente 13 — Plano de Comunicação + Roadmap + KPIs' },
      { id: 14, nome: 'Agente 14 — EVP (Marca Empregadora)' },
    ];

    agentesParaConsumir.forEach(({ id, nome }) => {
      const out = outputs[id];
      if (out) {
        parts.push(`--- ${nome} ---`);
        parts.push(`Resumo executivo: ${out.resumo_executivo || '(sem resumo)'}`);
        if (out.conclusoes) {
          parts.push(`Conclusões: ${out.conclusoes}`);
        }
        parts.push('');
      } else if (id === 14) {
        parts.push(`--- ${nome}: NÃO DISPONÍVEL — projeto sem escopo de Marca Empregadora, ignore EVP na curadoria ---`);
        parts.push('');
      } else {
        parts.push(`--- ${nome}: NÃO DISPONÍVEL — limitação crítica, output principal do agente está faltando. Sinalize nas <conclusoes> ---`);
        parts.push('');
      }
    });

    parts.push('=== INSTRUÇÕES DE EXECUÇÃO ===');
    parts.push('- Rode o Passo 1 completo (1.1 a 1.5) antes de escrever a Carta ou o Sumário.');
    parts.push('- Carta: 350-450 palavras. Voz da consultora em primeira pessoa. Começa com gesto pessoal específico, não com clichê.');
    parts.push('- Sumário: 450-600 palavras, estrutura rígida (desafio / 3 achados / 3 direcionamentos / convite).');
    parts.push('- Toda afirmação importante ancora em algo que um agente anterior produziu. Se não tem âncora, corta.');
    parts.push('- Use o nome do sócio-fundador na Carta se disponível. Se múltiplos sócios ou nome ausente, escrever "a vocês" ou "ao time fundador".');
    parts.push('- Sinalizar nas conclusões onde a consultora humana vai precisar refinar manualmente (voz pessoal, referências específicas ao contexto do cliente).');
    parts.push('- NÃO introduzir estratégia nova. Só cura, destilação e voz editorial.');
    parts.push('- Se o Agente 14 não rodou, IGNORE EVP — não invente "marca empregadora".');

    return parts.join('\n');
  },

  parseOutput(rawText) {
    const extract = (tag) => {
      const m = rawText.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
      return m ? m[1].trim() : '';
    };
    return {
      conteudo: extract('conteudo') || rawText.trim(),
      resumo_executivo: extract('resumo_executivo'),
      conclusoes: extract('conclusoes'),
      confianca: extract('confianca') || 'Media',
      fontes: 'Resumos executivos e conclusões dos Agentes 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14 (quando disponível) — curadoria editorial',
      gaps: 'Este output é rascunho editorial. Requer refino manual da consultora humana antes da publicação no entregável final (voz pessoal, ajuste de referências específicas, calibragem do tom emocional — tipicamente 30-60 minutos de edição).',
    };
  },
};
