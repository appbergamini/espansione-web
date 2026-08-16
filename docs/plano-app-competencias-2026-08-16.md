# Plano de implementação — App do Teste de Competências Empreendedoras

**Espansione · 16 de agosto de 2026 · documento de aprovação, anterior a qualquer código**

Reconcilia a `SPEC_App_Teste_Competencias_Espansione.md` (ago/2026) com o que já está construído e no ar no monorepo `web/`. Onde a SPEC e o repositório divergem, este documento decide — e diz por quê.

---

## 0. Decisões que este plano executa

| # | Decisão | Consequência que este plano resolve |
|---|---|---|
| 1 | **App separado** em `apps/`, não módulo no `diagnostic-web` | O domínio do funil é roteado por rewrites dentro do `diagnostic-web`. Dois apps sob um domínio exige **multi-zone**. Sessão e compra precisam atravessar a fronteira. |
| 2 | **O teste substitui o `/mapa`** como porta de entrada | O funil perde a captura grátis, porque o teste é pago. O Mapa de Maturidade precisa de um novo lugar — e não pode ser removido. |
| 3 | **Plano escrito antes de código** | Este documento. Nada é implementado antes da aprovação. |

Nenhuma das três decisões apaga código existente. O plano inteiro é aditivo, e a única alteração em arquivo que hoje está em produção é o bloco de `rewrites` do `next.config.mjs` (fase F6).

---

## 1. Inventário — o que já existe e o que acontece com cada coisa

Verificado no repositório, não presumido.

| Ativo | Onde | Destino |
|---|---|---|
| **Instrumento comportamental (VERTHO v2.1)** — 8 rankings + 6 pares, respondidos 2× (natural e em contexto); saída `disc`/`dA` somando 200 | `public/cis-app.js` | **Extraído para pacote e reusado.** É o Instrumento 2 da SPEC, e já é auto-aplicável. |
| Parser/normalizador do CIS, `COMPETENCIAS_KEYS` | `lib/cis/parseCis.js` | Vai para o pacote. Intocado no comportamento. |
| Relatório próprio do CIS | `components/pdf/RelatorioDisc.js` | **Fica onde está.** Continua servido pela matriz `CC`, para uso avulso. |
| Mapa de Maturidade (4 sistemas × 10, relatório + PDF) | `lib/mapa-maturidade/`, `pages/mapa/*` | **Fica vivo.** Sai da porta de entrada (fase F6), não sai do ar. Ver §4. |
| Mapa de Identidade (30/público × 3 públicos) | `lib/identidade-final/`, `pages/form/identidade-final/*` | Intocado. |
| Checkout InfinitePay + fulfillment idempotente por `order_nsu` | `lib/checkout/` | **Reusado e estendido** com um fulfillment novo. |
| Login OTP, `/area`, treinamentos Bunny | `pages/area.js`, `lib/getServerUser.js` | Reusado via cookie no apex. |
| Tema da marca (navy `#001A3B`, Poppins, `#C72638`) | `components/mapa/mapaTheme.js` | Vai para pacote compartilhado. Marca idêntica nos dois apps. |
| Geradores de catálogo a partir de Excel | `scripts/build-maturidade-final.cjs`, `build-identidade-final.cjs` | **Padrão copiado** para o banco de itens novo. |
| Home institucional + LP | `public/home/`, `public/crescimento/` | Só muda o destino do CTA. |

**Metade do produto novo já está construída.** A SPEC está certa ao dizer que basta derivar os 4 pilares dos fatores `disc`/`dA` — não é preciso rodar a matriz `CC` no fluxo novo.

---

## 2. Correções à SPEC — aplicar antes de implementar

A SPEC é sólida: conferi as afirmações estruturais dela contra a matriz `CC` real e todas batem (somas de `dA` entre 0,540 e 0,583; amplitude de Organização 0,417; topo 1,134 em Paciência; Persuasão/Extroversão/Entusiasmo com vetores idênticos até a 2ª casa). O banco de itens também está íntegro: 12 competências × exatamente 4 aparições, nenhum bloco repete competência, e as 12 faixas passam na regra de viabilidade (195 a 205, dentro de 185–215).

Os três ajustes abaixo vêm de simulação, não de opinião.

### 2.1 A ramificação é instável — e ela é o produto

