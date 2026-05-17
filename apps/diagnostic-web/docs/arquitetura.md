# Arquitetura — Espansione

Plataforma web de diagnóstico e construção de Plataforma de Branding segundo o método Ana Couto. Pipeline de **15 agentes de IA** (13 obrigatórios + 2 modulares/finais) que transformam escutas (sócios, colaboradores, clientes, mercado) em Plataforma, Identidade Verbal, One Pages, EVP opcional, Plano de Comunicação e **entregável editorial consolidado** exportável em PDF.

---

## Stack

- **Next.js 16** (Pages Router) + **React 19.2** · Turbopack em build
- **Supabase** — Postgres 17 + Auth (`@supabase/ssr` cookies) + RLS · cliente `anon` no browser, `service_role` no server
- **Vercel Pro** — hosting com Fluid Compute; `/api/outputs/*/pdf` roda com `maxDuration: 60s` e `memory: 3009 MB` (Chromium slim)
- **IA multi-provider** via `lib/ai/router.js`:
  - **Google Gemini** (default para a maioria dos agentes)
  - **Anthropic Claude** (Opus 4.7 com `web_search_20250305` — deep research do Agente 5)
  - **OpenAI GPT-4o** (opcional)
- **Playwright + @sparticuz/chromium** — PDF editorial por agente e consolidado (TASK 4.3/4.4)
- **Recharts** — radar/barras/heatmap das visualizações CIS + Maturidade 360° (TASK 4.1)
- **react-markdown + remark-gfm** — render de Markdown dos outputs na página editorial
- **Tavily Extract** — captura de conteúdo bruto de sites dos concorrentes (complementar ao Claude)
- **Resend** — emails transacionais (convites, links de formulário)
- **jsPDF + @react-pdf/renderer** — PDFs legados (relatório DISC, outputPdf por agente)
- **Tiptap** — editor rich text para templates de e-mail
- **SheetJS (xlsx)** — import de respondentes via CSV/XLSX

---

## Estrutura de pastas

