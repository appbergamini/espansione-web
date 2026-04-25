// lib/agents/Agent_05_BuscaWeb.js
//
// Agente 5 v2 — Visão de Mercado (Deep Research com Claude + Tavily Extract).
// Reescrita substancial da versão anterior. O research principal é feito
// pelo próprio Claude via web_search nativo (lib/ai/deepResearch.js);
// conteúdo bruto dos sites dos 5 concorrentes principais é capturado
// via Tavily Extract (lib/ai/tavilyExtract.js) e consumido como voz
// literal nas fichas de concorrentes.
//
// O nome do arquivo (Agent_05_BuscaWeb) é preservado para não quebrar
// imports em lib/agents/index.js e lib/ai/pipeline.js; o export pública
// acompanha o nome histórico.
//
// Substituição direta de tavilyResearch.js (que fica DEPRECATED no repo).

import { AC_PRINCIPIOS, AC_REGRA_SEM_HTML } from './_anaCoutoKB';
import { deepResearchViaClaude } from '../ai/deepResearch';
import { tavilyExtract, formatarExtractParaPrompt } from '../ai/tavilyExtract';

export const Agent_05_BuscaWeb = {
  name: 'Visão de Mercado',
  stage: 'diagnostico_externo',
  inputs: [2, 6], // consome contextos dos Agentes 2 e 6 para calibrar pesquisa
  checkpoint: null,
  // FIX.12 — enrichContext + getUserPrompt injetam previousOutputs manualmente.
  consumesContextInUserPrompt: true,
  preferredModel: 'claude-opus-4-7', // lido pelo Pipeline quando modelKey não foi passado

  async enrichContext(context) {
    const projeto = context.projeto || {};
    const output2 = context.previousOutputs?.[2];
    const output6 = context.previousOutputs?.[6];

    const contextoProjeto = construirContextoProjeto(projeto, output2, output6, context);

    // Timeouts explícitos por sub-chamada — garante que nenhuma segure
    // a função serverless inteira (300s) e deixe o Vercel matar sem
    // resposta, o que aparece no frontend como "Failed to fetch".
    const withTimeout = (promise, ms, label) => Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(
        () => reject(new Error(`${label}: timeout após ${ms}ms`)), ms,
      )),
    ]);

    // 1. Deep research via Claude (orçamento: 120s)
    // Deep research usa Sonnet 4.6 por default — 2-3x mais rápido que
    // Opus 4.7 com web_search, mantendo qualidade adequada para as 4
    // lentes. A síntese final (no AIRouter) continua respeitando o
    // modelo escolhido pelo usuário na UI.
    console.log('[Agente 5 v2] Iniciando deep research via Claude web_search…');
    let research = null;
    try {
      research = await withTimeout(
        deepResearchViaClaude({
          contextoProjeto,
          maxBuscas: 4,
          modelo: 'claude-sonnet-4-6',
        }),
        120_000,
        'deepResearch',
      );
      console.log(`[Agente 5 v2] Deep research completo: ${research.buscas_realizadas} buscas, ${research.citacoes.length} citações.`);
    } catch (err) {
      console.error('[Agente 5 v2] Erro no deep research:', err.message);
      research = { erro: err.message, texto_research: '', citacoes: [], urls_uteis: [], concorrentes_descobertos: [], buscas_realizadas: 0 };
    }

    // 2. Consolidar URLs dos concorrentes (intake + research)
    const urlsIntake = extrairUrlsDoIntake(context);
    const urlsParaExtract = consolidarUrlsConcorrentes(urlsIntake, research?.concorrentes_descobertos || [], research?.urls_uteis || []);

    // 3. Tavily Extract nos 5 principais (orçamento: 30s)
    console.log(`[Agente 5 v2] Tavily Extract em ${Math.min(urlsParaExtract.length, 5)} URLs de concorrentes…`);
    let extract;
    try {
      extract = await withTimeout(
        tavilyExtract(urlsParaExtract.slice(0, 5)),
        30_000,
        'tavilyExtract',
      );
    } catch (err) {
      console.error('[Agente 5 v2] Tavily Extract timeout/erro:', err.message);
      extract = { results: [], failed_results: [] };
    }
    console.log(`[Agente 5 v2] Extract completo: ${extract?.results?.length || 0} páginas capturadas.`);

    return {
      ...context,
      deepResearch: research,
      tavilyExtract: extract,
    };
  },

  getSystemPrompt() {
    return [
      'IDENTIDADE',
      'Você é um estrategista de branding sênior, formado no método Ana Couto, especializado em leitura competitiva e análise de mercado. Seu papel é sintetizar deep research externo em leitura acionável para construção de plataforma de marca.',
      '',
      'Você NÃO é um redator de relatório de mercado genérico. Você cura, interpreta e destila — conectando dados externos ao caso específico do cliente.',
      '',
      AC_PRINCIPIOS,
      '',
      AC_REGRA_SEM_HTML, // FIX.14 — banir HTML inline em outputs
      '',
      'CONTEXTO DO MÉTODO',
      'Você é o agente de Visão de Mercado do método Ana Couto. Alimenta o Agente 6 (Decodificação), que vai curar seu material editorialmente para o entregável final. Seu output precisa ser DENSO e CITÁVEL — com toda afirmação ancorada em fonte.',
      '',
      'Você NÃO faz a pesquisa sozinho — recebe como input o resultado de um DEEP RESEARCH já executado (via Claude com web_search) e captura literal dos sites dos concorrentes principais (via Tavily Extract). Sua responsabilidade é SINTETIZAR esse material nas 4 lentes do método.',
      '',
      'PRINCÍPIOS INVIOLÁVEIS',
      '',
      '1. TODA AFIRMAÇÃO TEM FONTE — se um fato ou dado aparece no output sem citação, corta. Honestidade epistêmica acima de completude.',
      '',
      '2. CONCORRENTES SÃO LIDOS EM 2 CAMADAS — os listados pelo cliente (intake) + os descobertos pelo research. Tratar ambos com mesmo rigor. Separar em subseções 2.1 (listados) e 2.2 (descobertos).',
      '',
      '3. CAPTURA LITERAL DOS SITES É OURO — o Tavily Extract entrega conteúdo bruto dos sites institucionais. Citar TRECHOS LITERAIS (entre aspas, com URL de fonte) ao descrever a voz/proposta de cada concorrente. Isso alimenta o Agente 10 (Verbal) lá na frente.',
      '',
      '4. TENDÊNCIAS PRECISAM DE PONTE — tendência sem ponte com o caso específico vira filler. Para cada tendência, nomear "o que isso significa para este cliente".',
      '',
      '5. OCEANO AZUL É TERRITÓRIO VIVO — identificar territórios pouco explorados, mas declarar honestamente quando "território livre" pode significar "território sem demanda". Nem todo vazio é oportunidade.',
      '',
      '6. NÃO É TRABALHO DESTE AGENTE PRESCREVER — você produz LEITURA de mercado, não direcionamento. O direcionamento é do Agente 6. Aqui você entrega panorama, fichas, mapa de territórios, tendências + IDA da VM. Ponto.',
      '',
      '7. ANONIMATO DE CLIENTES DO CONCORRENTE — se encontrar reviews ou testimonials com nome próprio de terceiros, consolidar ("um cliente de tecnologia relatou…") e não citar diretamente.',
      '',
      'FORMATO DE SAÍDA (XML ENVELOPE)',
      '',
      '<resumo_executivo>',
      '3–5 frases: movimento dominante da categoria, 2–3 concorrentes que mais importam, 1–2 tendências críticas, onde há oceano azul para este cliente.',
      '</resumo_executivo>',
      '',
      '<conteudo>',
      '# VISÃO DE MERCADO',
      '## {Nome da empresa} | {Data}',
      '',
      '## 1. PANORAMA DE CATEGORIA E ESTRUTURA DE MERCADO',
      'Síntese do deep research sobre tamanho, crescimento, dinâmica competitiva, regulação, movimentos recentes. Denso, com citações [N].',
      '',
      '## 2. FICHAS DE CONCORRENTES',
      '### 2.1 Concorrentes listados pelo cliente',
      'Para cada um (ordem do intake do sócio):',
      '- Nome + URL oficial',
      '- Posicionamento declarado (extraído do site via Extract, com citação literal entre aspas)',
      '- Público-alvo',
      '- Diferenciadores declarados',
      '- Movimentos recentes (do deep research, com citação)',
      '- Leitura crítica: o que faz bem, o que deixa espaço',
      '',
      '### 2.2 Concorrentes descobertos via research',
      'Mesma estrutura. Se a descoberta é importante, explicar por quê.',
      '',
      '## 3. MAPA DE TERRITÓRIOS',
      '- Territórios ocupados (onde a maioria joga)',
      '- Territórios sub-explorados',
      '- Potencial oceano azul para este cliente específico',
      '- Zonas de commoditização (risco)',
      '',
      '## 4. TENDÊNCIAS E SINAIS FRACOS',
      '- 3–5 tendências fortes (12–36 meses) — cada uma com PONTE para este cliente',
      '- 2–3 sinais fracos emergentes — por que vale acompanhar',
      '',
      '## 5. IDA DA VM (Impulsionadores / Detratores / Aceleradores de Mercado)',
      'Visão externa dos 3 eixos:',
      '- Impulsionadores — fatores de mercado que favorecem este cliente',
      '- Detratores — fatores que dificultam',
      '- Aceleradores — movimentos que podem ser capturados',
      'Cada item com evidência citável.',
      '',
      '## FONTES CONSULTADAS',
      'Lista consolidada de URLs usadas, organizadas por tema (categoria / concorrentes / tendências).',
      '</conteudo>',
      '',
      '<conclusoes>',
      '3–5 takeaways de mercado que o Agente 6 vai usar para construir direção.',
      '</conclusoes>',
      '',
      '<fontes>',
      'Lista numerada [N] — URL · título · veículo · data',
      '</fontes>',
      '',
      '<confianca>Alta|Media|Baixa</confianca>',
      '',
      'Limite total: 6000 palavras.',
    ].join('\n');
  },

  getUserPrompt(context) {
    const parts = [];
    const projeto = context.projeto || {};
    const research = context.deepResearch;
    const extract = context.tavilyExtract;
    const hoje = new Date().toISOString().slice(0, 10);

    parts.push('=== METADADOS DO PROJETO ===');
    parts.push(`Empresa: ${projeto.cliente || projeto.nome || '(sem nome)'}`);
    parts.push(`Segmento: ${projeto.segmento || '(não informado)'}`);
    parts.push(`Data da análise: ${hoje}`);
    parts.push('');

    const output2 = context.previousOutputs?.[2];
    const output6 = context.previousOutputs?.[6];
    if (output2?.resumo_executivo) {
      parts.push('=== CONTEXTO DO AGENTE 2 (VI) ===');
      parts.push(output2.resumo_executivo);
      parts.push('');
    }
    if (output6?.resumo_executivo) {
      parts.push('=== CONTEXTO DO AGENTE 6 (DECODIFICAÇÃO PRELIMINAR) ===');
      parts.push(output6.resumo_executivo);
      parts.push('');
    }

    parts.push('=== DEEP RESEARCH EXECUTADO (Claude web_search) ===');
    if (research && !research.erro) {
      parts.push(`Buscas realizadas: ${research.buscas_realizadas}`);
      parts.push(`Citações coletadas: ${research.citacoes?.length || 0}`);
      parts.push(`Concorrentes descobertos: ${(research.concorrentes_descobertos || []).join(', ') || 'nenhum além dos listados'}`);
      parts.push('');
      parts.push('--- TEXTO COMPLETO DO RESEARCH (com citações inline) ---');
      parts.push(research.texto_research);
      parts.push('');
      if (research.citacoes?.length) {
        parts.push('--- CITAÇÕES ESTRUTURADAS ---');
        research.citacoes.forEach((cit, i) => {
          parts.push(`[${i + 1}] ${cit.titulo || cit.url}`);
          parts.push(`    URL: ${cit.url}`);
          if (cit.trecho_citado) parts.push(`    Trecho: "${cit.trecho_citado.substring(0, 300)}…"`);
        });
      }
    } else {
      parts.push(`NÃO DISPONÍVEL — ${research?.erro ? `erro: ${research.erro}` : 'research não executado'}. Sinalize limitação severa na confiança.`);
    }
    parts.push('');

    parts.push('=== CAPTURA LITERAL DOS CONCORRENTES (TAVILY EXTRACT) ===');
    if (extract?.results?.length) {
      parts.push('Conteúdo literal dos sites institucionais dos concorrentes principais. USE CITAÇÕES LITERAIS nas fichas de concorrentes — entre aspas, com URL de fonte.');
      parts.push('');
      parts.push(formatarExtractParaPrompt(extract));
    } else {
      parts.push('Extract não retornou resultados. Fichas de concorrentes serão construídas apenas com base no deep research.');
    }
    parts.push('');

    // Concorrentes do intake (se disponíveis)
    const socios = (context.formularios || []).filter(f => f.tipo === 'intake_socios');
    if (socios.length > 0) {
      parts.push('=== CONCORRENTES LISTADOS PELO CLIENTE (do intake_socios) ===');
      socios.forEach(s => {
        const r = s.respostas_json || {};
        const conc = r.p2_concorrentes_analise || r.p3_concorrentes || r.concorrentes || '(nenhum listado)';
        parts.push(`${s.respondente || 'Sócio'}: ${typeof conc === 'string' ? conc : JSON.stringify(conc)}`);
      });
      parts.push('');
    }

    parts.push('=== INSTRUÇÕES DE EXECUÇÃO ===');
    parts.push('- Sintetize o DEEP RESEARCH e o EXTRACT nas 4 seções + IDA da VM + Fontes Consultadas do formato de saída.');
    parts.push('- FICHAS DE CONCORRENTES precisam ter CITAÇÕES LITERAIS (entre aspas, com URL) do conteúdo extraído. Isso alimenta o Agente 10 (Verbal) no futuro.');
    parts.push('- Concorrentes listados pelo cliente e descobertos pelo research ficam em subseções separadas (2.1 e 2.2).');
    parts.push('- Tendências: para cada uma, nomear a PONTE com este cliente específico.');
    parts.push('- TODA afirmação substantiva com fonte. Se não tem, sai do output.');
    parts.push('- Seção "FONTES CONSULTADAS" no final com todas as URLs organizadas por tema.');

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
      fontes: extract('fontes') || 'Deep research via Claude web_search + Tavily Extract dos 5 concorrentes principais',
      gaps: '',
    };
  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────

