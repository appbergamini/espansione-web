# Modelos de IA — usos e mapeamento

Referência canônica de **quais modelos de IA o sistema usa e onde**. Espelho do
código; se divergir, o **código vence**. Fontes-verdade citadas em cada seção.

Última revisão: **2026-06-05**.

---

## 1. Provedores e chaves

| Provedor | Env var | Usado para |
|---|---|---|
| Google (Gemini) | `GEMINI_API_KEY` | esteira dos agentes, agência, clusters, fallback da entrevista |
| Anthropic (Claude) | `ANTHROPIC_API_KEY` | deep research (Ag5), Brand Memory (Ag16), entrevista (primário), agência |
| OpenAI | `OPENAI_API_KEY` | Whisper (transcrição de voz), GPT Image (imagem da agência), agência |
| Tavily | `TAVILY_API_KEY` | Extract/Search no deep research do Agente 5 (não é LLM) |

**Estado de billing (2026-06-05, pode mudar):**
- **Gemini**: BLOQUEADO. A API retorna 429 e o ListModels 403 `PERMISSION_DENIED` — *"Lightning dunning decision is deny for project: projects/112845730761"*. O projeto Google Cloud dono dessa chave está **suspenso por inadimplência**. Nenhuma chamada Gemini funciona até regularizar o pagamento desse projeto (ou usar chave de outro projeto saudável).
- **OpenAI**: OK. Chave corrigida (`sk-proj…`) no `.env.local` e na Vercel (estava com uma chave Anthropic).
- **Anthropic**: OK (com saldo).

---

## 2. Catálogo de modelos (`AIRouter.MODELS`)

Fonte: `lib/ai/router.js`. O `modelKey` é o apelido usado no código; resolve para o `id` real + provedor.

| `modelKey` | `id` real | Provedor |
|---|---|---|
| `gemini-flash` | `gemini-3.5-flash` | Google |
| `gemini-pro` | `gemini-3.1-pro-preview` | Google |
| `claude-opus-4-7` | `claude-opus-4-7` | Anthropic |
| `claude-sonnet` | `claude-sonnet-4-6` | Anthropic |
| `claude-haiku-4-5-20251001` | `claude-haiku-4-5-20251001` | Anthropic |
| `gpt-5.4` | `gpt-5.4` | OpenAI |
| `gpt-5.4-mini` | `gpt-5.4-mini` | OpenAI |

`MODEL_DEFAULT` (fallback final quando nada é escolhido): **`gemini-3.5-flash`**.

Modelos fora desse catálogo (chamados direto, não via `AIRouter`):
- **`whisper-1`** (OpenAI) — transcrição de áudio (entrevista). Fonte: `pages/api/entrevista/transcribe.js`.
- **`gpt-image-2-2026-04-21`** (OpenAI) — geração de imagem da Agência. Fonte: `lib/agency/imageGeneration.js`.
- **Web Speech API** (navegador, sem chave/custo) — transcrição de voz no browser (entrevista). Fonte: `pages/entrevista/[token].js`.

---

## 3. Fase 1 — Esteira dos 15 agentes

Fonte: `lib/ai/pipeline.js` (`runAgent`), `lib/agents/Agent_*.js`.

**Como o modelo é escolhido** (`pipeline.js`): `modelKey` escolhido pelo usuário no seletor → senão `agent.preferredModel` → senão `MODEL_DEFAULT` (`gemini-3.5-flash`).

**Seletor de modelo do painel** (modal do orquestrador, `pages/adm/[id].js`):

| Opção | `modelKey` | Provedor |
|---|---|---|
| Gemini Flash — "Rápido e econômico" | `gemini-flash` (`gemini-3.5-flash`) | Google |
| Gemini Pro — "Mais completo" | `gemini-pro` | Google |
| Claude Opus 4.7 — "Máxima capacidade · web search" | `claude-opus-4-7` | Anthropic |
| Claude Sonnet 4.6 — "Equilibrado" | `claude-sonnet` | Anthropic |
| GPT-5.4 — "Alta capacidade" | `gpt-5.4` | OpenAI |
| GPT-5.4 Mini — "Rápido e econômico" | `gpt-5.4-mini` | OpenAI |

**Overrides fixos por agente:**

| Agente | `preferredModel` | Observação |
|---|---|---|
| **5 — Visão de Mercado** | `claude-opus-4-7` | deep research via Claude `web_search_20250305` (max_uses 18) + Tavily Extract. Fonte: `Agent_05_BuscaWeb.js`, `lib/ai/deepResearch.js` |
| **6 — Decodificação** | — (usuário escolhe) | `preferredMaxTokens: 12000`. Fonte: `Agent_06_VisaoGeral.js` |
| **16 — Coletor Brand Memory** | `claude-haiku-4-5-20251001` | extração pura, baixo custo. Fonte: `Agent_16_BrandMemoryExport.js` |
| 1, 2, 3, 4, 7–15 | — | sem override; usam o modelo do seletor (ou o default `gemini-3.5-flash`) |