```
web/
├── components/
│   ├── DashboardLayout.js, Logo, Icon, RichTextEditor, RespondentesManager,
│   │   OptInEntrevistasManager, PosicionamentoResults
│   ├── deliverable/                  Entregável final consolidado (TASK 4.4)
│   │   ├── Deliverable.js            Raiz — 8 partes + cover + TOC
│   │   ├── parts/Parte0..Parte7      Uma por parte editorial
│   │   └── shared/                   DeliverableCover, DeliverableToc, DeliverableHeader,
│   │                                 PartHeader, ComoLemosSuaEmpresa
│   ├── forms/
│   │   ├── FormSocios, FormColaboradores, FormClientes   Forms com useFormPersistence
│   │   └── shared/                   BarraProgresso, EscalaLikert, RadarSliders,
│   │                                 RankingDragDrop, PreviewBanner (FIX.2)
│   ├── output/                       Página editorial de output (TASK 4.2)
│   │   ├── OutputRenderer.js         Markdown + VIZ markers → componentes
│   │   ├── OutputSidebar.js, OutputHeader.js
│   └── visualizations/               Componentes VIZ (TASK 4.1)
│       ├── VizCard.js, tokens.js
│       ├── cis/                      RadarDISC, BarrasJung, HeatmapCompetencias,
│       │                             BadgeEstiloLideranca
│       └── maturidade/               RadarMaturidade360
├── lib/
│   ├── agents/
│   │   ├── _anaCoutoKB.js            Constantes do método (Tríplice, Ondas, RDPC…)
│   │   ├── Agent_01…Agent_15         15 agentes + index.js (AGENTS_MAP)
│   │   └── catalog.js                Catálogo canônico (FIX.3) — fonte única de
│   │                                 metadados, inputs[], inputs_opcionais[], helpers
│   ├── ai/
│   │   ├── pipeline.js               Orquestrador (AGENT_CONFIGS, STAGES, runAgent)
│   │   ├── router.js                 AIRouter — Gemini + Claude + OpenAI, retry, MAX_OUT=16000
│   │   ├── deepResearch.js           Claude web_search (Agente 5)
│   │   ├── tavilyExtract.js          Raw content extraction complementar
│   │   └── tavilyResearch.js         Pesquisa estruturada (legado — substituído por deepResearch)
│   ├── auth/
│   │   └── verificarSessaoAdmin.js   Helper FIX.2 (sessão + profile.role)
│   ├── cis/parseCis.js               Normaliza scores_json → schema estável (DISC + Jung +
│   │                                 16 competências + estilo de liderança)
│   ├── db.js                         Acesso Supabase server-side (service role)
│   ├── deliverable/                  Data layer do entregável consolidado
│   │   ├── loadAllOutputs.js         Carrega projeto + outputs + CIS + 360° + escuta
│   │   ├── extractFromOutput.js      Extratores defensivos por seção de Markdown
│   │   └── esteiraHelpers.js         Análise de cascata + próximo agente dep-aware (FIX.4)
│   ├── emails/                       Templates + sendFormInvite
│   ├── forms/useFormPersistence.js   sessionStorage + debounce
│   ├── getServerUser.js              Extração de usuário a partir dos cookies
│   ├── maturidade/                   Compute + aggregate do 360°
│   ├── output/
│   │   ├── parseVizMarkers.js        Parser <!-- VIZ:tipo:param --> (TASK 4.2)
│   │   └── resolveVizData.js         Busca CIS/Maturidade e indexa por marker key
│   ├── pdf/
│   │   ├── generatePdfFromPage.js    Playwright + Chromium slim (local/serverless) — TASK 4.3
│   │   ├── pdfToken.js               HMAC-SHA256 scoped por stage, TTL 60s
│   │   └── outputPdf.js              PDF jsPDF legado (relatório DISC)
│   ├── supabaseAdmin.js              Cliente service_role (server only)
│   ├── supabaseClient.js             Cliente anon (browser)
│   └── tokens/
│       └── respondenteToken.js       Geração + validação + renovação (FIX.1)
├── pages/
│   ├── adm/
│   │   ├── [id].js                   Painel master — orquestrador + Danger Zone (modal de cascata)
│   │   ├── [id]/outputs/[stage].js   Página editorial do output (TASK 4.2)
│   │   ├── [id]/deliverable.js       Entregável consolidado (TASK 4.4)
│   │   └── novo.js, index.js
│   ├── api/
│   │   ├── adm/, convites/, cis/, engine/, formularios.js, outputs/,
│   │   │   projetos/, relatorio/, respondentes/
│   │   └── outputs/[projetoId]/
│   │       ├── [stage]/pdf.js        PDF por agente (Playwright)
│   │       └── deliverable/pdf.js    PDF consolidado
│   ├── dashboard/                    Fluxo de usuário não-master
│   ├── dev/visualizations-catalog.js Dev-only (NODE_ENV check) — galeria dos 5 VIZ
│   └── form/                         Formulários públicos + modo preview admin (FIX.2)
├── styles/globals.css                Design system + editorial prose + @media print
├── supabase/                         Migrations numeradas (01→10)
└── docs/                             arquitetura.md · passo-a-passo.md · prompts.md · specs/
```

---

## Modelo de dados

### Tabelas do domínio

| Tabela | Função |
|---|---|
| `profiles` | 1-1 com `auth.users`; `role` (`master` · `admin` · `user`), `empresa_id`, `nome_completo` |
| `empresas` | Empresa cliente (FK para projetos) |
| `projetos` | Projeto: `cliente`, `segmento`, `porte`, `momento`, `objetivo`, `responsavel_email`, `status`, `etapa_atual`, `tipo_negocio` (B2B/B2C) |
| `convites` | Convites para criação de conta (email + role + token) |
| `respondentes` | `nome`, `papel` (`socios`/`colaboradores`/`clientes`), `email`, `whatsapp`, `token` (48 hex), `token_expira_em` (30 dias) |
| `formularios` | Respostas. `tipo` ∈ {`intake_socios`, `intake_colaboradores`, `intake_clientes`, `entrevista_socios`, `entrevista_colaboradores`, `entrevista_cliente`, `posicionamento_estrategico`}, `respostas_json` (jsonb) |
| `cis_participantes` | CIS: quem foi convidado (email, liberado, respondido) |
| `cis_assessments` | CIS: resposta (`perfil_label`, `scores_json` com DISC + Jung + 16 competências + estilo) |
| `outputs` | Relatório do agente `agent_num`: `conteudo`, `resumo_executivo`, `conclusoes`, `confianca`, `fontes`, `gaps` |
| `logs_execucao` | Log do run (tokens in/out, modelo, status) |
| `checkpoints` | Gatilhos de aprovação entre etapas (1, 2, 3, 4) |
| `intake_data` | Chave-valor por projeto. Usado para `maturidade_360` agregado (campo `valor` = JSON stringified) |
| `opt_in_entrevistas` | Opt-ins de entrevista. `status` ∈ {`pendente`, `priorizado`, `entrevistado`, `descartado`} |
| `email_templates` | Template de convite por projeto × papel |

