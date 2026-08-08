# Arquitetura — Espansione

Plataforma do **Crescimento Integrado**: um sistema único que vai da captação de lead ao entregável estratégico e à operação de conteúdo. Quatro pilares (Marca · Negócios · Comunicação · Pessoas) lidos como um sistema só — clareza para decidir, estrutura para crescer.

Hoje o produto tem **três camadas** rodando no mesmo app:

| Camada | O que é | Estado |
|---|---|---|
| **1 · Funil público** | Domínio próprio `crescimentointegrado.com.br`: home institucional, LP, Mapa Essencial (grátis), checkout, Mapa Estratégico (pago), área do cliente com treinamentos | No ar |
| **2 · Diagnóstico profundo (esteira)** | Pipeline de **16 agentes de IA** que transforma escutas (sócios, colaboradores, clientes, mercado) em Plataforma de Branding, Identidade Verbal, One Pages, EVP, Plano de Comunicação e entregável editorial consolidado | No ar (uso consultivo) |
| **3 · Agência de IA (Fase 2)** | Brand Memory + agentes de execução (briefing → copy → adaptação de canal → direção visual → edição → compliance → aprovação), biblioteca de peças, sinais e aprendizados | Em produção parcial — ver "Estado e pendências" |

> Documentos irmãos: [`passo-a-passo.md`](./passo-a-passo.md) (operação), [`fab.md`](./fab.md) (features/atributos/benefícios), [`agentes-io.md`](./agentes-io.md) (I/O por agente), [`prompts.md`](./prompts.md), [`modelos-ia.md`](./modelos-ia.md), [`formularios-perguntas.md`](./formularios-perguntas.md), [`cis-schema.md`](./cis-schema.md).
>
> **Regra geral: se este documento divergir do código, o código vence.**

---

## Monorepo

```
web/                                  raiz pnpm + turbo
├── apps/
│   ├── diagnostic-web/               ← o app Next.js (este documento)
│   └── agency-worker/                worker da Agência
├── packages/
│   ├── agents/       (TS)            prompt-packs, execution-profiles, model-registry,
│   │                                 brand-readiness — usados pela Agência
│   ├── brand-memory/ (TS)            loader v2 da Brand Memory (versões, estados)
│   ├── db/           (TS)
│   ├── shared/       (TS)
│   └── types/        (TS)            agency, checkpoint, curated-evidence,
│                                     output-quality, espansione-diagnostic
├── migrations/                       migrations da Fase 2 (Agência + Brand Memory)
├── docs/                             docs de nível monorepo (auditorias, fases)
├── turbo.json · pnpm-workspace.yaml · tsconfig.base.json
```

- Gerenciador: **pnpm 9** + **turbo 2**. Node ≥ 20.
- Scripts na raiz: `pnpm build` · `pnpm dev` · `pnpm lint` · `pnpm type-check`.
- Os pacotes TS são consumidos pelo app via `transpilePackages` (`@espansione/agents`, `@espansione/brand-memory`, `@espansione/types`).

---

## Stack

- **Next.js 16.2** (Pages Router) + **React 19.2** · Turbopack (`turbopack.root` aponta pra raiz do monorepo)
- **Supabase** — Postgres + Auth (`@supabase/ssr`, cookies) + RLS · cliente `anon` no browser, `service_role` no server
- **Vercel Pro** — Fluid Compute; `maxDuration` por rota em `vercel.json` (PDF 60s/3009MB, engine 300s, agência 300s, relatório do Mapa 120s)
- **IA multi-provider** via `lib/ai/router.js` — Google Gemini · Anthropic Claude · OpenAI. Catálogo e uso por rota em [`modelos-ia.md`](./modelos-ia.md)
- **Playwright + @sparticuz/chromium** — PDF editorial por agente e consolidado
- **`window.print`** — PDF dos relatórios do funil (Essencial e Estratégico). *html2pdf foi revertido: gerava páginas em branco*
- **Recharts** — radar/barras/heatmap das visualizações
- **react-markdown + remark-gfm** — render dos outputs
- **InfinitePay** — checkout hospedado + webhook de pagamento
- **Bunny Stream** — vídeos dos treinamentos da área do cliente
- **Resend** — e-mails transacionais (convites, código OTP, relatório, boas-vindas)
- **WaSenderAPI** — envio do link do relatório por WhatsApp
- **Tavily** — Extract/Search do deep research (Agente 5)
- **jsPDF + @react-pdf/renderer** — PDF do relatório comportamental individual
- **Tiptap** — editor rich text de templates de e-mail · **SheetJS (xlsx)** — import de respondentes

---

## Estrutura de pastas (app)

