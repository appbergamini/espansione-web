// =====================================================================
// Build do catálogo do Mapa da Maturidade (versão FINAL — 4 sistemas × 10).
// Lê data/maturidade/mapa_maturidade_final.xlsx e emite
// lib/mapa-maturidade/catalog.generated.js.
//
// Fonte de verdade = o Excel (ativo metodológico). Reexecutar após editar:
//   node scripts/build-maturidade-final.cjs
//
// Saída determinística (ordem do Excel) para diffs limpos no git.
// =====================================================================
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const SRC = path.join(__dirname, '..', 'data', 'maturidade', 'mapa_maturidade_final.xlsx');
const OUT = path.join(__dirname, '..', 'lib', 'mapa-maturidade', 'catalog.generated.js');

const SISTEMAS = ['Marca', 'Negócios', 'Comunicação', 'Pessoas'];

// enum estável de tipo de resposta
function responseType(tipo) {
  const t = (tipo || '').toLowerCase();
  if (/frequ/.test(t)) return 'escala4_frequencia';
  if (/múltipla|multipla/.test(t)) return 'multipla';
  if (/seleção única|selecao unica/.test(t)) return 'selecao_unica';
  if (/texto/.test(t)) return 'texto_curto';
  return 'outro';
}

// "Nunca (0) | ... | Não sei/Não se aplica (excluído do cálculo)" → [{label,value}]
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

// "Condicional — exibir se MM2-MAR-10 = Muitas vezes ou Sempre" → { depende, valores:[2,3] }
const FREQ_LABEL_TO_VALUE = { 'nunca': 0, 'poucas vezes': 1, 'muitas vezes': 2, 'sempre': 3 };
function parseExibicao(exib) {
  const s = String(exib || '').trim();
  if (/^núcleo$/i.test(s) || !s) return { exibicao: 'nucleo', regra_condicional: null };
  const m = s.match(/exibir se\s+([A-Z0-9-]+)\s*=\s*(.+)$/i);
  if (m) {
    const depende = m[1].trim();
    const valores = m[2]
      .split(/\s+ou\s+|,|;/i)
      .map((x) => FREQ_LABEL_TO_VALUE[x.trim().toLowerCase()])
      .filter((v) => v !== undefined);
    return { exibicao: 'condicional', regra_condicional: { depende, valores } };
  }
  return { exibicao: 'condicional', regra_condicional: null };
}

function num(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function build() {
  const wb = XLSX.readFile(SRC);
  const perguntasRaw = XLSX.utils.sheet_to_json(wb.Sheets['Perguntas_Maturidade'], { defval: '' });

  const perguntas = perguntasRaw
    .filter((r) => r.ID)
    .map((r) => {
      const rt = responseType(r['Tipo de resposta']);
      const isEscala4 = rt === 'escala4_frequencia';
      const isLista = rt === 'multipla' || rt === 'selecao_unica';
      const { exibicao, regra_condicional } = parseExibicao(r['Exibição']);
      return {
        id: String(r.ID),
        sistema: r.Sistema || null,
        dimensao: r['Dimensão do check-up'] || null,
        indicador: r['Indicador de maturidade'] || null,
        o_que_identifica: r['O que identifica no check-up'] || null,
        pergunta: r['Pergunta final'] || '',
        response_type: rt,
        opcoes: isEscala4 ? parseEscala4(r['Opções / Escala']) : isLista ? parseLista(r['Opções / Escala']) : [],
        score_family: r.score_family || 'none',
        pontua: r['Pontua?'] === 'Sim',
        peso: num(r['Peso sugerido']),
        relevancia: num(r['Relevância (0–10)']),
        exibicao,
        regra_condicional,
        obrigatoria: r['Obrigatória?'] === 'Sim',
        sinal_alerta: r['Sinal de alerta quando a nota for baixa'] || null,
        identidade_aprofunda: r['O que o Mapa da Identidade aprofunda'] || null,
      };
    });

  // régua de pontuação (4 faixas)
  const reguaRaw = XLSX.utils.sheet_to_json(wb.Sheets['Regua_Pontuacao'], { defval: '' });
  const regua = reguaRaw
    .filter((r) => r.Faixa)
    .map((r) => {
      const m = String(r.Faixa).match(/(\d+)\s*%?\s*a\s*(\d+)/);
      const nivel = String(r['Nível']).match(/Nível\s*(\d+)/i);
      return {
        min: m ? Number(m[1]) : null,
        max: m ? Number(m[2]) : null,
        faixa: r.Faixa,
        nivel: nivel ? Number(nivel[1]) : null,
        nivel_nome: String(r['Nível']).replace(/^Nível\s*\d+\s*[—-]\s*/i, '').trim(),
        leitura: r['Leitura do check-up'] || '',
        mensagem: r['Mensagem para relatório'] || '',
      };
    });

  // cadastro / captação de lead
  const cadastroRaw = XLSX.utils.sheet_to_json(wb.Sheets['Dados_Cadastro'], { defval: '' });
  const cadastro = cadastroRaw
    .filter((r) => r.ID)
    .map((r) => ({
      id: String(r.ID),
      campo: r.Campo || null,
      pergunta: r.Pergunta || '',
      response_type: responseType(r['Tipo de resposta']),
      opcoes: parseLista(r['Opções']),
      uso: r.Uso || null,
    }));

  const header =
`// =====================================================================
// GERADO AUTOMATICAMENTE — NÃO EDITAR À MÃO.
// Fonte: data/maturidade/mapa_maturidade_final.xlsx.
// Regenerar: node scripts/build-maturidade-final.cjs
// Perguntas: ${perguntas.length} (${perguntas.filter((q) => q.pontua).length} pontuam) · Sistemas: ${SISTEMAS.length}
// =====================================================================

export const SISTEMAS_MATURIDADE = ${JSON.stringify(SISTEMAS, null, 2)};

/** @typedef {Object} PerguntaMaturidade */
export const CATALOGO_MATURIDADE = ${JSON.stringify(perguntas, null, 2)};

export const REGUA_MATURIDADE = ${JSON.stringify(regua, null, 2)};

export const CADASTRO_MATURIDADE = ${JSON.stringify(cadastro, null, 2)};
`;
  fs.writeFileSync(OUT, header, 'utf8');

  // sanidade
  const dup = perguntas.map((q) => q.id).filter((id, i, a) => a.indexOf(id) !== i);
  if (dup.length) throw new Error('IDs duplicados: ' + [...new Set(dup)].join(', '));
  const pontuam = perguntas.filter((q) => q.pontua);
  if (pontuam.length !== 40) throw new Error(`esperado 40 perguntas que pontuam, obtido ${pontuam.length}`);
  for (const s of SISTEMAS) {
    const n = pontuam.filter((q) => q.sistema === s).length;
    if (n !== 10) throw new Error(`sistema ${s}: esperado 10 que pontuam, obtido ${n}`);
  }
  if (regua.length !== 4) throw new Error(`régua deve ter 4 faixas, obtido ${regua.length}`);

  console.log(
    `OK → lib/mapa-maturidade/catalog.generated.js (${perguntas.length} perguntas, ${pontuam.length} pontuam, ${regua.length} faixas, ${cadastro.length} campos de cadastro)`
  );
}
build();
