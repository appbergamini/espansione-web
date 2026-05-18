# Auditoria Tecnica - Agencia IA e Brand Memory

Data: 2026-05-18

## Objetivo

Mapear o estado atual do codigo da Espansione antes de novas implementacoes da Agencia IA, verificando tipos, Brand Memory, agentes, aplicacao principal, APIs, UI e migrations relacionadas.

Esta auditoria nao cria tabelas, nao altera regras da Fase 1, nao cria worker, nao adiciona papeis/permissoes e nao refatora codigo existente.

## Resumo executivo

A base da Fase 2 esta implementada de forma ampla. Ja existem contratos compartilhados, validacao de prontidao da Agencia, BrandKernel, versionamento da Brand Memory, pedido estruturado, runs, steps, gate de briefing aprovado, reprocessamento parcial, biblioteca da marca, aprendizados sugeridos, ativos criativos e metadados de execucao.

O principal risco agora nao e ausencia de features, mas consolidacao: schema aplicado em Supabase/Vercel, consistencia entre migrations, armazenamento de imagens, calculo real de custo, padronizacao de DTOs e clareza do fluxo administrativo.

## Status por capacidade

| Capacidade | Status | Evidencia principal |
| --- | --- | --- |
| Versionamento da Brand Memory | Implementado | `brand_memory_versions`, `loadBrandMemory`, `activateBrandMemoryVersion`, `getActiveBrandMemoryVersion` |
| Validacao de prontidao da Agencia | Implementado | `validateBrandReadinessForAgency` |
| BrandKernel operacional | Implementado | `buildBrandKernel` |
| Pedido estruturado da Agencia | Implementado | `agency_requests`, APIs e pagina de Agencia |
| AgencyRun e AgencyStep | Implementado | `agency_runs`, `agency_steps`, `prepareAgencyRun`, `runAgencyWorkflow` |
| Ligacao da run com Brand Memory versionada | Implementado | `agency_runs.brand_memory_version_id` |
| Snapshot do BrandKernel na run | Implementado | `agency_runs.brand_kernel_snapshot` |
| Gate de briefing aprovado | Implementado | `briefingApproval.js`, `briefingGate.js`, bloqueio antes dos criativos |
| Quality metadata | Implementado com cobertura parcial | Fase 1 critica e Agencia; fallback para outputs antigos |
| Execution metadata | Implementado com cobertura parcial | Agencia bem instrumentada; Fase 1 ainda parcial |
| Prompt version | Implementado | Constantes por agente em `prompt-packs.ts` |
| Reprocessamento parcial | Implementado | `parent_step_id`, `version_number`, `is_current`, variacoes de run |
| Biblioteca da Marca | Implementado | `brand_library_items` e UI dedicada |
| Aprendizados sugeridos | Implementado | `brand_learning_suggestions` e UI dedicada |
| Creative assets | Implementado | `creative_assets`, UI e endpoint de imagem |
| Desacoplamento Agente 15/16 | Implementado | Agente 16 nao depende do Agente 15 |
| Worker da Agencia | Nao implementado | Correto para o escopo atual |
| Publicacao automatica | Nao implementado | Correto para o escopo atual |
| Dashboard avancado de custo/performance | Nao implementado | Correto para o escopo atual |

## Implementado

### Tipos compartilhados

O pacote `web/packages/types` contem os contratos centrais da Agencia:

- `AgencyRequestType`
- `AgencyChannel`
- `AgencyObjective`
- `AgencyRequestStatus`
- `AgencyRunStatus`
- `AgencyStepStatus`
- `AgencyAgentId`
- `AgencyApprovalDecision`
- `BrandReadinessStatus`
- `BrandKernel`
- `AgencyRequest`
- `AgencyRun`
- `AgencyStep`
- `AgencyOutput`
- `ApprovalDecision`
- `BrandReadinessResult`
- `OutputQualityMetadata`
- `AgentExecutionMetadata`
- `AgencyRunExecutionSummary`

