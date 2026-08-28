import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOGO_IDENTIDADE } from '../catalog.generated.js';
import {
  respostasIntakeDe,
  montarFormularios,
  normalizarValor,
  valorDaResposta,
  lacunasDaEsteira,
  TIPO_PARA_PUBLICO,
} from '../paraIntake.js';

const idDaChave = (chave) =>
  CATALOGO_IDENTIDADE.find((q) => q.chave_intake === chave)?.id;

const perguntaDaChave = (chave) =>
  CATALOGO_IDENTIDADE.find((q) => q.chave_intake === chave);

test('valorDaResposta respeita a precedência json → num → text', () => {
  assert.deepEqual(valorDaResposta({ value_json: ['a'], value_num: 3, value_text: 'x' }), ['a']);
  assert.equal(valorDaResposta({ value_json: null, value_num: 3, value_text: 'x' }), 3);
  assert.equal(valorDaResposta({ value_json: null, value_num: null, value_text: 'x' }), 'x');
  assert.equal(valorDaResposta({ value_json: null, value_num: null, value_text: null }), null);
  // 0 é resposta, não ausência — a escala de concordância começa em 0.
  assert.equal(valorDaResposta({ value_json: null, value_num: 0, value_text: null }), 0);
});

test('chave de lista chega ao agente como array', () => {
  const respostas = {
    [idDaChave('p7_decisores')]: ['Dono / sócio', 'Diretor comercial'],
    [idDaChave('p7_clientes_desejados')]: ['Indústria média', '', 'Varejo regional'],
  };
  const out = respostasIntakeDe('socios', respostas);
  assert.deepEqual(out.p7_decisores, ['Dono / sócio', 'Diretor comercial']);
  // entradas em branco da lista de 3 campos somem
  assert.deepEqual(out.p7_clientes_desejados, ['Indústria média', 'Varejo regional']);
});

test('seleção única com código entrega o CÓDIGO, não o rótulo', () => {
  // O Agente 13 lê 'ate_50k' para traduzir em valor absoluto de budget.
  // Entregar "Até R$ 50 mil/ano" quebraria essa leitura sem dar erro.
  const q = perguntaDaChave('p5_orcamento_comunicacao_faixa');
  assert.equal(normalizarValor(q, 'Até R$ 50 mil/ano'), 'ate_50k');
  assert.equal(normalizarValor(q, 'Acima de R$ 5 milhões/ano'), 'acima_5m');
});

test('resposta em branco não vira chave — ausência é diferente de vazio', () => {
  const out = respostasIntakeDe('socios', {
    [idDaChave('p5_canais_ativos_hoje')]: '   ',
    [idDaChave('p7_decisores')]: [],
    [idDaChave('p7_clientes_evitar')]: ['', '', ''],
  });
  assert.deepEqual(Object.keys(out), []);
});

test('pergunta sem chave_intake não vaza para o respostas_json', () => {
  const escala = CATALOGO_IDENTIDADE.find(
    (q) => q.publico === 'socios' && q.score_family === 'maturity',
  );
  const out = respostasIntakeDe('socios', { [escala.id]: 2 });
  assert.deepEqual(out, {}, 'nota de maturidade não pertence ao formato do intake');
});

test('o nome é espelhado em _respondente_nome — é lá que o Agente 15 procura', () => {
  const out = respostasIntakeDe('socios', {
    [idDaChave('p1_nome_completo')]: 'Vanessa Bergamini',
  });
  assert.equal(out.p1_nome_completo, 'Vanessa Bergamini');
  assert.equal(out._respondente_nome, 'Vanessa Bergamini');
});

