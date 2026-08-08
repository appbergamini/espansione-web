# Passo-a-passo — Operar a plataforma Espansione

Guia operacional dos três fluxos que rodam hoje:

- **[A] Funil** — lead → Mapa Essencial (grátis) → relatório → compra → Mapa Estratégico → área do cliente
- **[B] Diagnóstico profundo** — esteira dos 16 agentes até o entregável editorial consolidado
- **[C] Agência de IA** — Brand Memory → briefing → peça aprovada

Arquitetura e contratos técnicos em [`arquitetura.md`](./arquitetura.md). Argumentação comercial em [`fab.md`](./fab.md).

---

## 0. Pré-requisitos

- Usuário `master` cadastrado (via `/register` com token de convite).
- Chaves em produção: `SUPABASE_*`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `OPENAI_API_KEY`, `TAVILY_API_KEY`, `RESEND_API_KEY`, `WASENDERAPI`, `INFINITEPAY_HANDLE`, `NEXT_PUBLIC_BUNNY_LIBRARY_ID`.
- Domínio verificado no Resend (em sandbox só envia para o dono da conta).
- **Vercel Pro ativo** — requerido pelos endpoints de PDF (`memory: 3009`) e pelos de 300s (engine e agência).
- Migrations locais: `SUPABASE_ACCESS_TOKEN` no `.env.local` + `scripts/run-migration.mjs`.
- Domínio do funil apontado: `crescimentointegrado.com.br` (apex canônico, `www` → 308).

---

# [A] Funil

## A1. Captação — Mapa do Crescimento Integrado · Essencial

O visitante chega pela home (`/` no domínio do funil) ou pela LP (`/lp`) e clica para fazer o teste.

1. **`/mapa`** — cadastro do lead. Campos essenciais: nome, empresa e contato (os demais do `CADASTRO_MATURIDADE` são opcionais). `POST /api/mapa/start` cria uma avaliação **sem projeto** (é um lead) e devolve o token.
2. **`/mapa/[token]`** — quiz estilo Typeform: **uma afirmação por tela**, auto-avanço ao tocar na resposta, botão voltar, progresso por bloco (1/4). São **40 perguntas que pontuam** distribuídas em 4 pilares × 10, mais 1 tela condicional de atributos de marca (múltipla escolha, até 3 — essa é a única com "Continuar").
   - Escala: **Nunca · Poucas vezes · Muitas vezes · Sempre** (0–3) + **"Não sei/Não se aplica"**, que é **excluído do cálculo** (não penaliza).
   - Autosave contínuo (`/api/mapa/session`) — o lead pode fechar e voltar pelo mesmo link.
3. **Resultado** — `POST /api/mapa/finalize` recomputa a nota no servidor (o cliente nunca define a nota), marca como concluído e **dispara o e-mail com o link do relatório** (Resend).
4. **Relatório** — página editorial em `/api/mapa/report?token=…`. A narrativa é escrita por IA (Claude Sonnet) e **cacheada**: reabrir não gasta token nem muda o texto. O botão de **PDF** usa a impressão do navegador (`?print=1` → `window.print`).
5. **WhatsApp** — o lead pode pedir o relatório no WhatsApp (`/api/mapa/whatsapp`, WaSenderAPI). Limite de **3 envios** por avaliação.

**Leitura do resultado:** nota geral = média dos 4 pilares (25% cada). Régua de 4 níveis: **Crítico/Reativo** (0–29) · **Em estruturação** (30–56) · **Em consolidação** · **Integrado**.

> O relatório é explicitamente um **autodiagnóstico do dono**. Ele nunca fala como se fosse a visão do mercado ou dos clientes — ouvir de fato é o que o Estratégico entrega.

## A2. Trabalhar os leads

**`/adm/leads`** lista quem preencheu o cadastro em `/mapa` e ainda não virou projeto (`mapa_assessments` com `projeto_id` nulo). Traz cadastro, status e nota. A conversão comercial é vincular esse lead a um projeto.

**`/adm/feira`** lista os cadastros e pagamentos originados no QR Code de feira.

## A3. Venda — checkout

O catálogo de produtos vive em **`/adm/produtos`**: `slug`, nome, descrição, **preço em centavos** e `fulfillment` (`identidade` · `treinamento` · `nenhum`). **Editar aqui não exige deploy.**

