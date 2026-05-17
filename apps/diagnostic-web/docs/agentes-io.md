# Agentes — Inputs & Outputs

Referência canônica de **o que cada um dos 15 agentes consome e produz**. Fonte-verdade: `lib/agents/catalog.js` (`CATALOGO_AGENTES`), `lib/ai/pipeline.js` (`AGENT_CONFIGS`, `AGENT_FORM_TYPES`, `AGENTS_WITH_CIS`, `buildForAgent`) e cada `lib/agents/Agent_NN_*.js` (`getSystemPrompt`/`getUserPrompt`/`enrichContext`/`parseOutput`). Espelho do código — se divergir do código, o **código vence**. Visão de arquitetura geral em [`arquitetura.md`](./arquitetura.md).

---

## 1. Modelo de contexto (input comum a todo agente)

`Pipeline.runAgent → buildForAgent(projetoId, agentNum)` monta um objeto `context` **idêntico em estrutura** para todos os agentes; o que muda é o que vem preenchido:

| Campo | Origem | Quando vem preenchido |
|---|---|---|
| `projeto` | `db.getProject` | sempre |
| `intake` | `db.getIntake` | sempre |
| `previousOutputs` | `db.getOutputs(projetoId, inputs)` | quando `AGENT_CONFIGS[n].inputs` ≠ [] |
| `formularios` | `db.getFormularios` filtrado por `AGENT_FORM_TYPES[n]` | só os tipos que o agente declara |
| `cisAssessments` | `db.getCisAssessmentsByProjeto` | só agentes 1, 2, 6 (`AGENTS_WITH_CIS`) |
| `clustersComunicacao` | `clusters_comunicacao` (ativo=true) | só Agente 13 (FIX.29/33) |
| `curatedBlocks` | `analysis_blocks` (incluir_no_relatorio + status aprovado/editado/validado_cliente) | só Agente 15 (FIX.24) |
| `_agentInputs` | cópia de `inputs` | sempre |
| campos de `enrichContext` | hook do próprio agente | só agentes 5 e 15 |

**Validação dura (FIX.4):** antes de montar contexto, `podeExecutar()` exige que todos os `inputs` obrigatórios já tenham output salvo (descontando `inputs_opcionais`). Falta → erro explícito, agente não roda. Checkpoint pendente bloqueia qualquer agente de número maior que o que criou o checkpoint.

**Injeção de outputs anteriores:** se o agente **não** declara `consumesContextInUserPrompt`, o `buildForAgent` empurra `resumo_executivo + conteudo + conclusoes` de cada input no *system prompt*. Se declara (FIX.12 — caso da maioria dos agentes 7–15), o próprio `getUserPrompt` injeta o que precisa (evita duplicar 40–60k tokens).

---

## 2. Envelope de saída (output comum a todo agente)

Todo agente devolve texto que `parseOutput(rawText)` decompõe no envelope:

```xml
<resumo_executivo> 2–5 frases </resumo_executivo>
<conteudo> Markdown (estrutura específica por agente; pode conter markers <!-- VIZ:tipo:param -->) </conteudo>
<conclusoes> ... </conclusoes>
<confianca> Alta | Media | Baixa </confianca>
<fontes> ... </fontes>   <!-- opcional -->
<gaps> ... </gaps>       <!-- opcional -->
```

Pós-processamento (`Pipeline.runAgent`):
- `findings_json` é extraído do raw via `parseFindingsFromRaw` (FIX.24); se ausente/ inválido, cai no parser heurístico do markdown.
- Persistência: `outputs` (envelope), `logs_execucao` (tokens, modelo, status), `analysis_blocks` via `materializarFindings` (insumo da curadoria), `status`/`etapa_atual` do projeto.
- Se `AGENT_CONFIGS[n].checkpoint` ≠ null → cria checkpoint pendente (bloqueia agentes posteriores até aprovação).

Convenções de `<conteudo>`:
- **Agentes de síntese (2, 4, 6):** dois documentos — `# PARTE A — … ANALÍTICO` e `# PARTE B — DEVOLUTIVA`, separados por `---`.
- **Sem HTML inline** (FIX.14) e **com `findings_json`** (FIX.24) — regras injetadas via `_anaCoutoKB`.

---

## 3. Tabela-resumo

