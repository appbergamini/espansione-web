# @espansione/agents

Fase 2 enxuta: uma agencia de marketing orientada pela Brand Memory da fase 1.

Este pacote nao chama modelo, nao cria worker e nao mantem state machine. Ele transforma o `EspansioneDiagnostic` emitido pelo Agente 16 em briefings/prompt packs para cinco papeis:

- Atendimento Estrategico
- Copywriter
- Direcao Visual
- Editor de Coerencia
- Aprovador de Marca

Uso direto com a saida da fase 1:

```ts
import { buildAgencyRun } from '@espansione/agents';

const run = buildAgencyRun(diagnostic, {
  objective: 'Lancar campanha de awareness',
  deliverable: 'Post carrossel',
  channel: 'instagram',
  cta: 'Agendar conversa',
});
```

Uso acoplado a Brand Memory:

```ts
import { buildAgencyRunFromBrandMemory } from '@espansione/agents';

const run = await buildAgencyRunFromBrandMemory(supabase, brandId, {
  objective: 'Gerar campanha institucional',
  deliverable: 'Landing page',
  channel: 'site',
});
```