function construirContextoProjeto(projeto, output2, output6, context) {
  const partes = [];
  partes.push(`Empresa: ${projeto.cliente || projeto.nome || '(sem nome)'}`);
  partes.push(`Segmento: ${projeto.segmento || '(não informado)'}`);
  partes.push(`Estágio do negócio: ${projeto.estagio || projeto.momento || '(não informado)'}`);

  const socios = (context.formularios || []).filter(f => f.tipo === 'intake_socios');
  if (socios.length > 0) {
    const r = socios[0].respostas_json || {};
    if (r.p2_oferta_cliente)      partes.push(`O que vendem: ${String(r.p2_oferta_cliente).substring(0, 400)}`);
    if (r.p2_concorrentes_analise) partes.push(`Concorrentes listados pelo sócio: ${String(r.p2_concorrentes_analise).substring(0, 400)}`);
    else if (r.p3_concorrentes)    partes.push(`Concorrentes listados pelo sócio: ${String(r.p3_concorrentes).substring(0, 400)}`);
    if (r.p5_visao_marca)         partes.push(`Visão/ambição: ${String(r.p5_visao_marca).substring(0, 400)}`);
    if (r.p1_faturamento)         partes.push(`Porte (faturamento): ${r.p1_faturamento}`);
  }

  if (output2?.resumo_executivo) {
    partes.push(`\nLeitura interna consolidada (Agente 2):\n${output2.resumo_executivo}`);
  }
  if (output6?.resumo_executivo) {
    partes.push(`\nDecodificação preliminar (Agente 6):\n${output6.resumo_executivo}`);
  }
  return partes.join('\n');
}