Arquivo principal:

- `packages/types/src/agency.types.ts`
- `packages/types/src/output-quality.types.ts`
- `packages/types/src/index.ts`

### Brand Memory versionada

Existe uma camada de versionamento com a tabela `brand_memory_versions`.

Regras encontradas:

- apenas uma versao ativa por marca via indice parcial;
- nova versao ativa arquiva versoes ativas anteriores;
- a versao guarda o JSON completo do `EspansioneDiagnostic`;
- `loadBrandMemory` exige revisao humana (`reviewedAt` e `reviewedBy`);
- `getBrandMemory` prioriza a versao ativa e usa snapshots como fallback.

Arquivos principais:

- `migrations/2026-05-18_brand_memory_versions_and_explicit_states.sql`
- `packages/brand-memory/src/brand-memory-loader-v2.ts`
- `packages/brand-memory/src/index.ts`
- `apps/diagnostic-web/pages/api/brand-memory/load.js`

### Prontidao da Agencia

A funcao `validateBrandReadinessForAgency` existe e usa os quatro slices criticos:

- `decodificacao`
- `plataforma_branding`
- `experiencia`
- `plano_comunicacao`

A regra de tipos permitidos tambem esta implementada:

- `not_ready`: nenhum pedido permitido;
- `partial_ready`: nenhum pedido permitido;
- `ready_for_content`: post, carrossel, roteiro curto e email;
- `ready_for_campaigns`: tipos anteriores mais landing page copy.

Arquivos principais:

- `packages/agents/src/brand-readiness.ts`
- `apps/diagnostic-web/lib/agency/runtime.js`

### BrandKernel

O `BrandKernel` existe como versao operacional da Brand Memory para Agencia.

Ele consolida:

- estrategia;
- audiencia;
- voz;
- visual;
- comunicacao;
- restricoes;
- proof points;
- claims proibidos;
- diretrizes de canal;
- origem dos dados.

Arquivo principal:

- `packages/agents/src/index.ts`

Observacao: `preferredCTAs` existe no contrato, mas atualmente e retornado como lista vazia no `buildBrandKernel`. Vale preencher a partir de plano de comunicacao, CTAs aprovados ou biblioteca quando a origem estiver clara.

### Pedido estruturado, runs e steps

Foram encontradas migrations e codigo para:

- `agency_requests`;
- `agency_runs`;
- `agency_steps`;
- criacao, listagem, detalhe, atualizacao e arquivamento de pedidos;
- preparacao de run;
- execucao sequencial da esteira;
- timeline visual no detalhe do pedido.

Arquivos principais:

- `migrations/2026-05-18_agency_requests.sql`
- `migrations/2026-05-18_agency_runs_steps.sql`
- `apps/diagnostic-web/lib/agency/prepareRun.js`
- `apps/diagnostic-web/lib/agency/runPersistence.js`
- `apps/diagnostic-web/lib/agency/workflow.js`
- `apps/diagnostic-web/pages/adm/[id]/agency.js`
- `apps/diagnostic-web/pages/adm/[id]/agency/[requestId].js`

### Gate obrigatorio de briefing

O gate de briefing esta implementado.

Fluxo encontrado:

1. `generateAccountDirectorBriefing` gera/salva briefing do Account Director.
2. `approveAgencyBriefing` salva a versao aprovada, podendo ser editada pelo admin.
3. `requestAgencyBriefingRevision` marca revisao solicitada.
4. `assertBriefingApproved` bloqueia agentes criativos se nao houver `approved_briefing_json`.
5. `runAgencyWorkflow` checa o gate antes de copywriter e visual director.

Arquivos principais:

- `apps/diagnostic-web/lib/agency/briefingApproval.js`
- `apps/diagnostic-web/lib/agency/briefingGate.js`
- `apps/diagnostic-web/lib/agency/workflow.js`
- `apps/diagnostic-web/pages/api/agency/requests/[id]/briefing/*`
- `apps/diagnostic-web/pages/adm/[id]/agency/[requestId].js`

