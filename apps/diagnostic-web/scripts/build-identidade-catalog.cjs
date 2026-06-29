// =====================================================================
// Build do catálogo do Mapa de Identidade Estratégica (MVP v1).
// Lê o banco validado (data/identidade/banco_mvp_v1.xlsx, aba
// Banco_Completo_Anotado) e emite lib/identidade-v2/catalog.generated.js.
//
// Fonte de verdade = o Excel (ativo metodológico). Reexecutar após editar:
//   node scripts/build-identidade-catalog.cjs
//
// Saída é determinística (ordenada por ID) para diffs limpos no git.
// =====================================================================
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const SRC = path.join(__dirname, '..', 'data', 'identidade', 'banco_mvp_v1.xlsx');
const OUT = path.join(__dirname, '..', 'lib', 'identidade-v2', 'catalog.generated.js');

const PUBLICO = {
  'Sócios/Diretores': 'socios',
  'Colaboradores/Líderes': 'colaboradores',
  'Clientes/Fornecedores': 'clientes',
};

// Normaliza subperfil para enum ASCII estável: todos | lider | cliente | fornecedor.
function normSubperfil(v) {
  const s = String(v || 'todos').toLowerCase();
  if (/l[ií]der/.test(s)) return 'lider';
  if (/fornecedor/.test(s)) return 'fornecedor';
  if (/cliente/.test(s)) return 'cliente';
  return 'todos';
}

// Classifica o tipo de resposta num enum estável usado pelo engine/forms.
function responseType(tipo) {
  const t = (tipo || '').toLowerCase();
  if (/concord/.test(t)) return 'escala4_concordancia';
  if (/frequ/.test(t)) return 'escala4_frequencia';
  if (/nps/.test(t)) return 'escala_0_10_nps';
  if (/0 a 10|0-10/.test(t)) return 'escala_0_10';
  if (/múltipla|multipla/.test(t)) return 'multipla_ate3';
  if (/seleção única|selecao unica|seleção dinâmica|selecao dinamica/.test(t)) return 'selecao_unica';
  if (/número|numero/.test(t)) return 'numero';
  if (/texto/.test(t)) return 'texto_curto';
  if (/aberta/.test(t)) return 'aberta';
  if (/ranking/.test(t)) return 'ranking';
  return 'outro';
}

// Para escalas 0–3: mapa opção→valor + valor de exclusão (N/A).
function parseEscala4(opcoes) {
  // ex: "Discordo totalmente (0) | ... | Não sei/Não se aplica (excluído)"
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

function build() {
  const wb = XLSX.readFile(SRC);
  const rows = XLSX.utils.sheet_to_json(wb.Sheets['Banco_Completo_Anotado'], { defval: '' });

  const catalogo = rows
    .filter((r) => r.ID)
    .map((r) => {
      const rt = responseType(r['Tipo de resposta']);
      const isEscala4 = rt === 'escala4_concordancia' || rt === 'escala4_frequencia';
      const isMultipla = rt === 'multipla_ate3';
      return {
        id: String(r.ID),
        publico: PUBLICO[r['Público']] || null,
        subperfil: normSubperfil(r.subperfil),
        sistema: r.Sistema || null,
        objetivo: r.Objetivo || null,
        indicador: r.Indicador || null,
        indicador_canonico: r.indicador_canonico || null,
        anchor_cobertura: r.anchor_cobertura || null,
        score_family: r.score_family || 'none',
        tier_mvp: r.tier_mvp || null,
        produto: r.produto || null,
        is_free: r.is_free === 'Sim',
        is_paid_core: r.is_paid_core === 'Sim',
        is_paid_extra: r.is_paid_extra === 'Sim',
        usar_no_calculo_v1: r.usar_no_calculo_v1 === 'Sim',
        obrigatoria: r['Obrigatória?'] === 'Sim',
        ordem_core: r.ordem_core === '' ? null : Number(r.ordem_core),
        response_type: rt,
        pergunta: r['Pergunta final'] || '',
        opcoes: isEscala4 ? parseEscala4(r['Opções / Escala'])
          : isMultipla ? parseLista(r['Opções / Escala'])
          : parseLista(r['Opções / Escala']),
        max_escolhas: isMultipla ? 3 : null,
        observacao: r.observacao_v1 || '',
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));

  const header =
`// =====================================================================
// GERADO AUTOMATICAMENTE — NÃO EDITAR À MÃO.
// Fonte: data/identidade/banco_mvp_v1.xlsx (aba Banco_Completo_Anotado).
// Regenerar: node scripts/build-identidade-catalog.cjs
// Total de perguntas: ${catalogo.length}
// =====================================================================

/** @typedef {Object} PerguntaIdentidade */
export const CATALOGO_IDENTIDADE = ${JSON.stringify(catalogo, null, 2)};
`;
  fs.writeFileSync(OUT, header, 'utf8');

  // sanidade
  const dup = catalogo.map((q) => q.id).filter((id, i, a) => a.indexOf(id) !== i);
  if (dup.length) throw new Error('IDs duplicados no catálogo: ' + [...new Set(dup)].join(', '));
  const matSemCanon = catalogo.filter((q) => q.score_family === 'maturity' && !q.indicador_canonico);
  if (matSemCanon.length) throw new Error('maturity sem indicador_canonico: ' + matSemCanon.map((q) => q.id).join(', '));

  console.log(`OK → ${OUT.replace(/\\/g, '/').split('/').slice(-3).join('/')} (${catalogo.length} perguntas)`);
}
build();