```
apps/diagnostic-web/
├── components/
│   ├── admin-cockpit/Cockpit.js      Cockpit da empresa (jornada em 7 etapas)
│   ├── admin-project/                painéis extraídos do /adm/[id]
│   ├── agency-request/               constantes + helpers da tela de request
│   ├── clusters/                     clusters de comunicação (FIX.29)
│   ├── cockpit/                      cockpit da AGÊNCIA (ui.js, views.js) — tema dark
│   ├── deliverable/                  entregável consolidado (Parte0..Parte7 + shared)
│   ├── executional/ · strategic/ · visual/
│   ├── forms/                        FormSocios · FormColaboradores · FormClientes + shared
│   ├── mapa/mapaTheme.js             tema do funil (navy #001A3B, Poppins, #C72638)
│   ├── output/                       OutputRenderer · OutputSidebar · OutputHeader
│   ├── pdf/                          RelatorioDisc (@react-pdf)
│   ├── visualizations/               VizCard + cis/ + maturidade/ + identidade/
│   ├── EntrevistaIASessoes.js · TreinamentosPlayer.js · MapaMaturidadeCard.js
│   └── MapaIdentidadeFinalCard.js · RespondentesManager.js · RichTextEditor.js
├── data/                             planilhas-fonte dos catálogos (maturidade, identidade)
├── lib/
│   ├── agency/                       runtime, workflow, prepareRun, briefingGate/Approval,
│   │                                 modelGateway, imageGeneration, library, learning,
│   │                                 agencySignals, creativeAssets, brandAssetKit,
│   │                                 executionMetadata, runPersistence, projectLifecycle
│   ├── agents/                       Agent_01…Agent_16 + catalog.js + index.js +
│   │                                 leanClusters.js + adminFlow.js + _anaCoutoKB.js
│   ├── ai/                           router.js · pipeline.js · deepResearch.js ·
│   │                                 entrevistaModel.js · tavily*
│   ├── api/                          http.js (createApiHandler/HttpError) · auth.js
│   ├── auth/verificarSessaoAdmin.js
│   ├── brand-memory/exportValidation.js · brand/logoDataUri.js
│   ├── checkout/                     infinitepay.js (payment_check) · provisionar.js
│   ├── checkpoints/structuredNotes.js
│   ├── cis/parseCis.js               normaliza scores → schema estável
│   ├── cockpit/journey.js            regras da jornada da empresa (puro)
│   ├── curadoria/ · curated-evidence/ · strategic-tensions/ · executional-readiness/
│   ├── deliverable/                  loadAllOutputs · extractFromOutput · esteiraHelpers
│   ├── emails/                       sendFormInvite · sendCodigoAcesso ·
│   │                                 sendRelatorioEssencial · sendWelcomeIdentidade
│   ├── forms/                        schemas v2/v3/v4 + useFormPersistence
│   ├── identidade-final/             catalog(.generated) · forms · scoring · report · reportHtml
│   ├── mapa-maturidade/              catalog(.generated) · score · reportVendedor · reportHtml
│   ├── output/                       parseVizMarkers · resolveVizData · qualityMetadata
│   ├── pdf/                          generatePdfFromPage (Playwright) · pdfToken · outputPdf
│   ├── relatorio/                    pdfGenerator · narrativeGenerator · normalizeScores
│   ├── repos/                        outputsRepo · projectsRepo
│   ├── treinamentos.js               trilha Bunny · visual-identity/ · whatsapp/wasender.js
│   ├── db.js · getServerUser.js · supabaseAdmin.js · supabaseClient.js · tokens/
├── pages/                            ver "Rotas" abaixo
├── public/
│   ├── home/index.html               home institucional (servida na / do funil)
│   ├── crescimento/index.html        LP do Mapa (/lp e /crescimento)
│   ├── brand/ · fonts/ · img/ · robots.txt · sitemap.xml · favicon.ico
│   └── cis.html · mapeamento.html    páginas estáticas legadas do mapeamento
├── scripts/                          geradores de catálogo + demos + pipeline local
├── styles/globals.css                design system + prose editorial + @media print
├── supabase/                         migrations 01→11 + migrations/ (funil e produto)
├── next.config.mjs · vercel.json · middleware.js
└── docs/                             esta pasta
```

---

## Modelo de dados

### Núcleo do diagnóstico

| Tabela | Função |
|---|---|
| `profiles` | 1-1 com `auth.users`; `role` (`master`/`admin`/`user`), `empresa_id`, `nome_completo` |
| `empresas` | Empresa cliente |
| `projetos` | `cliente`, `segmento`, `porte`, `momento`, `objetivo`, `responsavel_email`, `status`, `etapa_atual`, `tipo_negocio` (B2B/B2C) |
| `convites` | Convite de criação de conta (email + role + token) |
| `respondentes` | `nome`, `papel` (`socios`/`colaboradores`/`clientes`), `email`, `whatsapp`, `token` (48 hex), `token_expira_em` |
| `formularios` | Respostas. `tipo` ∈ intake_socios · intake_colaboradores · intake_clientes · entrevista_socios · entrevista_colaboradores · entrevista_cliente · posicionamento_estrategico. `respostas_json` |
| `cis_participantes` / `cis_assessments` | Mapeamento Comportamental (DISC + Jung + 16 competências + estilo de liderança) |
| `outputs` | Relatório do agente: `agent_num`, `conteudo`, `resumo_executivo`, `conclusoes`, `confianca`, `fontes`, `gaps` |
| `logs_execucao` · `checkpoints` · `intake_data` | Log de run · gatilhos de aprovação (1–4) · chave-valor (ex.: `maturidade_360`) |
| `opt_in_entrevistas` | Opt-ins de entrevista (`pendente`/`priorizado`/`entrevistado`/`descartado`) |
| `email_templates` | Template de convite por projeto × papel |
| `entrevista_sessoes` | Sessões da entrevista guiada por IA (perguntas, progresso, status) |
| `analysis_blocks` | Curadoria estratégica — findings materializados a partir dos outputs (FIX.24) |
| `clusters` | Clusters de comunicação por projeto (FIX.29/30) |
| `curated_evidence_packs` · `checkpoint_approval_records` | Evidência curada e registros de aprovação estruturada |