Simulação de 20.000 respondentes sobre os 12 blocos reais, modelo Thurstoniano:

| ruído | empate no corte (3º = 4º) | competências empatadas no corte | overlap do bottom-3 em teste-reteste |
|---|---|---|---|
| 0,3 | 41,2% | 2,63 | 79,6% (2,4 de 3) |
| 0,5 | 44,4% | 2,80 | 71,8% (2,2 de 3) |
| 0,8 | 48,3% | 3,02 | 62,3% (1,9 de 3) |

A mesma pessoa, respondendo duas vezes, troca aproximadamente **1 das 3 competências da trilha**. Em ~44% dos casos o corte é decidido pelo desempate, não pelo dado. Como a trilha sustenta os blocos 3, 5 e 6 do relatório, é o risco número um do produto.

Cada competência aparece em 4 blocos e recebe +1/−1/0 em cada um: a resolução máxima do instrumento é uma escala de 9 pontos (−4 a +4) para ordenar 12 itens. Empate é o comportamento esperado, não a exceção.

**Decisão — duas mudanças, nenhuma delas cara:**

1. **Mover as 4 âncoras de evidência para antes da ramificação.** Continuam 22 telas; muda só a ordem (12 blocos → 4 âncoras → 6 ancorados). As âncoras já mapeiam 8 das 12 competências e são factuais, então servem de desempate com sinal externo ao autorrelato. Custo: a pessoa entra na etapa 2 já ciente de que está sendo checada — pode enrijecer a resposta dos ancorados. Aceitável frente ao ganho.
2. **Empate remanescente vira escolha do respondente.** "Estas competências ficaram no mesmo patamar — escolha as que você quer aprofundar." Substitui um desempate arbitrário por uma decisão informada, e aumenta a percepção de relevância do que vem depois.

Registrar em `comp_assessments` como o corte foi decidido (`por_score` | `por_ancora` | `por_escolha`) — é dado de calibração.

### 2.2 A válvula de honestidade do motor quase nunca abre

A regra 4 da trilha — *"todos os pilares dentro da faixa → fragilidade técnica, não acionar módulo comportamental"* — é o que impede o relatório de sempre achar um culpado comportamental. Simulei 30.000 perfis gerados pela geometria do próprio instrumento CIS:

- A regra 4 dispara em **5,7%** dos casos.
- O motor encontra em média **2,25 pilares fora de faixa por competência**.
- Em **82,8%** das competências, dois ou mais pilares são sinalizados.

Testei em toda a faixa plausível de dispersão de perfil (desvio-padrão de 14 a 31 pontos): fica entre 2% e 19%. Nunca perto de confortável. Isso produz exatamente o que a própria SPEC condena na regra editorial 3: *"quem sempre encontra problema parece estar vendendo"*.

A causa é estrutural: faixas de 35 a 40 pontos de largura, quatro delas, sobre pilares que somam 200. Estar dentro das quatro ao mesmo tempo é raro por construção.

**Decisão — tolerância de borda.** Um pilar só é sinalizado quando a distância até a borda da faixa for **≥ δ**, e não meramente por estar fora. Com δ = 10:

| δ | regra 4 dispara | pilares sinalizados por competência | competências com ≥2 sinalizados |
|---|---|---|---|
| 0 (SPEC) | 5,7% | 2,25 | 82,8% |
| 5 | 11,4% | 1,85 | 69,6% |
| **10** | **19,8%** | **1,47** | **53,6%** |
| 15 | 29,7% | 1,14 | 38,2% |

δ = 10 é o ponto onde a regra 4 passa a ser um resultado real (1 em 5) e o relatório nomeia menos coisas com mais força — que é o que as regras editoriais da própria SPEC pedem. **δ entra como parâmetro versionado, não como constante no código**, para ser recalibrado com dado real.

### 2.3 Versionar as faixas e o banco de itens

A SPEC diz, corretamente, que as 48 faixas são hipóteses testáveis definidas por julgamento, a recalibrar com 150–200 casos. Consequência que a SPEC não trata: **quando a recalibração acontecer, os relatórios já entregues precisam continuar explicáveis**. Um cliente que voltar para a sessão de leitura três meses depois tem que receber a mesma leitura.

Toda sessão grava `faixas_versao`, `delta_versao` e `catalogo_versao`. Recalibrar cria uma versão nova; não altera a anterior.