| # | Agente (nome exibição) | `key` | Stage | Formulários | Outputs consumidos | CKPT | Modular |
|---|---|---|---|---|---|---|---|
| 1 | Roteiros VI — Entrevistas Internas | `roteiros_vi` | pre_diagnostico | intake_socios, intake_colaboradores, posicionamento_estrategico · **CIS** | — | — | — |
| 2 | Consolidado da Visão Interna (VI) | `consolidado_vi` | diagnostico_interno | intake_socios, intake_colaboradores, entrevista_socios, entrevista_colaboradores, posicionamento_estrategico · **CIS** | 1 | — | — |
| 3 | Roteiros VE — Entrevistas Cliente | `roteiros_ve` | diagnostico_externo | intake_clientes | 2 | — | — |
| 4 | Consolidado da Visão Externa (VE) | `consolidado_ve` | diagnostico_externo | intake_clientes, entrevista_cliente | 3 | — | — |
| 5 | Visão de Mercado (VM) | `visao_mercado` | diagnostico_externo | intake_socios | — | — | — |
| 6 | Decodificação e Direcionamento Estratégico | `decodificacao` | sintese | posicionamento_estrategico · **CIS** | 2, 4, 5 | **1** | — |
| 7 | Valores e Atributos | `valores_atributos` | estrategia | — | 6 | — | — |
| 8 | Diretrizes Estratégicas | `diretrizes` | estrategia | — | 6, 7 | — | — |
| 9 | Plataforma de Branding | `plataforma_marca` | estrategia | — | 6, 7, 8 | **2** | — |
| 10 | Identidade Verbal (UVV) | `identidade_verbal` | visual_verbal | — | 6, 9 | — | — |
| 11 | One Page de Personalidade (Visual) | `one_page_visual` | visual_verbal | — | 6, 9, 10 | **3** | — |
| 12 | One Page de Experiência | `one_page_experiencia` | cx | — | 6, 9 | — | — |
| 13 | Plano de Comunicação — A Marca Fala | `comunicacao` | comunicacao | intake_socios · **clusters_comunicacao** | 6, 7, 8, 9, 10, 11, 12 | **4** | — |
| 14 | Plataforma de Marca Empregadora (EVP) | `evp` | marca_empregadora | intake_colaboradores, entrevista_colaboradores | 2, 6, 7, 9 | — | **sim** |
| 15 | Consolidador Editorial do Entregável Final | `editorial` | encerramento | intake_socios · **curatedBlocks** | 2,4,5,6,7,8,9,10,11,12,13,**14\*** | — | — |

`*` Output 14 é `inputs_opcionais` do 15 — projetos sem escopo EVP rodam o 15 normalmente; a seção EVP é ignorada.

---

## 4. Detalhe por agente

### Agente 1 — Roteiros VI · Entrevistas Internas (`pre_diagnostico`)
- **Inputs:** formulários `intake_socios`, `intake_colaboradores`, `posicionamento_estrategico`; `cisAssessments` (perfis comportamentais DISC/Jung). Sem outputs anteriores (primeiro do pipeline).
- **Output `<conteudo>`:** roteiros de entrevista internos organizados por blocos `### 1.1 {tema}` (temas a aprofundar), `### 2.1 {tensão}` (tensões a explorar), `### 3.1 {hipótese a validar}`. Prepara a escuta qualitativa dos sócios/colaboradores.

### Agente 2 — Consolidado da Visão Interna (VI) (`diagnostico_interno`)
- **Inputs:** Output **1**; formulários `intake_socios`, `intake_colaboradores`, `entrevista_socios`, `entrevista_colaboradores`, `posicionamento_estrategico`; `cisAssessments`.
- **Output:** síntese **PARTE A (ANALÍTICO)** + **PARTE B (DEVOLUTIVA)**. Seções: sumário analítico, metodologia/insumos, **cultura comportamental do time (CIS 5 dimensões)** com perfis individuais dos sócios, dinâmica da sociedade, retrato em 3 camadas (negócio é / marca é / comunicação fala) + Maturidade 360°, cultura vivida sócios×colaboradores, posicionamento aspiracional×real, ambição×capacidade, tensões críticas, **IDA da VI** (Impulsionadores/Detratores/Aceleradores).
- **Markers de visualização** (linha própria, sem indentação): `<!-- VIZ:radar_disc_socio:{slug} -->` por sócio; e quando cobertura CIS ≥ 70%: `radar_disc_time`, `barras_jung_time`, `heatmap_competencias_time`, `badge_estilo_lideranca`; quando 360° ≥ 80%: `radar_maturidade_360`.

### Agente 3 — Roteiros VE · Entrevistas Cliente (`diagnostico_externo`)
- **Inputs:** Output **2**; formulário `intake_clientes`.
- **Output:** `## 1. Ambiguidades e hipóteses a validar`, `## 2. Priorização de entrevistas`, `## 3. Roteiros individualizados` (`### 3.1 {nome do cliente}`). Roteiros para a escuta de clientes.

