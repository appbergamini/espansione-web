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

test('o Agente 13 tem todas as 8 chaves de comunicação cobertas', () => {
  const cobertas = new Set(CATALOGO_IDENTIDADE.map((q) => q.chave_intake).filter(Boolean));
  const faltando = CHAVES_DO_AGENTE_13.filter((k) => !cobertas.has(k));
  assert.deepEqual(faltando, [], 'Agente 13 ficaria sem calibragem de canais/budget');
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

test('escala não é mapeada como se fosse texto', () => {
  // p2_diferenciais é lido como texto livre. V30-SD-MAR-02 mede
  // diferenciação numa escala de 4 pontos — mapear seria entregar "2" onde
  // o agente espera uma frase.
  const mar02 = CATALOGO_IDENTIDADE.find((q) => q.id === 'V30-SD-MAR-02');
  assert.equal(mar02.chave_intake, null);
  const cobertas = new Set(CATALOGO_IDENTIDADE.map((q) => q.chave_intake).filter(Boolean));
  assert.ok(!cobertas.has('p2_diferenciais'), 'p2_diferenciais só pode vir de pergunta aberta');
});