- Link de compra: `/api/checkout/infinitepay?produto=<slug>` — monta o link hospedado no InfinitePay e redireciona.
- O webhook (`/api/checkout/infinitepay-webhook`) é a **fonte de verdade** do pagamento. Ele grava em `pagamentos` e dispara o fulfillment.
- Fulfillment `identidade` (idempotente por `order_nsu`): cria um projeto leve para o comprador + o assessment com os **3 tokens** e envia o e-mail de boas-vindas.
- **`/adm/pagamentos`** lista as compras recebidas e permite vincular a um projeto.

## A4. Entrega — Mapa do Crescimento Integrado · Estratégico

**Self-serve (compra pela LP):**

1. O checkout redireciona para **`/identidade/setup?order=…`**, que faz polling em `/api/identidade-final/acesso` até o webhook confirmar o pagamento.
2. O comprador informa **nome da empresa** e **e-mail** (o e-mail é o que dá acesso à `/area` depois).
3. Recebe **3 links**, um por público:

   | Público | Quem responde |
   |---|---|
   | **Sócios e Diretores** | você e os demais sócios |
   | **Colaboradores e Líderes** | a equipe (vários respondentes por link) |
   | **Clientes e Fornecedores** | clientes/fornecedores de confiança |

4. Cada pessoa responde em `/form/identidade-final/[publico]` com autosave. São **106 perguntas** no total do instrumento, distribuídas entre os públicos, sendo **24 indicadores comparáveis** (o mesmo construto perguntado de forma adequada a cada público — é isso que torna a triangulação possível).
5. `POST /api/identidade-final/finalize` conclui o respondente e **recomputa o `result_json`** do assessment: maturidade por público, triangulação por indicador, eNPS (equipe), NPS (clientes), satisfação e drivers.
6. Relatório em `/api/identidade-final/report?token=…` (aceita qualquer um dos 3 tokens). `?print=1` → PDF.

**Via consultoria (projeto já existente):** no painel do projeto, o card **Mapa Estratégico** chama `/api/identidade-final/hub` e devolve os mesmos 3 links + contagem de respondentes e concluídos por público.

**O que a triangulação lê:** a distância entre os olhares. Os padrões possíveis são `descida` (sócios > equipe > cliente: há valor que não foi traduzido), `inversao` (cliente/equipe percebem mais força do que os sócios), `alinhamento_alto`, `alinhamento_baixo` (fragilidade compartilhada) e `polarizacao` (a identidade significa coisas diferentes para cada público).

## A5. Pós-venda — área do cliente

**`/area`** — login por **e-mail com código** (OTP enviado pelo nosso Resend, não pelo template do Supabase).

- Aba **Diagnóstico**: estado dos mapas do cliente (casado pelo e-mail da compra).
- Aba **Treinamentos**: trilha em vídeo (Bunny Stream). Editar títulos/ordem/`videoId` em `lib/treinamentos.js` — aula sem `videoId` aparece como **"em breve"**.

---

# [B] Diagnóstico profundo (esteira dos 16 agentes)

## B1. Criar o projeto

1. Login em `/login` com credenciais master → `/adm` → **Novo Projeto**.
2. Preencher: **Cliente**, **Segmento** (o mais específico possível — crítico para o Agente 5), **Porte**, **Momento**, **Objetivo**, **Tipo de negócio** (B2B/B2C, afeta condicionais dos formulários) e **Responsável**.
3. O projeto nasce com status `criado`. Se houver escopo de **EVP**, ele é derivado hoje pela presença do output 14.

## B2. Cockpit da empresa — `/adm/[id]`

O painel do projeto é organizado como **jornada**, com 9 abas:

| Aba | O que tem |
|---|---|
| **Visão Geral** | jornada em etapas com status, bloqueios e próximas ações (`/api/adm/cockpit/[id]`) |
| **Diagnóstico (esteira)** | orquestrador dos agentes, trilha de outputs, checkpoints, Danger Zone |
| **Formulários** | links, preview e status de cada formulário |
| **Pessoas** | respondentes, convites, Mapeamento Comportamental, opt-ins |
| **Entregáveis** | outputs, entregável consolidado, relatórios |
| **Trilhas** | aprofundamento |
| **Histórico** · **Observações** · **Logs** | rastreabilidade |

