// Runner headless da esteira: roda agentes via Pipeline.runAgent, aprovando
// checkpoints pendentes automaticamente. Usa jiti para resolver os imports
// sem extensão da lib (estilo Next). Service role vem do .env.local.
//
// Uso: RUN_PROJETO=<id> RUN_AGENTS=4,5,6 node --env-file=.env.local scripts/run-pipeline.cjs
const { createJiti } = require('jiti');
const jiti = createJiti(__filename);

const PROJETO = process.env.RUN_PROJETO;
const AGENTS = (process.env.RUN_AGENTS || '').split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !Number.isNaN(n));
const MODEL = process.env.RUN_MODEL || '';

(async () => {
  if (!PROJETO || !AGENTS.length) throw new Error('Defina RUN_PROJETO e RUN_AGENTS');
  const { Pipeline } = await jiti.import('../lib/ai/pipeline.js');
  const { db } = await jiti.import('../lib/db.js');

  const aprovarPendentes = async () => {
    const pend = await db.getPendingCheckpoints(PROJETO);
    for (const c of pend) {
      await db.updateCheckpoint(
        PROJETO,
        c.checkpoint_num,
        'aprovado',
        JSON.stringify({ decision: 'approved', structured_notes: {}, freeform_notes: 'auto-aprovado (run headless)' }),
      );
      console.log(`  ✓ checkpoint ${c.checkpoint_num} aprovado`);
    }
  };

  console.log(`Projeto ${PROJETO} · agentes ${AGENTS.join(',')} · modelo ${MODEL || '(default)'}`);
  for (const n of AGENTS) {
    await aprovarPendentes();
    const t0 = Date.now();
    process.stdout.write(`▶ Agente ${n}... `);
    try {
      await Pipeline.runAgent(PROJETO, n, MODEL || undefined);
      console.log(`OK (${Math.round((Date.now() - t0) / 1000)}s)`);
    } catch (e) {
      console.log(`FALHOU: ${e.message}`);
      process.exit(1);
    }
  }
  await aprovarPendentes();
  console.log(`✅ Concluído: ${AGENTS.join(',')}`);
  process.exit(0);
})().catch((e) => { console.error('ERRO FATAL:', e.message); console.error((e.stack || '').split('\n').slice(0, 5).join('\n')); process.exit(1); });