### 2.4 Nomenclatura

A SPEC chama o Instrumento 2 de "Perfil Comportamental". O termo estabelecido em superfície de cliente é **Mapeamento Comportamental**. Adotar o estabelecido, nos dois apps.

Mantidas as demais regras da SPEC §2: nenhum termo DISC em superfície de cliente (com teste de string no build), as 16 do CIS são **características**, as 12 do teste são **competências**, e as duas nunca aparecem com o mesmo nome na mesma tela.

⚠️ *Assertividade* e *Sociabilidade* existem **nas duas taxonomias** — nas 16 características do CIS e nas 24 do acervo — com definições diferentes. Namespace obrigatório desde a primeira linha do de-para (pendência 2 da SPEC), senão o nó é impossível de desfazer depois.

---

## 3. Arquitetura

### 3.1 O app novo

```
apps/competencias-web/          @espansione/competencias-web
  next.config.mjs               assetPrefix: '/teste-static'
  lib/competencias/
    catalog.generated.js        ← gerado do XLSX, não editado à mão
    catalog.js                  helpers (padrão mapa-maturidade/catalog.js)
    score.js                    etapa 1, ranking, desempate, integridade
    faixas.js                   48 faixas + tolerância δ + viabilidade
    motor.js                    aderência → rota → trilha
    relatorio.js                gerador de texto + regras editoriais
  pages/teste/…                 22 telas
  components/                   UI
```

Next 16.2.1, Pages Router e Tailwind 4 — as mesmas versões do `diagnostic-web`, para que a extração de código compartilhado não esbarre em divergência de versão.

### 3.2 O que sai para `packages/`

Hoje `packages/shared` e `packages/db` são stubs (`export {}`); `agents`, `brand-memory` e `types` têm conteúdo real. Dois pacotes novos:

- **`@espansione/cis`** — o instrumento comportamental: itens, `calcScores`, `fixSum`, `parseCis`, e a derivação dos 4 pilares (natural e em contexto). Uma única cópia, consumida pelos dois apps. Sem isso, duas cópias do questionário divergem em semanas.
- **`@espansione/brand`** — tokens da marca a partir do `mapaTheme.js`. Sem isso, o funil deixa de ser visualmente coeso na fronteira entre os apps, que é justamente onde o cliente paga.

`packages/shared` recebe o cliente Supabase e o `getServerUser`, hoje duplicáveis.

### 3.3 Roteamento do domínio — a parte cara da decisão 1

Hoje, `crescimentointegrado.com.br` é servido pelos rewrites host-based dentro do `next.config.mjs` do `diagnostic-web`: `/` → `public/home/index.html`, `/lp` e `/crescimento` → `public/crescimento/index.html`, e `/mapa` é página Next do mesmo app.

Com dois apps sob o mesmo domínio, a saída é **multi-zone** — confirmado no guia do Next 16 instalado (`node_modules/next/dist/docs/01-app/02-guides/multi-zones.md`):

- O app novo declara `assetPrefix: '/teste-static'`.
- O `diagnostic-web` permanece **dono do domínio e roteador de borda**, e ganha três rewrites: `/teste`, `/teste/:path+` e `/teste-static/:path+` → `${TESTE_ORIGIN}/…`.
- O rewrite extra de `/teste-static/_next/:path+` **não é necessário** — deixou de ser a partir do Next 15.
- Navegação entre zonas usa `<a>`, nunca `<Link>`: prefetch cruzando zona não funciona.
- `TESTE_ORIGIN` é variável de ambiente, apontando para `localhost` em dev e para o domínio de produção do app novo em prod.

Cada app continua com seu próprio projeto Vercel e seu próprio deploy — que é o ganho que motivou a decisão 1.

### 3.4 Sessão entre os dois apps

Cookies do Supabase escopados no apex `.crescimentointegrado.com.br`. O `@supabase/ssr` já está no `diagnostic-web`; o app novo usa a mesma configuração a partir de `packages/shared`. Quem faz login no `/area` chega autenticado no `/teste`, e vice-versa. Sem isso, o comprador loga duas vezes — e desiste na segunda.

### 3.5 Compra e liberação — reuso, sem conceito novo

O `lib/checkout/provisionar.js` já é idempotente por `order_nsu` e já cria projeto leve + assessment. Um fulfillment novo, `provisionarCompetencias`, segue o mesmo formato e cria:

1. a linha em `pagamentos` (via `registrarPagamento`, já existente);
2. a sessão em `comp_assessments`;
3. o participante em `cis_participantes` com **`liberado = false`**.

A "ordem imposta" da SPEC — o comportamental bloqueado até o teste concluir — **não precisa de mecanismo novo**: é o `liberado` virando `true` no fechamento da etapa do teste. A tabela `cis_participantes` já tem `liberado` e `respondido`, e a API `/api/cis/verificar-acesso` já os respeita.

Um ajuste é necessário: hoje `cis_participantes` é chaveado por `projeto_id` (caminho B2B, consultoria). O fulfillment self-serve cria um projeto leve por comprador, exatamente como o de identidade já faz. O caminho B2B segue funcionando sem alteração.

---

## 4. O funil depois da troca — e o risco que a decisão 2 carrega

**A consequência precisa ser dita com todas as letras: hoje `/mapa` é uma captura grátis, e o Teste de Competências é pago. Trocar um pelo outro na porta de entrada remove o topo grátis do funil.** A conversão deixa de ser "responde grátis → recebe relatório → compra" e passa a ser "paga para entrar".

Isso é uma decisão comercial legítima — testes pagos na porta funcionam quando a promessa é específica o bastante — mas não é uma troca neutra, e o número que mede se deu certo muda junto: passa a ser custo por venda, não taxa de conclusão.

**Três caminhos, com recomendação:**

| Caminho | O que acontece | Avaliação |
|---|---|---|
| **A — Camada grátis do próprio teste** *(recomendado)* | A etapa 1 (12 blocos, ~4 min) é grátis e devolve **apenas a posição das 4 capacidades, sem interpretação**. Trilha, Mapeamento Comportamental e relatório ficam atrás do pagamento. | Preserva a captura, e a captura passa a ser do produto certo. Risco a controlar: a SPEC alerta que resultado parcial "vira o produto na cabeça do cliente" — por isso o grátis entrega **posição sem texto**, que gera pergunta em vez de resposta. |
| **B — Troca seca** | O teste pago vira a porta. Sem versão grátis. | Mais simples e mais honesto com o posicionamento. Mais caro de encher o topo. |
| **C — `/mapa` recuado, não removido** | O teste vira a porta, e o Mapa de Maturidade passa a ser oferecido depois — ou no caminho B2B. | Complementa A ou B; não é alternativa a elas. |

**O Mapa de Maturidade não sai do ar em nenhum dos caminhos.** Ele mede a *empresa*; o teste mede a *pessoa*. Na sequência da SPEC — teste → sessão de leitura → workshop → programa — Maturidade e Identidade encaixam do workshop em diante, que é onde a conversa deixa de ser sobre o dono e passa a ser sobre o negócio. Rotas preservadas, CTA da home e da LP redirecionados.

**Esta é a única decisão deste plano que ainda está aberta.** Escolher A, B ou C antes da fase F6.

---

## 5. Modelo de dados

A SPEC §9 propõe `assessment_sessions` / `cf_respostas` / `cf_ancoradas`. O repositório usa prefixo por instrumento: `mapa_*`, `id_v2_*`, `cis_*`, `agency_*`. Adotar a convenção do repositório.

```sql
comp_assessments (
  id, projeto_id, pagamento_id, email,
  status,                       -- 'not_started' | 'in_progress' | 'done'
  ordem_seed,                   -- randomização reproduzível das 4 opções
  criterio_corte,               -- 'por_score' | 'por_ancora' | 'por_escolha'
  catalogo_versao, faixas_versao, delta_versao,
  iniciado_em, concluido_em
)

comp_answers (                  -- uma linha por tela; espelha mapa_answers
  assessment_id, etapa,         -- 1 | 2 | 3
  item_id,                      -- 'B01'..'B12' | id do ancorado | 'EVI-01'..
  payload jsonb,                -- {mais, menos} | {nivel} | {valor}
  ordem_exibida,                -- auditoria de viés de posição
  respondido_em
)

comp_scores (
  assessment_id, competencia_key, capacidade,
  score_bruto,                  -- -4..+4
  posicao,                      -- 'mais_forte'..'mais_fragil'
  nivel_afirmado,               -- 1..4, null se não aprofundada
  confianca_nivel               -- 'afirmado' | 'estimado' | null
)

comp_pilares (
  assessment_id, pilar, natural, em_contexto   -- congelado do CIS no fechamento
)

comp_faixas (                   -- seed da SPEC §7.2, VERSIONADO
  versao, competencia_key, pilar, minimo, maximo, confianca
)

comp_aderencia (
  assessment_id, competencia_key, pilar,
  posicao,                      -- 'abaixo' | 'dentro' | 'acima'
  distancia,                    -- pontos até a borda; alimenta o limiar δ
  sinalizado boolean            -- distancia >= δ
)

comp_trilha (
  assessment_id, ordem, competencia_key,
  rota,                         -- 'regular' | 'desenvolver' | 'compensar' | 'tecnica'
  pilar_alvo, conteudo_id
)
```