Os cards **Mapa Essencial** e **Mapa Estratégico** ficam no painel e geram os links públicos do projeto.

## B3. Cadastrar respondentes

Card **Respondentes**: nome, papel (`socios` / `colaboradores` / `clientes`), e-mail, WhatsApp (opcional). Adição manual ou **import CSV/XLSX** (colunas `nome`, `email`, `papel`, + `whatsapp`).

**Token:** cada respondente recebe automaticamente um token de **48 chars hex**, válido por **30 dias**.
- **Imutável** — editar o respondente não regenera o token.
- **Renovação automática** — reenviar convite (`enviar-batch` ou `form-link`) estende +30 dias mantendo o mesmo token; o rascunho em `sessionStorage` é preservado.
- **Expirado** — `/api/respondentes/by-token` devolve **410** e a página mostra "Este link expirou. Solicite um novo convite ao administrador do projeto."

**Template de e-mail:** modal **Editar template**, com placeholders `{nome}`, `{empresa}`, `{link_formulario}`, `{link_posicionamento}` (só sócios). Salvo por projeto × papel.

**Preview:** ícone 👁 ao lado de cada formulário abre `/form/<tipo>?projeto={id}&preview=true` — requer sessão admin, mostra banner âmbar sticky e mantém o submit desabilitado.

## B4. Disparar os formulários

| `tipo` | Rota pública | Quem responde |
|---|---|---|
| `intake_socios` | `/form/socios?t=…` | Sócios |
| `intake_colaboradores` | `/form/colaboradores?t=…` | Colaboradores (anônimo) |
| `intake_clientes` | `/form/clientes?t=…` | Clientes do ICP |
| `posicionamento_estrategico` | `/form/posicionamento?t=…` | Sócios |
| Mapeamento Comportamental | `/form/[tipo]?t=…` | Sócios + colaboradores |

- **Sócios** recebem dois links: Diagnóstico Inicial + Teste de Posicionamento Estratégico (27 perguntas).
- **Colaboradores** recebem a pesquisa (anônima) + o Mapeamento Comportamental.
- **Clientes** recebem a entrevista de clientes do ICP.

**Opt-in de entrevista:** ao final dos formulários de colaboradores e clientes, o respondente pode se voluntariar. Gera registro em `opt_in_entrevistas` (`pendente` → `priorizado` / `entrevistado` / `descartado`).

## B5. Mapeamento Comportamental

Card **Mapeamento Comportamental**: adicionar as mesmas pessoas (sócios + colaboradores); o link vai junto com o formulário principal. O painel mostra status por participante, **PDF individual** do perfil, reenvio de convite e o **Relatório Comportamental consolidado** do time.

Cobertura importa: markers de visualização do time só são emitidos com **≥ 70%** de cobertura.

## B6. Posicionamento Estratégico (só sócios)

Card **Posicionamento**: visão consolidada (barras EO / IC / LP com média dos sócios), matriz por respondente e **alerta de divergência** quando os sócios escolhem vetores diferentes — insumo crítico para o Agente 6.

## B7. Entrevistas

Duas formas de alimentar as entrevistas:

**Transcrição manual** — card **Entrevistas**: escolher o respondente, colar a transcrição (timestamps e marcação de interlocutor são tolerados) e salvar como `entrevista_socios` / `entrevista_colaboradores` / `entrevista_cliente`.

**Entrevista guiada por IA** — `/entrevista/[token]`: a IA monta o roteiro a partir dos outputs 1/3 (ou de perguntas-base quando não há roteiro), conduz com follow-up e anti-repetição, e transcreve por voz (Web Speech API no navegador; **Whisper** como fallback em `/api/entrevista/transcribe`). O acompanhamento das sessões fica no painel (`EntrevistaIASessoes`).

> Sem transcrições, os Agentes 2, 4 e 14 sinalizam limitação e reduzem a confiança.

## B8. Rodar a esteira

Na aba **Diagnóstico (esteira)**, card **Orquestrador de IA** → **Executar Agente N**. O modal pede o modelo:

| Opção | `modelKey` | Provedor |
|---|---|---|
| Gemini Flash — rápido e econômico | `gemini-flash` | Google |
| Gemini Pro — mais completo | `gemini-pro` | Google |
| Claude Opus 4.7 — máxima capacidade · web search | `claude-opus-4-7` | Anthropic |
| Claude Sonnet 4.6 — equilibrado | `claude-sonnet` | Anthropic |
| GPT-5.4 / GPT-5.4 Mini | `gpt-5.4` / `gpt-5.4-mini` | OpenAI |