### Funil / produto

| Tabela | Função |
|---|---|
| `mapa_assessments` / `mapa_answers` | **Mapa Essencial**. `projeto_id` **nullable** (avaliação nasce como lead público), `cadastro_json`, `extras_json`, `result_json` (score + narrativa cacheada) |
| `id_v2_assessments` / `id_v2_respondents` / `id_v2_answers` | **Mapa Estratégico**. `produto` ∈ `maturidade_free` · `identidade_pago` · `identidade_final`; 3 tokens (sócios/colaboradores/clientes); multi-respondente |
| `identity_assessments` / `identity_submissions` | Instrumento de identidade anterior (legado, mantido) |
| `produtos_checkout` | Catálogo do checkout: `slug`, `nome`, `preco_centavos`, `fulfillment` ∈ `identidade`/`treinamento`/`nenhum`, `ativo` — editável no `/adm/produtos` sem deploy |
| `pagamentos` | Compras recebidas via webhook InfinitePay (`order_nsu`, `status`, `cliente`, `raw`, `projeto_id`) |
| `leads_feira` | Cadastros originados no QR Code da feira |

### Agência / Brand Memory (migrations do monorepo)

`brands` · `brand_snapshots` · `brand_memory_versions` · `brand_library_items` · `brand_learning_suggestions` · `brand_assets` · `agency_requests` · `agency_runs` · **`agency_steps`** · `agency_signals` · `creative_assets` · `diagnostic_runs` · `diagnostic_run_reviews` · `personas` · `editorial_pillars` · `content_examples` · `campaign_briefs` · `content_performance` · `learnings` · `agent_runs` · `approvals`.

> ⚠️ A tabela de passos da agência em produção é **`agency_steps`** (não `agency_runs_steps`, apesar do nome do arquivo de migration).

RLS ativo. Todo acesso server-side (pipeline, PDF, deliverable, funil, agência) usa `supabaseAdmin` (service role).

### Migrations — duas pastas

```
apps/diagnostic-web/supabase/            (numeradas — núcleo do diagnóstico)
  01_bootstrap · 02_app_schema · 03_convites · 04_respondentes · 05_opt_in_entrevistas
  06_respondentes_respondido_em · 07_intake_data_unique · 08_projetos_tipo_negocio
  09_opt_in_canal_horario · 10_respondentes_token · 11_entrevista_sessoes

apps/diagnostic-web/supabase/migrations/ (por feature — funil e produto)
  mapa_maturidade · mapa_maturidade_contexto · mapa_maturidade_nao_sei · mapa_maturidade_final
  mapa_identidade · mapa_identidade_espelhos · identidade_v2 · identidade_v2_links
  identidade_final_produto · pagamentos · produtos_checkout · 2026-07-23_leads_feira
  fix24_curadoria_estrategica · fix29_clusters_comunicacao

web/migrations/                          (Fase 2 — Agência + Brand Memory, 20 arquivos)
```

Aplicação: `scripts/run-migration.mjs` via Supabase Management API (`SUPABASE_ACCESS_TOKEN`).

---

## Camada 1 — Funil público

### Domínio e roteamento

`next.config.mjs` faz o roteamento por host:

- **`crescimentointegrado.com.br`** (apex canônico, `www` → 308): `/` serve `public/home/index.html` via rewrite `beforeFiles` (necessário porque `/` casa com `pages/index.js`).
- `/lp` e `/crescimento` → `public/crescimento/index.html` (LP do Mapa; `/crescimento` é o alias histórico dos links de WhatsApp).
- `/home` → URL limpa da home institucional.
- **SEO**: header `X-Robots-Tag: noindex, nofollow` em **todo host que não seja o domínio do funil** — evita que `*.vercel.app` e previews indexem conteúdo duplicado.

### Mapa do Crescimento Integrado · Essencial (grátis)

Instrumento: **4 sistemas × 10 indicadores** (Marca · Negócios · Comunicação · Pessoas), **41 perguntas (40 pontuam)** + 1 condicional de atributos de marca. Escala de frequência **0–3** (`Nunca`/`Poucas vezes`/`Muitas vezes`/`Sempre`) com **`-1` = "Não sei/Não se aplica"** *excluído do cálculo* (nem soma, nem denominador).

- Catálogo gerado da planilha: `lib/mapa-maturidade/catalog.generated.js` (**não editar à mão** — `node scripts/build-maturidade-final.cjs` a partir de `data/maturidade/mapa_maturidade_final.xlsx`).
- Score (`score.js`, puro): nota da pergunta = `(valor/3)×100`; nota do sistema = média das válidas; **nota geral = média dos 4 sistemas (25% cada)**. Régua de 4 níveis: **Crítico/Reativo** (0–29) · **Em estruturação** (30–56) · **Em consolidação** (57–…) · **Integrado**.
- UX: quiz estilo Typeform — uma afirmação por tela, auto-avanço ao tocar, botão voltar, progresso por bloco (1/4). A única tela com "Continuar" é a condicional de múltipla escolha.
- Fluxo: `/mapa` (cadastro/lead) → `POST /api/mapa/start` (cria avaliação **sem projeto**) → `/mapa/[token]` (autosave via `/api/mapa/session`) → `POST /api/mapa/finalize` (**recomputa o score no servidor — nunca confia no cliente**) → relatório.
- Relatório: `GET /api/mapa/report?token=…` devolve **HTML editorial**; `?print=1` dispara `window.print()`. Narrativa escrita por **Claude Sonnet** (`lib/mapa-maturidade/reportVendedor.js`) e **cacheada em `result_json.report`** — a IA escreve o texto, o sistema calcula os números.
- Distribuição do relatório: e-mail (Resend) ao concluir e/ou **WhatsApp** (`/api/mapa/whatsapp`, WaSenderAPI, máx. 3 envios por avaliação).
- Leads: avaliações com `projeto_id IS NULL` aparecem em **`/adm/leads`**; o comercial converte vinculando a um projeto.

