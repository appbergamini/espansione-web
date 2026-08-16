// =====================================================================
// Build do catálogo do Teste de Competências Empreendedoras.
//
// Lê os dois ativos metodológicos e emite lib/competencias/catalog.generated.js:
//   data/competencias/itens_v1.xlsx   → competências, blocos, banco, âncoras
//   data/competencias/faixas_v5.xlsx  → as 48 faixas e a leitura por posição
//
// Fonte de verdade = os Excel. Reexecutar após editar:
//   node scripts/build-competencias.cjs
//
// AGNÓSTICO À CONTAGEM DE BLOCOS. Nada aqui presume 12 blocos ou 4 aparições
// por competência: o script deriva N_BLOCOS e K_APARICOES do que estiver na
// planilha e só exige que o desenho seja BALANCEADO. Trocar 12 por 15 blocos
// é regenerar daqui, sem tocar em código. (Decisão nº 1 do plano.)
// =====================================================================
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const DIR = path.join(__dirname, '..', 'data', 'competencias');
const SRC_ITENS = path.join(DIR, 'itens_v1.xlsx');
const SRC_FAIXAS = path.join(DIR, 'faixas_v5.xlsx');
const OUT = path.join(__dirname, '..', 'lib', 'competencias', 'catalog.generated.js');

// Versões gravadas em toda sessão, para que um relatório antigo continue
// explicável depois de uma recalibração. Bumpar ao trocar a planilha.
const CATALOGO_VERSAO = 'itens-v1';
const FAIXAS_VERSAO = 'faixas-v5';

const CAPACIDADES = ['Sustentar-se', 'Decidir', 'Traduzir Valor', 'Fazer Acontecer'];
const PILARES = ['determinacao', 'conexao', 'constancia', 'precisao'];
const ROTULO_PARA_PILAR = {
  'determinacao': 'determinacao',
  'conexao': 'conexao',
  'constancia': 'constancia',
  'precisao': 'precisao',
};

