// lib/agents/catalog.js
//
// TASK FIX.3 — catálogo canônico dos 15 agentes do pipeline Espansione.
// FONTE ÚNICA para UI (painel admin, dashboard do cliente, entregável
// consolidado). Nomes batem com `AGENT_CONFIGS` de lib/ai/pipeline.js
// e com os `name` exportados por lib/agents/Agent_XX_*.js — espelho
// do código, não memória.
//
// Regras:
//   - Não hardcodar 13, 14 ou 15 em lugar nenhum da UI. Usar
//     TOTAL_AGENTES / TOTAL_AGENTES_NAO_MODULARES.
//   - Não duplicar este catálogo. Qualquer componente que precise
//     de metadados de agente importa daqui.
//   - Ao adicionar/remover agente: editar este arquivo + o registro
//     em AGENTS_MAP/AGENT_CONFIGS/pipeline, nada mais.

/**
 * @typedef {Object} AgenteMeta
 * @property {number}   agent_num
 * @property {string}   key                  Chave estável (snake_case)
 * @property {string}   nome_curto           Ex.: "Agente 2"
 * @property {string}   nome_exibicao        Nome editorial usado em UI
 * @property {string}   stage                Coincide com stage do pipeline
 * @property {boolean}  modular              Opcional no entregável
 * @property {number}   ordem_exibicao
 * @property {number[]} inputs               Agent_nums consumidos (FIX.4).
 *                                           ESPELHO de AGENT_CONFIGS em
 *                                           lib/ai/pipeline.js — se mudar
 *                                           um, mudar o outro. Diverge
 *                                           propositalmente do que a spec
 *                                           escrita escritura — código
 *                                           real venceu.
 * @property {number[]} [inputs_opcionais]   Subconjunto de `inputs` que
 *                                           pode faltar sem bloquear a
 *                                           execução (ex.: Agente 15 aceita
 *                                           rodar sem 14 quando não há EVP).
 * @property {number|null} [checkpoint]      Número do checkpoint criado
 *                                           pela execução deste agente.
 */