> Estado de billing por provedor muda; conferir [`modelos-ia.md`](./modelos-ia.md) antes de culpar o código por um 429.

### Ordem e dependências

```
1 → 2 → 3 → 4
        [5 depende só do 2 — pode rodar em paralelo a 3/4]
2 + 4 + 5 → 6 (CKPT 1) → 7 → 8 → 9 (CKPT 2) → 10 → 11 (CKPT 3)
                                       ↓                ↓
                                      12 ────────→ 13 (CKPT 4)
                                                    ↓
                    14 (modular, se escopo EVP) → 15 (Editorial) → 16 (Brand Memory, modular)
```

| Agente | Consome |
|---|---|
| 1 | `intake_socios`, `intake_colaboradores`, `posicionamento_estrategico`, mapeamento comportamental |
| 2 | Output 1 + intakes + entrevistas internas + comportamental |
| 3 | Output 2 + `intake_clientes` |
| 4 | Output 3 + `intake_clientes`, `entrevista_cliente` |
| 5 | Output 2 · deep research via Claude + Tavily |
| 6 | Outputs 2, 4, 5 · **CKPT 1** |
| 7 | Output 6 |
| 8 | Outputs 6, 7 |
| 9 | Outputs 6, 7, 8 · **CKPT 2** |
| 10 | Outputs 6, 9 |
| 11 | Outputs 6, 9, 10 · **CKPT 3** |
| 12 | Outputs 6, 9 |
| 13 | Outputs 6, 7, 8, 9, 10, 11, 12 · **CKPT 4** |
| 14 | Outputs 2, 6, 7, 9 + colaboradores · **modular** (só com escopo EVP) |
| 15 | Outputs 2, 4, 5, 6–13 (+14 opcional) · roda **após CKPT 4 aprovado** |
| 16 | Mesmos inputs de 15 · **modular** — só quando o cliente assina pacote de Operação |

### Validação dura de dependências

`Pipeline.runAgent` verifica antes de executar. Faltando input obrigatório:

```
Agente 6 depende de output(s) ausente(s): 2, 4, 5. Execute o(s) agente(s) 2, 4, 5 antes.
```

O "próximo agente" sugerido usa o **primeiro faltante** — respeita buracos. Com outputs `[1, 2, 4, 5]`, o próximo sugerido é **3**, não 6.

### Executar

1. **Executar Agente N** → escolher modelo.
2. Aguardar 15–90s (o Agente 5 pode levar 3–5 min: web search + Tavily).
3. O output aparece na trilha → **📖 Abrir** leva à página editorial.

Agentes muito caros podem ser fatiados em duas chamadas: `/api/engine/enrich` (coleta/deep research) e depois `/api/engine/run` — evita estourar o teto de 300s.

## B9. Página editorial do output

`/adm/[id]/outputs/[agent_num]`:

- **Header** — breadcrumb, nome do agente, data, indicador de confiança (Alta=verde · Média=âmbar · Baixa=vermelho) e **📄 Baixar PDF**.
- **Sidebar** — outros outputs do projeto + índice do conteúdo atual (scroll âncora).
- **Corpo** — Resumo Executivo em card, conteúdo em tipografia editorial, **visualizações renderizadas inline** onde o agente emitiu os markers `<!-- VIZ:… -->`, Conclusões em card.

O PDF (`{cliente}_agente-{n}_{data}.pdf`) é 1:1 da tela — mesmo React, mesmas visualizações.

## B10. Checkpoints

Checkpoint aparecendo (bloco amarelo no orquestrador) = **pipeline pausado**. Revisar com o cliente e aprovar:

- **CKPT 1** (após Agente 6) — Decodificação e Direcionamento
- **CKPT 2** (após Agente 9) — Plataforma de Branding
- **CKPT 3** (após Agente 11) — One Page de Personalidade
- **CKPT 4** (após Agente 13) — entrega final; **destrava os Agentes 15 e 16**

As aprovações podem ser registradas com notas estruturadas (`checkpoint_approval_records`), que alimentam a Brand Memory.

## B11. Curadoria estratégica