### Checkout e fulfillment

`GET /api/checkout/infinitepay?produto=<slug>` lê preço/nome do catálogo `produtos_checkout`, cria o link hospedado no InfinitePay e redireciona. O slug vai codificado no `order_nsu` (`slug__uuid`).

`POST /api/checkout/infinitepay-webhook` é a **fonte de verdade do pagamento** — defensivo ao payload, grava o `raw` e dispara o fulfillment. `lib/checkout/infinitepay.js::verificarPagamento` consulta `payment_check` como anti-spoof (`paid`/`unpaid`/`unknown`).

`lib/checkout/provisionar.js` é **idempotente por `order_nsu`**: registra o pagamento, cria (ou recupera) um projeto leve para o comprador e o assessment `id_v2` (`produto='identidade_final'`) com os **3 tokens**.

### Mapa do Crescimento Integrado · Estratégico (pago)

Instrumento: **106 perguntas** distribuídas entre **3 públicos** (`socios`, `colaboradores`, `clientes`), com **24 indicadores comparáveis** (mesmo construto, formulações diferentes por público).

- Catálogo gerado: `lib/identidade-final/catalog.generated.js` (`node scripts/build-identidade-final.cjs`).
- Engine (`scoring.js`, puro): núcleo `score_family='maturity'` em escala 0–3 (N/A `-1` excluído); **multi-respondente** com pooling das respostas por pergunta; **triangulação por `indicador_codigo`** → gap entre os 3 olhares. Índices à parte: satisfação (0–10), **eNPS** (equipe), **NPS** (clientes), e *drivers* (múltipla escolha → ranking de frequência).
- Padrões lidos pela narrativa: `descida` · `inversao` · `alinhamento_alto` · `alinhamento_baixo` · `polarizacao`.
- Fluxo: compra → `/identidade/setup?order=…` (polling em `/api/identidade-final/acesso` até o webhook confirmar) → define nome da empresa/e-mail → recebe **3 links** → `/form/identidade-final/[publico]` (autosave via `/api/identidade-final/session`) → `POST /api/identidade-final/finalize` (recomputa o `result_json`) → `GET /api/identidade-final/report?token=…` (`?print=1` → PDF).
- Admin: `POST /api/identidade-final/hub` cria/recupera o assessment de um projeto existente e devolve os 3 links.

### Área do cliente

`/area` — login por **e-mail com código OTP** gerado server-side e enviado via Resend (`/api/area/enviar-codigo`; não depende do template de e-mail do Supabase), validado com `verifyOtp`. Abas **Diagnóstico** (`/api/area/dados` casa as compras pelo e-mail) e **Treinamentos** (`lib/treinamentos.js` → embeds Bunny Stream; aula sem `videoId` aparece como "em breve").

### Feira

`/feira` + `/feira/obrigado` + `/api/feira/checkout` + `/adm/feira` — captação por QR Code com checkout próprio (`FEIRA_*`), gravando em `leads_feira`.

---

## Camada 2 — Esteira de 16 agentes

> I/O detalhado por agente: [`agentes-io.md`](./agentes-io.md). Prompts: [`prompts.md`](./prompts.md).

| # | Nome | Nome p/ cliente | Stage | Inputs | CKPT | Modular |
|---|---|---|---|---|---|---|
| 1 | Roteiros VI — Entrevistas Internas | — | `pre_diagnostico` | — | — | — |
| 2 | Consolidado da Visão Interna | Quem Somos | `diagnostico_interno` | [1] | — | — |
| 3 | Roteiros VE — Entrevistas Cliente | — | `diagnostico_externo` | [2] | — | — |
| 4 | Consolidado da Visão Externa | Como Nos Veem | `diagnostico_externo` | [3] | — | — |
| 5 | Visão de Mercado | Onde Estamos | `diagnostico_externo` | [2] | — | — |
| 6 | Decodificação e Direcionamento | O Que Precisamos Decidir | `sintese` | [2,4,5] | **1** | — |
| 7 | Valores e Atributos | No Que Acreditamos | `estrategia` | [6] | — | — |
| 8 | Diretrizes Estratégicas | O Que Nos Guia | `estrategia` | [6,7] | — | — |
| 9 | Plataforma de Branding | Por Que Existimos | `estrategia` | [6,7,8] | **2** | — |
| 10 | Identidade Verbal (UVV) | Como Falamos | `visual_verbal` | [6,9] | — | — |
| 11 | One Page de Personalidade (Visual) | Como Aparecemos | `visual_verbal` | [6,9,10] | **3** | — |
| 12 | One Page de Experiência | Como Nos Relacionamos | `cx` | [6,9] | — | — |
| 13 | Plano de Comunicação — A Marca Fala | Para Onde Vamos | `comunicacao` | [6,7,8,9,10,11,12] | **4** | — |
| 14 | Plataforma de Marca Empregadora (EVP) | Por Que Trabalhar Conosco | `marca_empregadora` | [2,6,7,9] | — | **sim** |
| 15 | Consolidador Editorial do Entregável | A Nossa Marca | `encerramento` | [2,4,5,6,7,8,9,10,11,12,13,14*] | — | — |
| 16 | **Exportador para Brand Memory** | — | `encerramento` | [2,4,5,6,7,8,9,10,11,12,13,14*] | — | **sim** |