### Prompt packs e versao de prompt

Os prompt packs existem para os cinco agentes:

- Account Director;
- Copywriter;
- Visual Director;
- Editor;
- Approver.

Tambem existem constantes de versao:

- `account_director_v1`
- `copywriter_v1`
- `visual_director_v1`
- `editor_v1`
- `approver_v1`

Arquivos principais:

- `packages/agents/src/prompt-packs.ts`
- `packages/agents/src/__tests__/prompt-packs.test.ts`

### Quality metadata

Existe o tipo `OutputQualityMetadata`, migration para `outputs.quality_metadata`, parser de tags e componente visual.

Cobertura encontrada:

- Fase 1: agentes 6, 9, 11, 12 e 13 recebem instrucao de qualidade.
- Agencia: Account Director, Editor e Approver possuem metadata nos outputs/prompt packs.
- Outputs antigos sem metadata possuem fallback visual.

Arquivos principais:

- `packages/types/src/output-quality.types.ts`
- `migrations/2026-05-18_output_quality_metadata.sql`
- `apps/diagnostic-web/lib/output/qualityMetadata.js`
- `apps/diagnostic-web/components/output/OutputQualityPanel.js`
- `apps/diagnostic-web/lib/ai/pipeline.js`
- `apps/diagnostic-web/pages/adm/[id].js`
- `apps/diagnostic-web/pages/adm/[id]/agency/[requestId].js`

### Execution metadata e observabilidade

Existe tipo compartilhado e migration para metadata de execucao.

Na Agencia, os steps registram:

- provider;
- model;
- prompt_version;
- tokens;
- custo estimado;
- duracao;
- tentativas;
- erro;
- trace id.

A run agrega:

- total de steps;
- steps concluidos;
- steps com erro;
- custo estimado total;
- tokens totais;
- duracao total.

Arquivos principais:

- `packages/types/src/agency.types.ts`
- `migrations/2026-05-18_agent_execution_metadata.sql`
- `apps/diagnostic-web/lib/agency/executionMetadata.js`
- `apps/diagnostic-web/lib/agency/modelGateway.js`
- `apps/diagnostic-web/lib/agency/workflow.js`
- `apps/diagnostic-web/lib/agency/briefingGate.js`

### Reprocessamento parcial

Existe suporte para regeneracao de steps e variacoes de run.

Modelo encontrado:

- `agency_runs.parent_run_id`
- `agency_runs.branch_label`
- `agency_steps.parent_step_id`
- `agency_steps.superseded_by_step_id`
- `agency_steps.invalidated_by_step_id`
- `agency_steps.version_number`
- `agency_steps.is_current`

Acoes encontradas:

- `regenerateAgencyStep`
- `regenerateFromAgencyStep`
- `createAgencyRunVariation`

Arquivos principais:

- `migrations/2026-05-18_agency_step_regeneration.sql`
- `apps/diagnostic-web/lib/agency/workflow.js`
- `apps/diagnostic-web/pages/api/agency/runs/[id]/regenerate-step.js`
- `apps/diagnostic-web/pages/api/agency/runs/[id]/regenerate-from-step.js`
- `apps/diagnostic-web/pages/api/agency/runs/[id]/variation.js`
- `apps/diagnostic-web/pages/adm/[id]/agency/[requestId].js`

### Biblioteca da Marca

A Biblioteca da Marca esta implementada como camada separada de repertorio. Ela nao substitui `agency_steps` e nao altera Brand Memory.

Capacidades encontradas:

- salvar output aprovado ou rejeitado como item de biblioteca;
- listar por marca;
- filtrar por tipo, canal, objetivo, status, cluster e texto;
- arquivar item;
- usar item como referencia em novo pedido.