`/adm/[id]/curadoria` trabalha os **`analysis_blocks`** — findings materializados automaticamente a cada output salvo. Para projetos antigos, `POST /api/curadoria/backfill` gera os blocos retroativamente (idempotente).

**Clusters de comunicação** (lente de público para comunicação — não confundir com personas, que são para experiência) ficam em `/api/clusters`; `gerar-lean` monta uma primeira versão por IA.

## B12. Agente 14 (EVP) — modular

Com escopo de Marca Empregadora contratado, rode em paralelo aos 10/11/12. Requer outputs 2, 6, 7, 9 e `intake_colaboradores` com **≥ 30%** de cobertura do time (abaixo disso o agente declara limitação). Alimenta a Parte 5.2 do entregável — sem ele, a seção simplesmente não aparece.

## B13. Agente 15 (Editorial)

Só roda **depois do CKPT 4**. Consome apenas `resumo_executivo` + `conclusoes` dos demais outputs (contexto tratável mesmo com 12 inputs). Produz:

- **Carta de Abertura** (350–450 palavras, voz pessoal da consultora)
- **Sumário Executivo** (450–600 palavras: desafio central / 3 achados / 3 direcionamentos / convite)

É **rascunho editorial** — pede 30–60 min de refino humano antes de publicar. O próprio prompt declara essa fronteira.

## B14. Entregável final consolidado

Botão **📘 Entregável final** → `/adm/[id]/deliverable`. Documento de 30–60 páginas em 8 partes:

- **Parte 0 — Abertura**: Carta + Sumário (Agente 15) + "Como lemos sua empresa"
- **Parte 1 — Diagnóstico**: Visão Interna (2 · Parte B) · Visão Externa (4) · Leitura de Mercado (6 §3) · Cultura × Direção (6 §1.4)
- **Parte 2 — Direção**: Posicionamento (6 §2) + Valores (7) + Diretrizes (8)
- **Parte 3 — Plataforma**: Agente 9 + Manifesto em bloco serif destacado
- **Parte 4 — Expressão**: Identidade Verbal (10) + One page visual (11)
- **Parte 5 — Vivência**: Experiência (12) + EVP (14, condicional)
- **Parte 6 — Ativação**: Plano de Comunicação + Roadmap + KPIs (13)
- **Parte 7 — Encerramento**: convite à próxima fase + créditos

**📘 Baixar PDF consolidado** gera A4 com capa full-page, TOC, numeração no rodapé (exceto capa). Arquivo: `{cliente}_entregavel_{data}.pdf`. Cada parte tem empty-state quando a seção não existe ("Curadoria editorial pendente" etc.).

## B15. Agente 16 (Brand Memory) — modular

Só quando o cliente assina pacote de **Operação**. O Agente 16 **não interpreta**: colhe as tags `<brand_memory_export>` já emitidas pelos agentes 2–14, valida cada uma e consolida no JSON canônico. Depois, `POST /api/brand-memory/load` cria/ativa a versão que a Agência consome.

> ⚠️ Estado real: em produção a Brand Memory ativa foi carregada pelo **fallback legado**. O caminho per-agente nunca rodou fim-a-fim e as re-execuções do Agente 16 falham em emitir o JSON. Validar antes de prometer.

## B16. Danger Zone — re-executar um relatório

Rodapé do painel → **🗑 Excluir relatório**:

1. **Preview de cascata** — lista todos os dependentes transitivos que serão invalidados (apagar o Agente 2 mostra a cadeia 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16).
2. **Confirmação forte** — com cascata ≥ 3 outputs, exige digitar **"confirmar"**.
3. **Execução** — apaga em transação; `etapa_atual` recalculado pela **última etapa consecutiva** (não pelo máximo).

Depois disso o painel sugere o próximo agente (primeiro faltante). Re-executar é seguro.

> Apagar um **respondente** NÃO apaga a resposta dele em `formularios` — separação intencional, a evidência é preservada.

## B17. Downloads

- **PDF por agente** — 📄 na página editorial (Playwright, 1:1 da tela)
- **PDF consolidado** — 📘 em `/adm/[id]/deliverable`
- **Perfil comportamental individual** — 📄 no card de Mapeamento Comportamental
- **Relatório Comportamental do time** — botão no topo do mesmo card
- **Relatórios do funil** (Essencial e Estratégico) — botão de PDF na própria página do relatório (impressão do navegador)