RLS ativo em todas. Queries server-side (pipeline, PDF, deliverable) usam `supabaseAdmin` (service role) para bypass.

### Migrations aplicadas

```
01_bootstrap.sql              pgcrypto, profiles, empresas
02_app_schema.sql             projetos, outputs, intake_data, formularios, checkpoints, logs, cis_*
03_convites.sql               convites + RLS
04_respondentes.sql           respondentes + email_templates
05_opt_in_entrevistas.sql     opt-ins separados
06_respondentes_respondido_em.sql
07_intake_data_unique.sql     UNIQUE(projeto_id, campo)
08_projetos_tipo_negocio.sql
09_opt_in_canal_horario.sql
10_respondentes_token.sql     FIX.1 — token NOT NULL + token_expira_em NOT NULL + índice único
```

### Contrato de `respondentes.token` (FIX.1)

- Token de **48 chars hex** gerado server-side (`crypto.randomBytes(24)`) na criação do respondente.
- **Imutável**: upserts nunca sobrescrevem token existente — a `POST /api/respondentes` faz split insert/update defensivo.
- **Expira em 30 dias**. Reenvio de convite (`enviar-batch` ou `form-link`) **renova automaticamente** a expiração sem trocar o token — preserva respostas parciais em `sessionStorage`.
- `/api/respondentes/by-token` retorna **410 Gone** para token expirado (semântica HTTP correta).

---

## Pipeline de 15 agentes

> **I/O detalhado de cada agente:** ver [`agentes-io.md`](./agentes-io.md) — inputs (formulários, outputs anteriores, CIS, clusters, curated blocks, enrichContext) e estrutura de saída por agente.

| # | Nome | Stage | Inputs | Checkpoint | Modular |
|---|---|---|---|---|---|
| 1 | Roteiros VI — Entrevistas Internas | `pre_diagnostico` | — | — | — |
| 2 | Consolidado da Visão Interna (VI) | `diagnostico_interno` | [1] | — | — |
| 3 | Roteiros VE — Entrevistas Cliente | `diagnostico_externo` | [2] | — | — |
| 4 | Consolidado da Visão Externa (VE) | `diagnostico_externo` | [3] | — | — |
| 5 | Visão de Mercado (VM) | `diagnostico_externo` | — | — | — |
| 6 | Decodificação e Direcionamento Estratégico | `sintese` | [2,4,5] | **1** | — |
| 7 | Valores e Atributos | `estrategia` | [6] | — | — |
| 8 | Diretrizes Estratégicas | `estrategia` | [6,7] | — | — |
| 9 | Plataforma de Branding | `estrategia` | [6,7,8] | **2** | — |
| 10 | Identidade Verbal (UVV) | `visual_verbal` | [6,9] | — | — |
| 11 | One Page de Personalidade (Visual) | `visual_verbal` | [6,9,10] | **3** | — |
| 12 | One Page de Experiência | `cx` | [6,9] | — | — |
| 13 | Plano de Comunicação — A Marca Fala | `comunicacao` | [6,7,8,9,10,11,12] | **4** | — |
| 14 | Plataforma de Marca Empregadora (EVP) | `marca_empregadora` | [2,6,7,9] | — | **sim** |
| 15 | Consolidador Editorial do Entregável Final | `encerramento` | [2,4,5,6,7,8,9,10,11,12,13,14*] | — | — |

`*14` é `inputs_opcionais` — 15 roda sem EVP quando projeto não contratou escopo.