Arquivos principais:

- `migrations/2026-05-18_brand_library_items.sql`
- `apps/diagnostic-web/lib/agency/library.js`
- `apps/diagnostic-web/pages/api/agency/library/*`
- `apps/diagnostic-web/pages/api/agency/runs/[id]/library.js`
- `apps/diagnostic-web/pages/adm/[id]/agency/library.js`

### Aprendizados sugeridos

A fila de aprendizados sugeridos existe e nao altera a Brand Memory automaticamente.

Capacidades encontradas:

- criar sugestao;
- aprovar para memoria futura;
- rejeitar com motivo;
- arquivar;
- listar por marca e filtros.

Arquivos principais:

- `migrations/2026-05-18_brand_learning_suggestions.sql`
- `apps/diagnostic-web/lib/agency/learning.js`
- `apps/diagnostic-web/pages/api/agency/learnings/*`
- `apps/diagnostic-web/pages/adm/[id]/agency/learnings.js`

### Ativos criativos

Existe estrutura para ativos visuais vinculados a marca, pedido, run e step.

Capacidades encontradas:

- criar ativo;
- anexar a run;
- aprovar;
- rejeitar;
- arquivar;
- listar por marca e por run;
- salvar `prompt_visual_opcional` como `creative_asset`;
- marcar imagens com texto embutido para revisao humana.

Arquivos principais:

- `migrations/2026-05-18_creative_assets.sql`
- `apps/diagnostic-web/lib/agency/creativeAssets.js`
- `apps/diagnostic-web/pages/api/agency/assets/*`
- `apps/diagnostic-web/pages/api/agency/runs/[id]/generate-image.js`
- `apps/diagnostic-web/pages/adm/[id]/agency/[requestId].js`

### Agente 16 desacoplado do Agente 15

O Agente 16 nao depende do Agente 15.

Dependencias encontradas para o Agente 16:

- obrigatorias: 2, 4, 5, 6, 7, 8, 9, 10, 11, 12 e 13;
- opcional: 14;
- nao obrigatorio: 15.

O Agente 15 continua existindo como entregavel editorial.

Arquivos principais:

- `apps/diagnostic-web/lib/ai/pipeline.js`
- `apps/diagnostic-web/lib/agents/adminFlow.js`
- `apps/diagnostic-web/lib/agents/Agent_15_Editorial.js`
- `apps/diagnostic-web/lib/agents/Agent_16_BrandMemoryExport.js`

## Parcialmente implementado ou pontos a endurecer

### Execution metadata da Fase 1

A estrutura existe em migration e `db.js`, mas a Fase 1 ainda parece registrar metadados de forma menos completa que a Agencia.

Hoje ha suporte para `model`, `tokens` e erro, mas campos como `prompt_version`, `duration_ms`, `attempt_count`, `provider` e custo real ainda nao parecem padronizados em toda a esteira da Fase 1.

Recomendacao: criar uma pequena camada comum para medir execucao da Fase 1 sem alterar prompts nem logica dos agentes.

### Calculo real de custo

A agregacao existe, mas o gateway da Agencia retorna `estimatedCost: 0` em alguns caminhos. A base esta pronta, porem falta tabela/configuracao de precos por modelo e provider.

Recomendacao: criar `pricing map` local versionado e registrar moeda/unidade.

### Creative assets com imagens em base64

O endpoint de imagem salva o resultado como data URL em `creative_assets.file_url`.

Isso funciona para prototipo, mas e arriscado para uso continuo:

- linhas grandes no banco;
- carregamento pesado;
- backup e exportacao mais caros;
- dificuldade de cache/CDN.

Recomendacao: mover binarios para Supabase Storage ou storage equivalente e manter no banco apenas URL/metadados.

### BrandKernel e CTAs preferenciais

O contrato possui `preferredCTAs`, mas o `buildBrandKernel` ainda retorna lista vazia.