## B18. Excluir um projeto

**🗑 Excluir Projeto** no topo do painel apaga tudo por cascade (outputs, formulários, respondentes, comportamental, checkpoints, logs, `intake_data`, opt-ins). Irreversível, só master.

## B19. Checklist antes de cada agente

| Antes de rodar | Confirme |
|---|---|
| Agente 1 | Todos os sócios + ≥ 50% dos colaboradores responderam; comportamental rodou; posicionamento respondido |
| Agente 2 | Entrevistas transcritas; output 1 completo; cobertura comportamental ≥ 70% para emitir os markers de time |
| Agente 3 | Output 2 gerado; lista de clientes ICP definida e convidada |
| Agente 4 | `intake_clientes` + `entrevista_cliente` transcritas |
| Agente 5 | Concorrentes e site preenchidos no `intake_socios`; `ANTHROPIC_API_KEY` + `TAVILY_API_KEY` válidas |
| Agente 6 | Outputs 2, 4, 5 existentes; comportamental consolidado |
| Agentes 7–9 | Output 6 aprovado no CKPT 1 |
| Agentes 10–13 | Output 9 aprovado no CKPT 2 |
| Agente 14 | Outputs 2, 6, 7, 9; cobertura de colaboradores ≥ 30% |
| Agente 15 | **CKPT 4 aprovado**; maioria dos outputs 2–13 presentes |
| Agente 16 | Pacote de Operação contratado; outputs 2–14 com `<brand_memory_export>` válido |

---

# [C] Agência de IA

## C1. Pré-requisito: Brand Memory ativa

`GET /api/agency/readiness` diz se a marca está pronta. Sem uma versão ativa e válida de Brand Memory (`brand_memory_versions`), a agência não gera peça. Gerenciamento em `/adm/[id]/agency/brand-memory`.

## C2. Ciclo de uma peça

1. **Request** — `/adm/[id]/agency`: tipo (`social_post`, `carousel`, `short_video_script`, `email`, `landing_page_copy`) × canal (LinkedIn, Instagram, WhatsApp, e-mail, site, mídia paga) × objetivo (awareness, autoridade, geração de lead, conversão, lançamento, relacionamento, retenção).
2. **Briefing** — o *account director* gera o briefing. Status: `briefing_pending` → `briefing_generated`.
3. **Aprovação humana do briefing** — obrigatória (`briefing/approve`) ou pedido de revisão (`briefing/revision`). **O run não começa sem briefing aprovado.**
4. **Run** — `prepare-run` monta o plano de execução (perfil + seleção de modelo por passo) e `run-workflow` executa a sequência: `copywriter → channel_adapter → visual_director → editor → brand_compliance → approver`. Cada passo é gravado em `agency_steps` com metadados de execução e qualidade.
5. **Imagem** — `generate-image` (GPT Image) quando a peça pede visual.
6. **Ajuste** — `regenerate-step` (um passo) ou `regenerate-from-step` (dali pra frente), sem refazer tudo.
7. **Publicação e aprendizado** — peça vai para a **biblioteca** (`/library`, com `use-reference` para reaproveitar), gera **sinais** (`/signals`) e alimenta **aprendizados** (`/learnings`), que voltam para a Brand Memory.
8. **Brand book** e **assets** ficam em `/adm/[id]/agency/brand-book` e `/assets`.

## C3. Cockpit da agência

**`/cockpit`** — visão de agência (tema dark) com 7 views: Diagnóstico, Revisão, Visão Geral, Conteúdo, Pautas, Agenda e IA. Fase 1 no ar; parte das views ainda usa dados de exemplo.

---

# Solução de problemas

### Funil
- **Lead não recebeu o relatório por e-mail** → conferir domínio verificado no Resend (em sandbox só envia para o dono da conta) e se o cadastro tinha e-mail válido.
- **WhatsApp não chegou** → `WASENDERAPI` configurada? O limite é **3 envios por avaliação**.
- **Relatório com números estranhos** → a nota é recomputada no servidor no `finalize`; a narrativa é cache. Se o texto ficou velho após mudança de dados, o cache em `result_json.report` precisa ser invalidado.
- **Comprou e não recebeu os links** → o webhook é a fonte de verdade. Ver `/adm/pagamentos`; `/identidade/setup?order=…` faz polling e `verificarPagamento` consulta o InfinitePay direto.
- **Cliente não entra na `/area`** → o acesso casa pelo **e-mail da compra**; se ele comprou com outro e-mail, ajustar em `pagamentos.cliente`.
- **Página do funil aparecendo no Google pelo domínio errado** → só `crescimentointegrado.com.br` é indexável; os demais hosts levam `X-Robots-Tag: noindex`.