// ── helpers ──────────────────────────────────────────────────────────
const txt = (v) => String(v == null ? '' : v).trim();
const semAcento = (s) => txt(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function aba(wb, nome) {
  const s = wb.Sheets[nome];
  if (!s) throw new Error(`aba "${nome}" não encontrada em ${Object.keys(wb.Sheets).join(', ')}`);
  return XLSX.utils.sheet_to_json(s, { header: 1, defval: '' });
}

// Acha a linha de cabeçalho pela primeira célula esperada, em vez de fixar índice.
function linhaCabecalho(rows, primeiraCelula) {
  const alvo = semAcento(primeiraCelula);
  const i = rows.findIndex((r) => semAcento(r[0]) === alvo);
  if (i < 0) throw new Error(`cabeçalho começando por "${primeiraCelula}" não encontrado`);
  return i;
}

// Células de agrupamento vêm preenchidas só na primeira linha do grupo.
function arrastar(valor, anterior) {
  const v = txt(valor);
  return v || anterior;
}

// "a | b | c" ou quebra de linha — as planilhas usam os dois.
function partes(v, extraSep) {
  const sep = extraSep ? new RegExp(`[\\n|${extraSep}]`) : /[\n|]/;
  return String(v == null ? '' : v).split(sep).map((s) => s.trim()).filter(Boolean);
}

function inteiro(v, onde) {
  const n = Number(String(v).replace(',', '.'));
  if (!Number.isFinite(n)) throw new Error(`valor não numérico em ${onde}: "${v}"`);
  return Math.round(n);
}

// ── 1. banco de itens: define competências, chaves e capacidades ─────
function lerBanco(wb) {
  const rows = aba(wb, 'Banco de Itens');
  const h = linhaCabecalho(rows, 'Capacidade');
  const competencias = [];
  const porChave = new Map();
  const itens = [];
  let capacidade = '', nome = '', chave = '';

  for (const r of rows.slice(h + 1)) {
    capacidade = arrastar(r[0], capacidade);
    nome = arrastar(r[1], nome);
    chave = arrastar(r[2], chave);
    const afirmacao = txt(r[4]);
    if (!afirmacao) continue;
    if (!porChave.has(chave)) {
      const c = { chave, nome, capacidade };
      porChave.set(chave, c);
      competencias.push(c);
    }
    itens.push({ chave, n: inteiro(r[3], `banco/${chave}`), afirmacao, bloco: txt(r[5]) });
  }
  return { competencias, porChave, itens };
}

// ── 2. blocos de escolha forçada ─────────────────────────────────────
function lerBlocos(wb) {
  const rows = aba(wb, 'Blocos');
  const h = linhaCabecalho(rows, 'Bloco');
  const mapa = new Map();
  let bloco = '';
  for (const r of rows.slice(h + 1)) {
    bloco = arrastar(r[0], bloco);
    const opcao = txt(r[1]);
    const afirmacao = txt(r[2]);
    if (!opcao || !afirmacao) continue;
    if (!mapa.has(bloco)) mapa.set(bloco, { id: bloco, opcoes: [] });
    mapa.get(bloco).opcoes.push({
      opcao,
      afirmacao,
      capacidade: txt(r[3]),
      competencia: txt(r[4]),
    });
  }
  return [...mapa.values()];
}

// ── 3. âncoras de evidência ──────────────────────────────────────────
function lerAncoras(wb) {
  const rows = aba(wb, 'Ancoras de Evidencia');
  const h = linhaCabecalho(rows, 'ID');
  const out = [];
  for (const r of rows.slice(h + 1)) {
    const id = txt(r[0]);
    if (!/^EVI-\d+$/i.test(id)) continue;
    const opcoes = partes(r[2]);
    out.push({
      id: id.toUpperCase(),
      pergunta: txt(r[1]),
      // valor = índice, 0 a 4, da esquerda para a direita
      opcoes: opcoes.map((label, i) => ({ label, valor: i })),
      verifica: partes(r[3], '·').map((s) => s.trim()),
    });
  }
  return out;
}

// ── 4. itens ancorados (etapa 2) — hoje só os 2 gabaritos ────────────
function lerAncorados(wb) {
  const rows = aba(wb, 'Ramificacao');
  const h = linhaCabecalho(rows, 'Competência');
  const out = [];
  for (const r of rows.slice(h + 1)) {
    const chave = txt(r[0]);
    const situacao = txt(r[1]);
    if (!chave || !situacao) continue;
    const niveis = [1, 2, 3, 4].map((n) => ({ nivel: n, texto: txt(r[1 + n]) }));
    if (niveis.some((x) => !x.texto)) throw new Error(`ancorado de ${chave} sem os 4 níveis`);
    out.push({ id: `ANC-${chave}-${out.filter((x) => x.competencia === chave).length + 1}`, competencia: chave, situacao, niveis });
  }
  return out;
}

// ── 4b. rascunho dos ancorados que faltavam, com as regras aplicadas ─
const SRC_RASCUNHO = path.join(DIR, 'ancorados_rascunho_v1.json');
const MAX_PALAVRAS_SITUACAO = 15;
const MAX_PALAVRAS_OPCAO = 18;
const IRRELEVANTES = new Set(['e', 'de', 'do', 'da', 'sob', 'para', 'com', 'sua', 'seu']);

const contarPalavras = (s) => txt(s).split(/\s+/).filter(Boolean).length;

/** Palavras distintivas do nome da competência — nenhuma pode vazar nas opções. */
function palavrasProibidas(nome) {
  return semAcento(nome)
    .split(/[^a-z0-9]+/)
    .filter((p) => p.length >= 4 && !IRRELEVANTES.has(p));
}

function lerRascunho(porChave) {
  if (!fs.existsSync(SRC_RASCUNHO)) return [];
  const doc = JSON.parse(fs.readFileSync(SRC_RASCUNHO, 'utf8'));
  return (doc.itens || []).map((it) => {
    const c = porChave.get(it.competencia);
    if (!c) throw new Error(`rascunho: competência desconhecida "${it.competencia}"`);
    if (!Array.isArray(it.niveis) || it.niveis.length !== 4) {
      throw new Error(`rascunho/${it.competencia}: precisa de exatamente 4 níveis`);
    }
    return {
      competencia: it.competencia,
      situacao: txt(it.situacao),
      niveis: it.niveis.map((texto, i) => ({ nivel: i + 1, texto: txt(texto) })),
      rascunho: true,
      versao: doc.versao,
    };
  });
}

/**
 * REGRAS DE ESCRITA DA SPEC §5.5, verificadas em vez de conferidas no olho.
 * Vale para os itens do Excel e para os do rascunho igualmente.
 */
function validarAncorados(ancorados, porChave) {
  const problemas = [];
  for (const a of ancorados) {
    const nome = porChave.get(a.competencia).nome;
    const proibidas = palavrasProibidas(nome);
    const onde = `${a.competencia}/"${a.situacao.slice(0, 34)}…"`;

    if (contarPalavras(a.situacao) > MAX_PALAVRAS_SITUACAO) {
      problemas.push(`${onde}: situação com ${contarPalavras(a.situacao)} palavras (máx ${MAX_PALAVRAS_SITUACAO})`);
    }
    for (const n of a.niveis) {
      if (contarPalavras(n.texto) > MAX_PALAVRAS_OPCAO) {
        problemas.push(`${onde} nível ${n.nivel}: ${contarPalavras(n.texto)} palavras (máx ${MAX_PALAVRAS_OPCAO})`);
      }
      const corpo = semAcento(n.texto).split(/[^a-z0-9]+/);
      for (const p of proibidas) {
        if (corpo.includes(p)) problemas.push(`${onde} nível ${n.nivel}: contém "${p}", que nomeia a competência`);
      }
    }
    const textos = a.niveis.map((n) => semAcento(n.texto));
    if (new Set(textos).size !== 4) problemas.push(`${onde}: níveis repetidos`);
  }
  if (problemas.length) {
    throw new Error(`regras de escrita dos ancorados violadas:\n  - ${problemas.join('\n  - ')}`);
  }
}

// ── 5. as 48 faixas ──────────────────────────────────────────────────
function lerFaixas(wb, porNome) {
  const rows = aba(wb, 'Faixas');
  const h = linhaCabecalho(rows, 'Capacidade');
  const out = [];
  for (const r of rows.slice(h + 1)) {
    const nome = txt(r[1]);
    if (!nome) continue;
    const chave = porNome.get(semAcento(nome));
    if (!chave) continue; // linhas de nota de rodapé
    out.push({
      competencia: chave,
      faixas: {
        determinacao: { minimo: inteiro(r[2], `${chave}/det`), maximo: inteiro(r[3], `${chave}/det`) },
        conexao: { minimo: inteiro(r[4], `${chave}/con`), maximo: inteiro(r[5], `${chave}/con`) },
        constancia: { minimo: inteiro(r[6], `${chave}/cst`), maximo: inteiro(r[7], `${chave}/cst`) },
        precisao: { minimo: inteiro(r[8], `${chave}/prc`), maximo: inteiro(r[9], `${chave}/prc`) },
      },
      confianca: semAcento(r[12]).toUpperCase().replace('MEDIA', 'MEDIA'),
      observacao: txt(r[13]) || null,
    });
  }
  return out;
}

// ── 6. leitura por posição na faixa ──────────────────────────────────
function lerLeitura(wb, porNome) {
  const rows = aba(wb, 'Leitura por Competencia');
  const h = linhaCabecalho(rows, 'Competência');
  const out = [];
  for (const r of rows.slice(h + 1)) {
    const nome = txt(r[0]);
    if (!nome) continue;
    const chave = porNome.get(semAcento(nome));
    if (!chave) continue;
    const pilar = ROTULO_PARA_PILAR[semAcento(r[1])];
    if (!pilar) throw new Error(`pilar crítico desconhecido para ${chave}: "${r[1]}"`);
    out.push({
      competencia: chave,
      pilarCritico: pilar,
      abaixo: txt(r[2]),
      dentro: txt(r[3]),
      acima: txt(r[4]),
    });
  }
  return out;
}

// ── build ────────────────────────────────────────────────────────────
function build() {
  const wbItens = XLSX.readFile(SRC_ITENS);
  const wbFaixas = XLSX.readFile(SRC_FAIXAS);

  const { competencias, porChave, itens } = lerBanco(wbItens);
  const porNome = new Map(competencias.map((c) => [semAcento(c.nome), c.chave]));

  const blocos = lerBlocos(wbItens);
  const ancoras = lerAncoras(wbItens);

  // Gabaritos do Excel + rascunho dos que faltavam. Os IDs são reatribuídos
  // depois da junção para ficarem estáveis e sequenciais por competência.
  const ancorados = [...lerAncorados(wbItens), ...lerRascunho(porChave)];
  const seq = new Map();
  for (const a of ancorados) {
    const n = (seq.get(a.competencia) || 0) + 1;
    seq.set(a.competencia, n);
    a.id = `ANC-${a.competencia}-${n}`;
  }
  validarAncorados(ancorados, porChave);

  const faixas = lerFaixas(wbFaixas, porNome);
  const leitura = lerLeitura(wbFaixas, porNome);

  // ── sanidade: desenho balanceado, sem presumir contagem ────────────
  const N_BLOCOS = blocos.length;
  if (!N_BLOCOS) throw new Error('nenhum bloco lido');

  const aparicoes = new Map(competencias.map((c) => [c.chave, 0]));
  for (const b of blocos) {
    if (b.opcoes.length !== 4) throw new Error(`bloco ${b.id}: ${b.opcoes.length} opções, esperadas 4`);
    const caps = new Set(b.opcoes.map((o) => o.capacidade));
    if (caps.size !== 4) throw new Error(`bloco ${b.id}: repete capacidade`);
    const chaves = new Set(b.opcoes.map((o) => o.competencia));
    if (chaves.size !== 4) throw new Error(`bloco ${b.id}: repete competência`);
    for (const o of b.opcoes) {
      if (!aparicoes.has(o.competencia)) throw new Error(`bloco ${b.id}: competência desconhecida "${o.competencia}"`);
      aparicoes.set(o.competencia, aparicoes.get(o.competencia) + 1);
    }
  }
  const ks = [...new Set(aparicoes.values())];
  if (ks.length !== 1) {
    const detalhe = [...aparicoes.entries()].map(([k, v]) => `${k}=${v}`).join(', ');
    throw new Error(`desenho DESBALANCEADO — competências aparecem ${ks.join('/')} vezes: ${detalhe}`);
  }
  const K_APARICOES = ks[0];
  if (N_BLOCOS * 4 !== competencias.length * K_APARICOES) {
    throw new Error(`aritmética do desenho não fecha: ${N_BLOCOS}×4 ≠ ${competencias.length}×${K_APARICOES}`);
  }

  if (competencias.length !== 12) throw new Error(`esperadas 12 competências, obtidas ${competencias.length}`);
  for (const cap of CAPACIDADES) {
    const n = competencias.filter((c) => c.capacidade === cap).length;
    if (n !== 3) throw new Error(`capacidade ${cap}: ${n} competências, esperadas 3`);
  }
  if (itens.length !== competencias.length * K_APARICOES) {
    throw new Error(`banco tem ${itens.length} afirmações, esperadas ${competencias.length * K_APARICOES}`);
  }
  if (faixas.length !== 12) throw new Error(`esperadas 12 linhas de faixa, obtidas ${faixas.length}`);
  if (leitura.length !== 12) throw new Error(`esperadas 12 linhas de leitura, obtidas ${leitura.length}`);
  for (const f of faixas) {
    for (const p of PILARES) {
      const { minimo, maximo } = f.faixas[p];
      if (minimo >= maximo) throw new Error(`${f.competencia}/${p}: mínimo ${minimo} >= máximo ${maximo}`);
    }
    if (!['ALTA', 'MEDIA', 'BAIXA'].includes(f.confianca)) {
      throw new Error(`${f.competencia}: confiança inesperada "${f.confianca}"`);
    }
  }
  for (const a of ancoras) {
    if (a.opcoes.length !== 5) throw new Error(`${a.id}: ${a.opcoes.length} opções, esperadas 5 (0 a 4)`);
    for (const c of a.verifica) {
      if (!porChave.has(c)) throw new Error(`${a.id} verifica competência desconhecida "${c}"`);
    }
  }
  for (const a of ancorados) {
    if (!porChave.has(a.competencia)) throw new Error(`ancorado de competência desconhecida "${a.competencia}"`);
  }

  const cobertasPorAncora = new Set(ancoras.flatMap((a) => a.verifica));
  const semAncora = competencias.filter((c) => !cobertasPorAncora.has(c.chave)).map((c) => c.chave);

  const semAncoradosCompletos = competencias
    .filter((c) => ancorados.filter((a) => a.competencia === c.chave).length < 2)
    .map((c) => c.chave);
  const emRascunho = ancorados.filter((a) => a.rascunho).length;

  const header = `// =====================================================================
// GERADO AUTOMATICAMENTE — NÃO EDITAR À MÃO.
// Fonte: data/competencias/itens_v1.xlsx + data/competencias/faixas_v5.xlsx
// Regenerar: node scripts/build-competencias.cjs
//
// Desenho: ${N_BLOCOS} blocos · ${competencias.length} competências · ${K_APARICOES} aparições cada
// Score por competência varia de -${K_APARICOES} a +${K_APARICOES}; a soma dos 12 é sempre 0.
// Itens ancorados: ${ancorados.length} de ${competencias.length * 2} · ${emRascunho} ainda em RASCUNHO (não calibrados)
// =====================================================================

export const CATALOGO_VERSAO = ${JSON.stringify(CATALOGO_VERSAO)};
export const FAIXAS_VERSAO = ${JSON.stringify(FAIXAS_VERSAO)};

export const CAPACIDADES = ${JSON.stringify(CAPACIDADES, null, 2)};
export const PILARES = ${JSON.stringify(PILARES, null, 2)};

export const N_BLOCOS = ${N_BLOCOS};
export const K_APARICOES = ${K_APARICOES};

/** Competências sem cobertura de âncora de evidência — não têm verificação factual. */
export const SEM_ANCORA = ${JSON.stringify(semAncora, null, 2)};

export const COMPETENCIAS = ${JSON.stringify(competencias, null, 2)};

export const BLOCOS = ${JSON.stringify(blocos, null, 2)};

export const BANCO_ITENS = ${JSON.stringify(itens, null, 2)};

export const ANCORAS = ${JSON.stringify(ancoras, null, 2)};

/** Competências que ainda não têm os 2 itens ancorados. Vazio = etapa 2 completa. */
export const SEM_ANCORADOS_COMPLETOS = ${JSON.stringify(semAncoradosCompletos, null, 2)};

/**
 * Quantos itens ancorados ainda são RASCUNHO — escritos seguindo as regras,
 * mas sem calibração de piloto. Enquanto for > 0, o relatório não deve
 * afirmar nível como se fosse validado.
 */
export const ANCORADOS_EM_RASCUNHO = ${emRascunho};

export const ANCORADOS = ${JSON.stringify(ancorados, null, 2)};

export const FAIXAS = ${JSON.stringify(faixas, null, 2)};

export const LEITURA_FAIXA = ${JSON.stringify(leitura, null, 2)};
`;

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, header, 'utf8');

  console.log(
    `OK → lib/competencias/catalog.generated.js\n` +
    `   ${N_BLOCOS} blocos · ${competencias.length} competências × ${K_APARICOES} aparições · ${itens.length} afirmações\n` +
    `   ${ancoras.length} âncoras (não cobrem: ${semAncora.join(', ') || '—'})\n` +
    `   ${faixas.length} linhas de faixa · ${leitura.length} de leitura\n` +
    `   ${ancorados.length}/${competencias.length * 2} ancorados · ${emRascunho} em RASCUNHO · faltam: ${semAncoradosCompletos.join(', ') || '—'}`
  );
}
build();