`*14` é `inputs_opcionais` — 15 e 16 rodam sem EVP.

**`lib/agents/catalog.js` é a fonte única canônica.** Expõe `CATALOGO_AGENTES`, `TOTAL_AGENTES` (**16**), `TOTAL_AGENTES_NAO_MODULARES` (**14**), os nomes em três registros (`nome_exibicao` técnico · `nome_metodo` · `nome_cliente`) e o grafo de dependências (`getDependentes` transitivo, `getPrimeiroFaltante`, `podeExecutar`). **Zero hardcode de "13"/"15"/"16" na UI.**

### Contrato de cada agente

`Agent_NN_*.js` exporta: metadados (`name`, `stage`, `inputs`, `checkpoint`, `modular?`, `preferredModel?`), `enrichContext(context)` opcional, `getSystemPrompt()`, `getUserPrompt(context)` e `parseOutput(rawText)` → `{ conteudo, resumo_executivo, conclusoes, confianca, fontes, gaps }`.

### `Pipeline.runAgent`

1. Carrega `AGENT_CONFIGS[agentNum]` (derivado do catálogo).
2. **Valida dependências** (`podeExecutar`) — erro explícito listando os faltantes.
3. Valida checkpoint pendente.
4. Monta contexto (`buildForAgent`): projeto, intake, outputs anteriores, formulários filtrados por `AGENT_FORM_TYPES`, mapeamento comportamental quando aplicável.
5. `enrichContext` (Agente 5 faz deep research aqui).
6. `AIRouter.callModel(...)` — `modelKey` do usuário → `agent.preferredModel` → `MODEL_DEFAULT`.
7. `parseOutput` extrai o envelope.
8. Persiste em `outputs` + `logs_execucao`, atualiza `status`/`etapa_atual`, cria checkpoint, **materializa `analysis_blocks`** (FIX.24) a partir do output salvo.

Agentes caros podem ser fatiados: `/api/engine/enrich` (etapa 1) + `/api/engine/run` (etapa 2), para caber no cap de 300s.

### Envelope de saída

```xml
<resumo_executivo>...</resumo_executivo>
<conteudo>... markdown, com markers <!-- VIZ:tipo:param --> quando aplicável ...</conteudo>
<conclusoes>...</conclusoes>
<confianca>Alta|Media|Baixa</confianca>
<!-- opcional: <fontes>…</fontes> · <brand_memory_export>{…}</brand_memory_export> -->
```

Agentes de síntese (2, 4, 6) entregam **PARTE A — ANALÍTICO** e **PARTE B — DEVOLUTIVA** no mesmo `<conteudo>`. O Agente 5 entrega 4 artefatos. O Agente 15 entrega Carta de Abertura + Sumário Executivo (rascunho editorial).

### Markers de visualização

Emitidos em linha própria, sem indentação: `radar_disc_socio:{slug}`, `radar_disc_time`, `barras_jung_time`, `heatmap_competencias_time`, `badge_estilo_lideranca` (cobertura ≥ 70%), `radar_maturidade_360` (cobertura ≥ 80%). `OutputRenderer` e o entregável consolidado substituem pelos componentes de `components/visualizations/*`.

### Entregável consolidado

`/adm/[id]/deliverable` — capa A4 + TOC + **8 partes** (Parte 0 Abertura → Parte 7 Encerramento), com empty-state elegante por seção ausente. PDF por Playwright em `/api/outputs/[projetoId]/deliverable/pdf`.

---

## Camada 3 — Agência de IA (Fase 2)

**Brand Memory** é o contrato entre as camadas: o Agente 16 colhe as tags `<brand_memory_export>` dos agentes 2–14, valida e consolida no JSON canônico `EspansioneDiagnostic`. `POST /api/brand-memory/load` carrega/ativa a versão (`brand_memory_versions`, estados explícitos + validação).

**Fluxo de uma peça:**

```
request (tipo × canal × objetivo)  →  briefing (account_director)
      → aprovação humana do briefing (briefingGate/briefingApproval)
      → run: copywriter → channel_adapter → visual_director → editor
             → brand_compliance → approver
      → assets/imagens (GPT Image) → biblioteca → sinais → aprendizados
```