### Diagnóstico
- **"Agente X depende de output(s) ausente(s)"** → rodar os agentes listados antes.
- **Timeout** → tentar modelo mais rápido; para agentes caros, usar `enrich` + `run` separados.
- **Agente 5 falha na web search** → checar `ANTHROPIC_API_KEY`. O fallback Gemini não faz web search e o agente vai sinalizar a limitação.
- **Agente 5 não acha o site** → preencher o site/Instagram com o domínio completo no `intake_socios`.
- **429 / PERMISSION_DENIED de provedor** → é billing, não código. Ver [`modelos-ia.md`](./modelos-ia.md) e trocar de provedor no seletor.
- **Link do formulário "expirou"** → disparar `enviar-batch` ou `form-link`: renova +30 dias mantendo o token.
- **Visualização não aparece** → o output emitiu o marker? Os dados existem (cobertura comportamental ≥ 70% para markers de time; 360° ≥ 80% para o radar)?
- **PDF com 500** → plano Vercel Pro (`memory: 3009`); logs em `[deliverable-pdf] erro:` / `[api/outputs/pdf]`. Se o erro citar `@sparticuz/chromium/bin` inexistente, é o `outputFileTracingIncludes` do `next.config.mjs`.
- **PDF demora** → cold start do Chromium slim ~5s; ajustar `timeoutMs` em `generatePdfFromPage`.
- **Modal de exclusão preso** → hard refresh (estado `cascadePreview`).
- **Novo Projeto não aparece** → role precisa ser `master` ou `admin`.

### Agência
- **Não gera peça** → `GET /api/agency/readiness`; provavelmente não há Brand Memory ativa/válida.
- **Run travado antes de começar** → briefing não aprovado (`briefingGate`).
- **Agente 16 não emite o JSON** → problema conhecido; a Brand Memory em produção veio do fallback legado.
- **Rodar sem gastar token** → `AGENCY_MODEL_GATEWAY=mock` usa o `MockModelGateway`.

### Deploy
- **Push não deployou** → `vercel deploy --prod --yes`.

---

# Apêndice — Manutenção dos instrumentos

Os catálogos do funil são **gerados de planilha**. Nunca editar o `.generated.js` à mão:

```bash
# Mapa Essencial — fonte: data/maturidade/mapa_maturidade_final.xlsx
node scripts/build-maturidade-final.cjs

# Mapa Estratégico — fonte: data/identidade/mapa_identidade_final.xlsx
node scripts/build-identidade-final.cjs

# Landing page do funil
node scripts/build-landing-crescimento.cjs

# Relatórios de demonstração (sem tocar em dados reais)
node scripts/gen-maturidade-demo.cjs
node scripts/gen-identidade-demo.cjs
```

Testes das funções puras (score, jornada, agência, outputs):

```bash
pnpm --filter @espansione/diagnostic-web test
pnpm type-check     # na raiz do monorepo
```

## Projeto-teste (fixture GSIM)

Scripts locais **não commitados**:

```bash
node --env-file=.env.local scripts/seed-gsim-parte1.mjs   # empresa + 2 sócios
node --env-file=.env.local scripts/seed-gsim-parte2.mjs   # 10 colaboradores + comportamental
node --env-file=.env.local scripts/seed-gsim-parte3a.mjs  # 5 clientes + 360° agregado
node --env-file=.env.local scripts/seed-gsim-parte3b.mjs  # 3 entrevistas
```

Cria o projeto **GSIM Brasil** com 17 respondentes, 22 formulários, 12 mapeamentos, 2 opt-ins. Tensões plantadas (declarado × operado, sócios divergentes, cultura × aspiração, EVP gap, ambição × capacidade) permitem medir o rigor dos agentes.

Limpeza:

```bash
node --env-file=.env.local scripts/cleanup-gsim.mjs                   # dry-run
node --env-file=.env.local scripts/cleanup-gsim.mjs --yes-wipe-gsim   # executa
```