**`lib/agents/catalog.js`** é a fonte única canônica (FIX.3). Tem:
- `CATALOGO_AGENTES[]` — metadados completos
- `TOTAL_AGENTES` (15), `TOTAL_AGENTES_NAO_MODULARES` (14)
- Helpers: `getAgenteByNum`, `getAgenteByKey`, `calcularProgresso`, `formatarRotuloDocumento`, `formatarTituloAdmin`
- Grafo de dependências: `getDependentes` (fecho transitivo), `getPrimeiroFaltante`, `podeExecutar` (FIX.4)

### Contrato de cada agente

Cada `Agent_NN_*.js` exporta:

- Metadados: `name`, `stage`, `inputs`, `checkpoint`, `modular` (opcional), `preferredModel` (opcional)
- `enrichContext(context)` — opcional (Agente 5 faz deep research aqui; Agente 15 extrai nome do sócio-fundador)
- `getSystemPrompt()` → string
- `getUserPrompt(context)` → string
- `parseOutput(rawText)` → `{ conteudo, resumo_executivo, conclusoes, confianca, fontes, gaps }`

### `Pipeline.runAgent` (FIX.4)

1. Carrega `AGENT_CONFIGS[agentNum]`.
2. **Valida dependências** via `podeExecutar()` — lança erro explícito listando faltantes se obrigatórios ausentes.
3. Valida checkpoint pendente (bloqueia `agentNum > num-que-criou-checkpoint`).
4. Monta contexto via `buildForAgent`: `projeto`, `intake`, `previousOutputs`, `formularios` (filtrados por `AGENT_FORM_TYPES`), `cisAssessments` (se aplicável).
5. Chama `agent.enrichContext(context)` se existir.
6. `AIRouter.callModel(systemPrompt, messages, { modelKey })` — respeita `agent.preferredModel` como fallback.
7. `agent.parseOutput(rawText)` extrai envelope.
8. Persiste em `outputs`, `logs_execucao`, atualiza `status`/`etapa_atual`, cria checkpoint se houver.

### Envelope de saída

```xml
<resumo_executivo>...</resumo_executivo>
<conteudo>... markdown, com markers <!-- VIZ:tipo:param --> quando aplicável ...</conteudo>
<conclusoes>...</conclusoes>
<confianca>Alta|Media|Baixa</confianca>
<!-- opcional: <fontes>...</fontes> -->
```

**Agentes de síntese** (2, 4, 6) entregam dois documentos em `<conteudo>`: `# PARTE A — ANALÍTICO` e `# PARTE B — DEVOLUTIVA`, separados por `---`. **Agente 5** entrega 4 artefatos (concorrentes, panorama, tendências, IDA+hipóteses). **Agente 15** entrega Carta de Abertura + Sumário Executivo (rascunho editorial).

### Markers de visualização (TASK 3.1.1)

Agente 2 emite em linha própria, sem indentação:

- `<!-- VIZ:radar_disc_socio:{slug} -->` por sócio com CIS
- `<!-- VIZ:radar_disc_time -->`, `<!-- VIZ:barras_jung_time -->`, `<!-- VIZ:heatmap_competencias_time -->`, `<!-- VIZ:badge_estilo_lideranca -->` (quando cobertura CIS ≥ 70%, ordem fixa)
- `<!-- VIZ:radar_maturidade_360 -->` (quando cobertura 360° ≥ 80%)

O `OutputRenderer` (TASK 4.2) e o entregável consolidado (TASK 4.4) parseiam os markers e substituem pelos componentes React em `components/visualizations/*`.

---

## Autenticação e autorização

- **Login por senha** via `supabase.auth.signInWithPassword`.
- **SSR** via `@supabase/ssr` com cookies → `getServerUser(req, res)` lê o usuário em cada API e SSR.
- **Roles** em `profiles.role`:
  - `master` — administra todos os projetos; acessa `/adm/*`
  - `admin` — administra os projetos da sua empresa
  - `user` — só vê seus próprios projetos
- **Helper `verificarSessaoAdmin(req, res)`** (FIX.2) — padrão único para rotas admin: sessão + role check em uma chamada.
- **Formulários públicos** usam token por respondente (FIX.1).
- **Preview admin** (FIX.2): `/form/<tipo>?projeto={id}&preview=true` — autenticado por sessão admin (não por token público). Banner âmbar sticky, submit disabled, `submeter()` com guard defensivo.
- **PDF interno**: tokens HMAC curtos (TTL 60s) escopo por `stage` — o Chromium headless autentica no `?print=true` sem cookie de sessão.

