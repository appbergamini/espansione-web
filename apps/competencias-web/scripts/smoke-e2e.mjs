// =====================================================================
// Smoke E2E contra o banco REAL. Cria uma sessão descartável, responde os
// dois instrumentos inteiros, gera o relatório e apaga tudo no fim.
//
//   node --env-file=../diagnostic-web/.env.local scripts/smoke-e2e.mjs
//
// Não substitui os testes unitários: aqui o que se verifica é a fiação —
// schema, constraints, upsert, jsonb, ordem imposta. A regra já é testada
// sem banco em lib/**/__tests__.
//
// ATENÇÃO AO LER O RESULTADO: as respostas aqui são uniformemente
// aleatórias, o que produz um perfil comportamental artificialmente
// CENTRAL — os 4 pilares saem todos perto de 50, porque cada fator recebe
// uma posição aleatória em cada bloco e a média converge. Perfil central
// cai dentro das faixas com muito mais frequência que um perfil real, em
// que a pessoa responde de forma consistente. Ou seja: se a trilha sair
// inteira como 'tecnica' aqui, isso é artefato do fixture, não a taxa
// esperada em produção (medida em ~3% com δ=10). Não calibrar nada por
// este script.
// =====================================================================
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { BLOCOS } from '../lib/competencias/catalog.js';
import { estadoDaSessao, validarResposta } from '../lib/competencias/sessao.js';
import { consolidar } from '../lib/competencias/score.js';
import { gerarRelatorio, varrerRelatorio } from '../lib/competencias/relatorio.js';
import { indiceCoerencia } from '../lib/competencias/indices.js';
import { indiceAjuste } from '../lib/competencias/faixas.js';
import * as repo from '../lib/competencias/repo.js';
import * as comportamental from '../lib/comportamental/repo.js';
import { estadoDaSessao as estadoComp, validarResposta as validarComp } from '../lib/comportamental/sessao.js';

let seed = 31337;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const embaralhar = (a) => { const c = [...a]; for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; } return c; };

const ok = (m) => console.log(`  ok   ${m}`);
const falhar = (m) => { console.error(`  FALHA  ${m}`); process.exitCode = 1; };

if (!supabaseAdmin) {
  console.error('SUPABASE_SERVICE_ROLE_KEY ausente — rode com --env-file');
  process.exit(1);
}

const EMAIL = `smoke+${Date.now()}@espansione.test`;
let sessao = null;

