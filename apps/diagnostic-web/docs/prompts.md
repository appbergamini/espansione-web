# Prompts — Referência dos 15 Agentes

Resumo estruturado dos system prompts usados pelo pipeline. O prompt COMPLETO de cada agente mora no arquivo fonte correspondente — este documento é a lente curada.

**Fonte única** de metadados de agentes: `lib/agents/catalog.js` (FIX.3) — inclui `inputs[]`, `inputs_opcionais[]`, `checkpoint`, `modular`.

**Fontes compartilhadas** (todos os agentes importam daqui):

- `lib/agents/_anaCoutoKB.js` — constantes do método: `AC_MOMENTO`, `AC_TRIPLICE`, `AC_INVESTIGACAO_SIMULTANEA`, `AC_RDPC`, `AC_ONDAS`, `AC_DE_PARA`, `AC_DIRETRIZES`, `AC_PLATAFORMA`, `AC_ARQUETIPOS`, `AC_ONE_PAGE_PERSONALIDADE`, `AC_ONE_PAGE_EXPERIENCIA`, `AC_COMUNICACAO`, `AC_PRINCIPIOS`, `PORTER_ESTRATEGIA`.

---

## Envelope padrão de saída

Todos os agentes retornam markdown dentro de tags XML:

```xml
<resumo_executivo>3–5 frases para sumário no topo da UI</resumo_executivo>
<conteudo>
# ... markdown completo, opcionalmente com markers VIZ ...
</conteudo>
<conclusoes>
- Takeaway 1
- Takeaway 2
- Takeaway 3
</conclusoes>
<confianca>Alta|Media|Baixa</confianca>
<!-- Agente 5 adiciona <fontes> -->
```

Agentes de síntese (**2, 4, 6**) entregam DOIS documentos dentro do mesmo `<conteudo>`, separados por `---`:
- `# PARTE A — ... ANALÍTICO` (denso, técnico)
- `# PARTE B — ... DEVOLUTIVA` (curada, para sócios)

Agente **5** entrega 4 artefatos (fichas de concorrentes, panorama de categoria, tendências, IDA+hipóteses).

Agente **15** entrega 2 artefatos (Carta de Abertura + Sumário Executivo) — ambos RASCUNHO editorial para refino manual.

### Markers de visualização (TASK 3.1.1)

Agente 2 emite markers inline em `<conteudo>`:
- `<!-- VIZ:radar_disc_socio:{slug} -->` por sócio com CIS
- `<!-- VIZ:radar_disc_time -->`, `<!-- VIZ:barras_jung_time -->`, `<!-- VIZ:heatmap_competencias_time -->`, `<!-- VIZ:badge_estilo_lideranca -->` (quando cobertura ≥ 70%, ordem fixa)
- `<!-- VIZ:radar_maturidade_360 -->` (quando cobertura 360° ≥ 80%)

Página editorial (TASK 4.2) e entregável consolidado (TASK 4.4) substituem os markers por componentes React de `components/visualizations/*`.

---

## Agente 1 — Roteiros de Entrevista Internos

**Fonte:** `lib/agents/Agent_01_RoteirosInternos.js`
**Spec:** `agente_1_roteiro_entrevista_interna.md`

**Papel:** estrategista de branding sênior, especialista em roteiros de **aprofundamento** (não de descoberta). Toda pergunta é ancorada em evidência do input.

**Inputs:** `intake_socios`, `intake_colaboradores`, `posicionamento_estrategico`, DISC.

**Modos:**
- MODO A — Sócio individual (45min, Bloco 6 de posicionamento)
- MODO B — Colaborador identificado (30min, só com consentimento)
- MODO C — Cluster de colaboradores (45–60min, anônimo)

**Análise (8 dimensões):** lacunas · contradições internas · contradições cruzadas · hipóteses a validar · zona emocional · cruzamento DISC (sombra por perfil D/I/S/C) · tensionamento do teste de posicionamento · dinâmica de sociedade.

**Entregável:** roteiro nominal por sócio + roteiro por cluster de colaboradores. Cada roteiro com "Como conduzir" (camada de estilo DISC), Abertura, 7 blocos, Fechamento e Anexo de mapeamento.

**10 princípios invioláveis:** nunca pergunta genérica · cite o formulário de volta · respeite o tempo · concreto vence abstrato · não repita o formulário · tensionamento é convite, não acusação · confidencialidade em cluster · uma pergunta por vez · se input for insuficiente, sinalize · anonimato no Modo C.

