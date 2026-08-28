import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOGO_IDENTIDADE } from '../catalog.generated.js';
import { montarFormulario } from '../forms.js';

// =====================================================================
// Módulo de consultoria — perguntas que só o cliente de consultoria vê.
//
// O que estes testes protegem, em ordem de gravidade:
//   1. O módulo NÃO vazar para quem comprou pelo funil.
//   2. As chaves que a esteira lê por nome continuarem cobertas. Uma chave
//      renomeada não gera erro em lugar nenhum — o agente recebe
//      "(em branco)" e escreve o plano sem ela. Só um teste pega isso.
// =====================================================================

const doModulo = CATALOGO_IDENTIDADE.filter((q) => q.perfil === 'consultoria');
const doInstrumento = CATALOGO_IDENTIDADE.filter((q) => q.perfil !== 'consultoria');

test('o módulo não vaza para o funil', () => {
  for (const publico of ['socios', 'colaboradores', 'clientes']) {
    const funil = montarFormulario(publico);
    const vazou = funil.filter((q) => q.perfil === 'consultoria');
    assert.deepEqual(vazou, [], `${publico}: módulo apareceu no formulário do funil`);
  }
});

test('o funil continua com o instrumento intacto — 41/33/32', () => {
  assert.equal(montarFormulario('socios').length, 41);
  assert.equal(montarFormulario('colaboradores').length, 33);
  assert.equal(montarFormulario('clientes').length, 32);
});

test('perfil=consultoria acrescenta o módulo, sem tirar nada do instrumento', () => {
  for (const publico of ['socios', 'colaboradores', 'clientes']) {
    const funil = montarFormulario(publico);
    const consultoria = montarFormulario(publico, { perfil: 'consultoria' });
    const extras = consultoria.length - funil.length;
    assert.equal(extras, doModulo.filter((q) => q.publico === publico).length);
    // superconjunto: toda pergunta do funil continua lá, na mesma ordem
    const ids = new Set(consultoria.map((q) => q.id));
    for (const q of funil) assert.ok(ids.has(q.id), `${q.id} sumiu no perfil consultoria`);
  }
});

test('o núcleo de 24 indicadores não foi afetado pelo módulo', () => {
  for (const publico of ['socios', 'colaboradores', 'clientes']) {
    const nucleo = montarFormulario(publico, { perfil: 'consultoria' })
      .filter((q) => q.score_family === 'maturity');
    assert.equal(nucleo.length, 24, `${publico}: núcleo deixou de ter 24`);
  }
});

test('toda pergunta do módulo declara a chave que alimenta', () => {
  assert.ok(doModulo.length > 0, 'módulo vazio — o merge do builder parou de rodar');
  const sem = doModulo.filter((q) => !q.chave_intake);
  assert.deepEqual(sem.map((q) => q.id), []);
});

test('nenhuma chave_intake é disputada por duas perguntas', () => {
  // Duas perguntas com a mesma chave = uma sobrescreve a outra no
  // respostas_json, e o agente lê a que chegou por último.
  const chaves = CATALOGO_IDENTIDADE.map((q) => q.chave_intake).filter(Boolean);
  assert.equal(new Set(chaves).size, chaves.length);
});

// ── O contrato com os agentes ────────────────────────────────────────
// Cada chave abaixo é lida POR NOME por um agente. A lista foi levantada
// de lib/agents/*.js; ao acrescentar leitura nova lá, acrescente aqui.

const CHAVES_DO_AGENTE_13 = [
  'p5_canais_ativos_hoje',
  'p5_canais_papel_principal',
  'p5_equipe_comunicacao',
  'p5_orcamento_comunicacao_faixa',
  'p5_orcamento_comunicacao_observacoes',
  'p5_objetivos_comunicacao_12m',
  'p5_comunicacao_funciona',
  'p5_comunicacao_nao_funciona',
];

// leanClusters.js (insumo do Agente 13) e Agente 5.
const CHAVES_COMERCIAIS = [
  'p2_personalidade_marca',
  'p2_diferenciais',
  'p2_motivos_ganho_opcoes',
  'p2_quando_vencemos',
  'p2_motivos_perda_opcoes',
  'p2_quando_perdemos',
  'p2_objecoes_opcoes',
  'p2_objecoes_frequentes',
  'p2_concorrentes_tipos',
  'p2_concorrentes_analise',
  'p2_oferta_cliente',
  'p2_marca_admirada',
];

const CHAVES_ICP = [
  'p7_clientes_atuais_tipos',
  'p7_clientes_desejados',
  'p7_clientes_evitar',
  'p7_decisores',
  'p7_influenciadores',
  'p7_momento_busca',
  'p7_perda_para_quem',
  'p7_objecoes_pre_compra',
  'p7_objecoes_pre_compra_exemplo',
  'p7_provas_confianca',
  'p7_provas_existentes',
  'p7_provas_faltantes',
  'p7_canais_origem',
  'p7_mensagens_funcionam',
  'p7_mensagens_desconfianca',
];

// Estas o agente lê com fmtLista/fmtMultiselect, que devolvem "(em branco)"
// para qualquer coisa que não seja Array. Entregar string aqui é uma falha
// silenciosa: o campo foi respondido e o agente não vê.
const CHAVES_QUE_PRECISAM_SER_ARRAY = [
  'p7_clientes_desejados',
  'p7_clientes_evitar',
  'p2_motivos_ganho_opcoes',
  'p2_motivos_perda_opcoes',
  'p2_objecoes_opcoes',
  'p2_concorrentes_tipos',
  'p7_decisores',
  'p7_momento_busca',
  'p7_perda_para_quem',
  'p7_objecoes_pre_compra',
  'p7_provas_confianca',
  'p7_canais_origem',
];