Recomendacao: preencher somente a partir de fonte clara, como plano de comunicacao, Biblioteca da Marca ou aprendizados aprovados para memoria futura.

### Fallback legado da Brand Memory

A API de load possui fallback para construir diagnostico legado quando o export do Agente 16 nao vem no formato ideal.

Isso ajuda a nao travar o produto, mas pode mascarar defeitos no export estruturado.

Recomendacao: exibir no admin quando uma Brand Memory foi carregada por fallback legado e manter isso no `change_summary` ou `validation_errors`.

### Variacoes de run e metadata herdada

A variacao de run preserva relacao com a run original e copia o step de briefing aprovado, mas os metadados tecnicos desse step copiado podem ficar incompletos.

Recomendacao: marcar steps copiados como `skipped` ou `completed_from_approved_briefing` via metadata, para separar execucao real de reaproveitamento manual.

### Mapeamento snake_case versus camelCase

O banco usa `snake_case`, enquanto os tipos TypeScript usam `camelCase`. Existem mapeamentos em alguns pontos, mas nao ha uma camada unica de DTO para todas as entidades.

Recomendacao: antes de crescer a UI, criar mappers pequenos por entidade da Agencia para reduzir bugs de campo ausente.

## Nao encontrado ou corretamente fora do escopo

Nao foram encontrados indícios de:

- worker ativo da Agencia;
- publicacao automatica em redes sociais;
- dashboard avancado de performance;
- integracao Canva/Figma obrigatoria;
- promocao automatica de aprendizados para Brand Memory;
- alteracao automatica da Brand Memory a partir de Biblioteca, Aprendizados ou Ativos Criativos.

Essas ausencias estao corretas para o escopo atual.

## Riscos de duplicidade e consistencia

### Migrations com dependencia de ordem

As migrations de 2026-05-18 sao incrementais e em geral idempotentes, mas algumas dependem de tabelas criadas por migrations anteriores do mesmo dia.

Exemplo:

- `agency_requests` precisa existir antes de ajustes em estados/briefing;
- `agency_runs` precisa existir antes de adicionar `brand_memory_version_id` e `brand_kernel_snapshot`;
- `agency_steps` precisa existir antes de metadados e regeneracao.

Pelo nome atual dos arquivos, a ordenacao alfabetica tende a funcionar, mas a aplicacao manual no Supabase precisa respeitar a sequencia.

### AgencyRequestStatus em mais de uma migration

O status de pedidos aparece em migrations diferentes:

- criacao inicial de `agency_requests`;
- estados explicitos/versionamento;
- gate de briefing.

As migrations usam alteracoes defensivas, mas o risco e divergencia entre enum/check constraint, tipos TypeScript e UI.

Recomendacao: consolidar uma fonte de verdade documental para estados, mesmo sem refatorar as migrations antigas.

### Checks de acesso

Ha validacoes de acesso por usuario/projeto e algumas checagens de perfil master/admin em partes da Agencia.

Isso nao deve virar uma sprint de permissoes agora, pois o escopo explicitamente pede para nao implementar papeis/permissoes. O risco e expandir isso sem desenho claro.

### UI da Agencia crescendo em uma unica pagina

A pagina de detalhe do pedido concentra briefing, timeline, outputs, assets, biblioteca, aprendizados e acoes de regeneracao.

Funciona, mas pode voltar a ficar pesada se novas features forem empilhadas sem arquitetura de navegacao.

Recomendacao: manter uma pagina principal simples e mover detalhes para abas/paineis bem separados.

## Arquivos analisados

### Packages

- `packages/types/src/agency.types.ts`
- `packages/types/src/output-quality.types.ts`
- `packages/types/src/espansione-diagnostic.types.ts`
- `packages/types/src/index.ts`
- `packages/brand-memory/src/brand-memory-loader-v2.ts`
- `packages/brand-memory/src/index.ts`
- `packages/brand-memory/src/__tests__/brand-memory-loader-v2.test.ts`
- `packages/agents/src/index.ts`
- `packages/agents/src/brand-readiness.ts`
- `packages/agents/src/prompt-packs.ts`
- `packages/agents/src/__tests__/brand-readiness.test.ts`
- `packages/agents/src/__tests__/prompt-packs.test.ts`