`comp_pilares` materializa os 4 pilares no fechamento em vez de ler `cis_assessments` na hora de gerar o relatório: congela o resultado e mantém o relatório reproduzível.

---

## 6. Fases

Cada fase entrega algo verificável e não deixa o repositório em estado quebrado.

| Fase | Entrega | Desbloqueia |
|---|---|---|
| **F0 · Fundação** | `apps/competencias-web` criado e deployado em projeto Vercel próprio, respondendo em URL própria. `@espansione/cis` e `@espansione/brand` extraídos. Nada roteado no domínio ainda. | Tudo. Produção intocada. |
| **F1 · Motor** | Banco de itens gerado do XLSX. `score.js`, `faixas.js` com δ, viabilidade 185–215 e integridade soma = 0 como **testes automatizados** (`node --test`, padrão do repo). Sem UI. | Testável antes de existir tela. |
| **F2 · Fluxo do teste** | Migration `comp_*`. 22 telas: abertura → 12 blocos (ordem randomizada e gravada) → 4 âncoras → 6 ancorados. Salvamento item a item, retomada. Etapa 2 atrás de flag até os itens ancorados existirem. | O teste roda ponta a ponta. |
| **F3 · Compra e liberação** | `provisionarCompetencias`. Cookie no apex. `liberado` como trava da ordem imposta. | Comprador entra e responde. |
| **F4 · Mapeamento Comportamental** | VERTHO do pacote, dentro do app novo, consumindo só `disc`/`dA`. Matriz `CC` não roda aqui. | Instrumento 2 concluído na conta. |
| **F5 · Motor de cruzamento + relatório** | Aderência com tolerância, rota da trilha, gerador de texto com as regras editoriais, varredura de chave de tradução crua, PDF via `window.print` (padrão já estabelecido — `html2pdf` foi revertido por gerar páginas em branco). | O produto existe. |
| **F6 · Troca da porta** | Rewrites multi-zone no `diagnostic-web`. CTA da home e da LP para `/teste`. `/mapa` recuado, vivo. | Funil novo no ar. **Depende da decisão A/B/C do §4.** |
| **F7 · Painel do avaliador** | Índice de Aderência, distribuição de escolha MAIS por afirmação, tempo por etapa, taxa de conclusão dos dois instrumentos. | Calibração deixa de ser cega. |

F7 não é opcional: sem a distribuição de escolha MAIS por afirmação, o equilíbrio de desejabilidade dentro dos blocos — que a SPEC identifica como o ponto mais provável de exigir ajuste — não tem como ser medido.

---

## 7. Pendências que não são código

| # | Pendência | Bloqueia | Quem resolve |
|---|---|---|---|
| 1 | **22 itens ancorados** (88 opções calibradas) | A etapa 2 inteira — a única saída não-ipsativa do produto. Com os 2 exemplos da SPEC, só `vender_negociar` e `gestao_recursos` podem ser aprofundadas. | Redação + calibração da Vanessa. Posso entregar o rascunho completo seguindo as regras da SPEC e os 2 gabaritos. |
| 2 | **De-para 4 pilares → 24 características do acervo** | A entrega de conteúdo da trilha. O motor identifica o pilar e para ali. | Contorno da SPEC (recomendação da trilha sai da sessão de leitura, na mão, nas primeiras turmas) é o certo. |
| 3 | **Base normativa** | Percentil no relatório. Até lá: posição relativa, e nível "estimado" onde os dois ancorados discordarem. | 150–200 respondentes. |
| 4 | **Domínio do Resend** | O lembrete de 48h da SPEC. Já é pendência conhecida do funil. | Configuração. Alternativa imediata: WhatsApp, que já está integrado. |