- `lib/agency/runtime.js` — `REQUEST_TYPES` (social_post, carousel, short_video_script, email, landing_page_copy), `CHANNELS`, `OBJECTIVES`, `REQUEST_STATUSES` (`draft` → `briefing_pending` → `briefing_generated` → `briefing_revision_requested` → `briefing_approved` → `generation_running` → `approval_pending` → …), readiness da marca.
- `lib/agency/workflow.js` — orquestra a sequência (`packages/agents/execution-profiles`), resolve modelo por passo (`model-registry`), grava passos em `agency_steps`, calcula metadados de execução e qualidade, e gera **sinais** a partir de cada passo.
- Regeneração granular: `regenerate-step` e `regenerate-from-step`.
- Telas: `/adm/[id]/agency` (+ `[requestId]`, `assets`, `brand-book`, `brand-memory`, `library`, `learnings`, `signals`).
- **`/cockpit`** — dashboard da agência (tema dark, 7 views: Diagnóstico, Revisão, Visão Geral, Conteúdo, Pautas, Agenda, IA). Fase 1 deployada; parte dos dados ainda é exemplo.

---

## Autenticação e autorização

| Mecanismo | Onde |
|---|---|
| **Senha** (`signInWithPassword`) | `/login` — consultoria/admin |
| **OTP por e-mail** (Resend + `verifyOtp`) | `/area` — cliente comprador |
| **Token do respondente** (48 hex, 30 dias) | formulários do diagnóstico |
| **Token do assessment** | `/mapa/[token]`, relatórios do funil |
| **3 tokens por público** | `/form/identidade-final/[publico]` (+ `rid` por respondente) |
| **`order_nsu`** | `/identidade/setup` pós-compra |
| **HMAC curto (TTL 60s, escopo por stage)** | PDF interno — Chromium headless autentica sem cookie |

- SSR via `@supabase/ssr` → `getServerUser(req, res)`.
- Roles em `profiles.role`: `master` (todos os projetos) · `admin` (da sua empresa) · `user` (os seus).
- Helpers: `verificarSessaoAdmin(req, res)` e, no padrão novo, `lib/api/auth.js` (`requireUser`, `requireRole`) + `lib/api/http.js` (`createApiHandler`, `httpErrors`) — roteamento por método, 405 e try/catch padronizados.
- **Preview admin** de formulário: `/form/<tipo>?projeto={id}&preview=true` — sessão admin, banner âmbar sticky, submit desabilitado.
- ⚠️ `middleware.js` tem a proteção de `/adm` e `/api/adm` **comentada** ("temporário, a pedido"). A autorização real acontece nos handlers; a proteção de borda está desligada.

### Contrato de `respondentes.token`

48 chars hex (`crypto.randomBytes(24)`), **imutável** (upsert nunca sobrescreve — `POST /api/respondentes` faz split insert/update), **expira em 30 dias**, e o reenvio de convite **renova a expiração sem trocar o token** (preserva rascunho em `sessionStorage`). `/api/respondentes/by-token` devolve **410 Gone** quando expirado.

---

## Endpoints principais

### Funil e produto
| Endpoint | Método | Função |
|---|---|---|
| `/api/mapa/start` | POST | Público — cria avaliação-lead (sem projeto) |
| `/api/mapa/session` | GET/POST | Público por token — estado + autosave |
| `/api/mapa/finalize` | POST | Público — recomputa o score autoritativo e conclui |
| `/api/mapa/report` | GET | HTML do relatório (`?print=1` → PDF via navegador) |
| `/api/mapa/whatsapp` | POST | Envia o link do relatório (máx. 3×) |
| `/api/mapa/create` | POST | Admin — avaliação vinculada a um projeto |
| `/api/identidade-final/hub` | POST | Admin — cria/recupera assessment + 3 links |
| `/api/identidade-final/acesso` | GET/POST | Pós-compra por `order_nsu` |
| `/api/identidade-final/session` | GET/POST | Público por token (+`rid`) |
| `/api/identidade-final/finalize` | POST | Conclui respondente + recomputa triangulação |
| `/api/identidade-final/report` | GET | HTML do relatório (aceita qualquer um dos 3 tokens) |
| `/api/checkout/infinitepay` | GET | Cria link de checkout e redireciona |
| `/api/checkout/infinitepay-webhook` | POST | Pagamento → fulfillment idempotente |
| `/api/area/enviar-codigo` · `/api/area/dados` | POST · GET | OTP e estado do cliente |
| `/api/adm/leads` · `/pagamentos` · `/produtos` · `/feira` | GET/POST | Backoffice comercial |

### Diagnóstico
| Endpoint | Método | Função |
|---|---|---|
| `/api/adm/[id]` | GET | Painel do projeto (projeto + outputs + formulários + respondentes + comportamental) |
| `/api/adm/cockpit/[id]` | GET | Jornada da empresa já com status, bloqueios e ações |
| `/api/engine/enrich` · `/api/engine/run` | POST | Enriquecimento e execução de agente |
| `/api/engine/checkpoint` | POST | Aprova checkpoint |
| `/api/outputs/delete` | GET/POST | GET: preview de cascata · POST: exclui com `confirmar_cascata` |
| `/api/outputs/[projetoId]/[stage]/pdf` | GET | PDF editorial por agente (Playwright) |
| `/api/outputs/[projetoId]/deliverable/pdf` | GET | PDF consolidado |
| `/api/formularios` | POST | Salva resposta (hook calcula `maturidade_360`) |
| `/api/respondentes` · `/by-token` | CRUD · GET | Respondentes e lookup por token |
| `/api/convites/enviar` · `enviar-batch` · `form-link` · `aceitar` | POST | Convites (renovam token expirado) |
| `/api/cis/*` | — | Mapeamento Comportamental (participantes, salvar, consultar, acesso) |
| `/api/relatorio/gerar` · `solicitar` · `team-narratives` | — | Relatório comportamental individual e do time |
| `/api/entrevista/questions` · `session` · `sessions` · `transcribe` · `analyze` | — | Entrevista guiada por IA |
| `/api/clusters/*` · `/api/curadoria/backfill` · `/api/analysis-blocks/*` | — | Clusters e curadoria estratégica |