---

## Agente 2 — Consolidado da Visão Interna (VI)

**Fonte:** `lib/agents/Agent_02_ContextoInterno.js`
**Spec:** `agente_2_consolidado_vi.md`

**Papel:** cartógrafo de tensões. Mesma análise → 2 entregas (analítico + devolutiva).

**Inputs:** todos os formulários de sócios/colaboradores (intake + entrevistas), DISC de todos, posicionamento dos sócios, `maturidade_360` agregado (TASK 3.1), outputs do Agente 1.

**Passo 1 — Análise (8 cruzamentos):**

1. Evidências literais por categoria (ambição, diferenciais, valores declarados × vividos, cultura, propósito, dores, zona emocional).
2. Cruzamento sócios × colaboradores (classificação Alinhado / Parcial / Desalinhado).
3. DISC em 3 níveis (individual, coletivo/sociedade, cultura × aspiração).
4. Posicionamento aspiracional × real — 4 leituras: Declarado=Operado / Aspiracional / Inconsistência / Divergência entre sócios.
5. Ambição × capacidade (visão × pontuação 360°).
6. Tensões e contradições (tipologia: discurso×prática, sócios×colaboradores, sócio×sócio, presente×futuro, marca×cultura, estratégia×estrutura).
7. IDA da VI.
8. Hipóteses direcionais em Negócio / Marca / Comunicação.

**PARTE A (ANALÍTICO):** 10 seções + 3 anexos. **PARTE B (DEVOLUTIVA):** carta de abertura, sumário, leitura de liderança, ativos, leituras-chave, cultura em dois olhares, ambição × ponto de partida, sinalizadores, próximas etapas.

**Markers VIZ emitidos** (TASK 3.1.1):
- Seção 3.1 por sócio: `<!-- VIZ:radar_disc_socio:{slug} -->`
- Seção 3.3 (time) quando cobertura ≥ 70%: 4 markers em ordem fixa
- Seção 4.4 (360°) quando cobertura ≥ 80%: `<!-- VIZ:radar_maturidade_360 -->`
- Omissão explícita quando cobertura abaixo dos thresholds