**A pendência 1 é o caminho crítico.** Sem ela, F2 entrega o teste sem a etapa 2 e o relatório sai sem nível afirmado — que é a parte que justifica o preço.

---

## 8. Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Trilha instável entre aplicações | **Alta** — medida, não estimada | §2.1. Medir o overlap real assim que houver reteste. |
| Relatório sempre acha culpado comportamental | **Alta** sem correção | §2.2, δ = 10, recalibrável. |
| Duas cópias do instrumento CIS divergem | Alta se não houver pacote | `@espansione/cis`, cópia única. |
| Fronteira entre apps quebra a coesão de marca | Média | `@espansione/brand` + teste visual na fronteira. |
| Perda de topo de funil ao trocar grátis por pago | **Média a alta** | Decisão A/B/C do §4, antes de F6. |
| Comprador loga duas vezes e desiste | Média | Cookie no apex (F3). |
| Desequilíbrio de desejabilidade nos blocos | Alta, esperada pela própria SPEC | Instrumentação da F7 desde o primeiro respondente. |
| Chave de tradução crua no relatório | Baixa, mas cara | Varredura no build (§9). |

---

## 9. Checklist de aceite

Herda a SPEC §14 e acrescenta o que este plano introduziu.

**Da SPEC**
- [ ] Ordem imposta: comportamental bloqueado até o teste concluir
- [ ] Ordem das 4 opções randomizada por sessão e gravada em `ordem_exibida`
- [ ] Escala explicada uma única vez, na abertura
- [ ] Avanço automático nas etapas de escolha; manual nas âncoras
- [ ] Progresso por etapa, nunca por questão
- [ ] Integridade: soma dos 12 scores = 0
- [ ] Viabilidade das faixas (185–215) como teste automatizado
- [ ] Relatório só com os dois instrumentos concluídos
- [ ] Nenhum termo DISC em superfície de cliente — teste de string no build
- [ ] Nenhuma lista das 16 características no relatório
- [ ] Nenhum número de pilar, característica ou gap exposto
- [ ] Máximo 3 características por competência, nunca duas do mesmo pilar
- [ ] Texto explícito quando não há ponto de atenção numa competência
- [ ] Índice de Aderência só no painel do avaliador
- [ ] Varredura de chave de tradução não resolvida antes do deploy
- [ ] Métrica de conclusão dos **dois** instrumentos instrumentada

**Deste plano**
- [ ] Âncoras respondidas antes da ramificação; `criterio_corte` gravado
- [ ] Empate remanescente resolvido por escolha do respondente, nunca por regra arbitrária
- [ ] Tolerância δ aplicada e versionada; regra 4 dispara em ≥ 15% dos casos reais
- [ ] `faixas_versao`, `delta_versao` e `catalogo_versao` gravados em toda sessão
- [ ] Instrumento CIS existe em **uma** cópia, no pacote
- [ ] Sessão atravessa `/area` e `/teste` sem novo login
- [ ] "Mapeamento Comportamental" em toda superfície de cliente — nunca "Perfil Comportamental", nunca "CIS"
- [ ] `/mapa` e `/form/identidade-final/*` seguem respondendo depois da F6
- [ ] Namespace separando *Assertividade* e *Sociabilidade* das duas taxonomias

---

## 10. O que não entra

Da SPEC §13, mantido: sem plataforma de biblioteca e trilhas automatizadas, sem motor automático de recomendação de conteúdo, sem painel agregado de time, sem 360 multifonte, sem IRT, e sem calcular as 16 características no fluxo novo.

Acrescento: **sem migrar Maturidade ou Identidade para o app novo**. Eles medem a empresa, funcionam, e movê-los agora é risco sem retorno.

---

## Resumo em uma linha

A SPEC é implementável e encaixa num eixo que o produto ainda não cobria — a pessoa, e não a empresa. Metade dela já está construída. Antes de escrever código, três coisas precisam ser decididas ou corrigidas: **a estabilidade da ramificação** (§2.1), **a tolerância das faixas** (§2.2) e **o que substitui a captura grátis no topo do funil** (§4).