### Agência
`/api/agency/readiness` · `/requests` (+ `[id]`, `briefing/{index,approve,revision}`, `prepare-run`, `run-workflow`, `generate-image`) · `/runs/[id]` (+ `library`, `regenerate-step`, `regenerate-from-step`) · `/assets` · `/library` (+ `use-reference`) · `/learnings` · `/signals` · `/brand-book` · `/brand-memory-versions` · `/api/brand-memory/load` · `/api/curated-evidence-packs`.

---

## Rotas de frontend

**Público / funil** — `/` (home institucional no domínio do funil) · `/lp`, `/crescimento` (LP) · `/mapa`, `/mapa/[token]` · `/identidade/setup` · `/form/identidade-final/[publico]` · `/area` · `/feira`, `/feira/obrigado`

**Formulários do diagnóstico** — `/form/socios`, `/form/colaboradores`, `/form/clientes`, `/form/posicionamento`, `/form/intake`, `/form/[tipo]` · `/entrevista/[token]` (entrevista guiada por IA)

**Consultoria/admin** — `/login`, `/register`, `/forgot-password`, `/reset-password` · `/adm` · `/adm/novo` · `/adm/[id]` (cockpit da empresa, 9 abas: Visão Geral · **Diagnóstico (esteira)** · Formulários · Pessoas · Entregáveis · Trilhas · Histórico · Observações · Logs) · `/adm/[id]/outputs/[stage]` · `/adm/[id]/deliverable` · `/adm/[id]/curadoria` · `/adm/[id]/agency` (+ subpáginas) · `/adm/leads`, `/adm/pagamentos`, `/adm/produtos`, `/adm/feira` · `/cockpit` (agência)

**Cliente** — `/dashboard`, `/dashboard/projetos`, `/dashboard/projetos/[id]`, `/dashboard/equipe`

**Dev** — `/dev/visualizations-catalog` (galeria dos componentes VIZ, `NODE_ENV` check)

---

## Design system

São **duas linguagens visuais convivendo**, por público:

**1 · Funil e relatórios do cliente** — `components/mapa/mapaTheme.js`: fundo **navy `#001A3B`** (`navy2 #013063`), acento **vermelho `#C72638`**, cards brancos, tipografia **Poppins**, logo/símbolo Espansione como marca d'água e favicon. `MapaShell` + `MapaCard` + `sx` são compartilhados por `/mapa`, `/identidade/setup`, `/area` e os formulários do Estratégico. A landing e a home usam a mesma paleta.

**2 · Admin e entregável editorial** — `styles/globals.css`: paleta oficial no `@theme` do Tailwind v4 + variáveis CSS, tokens editoriais (`--accent-purple`, `--accent-green`), tokens VIZ (`--viz-success/warning/critical`, `--viz-card-*`), `.output-prose` (Andada Pro + Rebrand Dis), classes do entregável (`.deliverable-root`, `.deliverable-cover`, `.part-header`, `.manifesto-section`, `.como-lemos`, `.creditos-grid`) e `@media print` com `@page` A4, numeração de rodapé e `page-break-*`.

O cockpit da agência (`/cockpit`) usa um tema **dark** próprio e autocontido.

Ícones: `components/Icon.js` (Lucide SVG inline).

---

## Variáveis de ambiente

| Variável | Onde é usada |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` · `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + SSR |
| `SUPABASE_SERVICE_ROLE_KEY` | server (bypass RLS) |
| `SUPABASE_ACCESS_TOKEN` | local — Management API para migrations |
| `GEMINI_API_KEY` · `ANTHROPIC_API_KEY` · `OPENAI_API_KEY` | AIRouter (esteira, agência, relatórios, entrevista, Whisper, GPT Image) |
| `TAVILY_API_KEY` | Extract/Search do deep research (Agente 5) |
| `RESEND_API_KEY` · `RESEND_FROM_EMAIL` | e-mails transacionais |
| `WASENDERAPI` | envio do relatório por WhatsApp |
| `INFINITEPAY_HANDLE` · `INFINITEPAY_API_KEY` | checkout + `payment_check` |
| `FEIRA_INFINITEPAY_HANDLE` · `FEIRA_PRODUTO_NOME` · `FEIRA_VALOR_CENTAVOS` | checkout da feira |
| `NEXT_PUBLIC_BUNNY_LIBRARY_ID` | player de treinamentos |
| `NEXT_PUBLIC_SITE_URL` · `SITE_URL` | base URL dos links em e-mails |
| `PDF_EXPORT_SECRET` | HMAC dos tokens de PDF (fallback: `SUPABASE_SERVICE_ROLE_KEY`) |
| `AGENCY_MODEL_GATEWAY` · `AGENCY_MODEL_KEY` · `AGENCY_MODEL_MAX_TOKENS` · `AGENCY_MODEL_TEMPERATURE` | gateway de modelo da agência (`mock` para testes) |
| `OPENAI_IMAGE_SIZE` · `OPENAI_IMAGE_QUALITY` | geração de imagem da agência |
| `NEXT_PUBLIC_DEFAULT_AI_EXECUTION_MODE` | modo de execução default na UI da agência |