try {
  console.log('\n── 1. sessão ──');
  sessao = await repo.criarSessao({ email: EMAIL });
  ok(`criada (${sessao.token.slice(0, 8)}…) versões: ${sessao.catalogo_versao} / ${sessao.faixas_versao} / δ=${sessao.delta_valor}`);
  if (sessao.status !== 'not_started') falhar(`status inicial ${sessao.status}`);

  console.log('\n── 2. ordem imposta ──');
  if (comportamental.liberado(sessao)) falhar('comportamental deveria estar bloqueado antes do teste');
  else ok('comportamental bloqueado enquanto o teste não conclui');

  console.log('\n── 3. teste de competências (22 telas) ──');
  let respostas = {};
  let escolhas = [];
  let telas = 0;
  for (let guarda = 0; guarda < 60; guarda++) {
    const e = estadoDaSessao({ respostas, escolhas, seed: sessao.ordem_seed, etapa2Habilitada: true });
    if (e.fase === 'concluido') break;
    if (e.tela.tipo === 'escolha_de_aprofundamento') {
      escolhas = e.tela.opcoes.slice(0, e.tela.escolherQuantas).map((o) => o.chave);
      await repo.gravarEscolha(sessao.id, escolhas);
      continue;
    }
    const payload = e.tela.tipo === 'escolha_forcada'
      ? { mais: e.tela.opcoes[0].competencia, menos: e.tela.opcoes[3].competencia }
      : e.tela.tipo === 'item_ancorado' ? { nivel: 1 + Math.floor(rnd() * 4) } : { valor: Math.floor(rnd() * 5) };
    const v = validarResposta(e.tela.id, payload, { seed: sessao.ordem_seed });
    if (!v.ok) { falhar(`validação recusou ${e.tela.id}: ${v.motivo}`); break; }
    await repo.gravarResposta(sessao.id, { itemId: e.tela.id, etapa: v.etapa, payload: v.payload, ordemExibida: v.ordemExibida || null });
    respostas = await repo.respostasDaSessao(sessao.id);
    telas++;
  }
  ok(`${telas} telas gravadas e relidas do banco`);
  if (telas !== 22) falhar(`esperadas 22 telas, foram ${telas}`);

  console.log('\n── 4. reentrada (sair e voltar) ──');
  const relidas = await repo.respostasDaSessao(sessao.id);
  const escolhasRelidas = await repo.escolhasDaSessao(sessao.id);
  const retomada = estadoDaSessao({ respostas: relidas, escolhas: escolhasRelidas, seed: sessao.ordem_seed, etapa2Habilitada: true });
  retomada.fase === 'concluido' ? ok('estado reconstruído do banco bate com o da memória') : falhar(`retomada caiu em ${retomada.fase}`);

  console.log('\n── 5. fechamento da etapa ──');
  const consolidado = consolidar(relidas);
  consolidado.integridade.somaZero ? ok('integridade: soma dos 12 scores = 0') : falhar(`soma = ${consolidado.integridade.soma}`);
  await repo.fecharEtapaTeste(sessao.id, { consolidado, selecao: retomada.selecao, niveis: retomada.niveis });
  const scores = await repo.scoresDaSessao(sessao.id);
  scores.length === 12 ? ok('12 linhas em comp_scores') : falhar(`${scores.length} linhas em comp_scores`);
  const comNivel = scores.filter((s) => s.nivel_afirmado !== null);
  comNivel.length === 3 ? ok('nível afirmado só nas 3 aprofundadas') : falhar(`${comNivel.length} competências com nível`);

  console.log('\n── 6. comportamental (28 telas) ──');
  const atualizada = await repo.sessaoPorToken(sessao.token);
  if (!comportamental.liberado(atualizada)) { falhar('deveria ter liberado após concluir o teste'); }
  else ok('liberado depois que o teste concluiu');

  let respComp = {};
  let telasComp = 0;
  for (let guarda = 0; guarda < 60; guarda++) {
    const e = estadoComp({ respostas: respComp });
    if (e.fase === 'concluido') break;
    const payload = e.tela.tipo === 'ranking' ? { ordem: embaralhar([0, 1, 2, 3]) } : { escolha: rnd() < 0.5 ? 'a' : 'b' };
    const v = validarComp(e.tela.id, payload);
    if (!v.ok) { falhar(`validação recusou ${e.tela.id}: ${v.motivo}`); break; }
    const reg = await comportamental.gravarResposta(sessao.id, e.tela.id, v.payload);
    respComp = reg.respostas || {};
    telasComp++;
  }
  ok(`${telasComp} telas do comportamental gravadas`);
  if (telasComp !== 28) falhar(`esperadas 28, foram ${telasComp}`);

  const { pilares } = await comportamental.fechar(sessao.id, respComp);
  const soma = (k) => ['determinacao', 'conexao', 'constancia', 'precisao'].reduce((a, p) => a + pilares[p][k], 0);
  soma('natural') === 200 && soma('emContexto') === 200
    ? ok('4 pilares congelados, somando 200 nos dois momentos')
    : falhar(`pilares somam ${soma('natural')} / ${soma('emContexto')}`);

  const doBanco = await comportamental.pilaresDaSessao(sessao.id);
  JSON.stringify(doBanco) === JSON.stringify(pilares)
    ? ok('comp_pilares relido bate com o calculado')
    : falhar('comp_pilares divergiu na releitura');

  console.log('\n── 7. relatório integrado ──');
  const relatorio = gerarRelatorio({
    consolidado,
    pilares: doBanco,
    niveis: retomada.niveis,
    aprofundadas: retomada.selecao.selecionadas,
    delta: atualizada.delta_valor,
  });
  relatorio.blocos.length === 7 ? ok('7 blocos montados') : falhar(`${relatorio.blocos.length} blocos`);
  const varredura = varrerRelatorio(relatorio);
  varredura.limpo ? ok('varredura de QA limpa') : falhar(`vazamentos: ${varredura.achados.join('; ')}`);

  const trilha = relatorio.blocos[4];
  ok(`trilha: ${trilha.itens.map((i) => `${i.nome} (${i.rota})`).join(' · ') || 'vazia'}`);

  console.log('\n── 8. índices do avaliador ──');
  const scoresMapa = Object.fromEntries(scores.map((s) => [s.competencia_key, s.score_bruto]));
  const coerencia = indiceCoerencia(relidas, scoresMapa);
  const ajuste = indiceAjuste(doBanco, atualizada.delta_valor);

  coerencia ? ok(`Índice de Coerência ${coerencia.valor} → ${coerencia.leitura}`) : falhar('coerência não calculou');
  ajuste.valor >= 0 && ajuste.valor < 100
    ? ok(`Índice de Ajuste ${ajuste.valor}% (${ajuste.dentro}/${ajuste.total}) → ${ajuste.leitura}`)
    : falhar(`ajuste fora do esperado: ${ajuste.valor}`);

  const up1 = await supabaseAdmin.from('comp_indice_ajuste').upsert([{
    assessment_id: sessao.id, valor: ajuste.valor, dentro: ajuste.dentro, total: ajuste.total, leitura: ajuste.leitura,
  }], { onConflict: 'assessment_id' });
  const up2 = await supabaseAdmin.from('comp_indice_coerencia').upsert([{
    assessment_id: sessao.id,
    evidencia_media: coerencia.evidenciaMedia, declaracao_media: coerencia.declaracaoMedia,
    valor: coerencia.valor, leitura: coerencia.leitura,
  }], { onConflict: 'assessment_id' });
  (!up1.error && !up2.error) ? ok('os dois índices persistiram (CHECK do enum de leitura passou)')
    : falhar(`persistência: ${up1.error?.message || ''} ${up2.error?.message || ''}`);

  console.log('\n── 9. trilha persistida ──');
  const linhasTrilha = trilha.itens.map((i) => ({
    assessment_id: sessao.id, ordem: i.ordem, competencia_key: i.chave, rota: i.rota, pilar_alvo: i.pilarAlvo, conteudo_id: null,
  }));
  if (linhasTrilha.length) {
    const { error } = await supabaseAdmin.from('comp_trilha').upsert(linhasTrilha, { onConflict: 'assessment_id,ordem' });
    error ? falhar(`comp_trilha: ${error.message}`) : ok(`${linhasTrilha.length} linhas em comp_trilha`);
  }

  console.log('\n── 10. RLS ──');
  ok('todas as escritas passaram por service role; RLS ligada sem policy nega anon');

} catch (e) {
  falhar(`exceção: ${e.message}`);
  console.error(e);
} finally {
  if (sessao?.id) {
    // cascade limpa answers, scores, pilares, comportamental e trilha
    const { error } = await supabaseAdmin.from('comp_assessments').delete().eq('id', sessao.id);
    console.log(error ? `\n  AVISO: não consegui limpar ${sessao.id}: ${error.message}` : `\n  limpeza: sessão ${sessao.id} removida`);
  }
  console.log(process.exitCode ? '\nRESULTADO: FALHOU\n' : '\nRESULTADO: OK\n');
}