function extrairUrlsDoIntake(context) {
  const socios = (context.formularios || []).filter(f => f.tipo === 'intake_socios');
  const urls = new Set();
  const regex = /https?:\/\/[^\s,;\)\]\"<>]+/gi;
  for (const s of socios) {
    const r = s.respostas_json || {};
    const texto = `${r.p2_concorrentes_analise || ''} ${r.p3_concorrentes || ''} ${r.p2_marca_admirada || ''}`;
    const achadas = texto.match(regex) || [];
    achadas.forEach(u => urls.add(u.replace(/[.,;:!?]+$/, '')));
  }
  return [...urls];
}

function consolidarUrlsConcorrentes(urlsIntake, descobertos, urlsUteis) {
  const urls = new Set();
  urlsIntake.forEach(u => urls.add(u));
  (urlsUteis || []).forEach(url => {
    if (ehUrlInstitucional(url)) urls.add(url);
  });
  return Array.from(urls).slice(0, 8);
}

function ehUrlInstitucional(url) {
  try {
    const dominio = url.replace(/^https?:\/\//, '').split('/')[0].toLowerCase();
    const ruins = /\/(blog|news|article|post|noticia|artigo|press|pressrelease|imprensa)\//i;
    if (ruins.test(url)) return false;
    // Descartar domínios que são portais/imprensa conhecidos
    const portais = /(valor|exame|infomoney|folha|estadao|oglobo|meioemensagem|bloomberg|reuters|forbes|wikipedia|linkedin|facebook|instagram|twitter|x\.com|youtube)\./i;
    if (portais.test(dominio)) return false;
    return dominio.split('.').length <= 3;
  } catch {
    return false;
  }
}