const TIPOS_QUE_PRODUZEM_ARRAY = new Set([
  'multipla', 'multipla_ate3', 'ranking_top3', 'aberta_curta_multipla', 'aberta_estruturada_3',
]);

test('o Agente 13 tem todas as 8 chaves de comunicação cobertas', () => {
  const cobertas = new Set(CATALOGO_IDENTIDADE.map((q) => q.chave_intake).filter(Boolean));
  const faltando = CHAVES_DO_AGENTE_13.filter((k) => !cobertas.has(k));
  assert.deepEqual(faltando, [], 'Agente 13 ficaria sem calibragem de canais/budget');
});

test('o bloco comercial está coberto — Agente 5 e clusters', () => {
  const cobertas = new Set(CATALOGO_IDENTIDADE.map((q) => q.chave_intake).filter(Boolean));
  const faltando = CHAVES_COMERCIAIS.filter((k) => !cobertas.has(k));
  assert.deepEqual(faltando, []);
});

test('o bloco de ICP e provas está coberto — leanClusters', () => {
  const cobertas = new Set(CATALOGO_IDENTIDADE.map((q) => q.chave_intake).filter(Boolean));
  const faltando = CHAVES_ICP.filter((k) => !cobertas.has(k));
  assert.deepEqual(faltando, []);
});

test('chave que o agente lê como lista vem de pergunta que produz array', () => {
  const porChave = Object.fromEntries(
    CATALOGO_IDENTIDADE.filter((q) => q.chave_intake).map((q) => [q.chave_intake, q]),
  );
  for (const chave of CHAVES_QUE_PRECISAM_SER_ARRAY) {
    const q = porChave[chave];
    assert.ok(q, `${chave} não está mapeada`);
    assert.ok(
      TIPOS_QUE_PRODUZEM_ARRAY.has(q.response_type),
      `${chave} veio de ${q.id} (${q.response_type}), que devolve string — o agente leria "(em branco)"`,
    );
  }
});

test('lista de até 3 itens livres usa aberta_curta_multipla', () => {
  // Guarda de regressão do builder: a ordem dos testes em responseType()
  // fazia /múltipla/ capturar "Aberta curta múltipla" e devolver 'multipla',
  // deixando o tipo inalcançável. Se voltar a acontecer, cai aqui.
  const desejados = CATALOGO_IDENTIDADE.find((q) => q.chave_intake === 'p7_clientes_desejados');
  assert.equal(desejados.response_type, 'aberta_curta_multipla');
});

test('toda pergunta de lista tem opções para escolher', () => {
  const semOpcoes = CATALOGO_IDENTIDADE
    .filter((q) => q.perfil === 'consultoria')
    .filter((q) => ['multipla', 'multipla_ate3', 'selecao_unica'].includes(q.response_type))
    .filter((q) => q.opcoes.length === 0);
  assert.deepEqual(semOpcoes.map((q) => q.id), []);
});

test('a identificação nominal existe — é ela que permite parear com o Mapeamento Comportamental', () => {
  const cobertas = new Set(CATALOGO_IDENTIDADE.map((q) => q.chave_intake).filter(Boolean));
  // Agente 15 lê o nome do sócio-fundador; Agente 1 pareia CIS por nome/e-mail.
  assert.ok(cobertas.has('p1_nome_completo'), 'sócios sem nome: Agente 15 perde o destinatário da carta');
  assert.ok(cobertas.has('_respondente_email'), 'sócios sem e-mail: Agente 1 não pareia o CIS');
  assert.ok(cobertas.has('a1_nome'), 'colaboradores sem nome');
});

test('as perguntas do instrumento que já respondiam a uma chave continuam mapeadas', () => {
  const porChave = Object.fromEntries(
    doInstrumento.filter((q) => q.chave_intake).map((q) => [q.chave_intake, q.id]),
  );
  assert.equal(porChave.p2_oferta_cliente, 'AB-SD-NEG-01');
  assert.equal(porChave.p2_marca_admirada, 'AB-SD-NEG-03');
  assert.equal(porChave.p5_visao_marca, 'AB-SD-MAR-04');
  assert.equal(porChave.p3_concorrentes, 'V30-SD-ESP-01');
});

test('escala nunca alimenta chave que o agente lê como texto', () => {
  // O agente lê p2_diferenciais com fmtTexto e espera uma frase.
  // V30-SD-MAR-02 mede diferenciação numa escala de 4 pontos: mapear ali
  // entregaria "2" onde se espera um parágrafo — erro que não aparece como
  // erro. A regra vale para toda chave de texto, não só essa.
  const mar02 = CATALOGO_IDENTIDADE.find((q) => q.id === 'V30-SD-MAR-02');
  assert.equal(mar02.chave_intake, null, 'escala de diferenciação não pode virar chave de texto');

  const arrayEsperado = new Set(CHAVES_QUE_PRECISAM_SER_ARRAY);
  const deTexto = CATALOGO_IDENTIDADE
    .filter((q) => q.chave_intake && !arrayEsperado.has(q.chave_intake));
  const escalas = deTexto.filter((q) => q.response_type.startsWith('escala'));
  assert.deepEqual(
    escalas.map((q) => `${q.id} → ${q.chave_intake}`),
    [],
    'escala mapeada para chave lida como texto',
  );
});