### Agente 4 — Consolidado da Visão Externa (VE) (`diagnostico_externo`)
- **Inputs:** Output **3**; formulários `intake_clientes`, `entrevista_cliente`.
- **Output:** **PARTE A + PARTE B**. Seções: sumário analítico, metodologia, perfil da amostra, subsegmentação do ICP, a marca na percepção do ICP (primeiro contato / experiência atual / fortes / fracos com evidência), percepção declarada × história contada, **Marca Atual × Marca Ideal** (desenhos da marca ideal, matriz de gap, territórios de oportunidade), marca × categoria, posição competitiva. PARTE A e B dentro de `<conteudo>` separadas por `---`.

### Agente 5 — Visão de Mercado (VM) (`diagnostico_externo`)
- **Inputs:** formulário `intake_socios`. **`enrichContext`** roda deep research: Claude `web_search` + Tavily Extract sobre concorrentes/categoria (por isso `preferredModel: claude-opus-4-7`; `consumesContextInUserPrompt`). Sem outputs anteriores.
- **Output:** `## 1. Panorama de categoria e estrutura de mercado`, `## 2. Fichas de concorrentes` (2.1 listados pelo cliente / 2.2 descobertos via research), `## 3. Mapa de territórios`, `## 4. Tendências e sinais fracos`, `## 5. IDA da VM` (Impulsionadores/Detratores/Aceleradores de Mercado). `<fontes>` com URLs capturadas.

### Agente 6 — Decodificação e Direcionamento Estratégico (`sintese`) · **CKPT 1**
- **Inputs:** Outputs **2, 4, 5** (as três lentes VI/VE/VM); formulário `posicionamento_estrategico`; `cisAssessments`. `preferredMaxTokens: 12000`.
- **Output:** **PARTE A (ANALÍTICO) + PARTE B (DEVOLUTIVA)**. Sumário estratégico, metodologia de integração, **mapa de convergência entre lentes**, **IDA consolidado** (Impulsionadores/Detratores/Aceleradores com código de lentes + leitura DISC), **Divergências Críticas** classificadas (cultural/estratégica/comunicacional/operacional), **Escolhas Estratégicas Pendentes** (entrega as 2 rotas mutuamente excludentes — decisão é do cliente, não resolvida pelo agente). Cria **Checkpoint 1** (bloqueia 7+ até aprovação).

### Agente 7 — Valores e Atributos (`estrategia`)
- **Inputs:** Output **6** (injetado no user prompt — `consumesContextInUserPrompt`).
- **Output:** `## VALORES` (3–5, específicos, verbo de ação + manifestação prática), `## ATRIBUTOS DE PERSONALIDADE` (≈4 adjetivos que se contrastam/complementam), `## COERÊNCIA COM O DIAGNÓSTICO`. Primeiras peças da Plataforma.

### Agente 8 — Diretrizes Estratégicas (`estrategia`)
- **Inputs:** Outputs **6, 7**.
- **Output:** `## DIRETRIZ 01 — [Título]`, `## DIRETRIZ 02 — [Título]`, … e `## COMO ESTAS DIRETRIZES SE REFORÇAM`. Endereça as divergências do Agente 6.

### Agente 9 — Plataforma de Branding (`estrategia`) · **CKPT 2**
- **Inputs:** Outputs **6, 7, 8**.
- **Output:** estrutura de 3 colunas — `## COLUNA 1 — MARCA É` (PROPÓSITO, ARQUÉTIPO, ATRIBUTOS, VALORES), `## COLUNA 2 — NEGÓCIO FAZ` (DIRECIONADORES DE EXPERIÊNCIA), `## COLUNA 3 — COMUNICAÇÃO FALA` (DISCURSO DE POSICIONAMENTO, TAGLINE), `## ATUAÇÃO NAS 3 ONDAS DO BRANDING`. Cria **Checkpoint 2**.

### Agente 10 — Identidade Verbal — UVV (`visual_verbal`)
- **Inputs:** Outputs **6, 9**.
- **Output:** `## TONS DE VOZ` (`### TOM n`), `## TERRITÓRIOS DE PALAVRAS` (`### TERRITÓRIO n`), `## PALAVRAS E EXPRESSÕES PROIBIDAS`, `## CONVENÇÕES DE NAMING` (se aplicável).

### Agente 11 — One Page de Personalidade · Visual (`visual_verbal`) · **CKPT 3**
- **Inputs:** Outputs **6, 9, 10**.
- **Output:** `## MANTER / PERDER / GANHAR`, `## SÍMBOLO (LOGO)`, `## COR`, `## FORMA`, `## TIPOGRAFIA`, `## FOTOGRAFIA`, `## ILUSTRAÇÃO`, `## ICONOGRAFIA`, `## COMPORTAMENTO VISUAL`, `## AVALIAÇÃO RDPC`, `## MOODBOARD SUGERIDO`. Alimenta as visualizações de identidade (paleta, tipografia, símbolo). Cria **Checkpoint 3**.