### Diagnostic web - Agencia

- `apps/diagnostic-web/lib/agency/runtime.js`
- `apps/diagnostic-web/lib/agency/prepareRun.js`
- `apps/diagnostic-web/lib/agency/runPersistence.js`
- `apps/diagnostic-web/lib/agency/workflow.js`
- `apps/diagnostic-web/lib/agency/briefingApproval.js`
- `apps/diagnostic-web/lib/agency/briefingGate.js`
- `apps/diagnostic-web/lib/agency/modelGateway.js`
- `apps/diagnostic-web/lib/agency/executionMetadata.js`
- `apps/diagnostic-web/lib/agency/library.js`
- `apps/diagnostic-web/lib/agency/learning.js`
- `apps/diagnostic-web/lib/agency/creativeAssets.js`
- `apps/diagnostic-web/lib/agency/projectLifecycle.js`

### Diagnostic web - Fase 1 e admin

- `apps/diagnostic-web/lib/ai/pipeline.js`
- `apps/diagnostic-web/lib/db.js`
- `apps/diagnostic-web/lib/output/qualityMetadata.js`
- `apps/diagnostic-web/components/output/OutputQualityPanel.js`
- `apps/diagnostic-web/lib/agents/adminFlow.js`
- `apps/diagnostic-web/lib/agents/Agent_15_Editorial.js`
- `apps/diagnostic-web/lib/agents/Agent_16_BrandMemoryExport.js`
- `apps/diagnostic-web/pages/adm/[id].js`
- `apps/diagnostic-web/pages/adm/[id]/outputs/[stage].js`
- `apps/diagnostic-web/pages/api/engine/checkpoint.js`
- `apps/diagnostic-web/pages/api/brand-memory/load.js`

### Diagnostic web - paginas e APIs da Agencia

- `apps/diagnostic-web/pages/adm/[id]/agency.js`
- `apps/diagnostic-web/pages/adm/[id]/agency/[requestId].js`
- `apps/diagnostic-web/pages/adm/[id]/agency/library.js`
- `apps/diagnostic-web/pages/adm/[id]/agency/learnings.js`
- `apps/diagnostic-web/pages/api/agency/requests/index.js`
- `apps/diagnostic-web/pages/api/agency/requests/[id].js`
- `apps/diagnostic-web/pages/api/agency/requests/[id]/briefing/generate.js`
- `apps/diagnostic-web/pages/api/agency/requests/[id]/briefing/approve.js`
- `apps/diagnostic-web/pages/api/agency/requests/[id]/briefing/revision.js`
- `apps/diagnostic-web/pages/api/agency/requests/[id]/runs.js`
- `apps/diagnostic-web/pages/api/agency/runs/[id]/execute.js`
- `apps/diagnostic-web/pages/api/agency/runs/[id]/prepare.js`
- `apps/diagnostic-web/pages/api/agency/runs/[id]/regenerate-step.js`
- `apps/diagnostic-web/pages/api/agency/runs/[id]/regenerate-from-step.js`
- `apps/diagnostic-web/pages/api/agency/runs/[id]/variation.js`
- `apps/diagnostic-web/pages/api/agency/runs/[id]/library.js`
- `apps/diagnostic-web/pages/api/agency/runs/[id]/generate-image.js`
- `apps/diagnostic-web/pages/api/agency/library/index.js`
- `apps/diagnostic-web/pages/api/agency/library/[id]/archive.js`
- `apps/diagnostic-web/pages/api/agency/library/[id]/use-reference.js`
- `apps/diagnostic-web/pages/api/agency/learnings/index.js`
- `apps/diagnostic-web/pages/api/agency/learnings/[id]/approve.js`
- `apps/diagnostic-web/pages/api/agency/learnings/[id]/reject.js`
- `apps/diagnostic-web/pages/api/agency/learnings/[id]/archive.js`
- `apps/diagnostic-web/pages/api/agency/assets/index.js`
- `apps/diagnostic-web/pages/api/agency/assets/[id]/approve.js`
- `apps/diagnostic-web/pages/api/agency/assets/[id]/reject.js`
- `apps/diagnostic-web/pages/api/agency/assets/[id]/archive.js`

