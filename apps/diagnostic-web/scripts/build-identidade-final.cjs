// =====================================================================
// Build do catálogo do Mapa de Identidade Estratégica (FINAL — 30/público).
// Lê data/identidade/mapa_identidade_final.xlsx (3 públicos + bloco aberto)
// e emite lib/identidade-final/catalog.generated.js.
//
// Fonte de verdade = o Excel. Reexecutar após editar:
//   node scripts/build-identidade-final.cjs
//
// Isolado do catálogo de 231 (identidade-v2) — este substitui aquele no swap.
// =====================================================================
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const SRC = path.join(__dirname, '..', 'data', 'identidade', 'mapa_identidade_final.xlsx');
const OUT = path.join(__dirname, '..', 'lib', 'identidade-final', 'catalog.generated.js');

const PUBLICOS = ['socios', 'colaboradores', 'clientes'];

// código do indicador comparável (eixo da triangulação) a partir do ID
function indicadorCodigo(id) {
  const m = String(id).match(/(MAR|NEG|COM|PES)-0*(\d+)/);
  return m ? `${m[1]}-${String(m[2]).padStart(2, '0')}` : null;
}

function responseType(tipo) {
  const t = (tipo || '').toLowerCase();
  if (/concord/.test(t)) return 'escala4_concordancia';
  if (/frequ/.test(t)) return 'escala4_frequencia';
  if (/nps/.test(t)) return 'escala_0_10_nps';
  if (/0 a 10|0-10/.test(t)) return 'escala_0_10';
  if (/ranking/.test(t)) return 'ranking_top3';
  if (/até 3|ate 3/.test(t)) return 'multipla_ate3';
  if (/múltipla|multipla/.test(t)) return 'multipla';
  if (/seleção única|selecao unica/.test(t)) return 'selecao_unica';
  if (/estruturada/.test(t)) return 'aberta_estruturada_3';
  if (/curta múltipla|curta multipla/.test(t)) return 'aberta_curta_multipla';
  if (/aberta longa/.test(t)) return 'aberta_longa';
  if (/aberta curta|resposta curta/.test(t)) return 'aberta_curta';
  if (/aberta/.test(t)) return 'aberta_longa';
  if (/texto/.test(t)) return 'texto_curto';
  return 'outro';
}

function parseEscala4(opcoes) {
  const partes = String(opcoes || '').split('|').map((s) => s.trim()).filter(Boolean);
  const itens = [];
  for (const p of partes) {
    const m = p.match(/^(.*?)\s*\((\d+)\)\s*$/);
    if (m) itens.push({ label: m[1].trim(), value: Number(m[2]) });
    else if (/exclu/i.test(p)) itens.push({ label: p.replace(/\s*\(.*\)\s*$/, '').trim(), value: -1 });
  }
  return itens;
}
function parseLista(opcoes) {
  return String(opcoes || '').split('|').map((s) => s.trim()).filter(Boolean);
}
// "mostra_se=<id>:val1;val2" → { depende, valores }
function parseRegra(txt) {
  const m = String(txt || '').match(/^mostra_se=([^:]+):(.+)$/);
  if (!m) return null;
  return { depende: m[1].trim(), valores: m[2].split(';').map((s) => s.trim()).filter(Boolean) };
}

// normaliza uma linha (colunas variam por aba) num item de catálogo
function normalizar({ id, publico, sistema, objetivo, indicador, pergunta, tipo, opcoes, score_family,
  classificacao, obrigatoria, pontua, regra, subtipo, uso }) {
  const rt = responseType(tipo);
  const isEscala4 = rt === 'escala4_concordancia' || rt === 'escala4_frequencia';
  const isLista = ['selecao_unica', 'multipla', 'multipla_ate3', 'ranking_top3'].includes(rt);
  const sf = score_family || 'none';
  return {
    id: String(id),
    publico,
    sistema: sistema || null,
    objetivo: objetivo || null,
    indicador: indicador || null,
    indicador_codigo: sf === 'maturity' ? indicadorCodigo(id) : null,
    classificacao: classificacao || null,
    subperfil: subtipo || 'todos',
    score_family: sf,
    response_type: rt,
    pergunta: pergunta || '',
    opcoes: isEscala4 ? parseEscala4(opcoes) : isLista ? parseLista(opcoes) : [],
    max_escolhas: rt === 'multipla_ate3' || rt === 'ranking_top3' ? 3 : null,
    obrigatoria: obrigatoria === 'Sim',
    pontua_maturidade: pontua === 'Sim',
    regra_condicional: parseRegra(regra),
    uso_relatorio: uso || null,
    aberta: rt.startsWith('aberta'),
  };
}