---

## Deploy

- **GitHub**: `appbergamini/espansione-web`, branch `master`.
- **Vercel**: projeto `appbergamini`, plano **Pro** (necessário para `memory: 3009` e `maxDuration: 300`).
- **Domínio**: `crescimentointegrado.com.br` (apex canônico, HTTPS, `www` → 308).
- Auto-deploy via GitHub→Vercel; se um commit não refletir: `vercel deploy --prod --yes`.
- `outputFileTracingIncludes` força o Vercel a copiar a pasta inteira de `@sparticuz/chromium` — sem isso o Turbopack perde o `bin/` e o PDF quebra em runtime.
- Branches: `feat/…` ou `fix/NN-slug` → PR → merge em `master`. Pushes diretos em `master` são aceitos para ajustes pequenos.

---

## Convenções do código

- Server-side **nunca** usa `supabaseClient` (anon) — sempre `supabaseAdmin`.
- Todo endpoint valida permissão após `getServerUser` — via `verificarSessaoAdmin` (padrão antigo) ou `requireRole` + `createApiHandler` (padrão novo, para onde as rotas migram).
- **IDs internos nunca vão para o público** — o token é o identificador.
- **Score sempre recomputado no servidor** no `finalize` (Essencial e Estratégico). O cliente não é fonte de verdade de nota.
- **A IA escreve, o sistema calcula.** Narrativas dos relatórios recebem números e seleção já prontos e são cacheadas em `result_json.report`.
- Catálogos `*.generated.js` são **gerados de planilha** — editar a planilha em `data/` e rodar o script `build-*`; nunca editar o arquivo gerado.
- `lib/agents/catalog.js` é fonte única de metadados de agente; `AGENT_CONFIGS` (pipeline) e `CATALOGO_AGENTES` são mantidos em sync (há comentários de alerta em ambos).
- Lógica de score/jornada mora em **funções puras testáveis** (`mapa-maturidade/score.js`, `identidade-final/scoring.js`, `cockpit/journey.js`) — testes em `lib/**/__tests__` via `pnpm --filter @espansione/diagnostic-web test`.
- Nenhum agente inventa evidência — políticas anti-invenção explícitas nos prompts.
- **Terminologia client-facing**: os produtos se chamam **Mapa do Crescimento Integrado Essencial** e **Estratégico**; os quatro eixos são **PILARES** (Marca · Negócios · Comunicação · Pessoas); o instrumento comportamental é **Mapeamento Comportamental** (jamais a sigla técnica). Metodologia é **proprietária Espansione**.

---

## Estado e pendências conhecidas

- **Brand Memory**: a versão do fixture GSIM está ativa em produção, mas carregada pelo **fallback legado**. O caminho próprio (export per-agente via `<brand_memory_export>`) **nunca rodou fim-a-fim**; re-execuções do Agente 16 falham em emitir o JSON.
- **`middleware.js`**: proteção de borda de `/adm` e `/api/adm` comentada (temporária). A autorização vive nos handlers.
- **Marca no entregável**: resolvido. Capa, subtítulo da Parte 3, créditos da Parte 7, rodapé de impressão (`@page` em `globals.css`) e o campo `fontes` dos agentes assinam **Método do Crescimento Integrado · Espansione**. Os *system prompts* dos agentes ainda citam a metodologia de origem — isso é **instrução interna** que molda a resposta do modelo, não texto que o cliente lê; mexer ali altera a qualidade do output. `lib/agents/_anaCoutoKB.js` segue como nome de arquivo interno legado.
- **Cockpit da agência (`/cockpit`)**: Fase 1 no ar; parte das views ainda usa dados de exemplo.
- **Docs defasados**: `maturidade-textos-e-regua.md` e `identidade-perguntas-por-funcao.md` descrevem os instrumentos **anteriores** (7 pilares × 7; banco de 231). Os instrumentos vigentes são os `*.generated.js` descritos aqui.
- **Funil**: domínio do Resend a verificar; compras de teste a limpar; títulos das aulas 2 e 3 a definir.

---

## Scripts locais

**Commitados** (`apps/diagnostic-web/scripts/`):

| Script | Função |
|---|---|
| `build-maturidade-final.cjs` | Regenera `lib/mapa-maturidade/catalog.generated.js` da planilha |
| `build-identidade-final.cjs` | Regenera `lib/identidade-final/catalog.generated.js` da planilha |
| `build-landing-crescimento.cjs` | Gera a LP `public/crescimento/index.html` |
| `gen-maturidade-demo.cjs` · `gen-identidade-demo.cjs` | Relatórios de demonstração |
| `run-pipeline.cjs` | Roda a esteira localmente |
| `gera_md_intake_socios.js` · `popula_lean_gsim.js` | Utilitários de conteúdo/fixture |

**Não commitados** (em `.gitignore` — ferramentas locais): `run-migration.mjs` (SQL via Management API), `seed-gsim-parte*.mjs` (projeto-teste GSIM), `cleanup-gsim.mjs` (limpeza, dry-run por padrão).
