# Entrega tecnica - Fase 2 Agencia IA

Data: 2026-05-18

## Escopo entregue

A base inicial da Fase 2 foi acoplada ao `diagnostic-web` e a Brand Memory da Fase 1 foi mantida como fonte canonica.

O desenho implementado cobre:

- Tipos compartilhados da Agencia IA.
- BrandKernel operacional.
- Validacao de prontidao da marca para operar a Agencia.
- Persistencia de pedidos, runs e steps.
- APIs para criar, listar, buscar, atualizar, arquivar pedido, preparar briefing e rodar workflow mockado.
- UI inicial dentro da tela administrativa do projeto.
- Prompt packs puros para os agentes da Fase 2.
- Executor sequencial controlado com `MockModelGateway`.

Nao foi implementado:

- Worker real.
- Dashboard separado de agencia.
- Orquestrador agentico autonomo.
- Chamada direta a modelo dentro de `web/packages/agents`.
- Publicacao automatica.
- Aprendizado automatico na Brand Memory.

## Arquivos criados

- `docs/estrutura-e-fluxo-agentes.md`
- `docs/entrega-fase-2-agencia.md`
- `migrations/2026-05-18_agency_requests.sql`
- `migrations/2026-05-18_agency_runs_steps.sql`
- `apps/diagnostic-web/lib/agency/modelGateway.js`
- `apps/diagnostic-web/lib/agency/prepareRun.js`
- `apps/diagnostic-web/lib/agency/runtime.js`
- `apps/diagnostic-web/lib/agency/workflow.js`
- `apps/diagnostic-web/pages/adm/[id]/agency.js`
- `apps/diagnostic-web/pages/adm/[id]/agency/[requestId].js`
- `apps/diagnostic-web/pages/api/agency/readiness.js`
- `apps/diagnostic-web/pages/api/agency/requests/index.js`
- `apps/diagnostic-web/pages/api/agency/requests/[id].js`
- `apps/diagnostic-web/pages/api/agency/requests/[id]/prepare-run.js`
- `apps/diagnostic-web/pages/api/agency/requests/[id]/run-workflow.js`
- `apps/diagnostic-web/pages/api/agency/runs/[id].js`
- `packages/agents/src/brand-readiness.ts`
- `packages/agents/src/prompt-packs.ts`
- `packages/agents/src/__tests__/brand-readiness.test.ts`
- `packages/agents/src/__tests__/prompt-packs.test.ts`
- `packages/types/src/agency.types.ts`

## Arquivos alterados

- `apps/diagnostic-web/next.config.mjs`
- `apps/diagnostic-web/package.json`
- `apps/diagnostic-web/pages/adm/[id].js`
- `apps/agency-worker/README.md`
- `apps/agency-worker/package.json`
- `apps/agency-worker/src/index.ts`
- `packages/agents/README.md`
- `packages/agents/package.json`
- `packages/agents/src/index.ts`
- `packages/agents/tsconfig.json`
- `packages/brand-memory/src/brand-memory-loader-v2.ts`
- `packages/brand-memory/src/index.ts`
- `packages/types/src/index.ts`
- `pnpm-lock.yaml`
- `tsconfig.base.json`

## Decisoes tecnicas

### Fase 2 dentro do diagnostic-web

A Agencia IA foi conectada ao painel principal para evitar um segundo dashboard e para manter o fluxo perto da Brand Memory ja existente.

### web/packages/agents como pacote puro

O pacote `@espansione/agents` contem apenas contratos, validacoes, BrandKernel e prompt packs. Ele nao chama provider de IA.

### ModelGateway separado

O executor usa uma interface de gateway. Nesta entrega, a implementacao e mockada por `MockModelGateway`, permitindo testar o workflow sem custo, sem chamada externa e sem acoplamento a provider.

### Gate de prontidao da marca

A Agencia so aceita pedidos quando a Brand Memory tem os slices criticos:

- `decodificacao`
- `plataforma_branding`
- `experiencia`
- `plano_comunicacao`

Com os quatro slices, mas sem `voice_profile` ou `visual_identity`, a marca fica em `ready_for_content`.

Com os quatro slices mais `voice_profile` e `visual_identity`, a marca fica em `ready_for_campaigns`.

### Worker neutralizado

`apps/agency-worker` continua sem runtime real e sem dependencia da Agencia. Ele so deve nascer quando houver necessidade de fila, agendamento ou execucao longa fora da Vercel.

### Gate humano preservado na Brand Memory

`loadBrandMemory` exige metadados explicitos de revisao humana (`reviewedAt` e `reviewedBy`). A Fase 2 le a Brand Memory ativa, mas nao grava aprendizado automatico nela.

## Como rodar os testes

Na raiz `web`:

```bash
pnpm --filter @espansione/agents test
npm run type-check
npm run build
```

Resultado validado em 2026-05-18:

- `pnpm --filter @espansione/agents test`: 13 testes passando.
- `npm run type-check`: 6 tasks passando.
- `npm run build`: build passando.

Avisos conhecidos:

- Node mostra `MODULE_TYPELESS_PACKAGE_JSON` nos testes TypeScript do pacote `agents`.
- Next mostra aviso antigo de CSS porque um `@import` global aparece depois de outras regras.
- Next mostra aviso de convencao `middleware` depreciada.

Esses avisos nao bloqueiam a entrega atual.

## Como testar manualmente

1. Aplicar as migrations no Supabase:

```sql
-- migrations/2026-05-18_agency_requests.sql
-- migrations/2026-05-18_agency_runs_steps.sql
```

2. Subir o app:

```bash
cd web
pnpm --filter @espansione/diagnostic-web dev
```

3. Abrir um projeto no painel:

```text
/adm/{project_id}
```

4. Clicar em `Agencia IA`.

5. Conferir o estado de prontidao da marca.

6. Criar um pedido estruturado com:

- tipo de entrega
- canal
- objetivo
- publico ou cluster
- oferta
- contexto
- CTA desejado
- restricoes
- material de referencia

7. Abrir o detalhe do pedido.

8. Clicar em `Preparar briefing`.

9. Conferir a run e o step inicial do `account_director`.

10. Clicar em `Rodar Agencia IA`.

11. Conferir a timeline dos agentes:

- Atendimento Estrategico
- Copywriter
- Direcao Visual
- Editor
- Aprovador

12. Confirmar que o aprovador gera uma decisao:

- `approved`
- `revision_requested`
- `rejected`

## Pendencias e riscos

- As migrations da Agencia precisam estar aplicadas no banco antes do teste end-to-end.
- O fluxo ainda usa `MockModelGateway`, por desenho.
- Os outputs dos agentes sao plausiveis, mas mockados.
- A UI e inicial e pode receber refinamento depois do primeiro teste real com usuarios.
- Ainda nao ha politica fina de permissao/autorizacao por perfil para pedidos da Agencia.
- Ainda nao ha versionamento formal do BrandKernel alem da referencia de run.

## Proximas recomendacoes

1. Aplicar migrations em ambiente de homologacao.
2. Testar manualmente com uma marca que tenha Brand Memory ativa.
3. Criar um pequeno conjunto de fixtures de Brand Memory para testes de API.
4. Adicionar permissao por perfil antes de abrir a Agencia para usuarios finais.
5. Definir o gateway real de modelo fora de `web/packages/agents`, mantendo o pacote de agentes puro.
6. Criar revisao humana explicita antes de qualquer output aprovado virar aprendizado futuro.