### Migrations

- `migrations/2026-05-17_brand_memory_schema_v2.sql`
- `migrations/2026-05-17_brand_memory_review_state.sql`
- `migrations/2026-05-18_agency_requests.sql`
- `migrations/2026-05-18_agency_runs_steps.sql`
- `migrations/2026-05-18_brand_memory_versions_and_explicit_states.sql`
- `migrations/2026-05-18_output_quality_metadata.sql`
- `migrations/2026-05-18_agency_step_regeneration.sql`
- `migrations/2026-05-18_brand_library_items.sql`
- `migrations/2026-05-18_brand_learning_suggestions.sql`
- `migrations/2026-05-18_creative_assets.sql`
- `migrations/2026-05-18_agent_execution_metadata.sql`

## Recomendacoes para proximas sprints

### 1. Sprint de estabilizacao de schema e ambiente

Antes de criar novas features, validar que todas as migrations estao aplicadas no Supabase usado pela Vercel.

Checklist sugerido:

- confirmar existencia de todas as tabelas novas;
- confirmar colunas adicionadas em `outputs`, `agency_runs` e `agency_steps`;
- confirmar constraints/checks de status;
- confirmar indice de uma Brand Memory ativa por marca;
- rodar fluxo manual em staging: Fase 1, Agente 16, carregar Brand Memory, criar pedido, gerar briefing, aprovar briefing, rodar Agencia.

### 2. Sprint curta de hardening da Agencia

Foco:

- padronizar mappers DB -> UI para entidades da Agencia;
- melhorar mensagens de erro quando schema estiver desatualizado;
- explicitar quando uma Brand Memory foi carregada via fallback legado;
- preencher `preferredCTAs` apenas com fontes confiaveis.

### 3. Sprint de armazenamento de ativos

Antes de gerar muitas imagens, mover `creative_assets.file_url` para URLs de storage.

Entregas:

- upload para Supabase Storage;
- guardar metadata de provider/model/prompt;
- manter data URL apenas como fallback temporario;
- revisar limites de tamanho.

### 4. Sprint de custos reais

Usar a estrutura de `AgentExecutionMetadata` ja criada para calcular custo real.

Entregas:

- tabela/config local de precos por modelo;
- moeda;
- data da tabela de preco;
- custo estimado por step;
- custo agregado por run.

### 5. Sprint de UX administrativa

Consolidar o fluxo administrativo em uma experiencia mais guiada:

- Projeto;
- Fase 1;
- Checkpoints;
- Brand Memory;
- Pedido;
- Briefing;
- Geracao;
- Revisao;
- Biblioteca;
- Aprendizados.

O objetivo deve ser reduzir telas com muitas responsabilidades e deixar claro o proximo passo.

### 6. Sprint futura de promocao manual para Brand Memory

Quando a fila de aprendizados estiver madura, criar fluxo manual para transformar aprendizados aprovados em proposta de nova versao da Brand Memory.

Importante: continuar sem atualizacao automatica.

## Conclusao

A Fase 2 nao esta mais so em esqueleto: a base tecnica esta presente e cobre quase todos os itens das sprints anteriores. O proximo movimento mais seguro e estabilizar schema, fluxo manual e armazenamento de ativos antes de aumentar autonomia, volume de geracoes ou dashboards.

