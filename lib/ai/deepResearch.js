// lib/ai/deepResearch.js
//
// Wrapper do Claude com `web_search` nativo para deep research.
// Orquestra descoberta autônoma (queries calibradas ao caso + iteração)
// e entrega resultado estruturado nas 4 lentes do método Ana Couto.
//
// Contexto: substitui o caminho principal de pesquisa do Agente 5
// (antes em lib/ai/tavilyResearch.js) por deep research conduzido
// pelo próprio modelo.

import Anthropic from '@anthropic-ai/sdk';

/**
 * Executa deep research via Claude com web_search nativo.
 *
 * @param {object} params
 * @param {string} params.contextoProjeto  Texto com contexto (empresa, setor, intake + outputs dos Agentes 2 e 6 quando disponíveis)
 * @param {number} [params.maxBuscas=18]   Orçamento de buscas que o Claude pode fazer
 * @param {string} [params.modelo]         Modelo Claude (default claude-opus-4-7)
 * @returns {Promise<{ texto_research, citacoes, urls_uteis, concorrentes_descobertos, buscas_realizadas, uso_tokens }>}
 */
export async function deepResearchViaClaude({
  contextoProjeto,
  maxBuscas = 18,
  modelo = 'claude-opus-4-7',
}) {
  const apiKey = (process.env.ANTHROPIC_API_KEY || '').replace(/[\r\n\s]/g, '');
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY ausente');

  const anthropic = new Anthropic({ apiKey });

  const systemPrompt = construirSystemPromptDeepResearch(maxBuscas);
  const userPrompt = construirUserPromptDeepResearch(contextoProjeto);

  const response = await anthropic.messages.create({
    model: modelo,
    max_tokens: 8192,
    tools: [{
      type: 'web_search_20250305',
      name: 'web_search',
      max_uses: maxBuscas,
    }],
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  return parsearResultadoDeepResearch(response);
}

function construirSystemPromptDeepResearch(maxBuscas) {
  return `Você é um analista sênior de inteligência competitiva especializado em branding estratégico.

Sua missão é fazer research profundo e iterativo sobre:
1. A empresa-cliente específica (contexto será fornecido)
2. Os concorrentes listados pelo cliente + DESCOBRIR novos concorrentes relevantes que ele não listou
3. O panorama da categoria: estrutura de mercado, tamanho, crescimento, movimentos recentes
4. Tendências emergentes e sinais fracos que afetem o posicionamento

PRINCÍPIOS INVIOLÁVEIS:
1. QUERIES CALIBRADAS AO CASO — não faça queries genéricas ("tendências do setor X"). Calibre cada query ao contexto específico do cliente (porte, geografia, posicionamento aspiracional, segmento).
2. ITERAÇÃO INTELIGENTE — use o resultado de uma busca para orientar a próxima. Se descobrir um concorrente não-listado, investigue. Se uma tendência emerge, aprofunde.
3. DESCOBERTA AUTÔNOMA DE CONCORRENTES — além dos listados pelo cliente, procure:
   - Entrantes recentes no mercado
   - Players adjacentes com proposta convergente
   - Competidores internacionais que podem estar chegando ao mercado local
   - Startups ou iniciativas que redefinem o que é "concorrente"
4. CITAÇÕES OBRIGATÓRIAS — cada afirmação substantiva precisa apontar para fonte consultada. O Claude retorna citações nativamente via web_search; preservar e organizar.
5. 4 LENTES DO MÉTODO ANA COUTO — ao final, sintetizar em 4 blocos estruturados:
   (a) Panorama de categoria e estrutura de mercado
   (b) Fichas de concorrentes (listados + descobertos)
   (c) Mapa de territórios ocupados × oceano azul
   (d) Tendências e sinais fracos relevantes para o caso
6. LIMITE DE BUSCAS — você tem um budget de ${maxBuscas} buscas. Use com parcimônia. Queries ruins gastam budget sem ganhar conhecimento.
7. HONESTIDADE EPISTÊMICA — se algo não for encontrado ou for incerto, declare. Não invente dados. Melhor declarar "dados de mercado não encontrados publicamente para este recorte específico" do que fabricar números.

FORMATO DE SAÍDA:
Estruturar a resposta em 4 seções explícitas:

## 1. PANORAMA DA CATEGORIA
Estrutura, tamanho, crescimento, dinâmica competitiva, regulação relevante.

## 2. FICHAS DE CONCORRENTES
Para cada concorrente (listados + descobertos):
- Nome + URL oficial
- Posicionamento percebido
- Público-alvo declarado
- Diferenciadores principais
- Movimentos recentes (últimos 12-24 meses)
- Observações

Separar claramente "Listados pelo cliente" de "Descobertos via research".

## 3. MAPA DE TERRITÓRIOS
- Territórios ocupados (onde a maioria joga)
- Territórios pouco explorados
- Onde há potencial oceano azul para este cliente específico
- Onde há risco de commoditização

## 4. TENDÊNCIAS E SINAIS FRACOS
- 3-5 tendências fortes com horizonte 12-36 meses
- 2-3 sinais fracos emergentes
- Para cada: ponte explícita com o caso do cliente

ENCERRAMENTO: lista consolidada de URLs úteis para scraping posterior (captura literal dos sites dos concorrentes).`;
}

function construirUserPromptDeepResearch(contextoProjeto) {
  return `Execute deep research para o seguinte projeto de branding:

${contextoProjeto}

Use seu budget de buscas com inteligência. Prefira iteração (resultado de uma query orientando a próxima) em vez de queries paralelas desconectadas. Ao final, entregue a análise estruturada nas 4 lentes conforme instruído no system prompt.`;
}

function parsearResultadoDeepResearch(response) {
  const textBlocks = (response.content || []).filter(b => b.type === 'text');
  const textoCompleto = textBlocks.map(b => b.text || '').join('\n\n');

  // Extrair citações (web_search retorna citações inline)
  const citacoes = [];
  for (const block of textBlocks) {
    if (Array.isArray(block.citations)) {
      for (const cit of block.citations) {
        if (cit.type === 'web_search_result_location') {
          citacoes.push({
            url: cit.url,
            titulo: cit.title || '',
            trecho_citado: cit.cited_text || '',
          });
        }
      }
    }
  }

  // Extrair URLs do texto (incluindo as da seção ENCERRAMENTO)
  const urlsRegex = /https?:\/\/[^\s\)\]\"<>]+/g;
  const todasUrls = [...new Set((textoCompleto.match(urlsRegex) || []).map(u => u.replace(/[.,;:!?]+$/, '')))];

  const concorrentes_descobertos = extrairConcorrentesDescobertos(textoCompleto);

  // Contagem de buscas realizadas: itens com type 'server_tool_use' + name 'web_search'
  const buscas_realizadas = (response.content || []).filter(
    b => b.type === 'server_tool_use' && b.name === 'web_search'
  ).length;

  return {
    texto_research: textoCompleto,
    citacoes,
    urls_uteis: todasUrls,
    concorrentes_descobertos,
    buscas_realizadas,
    uso_tokens: response.usage || null,
  };
}

function extrairConcorrentesDescobertos(texto) {
  const match = texto.match(/Descobertos via research([\s\S]*?)(?=\n##|$)/i);
  if (!match) return [];
  const secao = match[1];
  const linhas = secao.split('\n').filter(l => l.trim().startsWith('-') || /^[A-ZÀ-Ý]/.test(l.trim()));
  return linhas
    .map(l => {
      const nome = l.replace(/^[-•*]\s*/, '').match(/^([^:–-]+)/)?.[1]?.trim();
      return nome;
    })
    .filter(Boolean)
    .slice(0, 10);
}