/** @type {AgenteMeta[]} */
export const CATALOGO_AGENTES = [
  {
    agent_num: 1,
    key: 'roteiros_vi',
    nome_curto: 'Agente 1',
    nome_exibicao: 'Roteiros VI — Entrevistas Internas',
    stage: 'pre_diagnostico',
    modular: false,
    ordem_exibicao: 1,
    inputs: [],
    checkpoint: null,
  },
  {
    agent_num: 2,
    key: 'consolidado_vi',
    nome_curto: 'Agente 2',
    nome_exibicao: 'Consolidado da Visão Interna (VI)',
    stage: 'diagnostico_interno',
    modular: false,
    ordem_exibicao: 2,
    inputs: [1],
    checkpoint: null,
  },
  {
    agent_num: 3,
    key: 'roteiros_ve',
    nome_curto: 'Agente 3',
    nome_exibicao: 'Roteiros VE — Entrevistas Cliente',
    stage: 'diagnostico_externo',
    modular: false,
    ordem_exibicao: 3,
    inputs: [2],
    checkpoint: null,
  },
  {
    agent_num: 4,
    key: 'consolidado_ve',
    nome_curto: 'Agente 4',
    nome_exibicao: 'Consolidado da Visão Externa (VE)',
    stage: 'diagnostico_externo',
    modular: false,
    ordem_exibicao: 4,
    inputs: [3],
    checkpoint: null,
  },
  {
    agent_num: 5,
    key: 'visao_mercado',
    nome_curto: 'Agente 5',
    nome_exibicao: 'Visão de Mercado (VM)',
    stage: 'diagnostico_externo',
    modular: false,
    ordem_exibicao: 5,
    inputs: [],
    checkpoint: null,
  },
  {
    agent_num: 6,
    key: 'decodificacao',
    nome_curto: 'Agente 6',
    nome_exibicao: 'Decodificação e Direcionamento Estratégico',
    stage: 'sintese',
    modular: false,
    ordem_exibicao: 6,
    inputs: [2, 4, 5],
    checkpoint: 1,
  },
  {
    agent_num: 7,
    key: 'valores_atributos',
    nome_curto: 'Agente 7',
    nome_exibicao: 'Valores e Atributos',
    stage: 'estrategia',
    modular: false,
    ordem_exibicao: 7,
    inputs: [6],
    checkpoint: null,
  },
  {
    agent_num: 8,
    key: 'diretrizes',
    nome_curto: 'Agente 8',
    nome_exibicao: 'Diretrizes Estratégicas',
    stage: 'estrategia',
    modular: false,
    ordem_exibicao: 8,
    inputs: [6, 7],
    checkpoint: null,
  },
  {
    agent_num: 9,
    key: 'plataforma_marca',
    nome_curto: 'Agente 9',
    nome_exibicao: 'Plataforma de Branding',
    stage: 'estrategia',
    modular: false,
    ordem_exibicao: 9,
    inputs: [6, 7, 8],
    checkpoint: 2,
  },
  {
    agent_num: 10,
    key: 'identidade_verbal',
    nome_curto: 'Agente 10',
    nome_exibicao: 'Identidade Verbal (UVV)',
    stage: 'visual_verbal',
    modular: false,
    ordem_exibicao: 10,
    inputs: [6, 9],
    checkpoint: null,
  },
  {
    agent_num: 11,
    key: 'one_page_visual',
    nome_curto: 'Agente 11',
    nome_exibicao: 'One Page de Personalidade (Visual)',
    stage: 'visual_verbal',
    modular: false,
    ordem_exibicao: 11,
    inputs: [6, 9, 10],
    checkpoint: 3,
  },
  {
    agent_num: 12,
    key: 'one_page_experiencia',
    nome_curto: 'Agente 12',
    nome_exibicao: 'One Page de Experiência',
    stage: 'cx',
    modular: false,
    ordem_exibicao: 12,
    inputs: [6, 9],
    checkpoint: null,
  },
  {
    agent_num: 13,
    key: 'comunicacao',
    nome_curto: 'Agente 13',
    nome_exibicao: 'Plano de Comunicação — A Marca Fala',
    stage: 'comunicacao',
    modular: false,
    ordem_exibicao: 13,
    inputs: [6, 7, 8, 9, 10, 11, 12],
    checkpoint: 4,
  },
  {
    agent_num: 14,
    key: 'evp',
    nome_curto: 'Agente 14',
    nome_exibicao: 'Plataforma de Marca Empregadora (EVP)',
    stage: 'marca_empregadora',
    modular: true,   // só roda se o projeto contratou escopo EVP
    ordem_exibicao: 14,
    inputs: [2, 6, 7, 9],
    checkpoint: null,
  },
  {
    agent_num: 15,
    key: 'editorial',
    nome_curto: 'Agente 15',
    nome_exibicao: 'Consolidador Editorial do Entregável Final',
    stage: 'encerramento',
    modular: false,
    ordem_exibicao: 15,
    // Consome resumos/conclusões de todos os agentes anteriores. 14 é
    // opcional porque projetos sem EVP não vão ter output 14 — o
    // editorial apenas ignora a seção.
    inputs: [2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    inputs_opcionais: [14],
    checkpoint: null,
  },
];

/** Quantidade total de agentes (15). */
export const TOTAL_AGENTES = CATALOGO_AGENTES.length;

/**
 * Quantidade de agentes NÃO-modulares (14). Serve como denominador
 * default de progresso quando não se sabe se o projeto contratou EVP.
 */
export const TOTAL_AGENTES_NAO_MODULARES =
  CATALOGO_AGENTES.filter(a => !a.modular).length;

/**
 * Busca metadados de um agente pelo número.
 * @param {number} num
 * @returns {AgenteMeta | null}
 */
export function getAgenteByNum(num) {
  return CATALOGO_AGENTES.find(a => a.agent_num === Number(num)) || null;
}

/**
 * Busca metadados pela key estável.
 * @param {string} key
 * @returns {AgenteMeta | null}
 */
export function getAgenteByKey(key) {
  return CATALOGO_AGENTES.find(a => a.key === key) || null;
}

/**
 * Calcula progresso do projeto a partir da lista de agent_num que já
 * geraram output. Agentes modulares entram no denominador apenas se
 * `incluiEvp=true`. Próximo agente é o primeiro esperado que ainda
 * não tem output — corrige o bug "maior output + 1" que pulava gaps.
 *
 * @param {number[]} agentNumsCompletos
 * @param {boolean}  [incluiEvp=false]
 * @returns {{ completos: number, total: number, pct: number, proximoAgente: AgenteMeta | null }}
 */
export function calcularProgresso(agentNumsCompletos = [], incluiEvp = false) {
  const completosSet = new Set(
    (agentNumsCompletos || []).map(n => Number(n)).filter(Number.isFinite),
  );

  const esperados = CATALOGO_AGENTES.filter(a => !a.modular || incluiEvp)
    .sort((a, b) => a.ordem_exibicao - b.ordem_exibicao);

  const total = esperados.length;
  const completos = esperados.filter(a => completosSet.has(a.agent_num)).length;
  const pct = total === 0 ? 0 : Math.round((completos / total) * 100);
  const proximoAgente = esperados.find(a => !completosSet.has(a.agent_num)) || null;

  return { completos, total, pct, proximoAgente };
}

/**
 * Formata rótulo de documento para a UI do dashboard do cliente.
 * `agent_num` já é o número canônico — NÃO adicionar +1 (o bug que
 * a FIX.3 corrige em dashboard/projetos/[id].js:285).
 *
 * @param {number} agentNum
 * @returns {string}
 */
export function formatarRotuloDocumento(agentNum) {
  const meta = getAgenteByNum(agentNum);
  const numeroFormatado = String(agentNum).padStart(2, '0');
  if (!meta) return `Documento nº ${numeroFormatado}`;
  return `Documento nº ${numeroFormatado} · ${meta.nome_exibicao}`;
}

/**
 * Formato curto usado em cabeçalhos de listas de outputs no painel
 * admin, que até então mostrava "02. Consolidado da Visão Interna (VI)".
 * Preserva o prefixo numérico zero-padded pra ordenação visual.
 *
 * @param {number} agentNum
 * @returns {string}
 */
export function formatarTituloAdmin(agentNum) {
  const meta = getAgenteByNum(agentNum);
  const numeroFormatado = String(agentNum).padStart(2, '0');
  if (!meta) return `${numeroFormatado}. Agente ${agentNum}`;
  return `${numeroFormatado}. ${meta.nome_exibicao}`;
}

// ─── Grafo de dependências (FIX.4) ─────────────────────────────────

/**
 * Retorna todos os agent_nums que dependem (direta OU transitivamente)
 * do agente informado. Usado para análise de cascata antes de apagar
 * um output.
 *
 * @param {number} agentNum
 * @returns {number[]}  ordenado ascendente
 */
export function getDependentes(agentNum) {
  const alvo = Number(agentNum);
  if (!Number.isFinite(alvo)) return [];

  const encontrados = new Set();
  const fila = [alvo];
  while (fila.length > 0) {
    const atual = fila.shift();
    for (const ag of CATALOGO_AGENTES) {
      if ((ag.inputs || []).includes(atual) && !encontrados.has(ag.agent_num)) {
        encontrados.add(ag.agent_num);
        fila.push(ag.agent_num);
      }
    }
  }
  return [...encontrados].sort((a, b) => a - b);
}

/**
 * Retorna o primeiro agent_num esperado que ainda não tem output —
 * detecta buracos na esteira (ex.: outputs [1, 2, 4, 5] → 3, não 6).
 * Agentes modulares só entram quando `incluiEvp=true`.
 *
 * @param {number[]} agentNumsPresentes
 * @param {boolean}  [incluiEvp=false]
 * @returns {number|null}
 */
export function getPrimeiroFaltante(agentNumsPresentes = [], incluiEvp = false) {
  const set = new Set(
    (agentNumsPresentes || []).map(n => Number(n)).filter(Number.isFinite),
  );
  const esperados = CATALOGO_AGENTES
    .filter(a => !a.modular || incluiEvp)
    .map(a => a.agent_num)
    .sort((a, b) => a - b);
  for (const n of esperados) {
    if (!set.has(n)) return n;
  }
  return null;
}

/**
 * Diz se um agente tem suas dependências obrigatórias satisfeitas no
 * estado atual. `inputs_opcionais` são descontadas — se estiverem
 * ausentes, tudo bem.
 *
 * @param {number}   agentNum
 * @param {number[]} agentNumsPresentes
 * @returns {{ ok: boolean, faltando: number[], motivo: string|null }}
 */
export function podeExecutar(agentNum, agentNumsPresentes = []) {
  const meta = getAgenteByNum(agentNum);
  if (!meta) {
    return { ok: false, faltando: [], motivo: `Agente ${agentNum} não existe no catálogo.` };
  }

  const set = new Set(
    (agentNumsPresentes || []).map(n => Number(n)).filter(Number.isFinite),
  );
  const opcionais = new Set(meta.inputs_opcionais || []);
  const obrigatorios = (meta.inputs || []).filter(i => !opcionais.has(i));
  const faltando = obrigatorios.filter(i => !set.has(i));

  return {
    ok: faltando.length === 0,
    faltando,
    motivo: faltando.length === 0
      ? null
      : `Agente ${agentNum} depende de output(s) ausente(s): ${faltando.join(', ')}.`,
  };
}