---

## Endpoints principais

| Endpoint | Método | Função |
|---|---|---|
| `/api/adm/[id]` | GET | Painel master: projeto + outputs + formulários + respondentes + CIS |
| `/api/adm/projetos` | GET/POST | Listagem e criação de projetos |
| `/api/projetos/[id]` | GET/DELETE | Projeto individual (cascade delete) |
| `/api/projetos/[id]/responsavel` | PATCH | Atualiza responsável |
| `/api/projetos/[id]/preview-check` | GET | FIX.2 — admin preview de formulário |
| `/api/engine/run` | POST | Dispara `Pipeline.runAgent(projetoId, agentNum, modelKey)` |
| `/api/engine/checkpoint` | POST | Aprova checkpoint |
| `/api/outputs/delete` | GET/POST | GET: preview de cascata. POST: exclui com `confirmar_cascata: true` (FIX.4) |
| `/api/outputs/[projetoId]/[stage]/pdf` | GET | **PDF editorial** por agente (Playwright — TASK 4.3) |
| `/api/outputs/[projetoId]/deliverable/pdf` | GET | **PDF consolidado** 7 partes (TASK 4.4) |
| `/api/formularios` | POST | Salva resposta; hook calcula `maturidade_360` em `intake_socios` |
| `/api/respondentes` | GET/POST/PUT/DELETE | CRUD (POST com split insert/update — token imutável) |
| `/api/respondentes/by-token` | GET | Token lookup (410 se expirado) |
| `/api/convites/enviar` | POST | Convite individual |
| `/api/convites/enviar-batch` | POST | Lote — auto-renova token expirado |
| `/api/convites/form-link` | POST | Send single — auto-renova |
| `/api/cis/participantes` | GET/POST/DELETE | CRUD participantes DISC |
| `/api/cis/salvar` | POST | Grava resposta DISC via token |
| `/api/relatorio/gerar` | GET | PDF individual DISC (jsPDF legado) |
| `/api/email-templates` | GET/POST | Templates por projeto × papel |

---

## Frontend — rotas principais

- `/login` — e-mail/senha
- `/register` — via token de convite
- `/dashboard` — home do usuário não-master
- `/dashboard/projetos/[id]` — visão simplificada pro cliente
- `/adm` — painel gerencial (master)
- `/adm/[id]` — painel de controle: orquestrador, respondentes, formulários, DISC, outputs (com modal de cascata em exclusão)
- `/adm/[id]/outputs/[stage]` — **página editorial do output** (TASK 4.2) com sidebar de navegação + render Markdown + visualizações inline
- `/adm/[id]/deliverable` — **entregável final consolidado** (TASK 4.4): capa A4 + TOC + 8 partes; botão "📘 Baixar PDF consolidado"
- `/form/socios`, `/form/colaboradores`, `/form/clientes`, `/form/posicionamento`, `/form/intake` — formulários públicos (token OU `?projeto={id}&preview=true` pra admin)
- `/dev/visualizations-catalog` — galeria dev-only dos 5 componentes VIZ com 21 cenários

---

## Design system

`styles/globals.css` centraliza:

- Paleta oficial (3 azuis, 3 vermelhos/rosa, 1 cinza, 1 branco) — `@theme` do Tailwind v4 + variáveis CSS tradicionais
- Tokens editoriais (FIX.5): `--accent-purple: #A78BFA`, `--accent-green: #10B981`
- Tokens VIZ: `--viz-success`, `--viz-warning`, `--viz-critical`, `--viz-card-bg/text/border/shadow`
- Classes `.output-prose` para a página editorial do output (tipografia Andada Pro body + Rebrand Dis headings)
- Classes do entregável: `.deliverable-root`, `.deliverable-cover`, `.part-header`, `.subpart`, `.manifesto-section` (serif + margens largas), `.como-lemos`, `.creditos-grid`
- `@media print`: `@page` A4 com numeração no rodapé, `.screen-only`/`.print-only`, `page-break-*` rules

Ícones via `components/Icon.js` (Lucide SVG inline).