**15 princípios invioláveis:** mesma análise / evidência literal / anonimato colaboradores / tensão ≠ acusação / DISC como lente (nunca sentença) / executivo sem surpresas negativas / analítico nunca suaviza / direcionais ≠ diretrizes / avise se análise for fraca / consistência entre docs / **[#15]** markers são instruções ao renderizador, não texto para o leitor; emitir APENAS com dados subjacentes nas coberturas mínimas.

---

## Agente 3 — Roteiros de Entrevista com Cliente

**Fonte:** `lib/agents/Agent_03_RoteiroCliente.js`

**Papel:** gera roteiros individualizados (e prioritização) para entrevistas com clientes do ICP, ancorados no consolidado VI e no intake de clientes.

**Inputs:** `intake_clientes`, consolidado VI (output 2).

**Output:** priorização dos clientes (rank 1..N) + roteiro por cliente, com perguntas ancoradas no que o cliente respondeu no intake e no gap vs. percepção dos sócios.

---

## Agente 4 — Consolidado da Visão Externa (VE)

**Fonte:** `lib/agents/Agent_04_ContextoExterno.js`
**Spec:** `agente_4_consolidado_ve.md`

**Papel:** tradutor de percepção — amostra pequena (5–10 clientes ICP), cada voz pesa 1/N, análise artesanal (não estatística).

**Escopo crítico:**
- **Cada voz tem peso** — jamais "70% disseram X"; usar "metade dos entrevistados mencionou X".
- **Lente focada** — revela o que fideliza, encanta, dói e a marca ideal sob ótica do ICP; NÃO revela barreira de entrada, motivos de saída, percepção fria.
- **Marca ideal** é seção estruturante de peso máximo.
- **Não cruzar com VM.**

**Passo 1 — Análise (10 cruzamentos):** evidências literais · subsegmentação dentro do ICP · percepção declarada × história contada (4 classificações) · marca declarada × marca ideal (matriz) · marca × categoria · posição competitiva na cabeça do cliente · quanti com ressalva de N · zona simbólica · IDA da VE · hipóteses direcionais.

**PARTE A (14 seções + 3 anexos).** **PARTE B:** carta + sobre a escuta + quem falou + o que encanta + o que friciona + **a marca que os clientes desenham** + como enxergam a concorrência + sinalizadores + o que esta escuta não alcançou + o que vem a seguir.

**10 princípios:** mesma análise / evidência literal / nunca generalizar para "o mercado" / caveat de amostra / marca ideal estruturante / anonimato (codinomes E1..En) / não cruzar com VM / NPS sempre com contexto / executivo sem surpresas / consistência entre docs.

---

## Agente 5 — Visão de Mercado (VM) · Deep Research

**Fonte:** `lib/agents/Agent_05_BuscaWeb.js`
**Spec:** `agente_5_visao_de_mercado.md`

**Papel:** investigador rigoroso — toda afirmação vem com fonte rastreável + data. Sem fonte, reporta ausência.

**Escopo:** profundidade sobre amplitude (3–4 concorrentes em detalhe). Sem análise visual. NÃO cruza com VI/VE.

**Modelo preferido (`preferredModel`):** `claude-opus-4-7` com ferramenta `web_search_20250305` (max_uses=18) — deep research multi-query em paralelo. Fallback para Gemini não faz web search; agente declara limitação.

**Inputs:** extraídos do `intake_socios`:
- Site oficial (campos `site_instagram`, `site`, `url`)
- Concorrentes — primeiro `p3_concorrentes`, com parser para texto livre

**`enrichContext` dispara DOIS passos:**

1. **`deepResearchViaClaude()`** (`lib/ai/deepResearch.js`) — Claude conduz busca web autônoma cobrindo: marca do projeto, 3-4 concorrentes (oficial + linkedin + movimentos + reviews + imprensa por concorrente), categoria (tamanho + crescimento + estrutura + regulação + movimentos), tendências (consultorias + relatórios + benchmarks adjacentes).

2. **`tavilyExtract()`** (`lib/ai/tavilyExtract.js`) — complemento: captura conteúdo bruto HTML dos top sites dos concorrentes para fortalecer ancoragem factual.

**Política estrita de dados (10 regras invioláveis):** fonte rastreável · confiabilidade classificada (Alta/Média/Baixa) · data aparece · ausência reportada · estimativa só com fonte · linguagem vaga proibida · plural só com pluralidade real · dados em moeda com data+geografia · primário × secundário · dados internacionais com ponte explícita ao Brasil.

**4 artefatos em `<conteudo>`:**

1. **Fichas por concorrente** — dados factuais, oferta, posicionamento declarado × decodificado, onda dominante (Produto/Pessoas/Propósito), RDPC, movimentos recentes, percepção pública, síntese, fontes, lacunas.
2. **Panorama da categoria** — recorte, tamanho/dinâmica, estrutura competitiva, códigos comuns, territórios ocupados/livres, movimentos recentes, regulação, benchmarks fora da categoria, síntese estratégica.
3. **Tendências aplicadas** — metodologia de filtro, sinais fortes, sinais fracos, ruído descartado.
4. **IDA da VM + hipóteses direcionais** — impulsionadores / detratores / aceleradores com fonte, hipóteses em Negócio / Marca / Comunicação, mapa de territórios consolidado.

**Princípios:** profundidade sobre amplitude · não cruze lentes · não especule além da evidência · reconheça limites da pesquisa pública · tendência sem evidência é narrativa · código comum é achado (não problema) · benchmarks fora da categoria são bem-vindos · outputs são sinalizadores · consistência entre artefatos · rigor acima de produção.

---

## Agente 6 — Decodificação e Direcionamento Estratégico

**Fonte:** `lib/agents/Agent_06_VisaoGeral.js`
**Spec:** `agente_6_decodificacao_direcionamento.md`
**Checkpoint 1.**

**Papel:** CÉREBRO do sistema — tradutor de convergência em direção. Integra VI + VE + VM + DISC em IDA → De-Para → Diretrizes.

**Inputs:** outputs 2, 4, 5 + DISC completo + posicionamento dos sócios + metadados do projeto. Se faltar uma das 3 lentes, NÃO GERA.

**3 princípios filosóficos:**
1. Convergência é confiança; divergência é informação.
2. Direção sem executabilidade é fantasia (DISC como filtro de viabilidade).
3. Especificidade vence abstração (teste: remova o nome da empresa; se a diretriz serve para qualquer outra, é genérica → reescreva).

**Passo 1 — Convergência entre lentes:**
- **Categoria A** — convergência total (3 lentes) → eixo estratégico candidato.
- **Categoria B1** — VI+VE = ativo real, mas não diferencial.
- **Categoria B2** — VI+VM = problema de comunicação/experiência.
- **Categoria B3** — VE+VM = ativo invisível para a própria liderança.
- **Categoria C** — achado único (1 lente); incluir com cautela.
- **Categoria D** — divergência crítica.

**Passo 2 — IDA consolidado** com código de lentes por item + filtro DISC em CADA item + seção dedicada a divergências críticas.

**Passo 3 — De-Para** em 3 camadas (Negócio / Marca / Comunicação), máx 3 pontos por camada, com 3 testes: específico, ancorado, executável.

**Passo 4 — 3 a 5 Diretrizes Estratégicas** com estrutura fixa:
- **TÍTULO** — verbo no infinitivo + o quê + qualificador
- **DEFESA** — 2–3 parágrafos conectando aos achados do IDA
- **COMO OPERACIONALIZAR** — 3–5 bullets concretos (decisão, mecanismo, recurso, horizonte)
- **FILTRO DISC** — parágrafo explícito sobre viabilidade e mecanismo de compensação
- **IMPACTO ESPERADO EM** — Negócio, Marca, Comunicação

**12 princípios invioláveis.** **PARTE A** analítico (8 seções + anexos) · **PARTE B** devolutiva.

---

## Agente 7 — Valores e Atributos

**Fonte:** `lib/agents/Agent_07_Valores.js`

**Papel:** traduz os achados do Agente 6 em valores e atributos de marca — palavras-chave que sustentam a Plataforma.

**Inputs:** output 6.

**Output:** 3–5 valores + 4 atributos (bipolares, contraste interessante), cada um com defesa curta, evidência do IDA e instrução de como operar no discurso.

---

## Agente 8 — Diretrizes Estratégicas

**Fonte:** `lib/agents/Agent_08_Diretrizes.js`

**Papel:** expansão técnica das Diretrizes do Agente 6. Pega cada diretriz estratégica e a desdobra em ações concretas por área (Negócio, Marca, Comunicação, Cultura).

**Inputs:** outputs 6, 7.

**Output:** para cada Diretriz, um plano de aplicação com áreas afetadas, responsável sugerido, horizonte de tempo e métricas de acompanhamento.

---

## Agente 9 — Plataforma de Branding

**Fonte:** `lib/agents/Agent_09_Plataforma.js`
**Checkpoint 2.**

**Papel:** desenha a Plataforma completa com as 3 colunas do método Ana Couto (MARCA É / NEGÓCIO FAZ / COMUNICAÇÃO FALA).

**Inputs:** outputs 6, 7, 8 + DISC + posicionamento.

**Elementos:**
- **Coluna 1 — MARCA É**: Propósito, Arquétipo (1 dos 12 Mark & Pearson, com sombra), Atributos (do Agente 7), Valores
- **Coluna 2 — NEGÓCIO FAZ**: 4 Direcionadores de Experiência
- **Coluna 3 — COMUNICAÇÃO FALA**: Discurso de Posicionamento, Tagline
- **Atuação nas 3 Ondas do Branding** (Produto / Pessoas / Propósito)
- **Manifesto** (opcional mas esperado) — inimigo simbólico + afirmação + 300-600 palavras

---

## Agente 10 — Identidade Verbal (UVV)

**Fonte:** `lib/agents/Agent_10_Verbal.js`

**Papel:** Universo Verbal — tom de voz, personalidade linguística, léxico da marca.

**Inputs:** outputs 6, 9.

**Output:** manual verbal com atitudes, atributos linguísticos, exemplos de uso e contraposição (do/don't), aplicações em títulos, microcopy, redes sociais, e-mail, press release.

---

## Agente 11 — One Page de Personalidade (Visual)

**Fonte:** `lib/agents/Agent_11_Visual.js`
**Checkpoint 3.**

**Papel:** briefing visual para a identidade — NÃO gera imagens, mas direciona o universo visual.

**Inputs:** outputs 6, 9, 10.

**Output:** orientações de paleta, tipografia, grafismos, fotografia, texturas, movimento; com referências e justificativa estratégica.

---

## Agente 12 — One Page de Experiência

**Fonte:** `lib/agents/Agent_12_CX.js`

**Papel:** traduz a Plataforma em direcionadores concretos de experiência do cliente, ponto de contato por ponto de contato.

**Inputs:** outputs 6, 9.

**Output:** 5 momentos da jornada (descoberta, avaliação, onboarding, uso contínuo, renovação/saída), cada um com promessa, atitude, sinais visuais e verbais, métricas.

---

## Agente 13 — Plano de Comunicação — A Marca Fala

**Fonte:** `lib/agents/Agent_13_Comunicacao.js`
**Checkpoint 4.**

**Papel:** fecha o projeto com um plano de comunicação aplicado (12–18 meses), com temas, canais, cadência e exemplos de peças + **roadmap consolidado** + **KPIs de branding e comunicação**.

**Inputs:** outputs 6, 7, 8, 9, 10, 11, 12.

**Output:**
- Plano narrativo (arco da marca)
- Mapa de conteúdo por canal
- Exemplos de peças (título, abertura, fechamento)
- Régua de governança da marca
- **Roadmap Consolidado de Ativação** (3/6/12 meses)
- **KPIs de Branding e Comunicação**

---

## Agente 14 — Plataforma de Marca Empregadora (EVP) · MODULAR

**Fonte:** `lib/agents/Agent_14_EVP.js`
**Spec:** `agente_14_evp.md`

**Papel:** transforma a Plataforma externa (Agente 9) em Plataforma interna — a promessa da empresa ao colaborador. Estrutura espelhada do Agent_09 (KB Ana Couto, envelope XML, parseOutput).

**Modular:** `modular: true`. Só roda quando projeto contratou escopo EVP. Sem execução, Parte 5.2 do entregável consolidado não aparece.

**Inputs:** outputs **2, 6, 7, 9** + `intake_colaboradores` (anônimo ortodoxo) + `entrevista_colaboradores` (opt-ins voluntários).

**Sem checkpoint próprio** — aprovação acompanha o CKPT 4 (Agente 13).

**10 princípios invioláveis:**
1. Âncora em evidência do intake — cada pilar da EVP com 1-2 evidências; sem evidência, o pilar sai.
2. EVP é complementar (não contraditória) à Plataforma externa.
3. EVP inclui gap atual → desejado — não esconde problemas.
4. **Anonimato ortodoxo** — clusters amplos, nunca indivíduos.
5. CIS é contexto narrativo (lê descrição do Agente 2 §3; NÃO reprocessa scores).
6. EVP serve à estratégia do negócio — não "bem-estar genérico".
7. Perfil ideal de contratação sai do gap, é narrativo.
8. Risco de dependência (competência concentrada) vira capítulo.
9. Manifesto interno é curto, falsificável, vivo (inimigo interno).
10. EVP é promessa de duas vias — o que oferece + o que pede em troca.

**Output (8 seções, 6000 palavras max):**
1. Diagnóstico de marca empregadora atual (cultura percebida, pilares fortes/frágeis, incoerências, risco de dependência)
2. EVP Statement + manifesto interno opcional
3. 4-6 pilares da EVP (cada um ancorado em evidência)
4. Jornada do Colaborador (6 momentos com métricas)
5. Discurso interno × externo
6. Gap atual → futuro (tabela 3/6/12 meses por dimensão)
7. Perfil ideal de contratação (narrativo, não checklist)
8. Compatibilidade com Plataforma externa

---

## Agente 15 — Consolidador Editorial do Entregável Final

**Fonte:** `lib/agents/Agent_15_Editorial.js`
**Spec:** `agente_15_editorial.md`

**Papel:** último agente do pipeline. Produz DOIS artefatos-rascunho para a Parte 0 do entregável consolidado: **Carta de Abertura** + **Sumário Executivo**.

**Gate de execução:** só roda **após CKPT 4 aprovado**. A lógica existente de `Pipeline.runAgent` (bloqueio por checkpoint pendente) já garante isso — zero código novo.

**Inputs:** outputs **2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14*** (todos os anteriores; 14 é `inputs_opcionais` — projeto sem EVP não bloqueia).

**Consome apenas `resumo_executivo` + `conclusoes`** de cada agente anterior — NÃO relê conteúdo inteiro. Mantém context window tratável mesmo com 12 inputs.

**`enrichContext`** extrai nome do sócio-fundador do primeiro `intake_socios` (cobre chaves `_respondente_nome`, `nome`, `nome_completo`, `a1_nome`) + período aproximado da escuta (min/max `created_at` dos formulários). Ambos opcionais — fallback "ao time fundador" se ausente.

**Fronteira explícita com curadoria humana:** prompt declara no topo que o output é RASCUNHO. `parseOutput.gaps` sinaliza: *"Requer 30-60 min de refino manual da consultora humana antes de publicação no entregável final."*

**10 princípios invioláveis:**
1. Ancorar em evidência — toda afirmação aponta pra output anterior.
2. Voz da consultora, não voz de agência (primeira pessoa, direta).
3. Carta é convite, não resumo.
4. Sumário é denso, 1 página (desafio / 3 achados / 3 direcionamentos / convite).
5. Nunca introduzir estratégia nova — só cura.
6. Nunca surpreender negativamente — tensão crítica sinalizada no Sumário.
7. Nomear sócio-fundador e empresa (fallback "ao time fundador").
8. Tom calibrado, nunca piegas.
9. Tamanho rígido — Carta 350-450 palavras, Sumário 450-600 palavras.
10. Fechamento é convite à jornada, nunca "obrigada pela parceria".

**Output (`<conteudo>`):**

```
# CARTA DE ABERTURA E SUMÁRIO EXECUTIVO
## {Nome da empresa} | {Data}

## CARTA DE ABERTURA
[Texto corrido, 350-450 palavras, voz da consultora em primeira pessoa]

## SUMÁRIO EXECUTIVO
[450-600 palavras, estrutura RÍGIDA]
### O desafio central que emergiu
### Os três achados-chave do diagnóstico
### Os três direcionamentos propostos (cada um "de X para Y")
### O convite para a próxima fase
```

---

## Parâmetros comuns dos prompts

- **Limites de palavras** declarados em cada agente (tipicamente 1.400 a 10.000; Agente 15 fica em 1.500).
- **Agentes de síntese (2, 4, 6)**: ~60% analítico, ~40% devolutiva.
- **Modelo padrão por tipo**:
  - **Agentes densos (2, 4, 6, 9, 13, 14)**: Gemini 2.5 Pro
  - **Agente 5 (deep research)**: Claude Opus 4.7 com web_search
  - **Agentes leves e roteiros (1, 3, 7, 8, 10, 11, 12, 15)**: Gemini 2.5 Flash ou Pro conforme preferência
- **MAX_OUTPUT_TOKENS** do router: 16000 (suficiente para agente com 10.000 palavras cap).
- **Nenhum agente** recomenda ações em etapas de diagnóstico (1–6). Recomendações só aparecem a partir do Agente 7 em diante.
- **Nenhum agente** inventa evidência. Todos têm regra explícita anti-invenção.
- **Anonimato ortodoxo** para colaboradores: `safeCopy()` remove `_respondente_*`, `nome`, `email` antes de inserir no prompt. Agente 14 + Agente 2 tratam colabs por cluster (`área · tempo de casa`).

---

## Como evoluir um prompt

1. Editar `lib/agents/Agent_NN_*.js` — função `getSystemPrompt()`.
2. Se mudar inputs/checkpoint/stage, atualizar TAMBÉM:
   - `lib/agents/catalog.js` (inputs, inputs_opcionais, checkpoint)
   - `lib/ai/pipeline.js` (AGENT_CONFIGS[NN] + STAGES + AGENT_FORM_TYPES)
3. Rodar `node --check lib/agents/Agent_NN_*.js` + `npx next build` para validar.
4. Commit com prefixo `feat(agent-N):` ou `fix(agent-N):`.
5. PR → merge → deploy (`vercel deploy --prod --yes` se auto-deploy não disparar).
6. No painel do projeto, apagar o output anterior via **Danger Zone** (modal de cascata — FIX.4) e rodar o agente de novo. Rodar também os dependentes transitivos se forem afetados pela mudança.

**Não crie prompts em outros lugares** — cada agente tem um único ponto de verdade (seu arquivo em `lib/agents/`). Evite duplicação; use as constantes de `_anaCoutoKB.js` para blocos compartilhados.

**Mantenha os metadados em sync entre `catalog.js` e `pipeline.js`** — comentários em ambos os arquivos alertam. Drift silencioso entre os dois pode quebrar validação de dependências (`podeExecutar`) ou apresentação na UI.