function build() {
  const wb = XLSX.readFile(SRC);
  const sheet = (n) => XLSX.utils.sheet_to_json(wb.Sheets[n], { defval: '' });

  const catalogo = [];

  // Sócios/Diretores — exclui as AB-SD-* (colunas desalinhadas; vêm do bloco aberto)
  for (const r of sheet('30_Socios_Diretores')) {
    if (!r.ID || String(r.ID).startsWith('AB-SD')) continue;
    catalogo.push(normalizar({
      id: r.ID, publico: 'socios', sistema: r.Sistema, objetivo: r.Objetivo, indicador: r.Indicador,
      pergunta: r['Pergunta final'], tipo: r['Tipo de resposta'], opcoes: r['Opções / Escala'],
      score_family: r.score_family, classificacao: r['Classificação'],
      obrigatoria: r['Obrigatória?'], pontua: r['Pontua na maturidade?'],
    }));
  }
  // Colaboradores/Líderes
  for (const r of sheet('30_Colab_Lideres')) {
    if (!r.ID) continue;
    catalogo.push(normalizar({
      id: r.ID, publico: 'colaboradores', sistema: r.Sistema, objetivo: r.Objetivo, indicador: r.Indicador,
      pergunta: r['Pergunta final'], tipo: r['Tipo de resposta'], opcoes: r['Opções / Escala'],
      score_family: r.score_family, classificacao: r['Classificação'],
      obrigatoria: r['Obrigatória?'], pontua: r['Pontua na maturidade?'],
    }));
  }
  // Clientes/Fornecedores
  for (const r of sheet('30_Clientes_Fornec')) {
    if (!r.ID) continue;
    catalogo.push(normalizar({
      id: r.ID, publico: 'clientes', sistema: r.Sistema, objetivo: r.Objetivo, indicador: r.Indicador,
      pergunta: r['Pergunta final'], tipo: r['Tipo de resposta'], opcoes: r['Opções / Escala'],
      score_family: r.score_family, classificacao: r['Subtipo/Regra de público'],
      obrigatoria: r['Obrigatória?'], pontua: r['Pontua?'], regra: r['Regra condicional'],
    }));
  }
  // Bloco aberto dos Sócios (8 abertas, colunas próprias)
  for (const r of sheet('Bloco_Aberto_Socios')) {
    if (!r.ID) continue;
    catalogo.push(normalizar({
      id: r.ID, publico: 'socios', sistema: r.Sistema, objetivo: r.Objetivo, indicador: r.Indicador,
      pergunta: r['Pergunta aberta final'], tipo: r.Tipo, score_family: 'none',
      classificacao: 'Bloco aberto', obrigatoria: r['Obrigatória?'], pontua: r['Pontua?'],
      uso: r['Uso no relatório / IA'],
    }));
  }

  // Matriz dos 24 indicadores comparáveis
  const matriz = sheet('Matriz_24_Indicadores')
    .filter((r) => r['Código'])
    .map((r) => ({
      codigo: r['Código'],
      sistema: r.Sistema,
      objetivo: r.Objetivo,
      indicador: r['Indicador comparável'],
      mede: r['O que mede'] || null,
    }));

  const header =
`// =====================================================================
// GERADO AUTOMATICAMENTE — NÃO EDITAR À MÃO.
// Fonte: data/identidade/mapa_identidade_final.xlsx.
// Regenerar: node scripts/build-identidade-final.cjs
// Perguntas: ${catalogo.length} · Indicadores comparáveis: ${matriz.length}
// =====================================================================

export const PUBLICOS_IDENTIDADE = ${JSON.stringify(PUBLICOS, null, 2)};

/** @typedef {Object} PerguntaIdentidade */
export const CATALOGO_IDENTIDADE = ${JSON.stringify(catalogo, null, 2)};

export const MATRIZ_INDICADORES = ${JSON.stringify(matriz, null, 2)};
`;
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, header, 'utf8');

  // sanidade
  const dup = catalogo.map((q) => q.id).filter((id, i, a) => a.indexOf(id) !== i);
  if (dup.length) throw new Error('IDs duplicados: ' + [...new Set(dup)].join(', '));
  const porPub = (p) => catalogo.filter((q) => q.publico === p);
  const nucleo = (p) => porPub(p).filter((q) => q.score_family === 'maturity');
  for (const p of PUBLICOS) {
    if (nucleo(p).length !== 24) throw new Error(`${p}: esperado 24 núcleo (maturity), obtido ${nucleo(p).length}`);
    const semCodigo = nucleo(p).filter((q) => !q.indicador_codigo);
    if (semCodigo.length) throw new Error(`${p}: núcleo sem código: ${semCodigo.map((q) => q.id).join(', ')}`);
  }
  if (matriz.length !== 24) throw new Error(`matriz deve ter 24 indicadores, obtido ${matriz.length}`);

  console.log(
    `OK → lib/identidade-final/catalog.generated.js (${catalogo.length} perguntas: ` +
    PUBLICOS.map((p) => `${p} ${porPub(p).length}`).join(', ') + `; ${matriz.length} indicadores)`
  );
}
build();