---

## Persistência e cascata (FIX.4)

- Apagar um `projeto` apaga tudo relacionado (outputs, formulários, respondentes, CIS, logs, checkpoints, intake_data, opt_ins) via FK cascade.
- Apagar um `output` (Danger Zone):
  1. `GET /api/outputs/delete?projetoId=...&agentNum=N` → preview de cascata com lista de dependentes transitivos
  2. Modal na UI: se `≥ 3` outputs afetados, exige digitar "confirmar"
  3. `POST /api/outputs/delete` com `confirmar_cascata: true` → apaga alvo + dependentes em uma transação
  4. `etapa_atual` recalculado via `ultimaEtapaConsecutiva()` (última etapa SEM gaps, não max)
- `Pipeline.runAgent` valida dependências antes de executar (erro explícito se input obrigatório ausente).
- Apagar `respondente` NÃO apaga sua resposta em `formularios` (separação intencional — evidência preservada).

---

## Variáveis de ambiente

| Variável | Onde é usada |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client + SSR |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client |
| `SUPABASE_SERVICE_ROLE_KEY` | server (bypass RLS) |
| `SUPABASE_ACCESS_TOKEN` | local — Management API para migrations (`scripts/run-migration.mjs`) |
| `GEMINI_API_KEY` | AIRouter · Gemini |
| `ANTHROPIC_API_KEY` | AIRouter · Claude + deep research do Agente 5 |
| `OPENAI_API_KEY` | AIRouter · GPT-4o (opcional) |
| `TAVILY_API_KEY` | Tavily Extract (Agente 5) |
| `RESEND_API_KEY` | emails transacionais |
| `RESEND_FROM_EMAIL` | remetente |
| `NEXT_PUBLIC_SITE_URL` | base URL para links em emails |
| `PDF_EXPORT_SECRET` | opcional — HMAC secret para tokens de PDF. Se ausente, cai em `SUPABASE_SERVICE_ROLE_KEY` |

---

## Deploy

- **GitHub**: `appbergamini/espansione-web`, branch `master`
- **Vercel**: projeto `appbergamini` (linked via `.vercel/project.json`)
- **Plano**: **Pro** (necessário para `memory: 3009 MB` no endpoint de PDF consolidado).
- **Auto-deploy** via integração GitHub→Vercel funciona, mas em caso de commit não refletido: `vercel deploy --prod --yes`.
- Workflow de branches: trabalho em `feat/bloco-X-task-Y` ou `fix/NN-slug` → PR → merge em master → deploy. Pushes diretos a `master` são permitidos apenas para chores pequenos (gitignore etc).

---

## Convenções do código

- Server side **nunca** usa `supabaseClient` (anon) — sempre `supabaseAdmin`.
- Todo endpoint API valida permissão (master / mesma empresa / responsável) após `getServerUser` — ou usa `verificarSessaoAdmin`.
- IDs de respondente nunca são expostos ao público — token é o identificador único.
- Outputs dos agentes guardam o envelope Markdown completo em `conteudo` — a página editorial, o PDF e o entregável consolidado derivam a renderização a partir daí.
- Nenhum agente inventa evidência — políticas anti-invenção explícitas nos prompts (especialmente Agente 5 com 10 regras de dados).
- `lib/agents/catalog.js` é a **fonte única** para metadados de agentes. Zero hardcode de `13` ou `15` em UI — sempre via `TOTAL_AGENTES_NAO_MODULARES` e afins.
- `AGENT_CONFIGS` em `pipeline.js` e `CATALOGO_AGENTES` em `catalog.js` são mantidos em sync manualmente (inputs + stage + checkpoint + nome). Comentários em ambos os arquivos alertam.

---

## Scripts locais (não commitados)

- `scripts/run-migration.mjs` — roda SQL arbitrário via Supabase Management API (usa `SUPABASE_ACCESS_TOKEN`)
- `scripts/seed-gsim-parte*.mjs` — planta projeto-teste GSIM (empresa + sócios + colaboradores + clientes + entrevistas + 360°)
- `scripts/cleanup-gsim.mjs` — remove projeto-teste (dry-run default; `--yes-wipe-gsim` executa)

Todos em `.gitignore` — ferramentas locais, não código de produção.