test('montarFormularios devolve linhas no formato de `formularios`', () => {
  const linhas = montarFormularios({
    projetoId: 'proj-1',
    tipo: 'intake_socios',
    respondentes: [
      { id: 'r1', created_at: '2026-08-01T10:00:00Z', completed_at: '2026-08-01T11:00:00Z' },
      { id: 'r2', created_at: '2026-08-02T10:00:00Z', completed_at: null },
    ],
    answers: [
      { respondent_id: 'r1', question_id: idDaChave('p1_nome_completo'), value_text: 'Ana Paula', value_num: null, value_json: null },
      { respondent_id: 'r1', question_id: idDaChave('p2_diferenciais'), value_text: 'Método próprio', value_num: null, value_json: null },
      { respondent_id: 'r2', question_id: idDaChave('p2_diferenciais'), value_text: 'Prazo curto', value_num: null, value_json: null },
    ],
  });

  assert.equal(linhas.length, 2);
  const [a, b] = linhas;
  assert.equal(a.tipo, 'intake_socios');
  assert.equal(a.projeto_id, 'proj-1');
  assert.equal(a.respondente, 'Ana Paula');
  assert.equal(a.respostas_json.p2_diferenciais, 'Método próprio');
  assert.equal(a.created_at, '2026-08-01T11:00:00Z', 'usa completed_at quando existe');
  assert.equal(a._origem, 'identidade_final');
  // sem nome (respondente anônimo do funil) → ordinal
  assert.equal(b.respondente, 'Sócio 2');
  assert.equal(b.created_at, '2026-08-02T10:00:00Z', 'cai em created_at quando não concluiu');
});

test('respondente que não respondeu nada não vira linha', () => {
  const linhas = montarFormularios({
    projetoId: 'p',
    tipo: 'intake_socios',
    respondentes: [{ id: 'r1', created_at: 'x' }],
    answers: [],
  });
  assert.deepEqual(linhas, []);
});

test('tipo que não é intake não produz nada', () => {
  // entrevista_socios, posicionamento_estrategico etc. continuam vindo
  // só da tabela `formularios` — o FINAL não tem equivalente.
  assert.deepEqual(
    montarFormularios({ projetoId: 'p', tipo: 'entrevista_socios', respondentes: [{ id: 'r' }], answers: [] }),
    [],
  );
  assert.equal(TIPO_PARA_PUBLICO.posicionamento_estrategico, undefined);
});

test('lacunasDaEsteira aponta o que não tem origem', () => {
  const faltando = lacunasDaEsteira('socios', ['p2_diferenciais', 'p6_inventada']);
  assert.deepEqual(faltando, ['p6_inventada']);
});

test('as 35 chaves da esteira não têm lacuna para sócios', () => {
  // Espelha o inventário levantado de lib/agents/*.js. Se um agente passar
  // a ler chave nova e ninguém acrescentar ao catálogo, este teste avisa
  // — em vez de o campo virar "(em branco)" no prompt sem ninguém notar.
  const DA_ESTEIRA = [
    'p1_nome_completo', '_respondente_email',
    'p2_oferta_cliente', 'p2_diferenciais', 'p2_personalidade_marca', 'p2_marca_admirada',
    'p2_concorrentes_analise', 'p2_concorrentes_tipos', 'p2_quando_vencemos', 'p2_quando_perdemos',
    'p2_motivos_ganho_opcoes', 'p2_motivos_perda_opcoes', 'p2_objecoes_frequentes', 'p2_objecoes_opcoes',
    'p3_concorrentes',
    'p5_visao_marca', 'p5_metas_12_meses', 'p5_mudaria_uma_coisa',
    'p5_canais_ativos_hoje', 'p5_canais_papel_principal', 'p5_equipe_comunicacao',
    'p5_orcamento_comunicacao_faixa', 'p5_orcamento_comunicacao_observacoes',
    'p5_objetivos_comunicacao_12m', 'p5_comunicacao_funciona', 'p5_comunicacao_nao_funciona',
    'p7_clientes_atuais_tipos', 'p7_clientes_desejados', 'p7_clientes_evitar', 'p7_decisores',
    'p7_influenciadores', 'p7_momento_busca', 'p7_perda_para_quem', 'p7_objecoes_pre_compra',
    'p7_objecoes_pre_compra_exemplo', 'p7_provas_confianca', 'p7_provas_existentes',
    'p7_provas_faltantes', 'p7_canais_origem', 'p7_mensagens_funcionam', 'p7_mensagens_desconfianca',
  ];
  assert.deepEqual(lacunasDaEsteira('socios', DA_ESTEIRA), []);
});