### Agente 12 — One Page de Experiência (`cx`)
- **Inputs:** Outputs **6, 9**.
- **Output:** `## PROPÓSITO E DIRECIONADORES`, `## PERSONAS (2 a 4)` (`### PERSONA n — nome, idade, contexto`), `## JORNADA IDEAL` (1. Conhecimento, 2. Compra, 3. Uso, 4. Fidelização), `## BRAND MOMENTS` (`### BRAND MOMENT n`), `## COERÊNCIA COM AS 3 ONDAS`.

### Agente 13 — Plano de Comunicação · A Marca Fala (`comunicacao`) · **CKPT 4**
- **Inputs:** Outputs **6, 7, 8, 9, 10, 11, 12**; formulário `intake_socios` (canais ativos, orçamento, equipe, objetivos 12m — FIX.29); **`clustersComunicacao`** = clusters formais `ativo=true` selecionados pelo consultor no painel (FIX.33).
- **Output:** `## 1. Atemporal`, `## 2. Clusters (Médio/Longo)`, `## 3. Diferenciais`, `## 4. Atuação no contexto`, `## 5. Narrativa de marca`, `## 6. Ondas do Branding` (Onda 1 Produto / Onda 2 Pessoas / Onda 3 Propósito), `## 7. Plano de conexões` (mídia paga/própria/espontânea), `## 8. Plano de ação integrado` (12 meses, por trimestre, 3 ondas). Cria **Checkpoint 4** (último antes do editorial).

### Agente 14 — Plataforma de Marca Empregadora · EVP (`marca_empregadora`) · **MODULAR**
- **Inputs:** Outputs **2, 6, 7, 9**; formulários `intake_colaboradores`, `entrevista_colaboradores`. Só roda se o projeto contratou escopo EVP (`modular: true` — UI decide se exibe o botão; aprovação acompanha o CKPT 4, sem checkpoint próprio).
- **Output:** `# PLATAFORMA DE MARCA EMPREGADORA (EVP)` com: 1. Diagnóstico atual (cultura percebida, pilares fortes/frágeis, incoerências discurso×realidade, risco de dependência), 2. Promessa ao colaborador (EVP Statement + manifesto), 3. Pilares da EVP, 4. Jornada do colaborador (atração→saída), 5. Discurso interno×externo, 6. Gap atual→futuro, 7. Perfil ideal de contratação, 8. Compatibilidade com posicionamento externo (Agente 9). Cada pilar ancorado em evidência do `intake_colaboradores`.

### Agente 15 — Consolidador Editorial do Entregável Final (`encerramento`)
- **Inputs:** resumo_executivo + conclusões de **2,4,5,6,7,8,9,10,11,12,13** e **14** (opcional); `curatedBlocks` (blocos `analysis_blocks` aprovados/editados/validados marcados p/ relatório — FIX.24); **`enrichContext`** extrai do `intake_socios` o nome do sócio-fundador (destinatário da carta) e o período da escuta. Roda só após CKPT 4 aprovado.
- **Output:** `# CARTA DE ABERTURA E SUMÁRIO EXECUTIVO` — **Carta de Abertura** (350–450 palavras, gesto pessoal → convite; Parte 0.2 do entregável) e **Sumário Executivo** (450–600 palavras: desafio central, 3 achados-chave, 3 direcionamentos, convite à próxima fase; Parte 0.3). Não introduz estratégia nova; limite total 1500 palavras. Não cria checkpoint.

---

## 5. Grafo de dependências e ordem

Stages (ordem de execução, `STAGES` em `pipeline.js`):

```
pre_diagnostico(1) → diagnostico_interno(2) → diagnostico_externo(3,4,5)
→ sintese(6 ▸CKPT1) → estrategia(7,8,9 ▸CKPT2)
→ visual_verbal(10,11 ▸CKPT3) → cx(12) → comunicacao(13 ▸CKPT4)
→ marca_empregadora(14, modular) → encerramento(15)
```

- **6** é o pivô: tudo de estratégia em diante (7–15) depende dele direta ou transitivamente.
- Helpers do grafo (`catalog.js`): `getDependentes(n)` (fecho transitivo — usado antes de apagar output, análise de cascata FIX.4), `getPrimeiroFaltante` (detecta buracos na esteira), `podeExecutar` (gate de dependências obrigatórias), `calcularProgresso` (modular entra no denominador só se `incluiEvp`).
- Apagar um output dispara recomputação em cascata de todos os `getDependentes` — ver `lib/deliverable/esteiraHelpers.js`.

> Ao adicionar/remover/alterar I/O de agente: editar `catalog.js` **e** `AGENT_CONFIGS`/`AGENT_FORM_TYPES` em `pipeline.js` **e** este documento. São espelhos manuais — não há geração automática.