---

## 4. Outros usos na Fase 1 (relatórios / clusters)

Fonte: `pages/api/relatorio/team-narratives.js`, `pages/api/clusters/gerar-lean.js`.

- **Narrativas de time** e **clusters de comunicação (lean)**: o `modelKey` vem do seletor do cliente. Sem modelo fixo.
- `lib/relatorio/narrativeGenerator.js` (caminho legado) chama `gemini-3.5-flash` direto.

---

## 5. Fase 2 — Agência de marketing

Fonte: `packages/agents/src/model-registry.ts`, `lib/agency/modelGateway.js`.

- **Modelo default da agência** (`modelGateway.js`): `gemini-flash` (`gemini-3.5-flash`), override via env `AGENCY_MODEL_KEY`.
- **Modelos registrados** (`model-registry.ts`): `mock-model` (mock), `gemini-3.5-flash` (econômico), `gpt-5.4`, `claude-sonnet-4-6`.
- **Modelo por step** (`DEFAULT_AGENT_MODEL`), no modo "use_agent_defaults":

| Step da agência | Modelo |
|---|---|
| `account_director` | `gpt-5.4` |
| `copywriter` | `claude-sonnet-4-6` |
| `channel_adapter` | `gemini-3.5-flash` |
| `visual_director` | `gpt-5.4` |
| `editor` | `claude-sonnet-4-6` |
| `brand_compliance` | `gpt-5.4` |
| `approver` | `gpt-5.4` |

- **Imagem da peça aprovada**: `gpt-image-2-2026-04-21` (OpenAI). Fonte: `lib/agency/imageGeneration.js`.
- Modos (`getDefaultAIExecutionMode`): `mock`, `economical` (`gemini-3.5-flash`), `use_agent_defaults`, `use_single_model_for_run`, `override_single_agent`.

---

## 6. Entrevista guiada por IA

Fonte: `pages/api/entrevista/*`, `lib/ai/entrevistaModel.js`, `pages/entrevista/[token].js`.

| Uso | Modelo | Provedor | Arquivo |
|---|---|---|---|
| Extrair perguntas do roteiro | **`claude-sonnet`** (primário) → `gemini-flash`/3.5 (fallback) | Anthropic / Google | `entrevistaModel.js`, `questions.js` |
| Follow-up + anti-repetição | **`claude-sonnet`** (primário) → `gemini-flash`/3.5 (fallback) | Anthropic / Google | `entrevistaModel.js`, `analyze.js` |
| Transcrição de voz (gravação) | **`whisper-1`** (idioma `pt`) | OpenAI | `transcribe.js` |
| Transcrição de voz (ao vivo) | **Web Speech API** (navegador, grátis) | — | `[token].js` |

> Primário = Claude Sonnet (qualidade na destilação das 6 perguntas e nos follow-ups). Fallback = Gemini Flash 3.5 (mais barato), útil quando o projeto Gemini estiver com saldo. **Claude Haiku foi desconsiderado** nesta camada.

---

## 7. Resumo por provedor

- **Anthropic (Claude):** Ag5 deep research (Opus 4.7), Ag16 Brand Memory (Haiku), entrevista questions/analyze (**Sonnet**), agência copywriter/editor (Sonnet 4.6), opções do seletor (Opus/Sonnet).
- **Google (Gemini):** default da esteira (Flash 3.5), default da agência (Flash 3.5), agência channel_adapter (Flash 3.5), fallback da entrevista (Flash 3.5), opções do seletor (Flash/Pro). **Atualmente bloqueado por billing.**
- **OpenAI:** Whisper (voz), GPT Image (imagem), agência account_director/visual_director/brand_compliance/approver (GPT-5.4), opções do seletor (GPT-5.4/Mini).
- **Tavily:** Extract/Search no deep research do Ag5 (não-LLM).
- **Navegador:** Web Speech API na voz da entrevista (sem custo).

> **Único modelo Haiku restante:** Agente 16 (Brand Memory). Se a diretriz "desconsiderar Haiku" valer também para o pipeline, trocar `preferredModel` em `Agent_16_BrandMemoryExport.js`.

---

## 8. Onde mexer

- Catálogo `modelKey → id/provider`: `lib/ai/router.js` (`MODELS`).
- Modelo por agente da esteira: `preferredModel` em `lib/agents/Agent_*.js`.
- Opções do seletor do painel: `pages/adm/[id].js`.
- Modelo da entrevista: `lib/ai/entrevistaModel.js` (`PRIMARY`/`FALLBACK`).
- Modelos da agência: `packages/agents/src/model-registry.ts` + `lib/agency/modelGateway.js`.
- Modelo de imagem: `lib/agency/imageGeneration.js`.
- Modelo de transcrição: `pages/api/entrevista/transcribe.js`.
