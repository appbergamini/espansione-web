// =====================================================================
// Prévia da narrativa: gera um relatório de um perfil sintético e imprime
// o texto que o cliente leria. Não toca no banco.
//
// Existe para afinar o prompt sem fazer um teste inteiro nem gastar uma
// sessão real. Cada rodada custa alguns centavos.
//
//   node --env-file=../diagnostic-web/.env.local scripts/previa-narrativa.mjs
//   node --env-file=... scripts/previa-narrativa.mjs --perfil=tecnico
//   node --env-file=... scripts/previa-narrativa.mjs --brief   (só os fatos, sem chamar a API)
//
// Perfis: `desequilibrado` (padrão, pilar bem fora da faixa),
//         `coerente` (nada fora — testa o texto que não força achado),
//         `tecnico` (fragilidade sem explicação comportamental).
// =====================================================================
import { BLOCOS } from '../lib/competencias/catalog.js';
import { consolidar } from '../lib/competencias/score.js';
import { gerarRelatorio, varrerRelatorio } from '../lib/competencias/relatorio.js';
import { montarBrief } from '../lib/narrativa/brief.js';
import { gerarNarrativa } from '../lib/narrativa/gerar.js';
import { aplicarNarrativa } from '../lib/narrativa/aplicar.js';

const arg = (n, padrao) => process.argv.find((a) => a.startsWith(`--${n}=`))?.split('=')[1] ?? padrao;
const temFlag = (n) => process.argv.includes(`--${n}`);

const PERFIS = {
  // Soma 200 — é a normalização do instrumento comportamental.
  desequilibrado: [78, 34, 30, 58],
  coerente: [50, 50, 50, 50],
  tecnico: [52, 48, 51, 49],
};

let seed = Number(arg('seed', 20260816));
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

function respostas() {
  const out = {};
  for (const b of BLOCOS) {
    const i = Math.floor(rnd() * 4);
    let j = Math.floor(rnd() * 3);
    if (j >= i) j++;
    out[b.id] = { mais: b.opcoes[i].competencia, menos: b.opcoes[j].competencia };
  }
  return out;
}

const nomePerfil = arg('perfil', 'desequilibrado');
const [d, i, s, c] = PERFIS[nomePerfil] || PERFIS.desequilibrado;

const consolidado = consolidar(respostas());
const aprofundadas = consolidado.ranking.slice(-3).map((r) => r.chave);

const relatorio = gerarRelatorio({
  consolidado,
  pilares: {
    determinacao: { natural: d, emContexto: d + 8 },
    conexao: { natural: i, emContexto: i - 6 },
    constancia: { natural: s, emContexto: s },
    precisao: { natural: c, emContexto: c - 2 },
  },
  niveis: Object.fromEntries(aprofundadas.map((k, n) => [k, { nivel: n === 0 ? 2 : 3, confianca: 'afirmado' }])),
  aprofundadas,
});

const brief = montarBrief(relatorio);

if (temFlag('brief')) {
  console.log(JSON.stringify(brief, null, 2));
  process.exit(0);
}

console.error(`perfil ${nomePerfil} · seed ${arg('seed', 20260816)} · gerando…`);
const t0 = Date.now();
const { narrativa, modelo, uso } = await gerarNarrativa(brief);
const segundos = ((Date.now() - t0) / 1000).toFixed(1);

const final = aplicarNarrativa(relatorio, narrativa);
const varredura = varrerRelatorio(final);

// ── impressão ────────────────────────────────────────────────────────
const risco = (ch = '─') => console.log(ch.repeat(72));
const par = (t) => { if (t) console.log('\n' + quebrar(t)); };
const quebrar = (t, largura = 72) =>
  String(t).split('\n').map((linha) =>
    linha.split(' ').reduce((acc, w) => {
      const ultima = acc[acc.length - 1];
      if (!ultima || (ultima + ' ' + w).length > largura) acc.push(w);
      else acc[acc.length - 1] = ultima + ' ' + w;
      return acc;
    }, []).join('\n')
  ).join('\n');

risco('═');
par(final.abertura);

for (const b of final.blocos) {
  console.log('');
  risco();
  console.log(b.titulo.toUpperCase());
  risco();
  par(b.texto);
  par(b.introducao);

  if (b.id === 'onde_voce_esta') {
    for (const cap of b.capacidades) console.log(`  · ${cap.capacidade} — ${cap.posicao}`);
  }
  if (b.id === 'suas_competencias') {
    for (const cap of b.capacidades) {
      console.log(`\n  ${cap.capacidade}`);
      for (const x of cap.competencias) {
        const faixa = '█'.repeat(x.passo) + '░'.repeat(x.de - x.passo);
        console.log(`    ${faixa}  ${x.nome} — ${x.posicao}${x.nivelNome ? ` · ${x.nivelNome}` : ''}`);
      }
    }
  }
  if (b.padraoRecorrente) par('» ' + b.padraoRecorrente.texto);
  for (const l of b.leituras || []) {
    console.log(`\n  ▸ ${l.nome || l.pilar}${l.caracteristicas?.length ? `  [${l.caracteristicas.map((e) => e.caracteristica).join(' · ')}]` : ''}`);
    par(l.texto);
  }
  for (const it of b.itens || []) {
    console.log(`\n  ${it.ordem}. ${it.nome}  (${it.rota}${it.caracteristica ? ` · ${it.caracteristica}` : ''})`);
    par(it.texto || it.motivo);
  }
}

par(final.fechamento);
console.log('');
risco('═');

const palavras = JSON.stringify(narrativa).split(/\s+/).length;
const custo = ((uso.entrada / 1e6) * 5 + (uso.saida / 1e6) * 25);
console.log(`modelo ${modelo} · ${segundos}s · ~${palavras} palavras`);
console.log(`tokens ${uso.entrada} entrada / ${uso.saida} saída · ~US$ ${custo.toFixed(3)} por relatório`);
console.log(varredura.limpo ? 'varredura: limpa' : `VARREDURA REPROVOU: ${varredura.achados.join(' | ')}`);
if (!varredura.limpo) process.exitCode = 1;
