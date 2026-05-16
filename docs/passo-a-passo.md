# Passo-a-passo — Rodar um projeto no Espansione

Guia operacional para conduzir um diagnóstico completo, do cadastro à entrega do documento editorial consolidado.

---

## 0. Pré-requisitos

- Usuário `master` cadastrado (via `/register` com token de convite).
- Chaves configuradas em produção (`SUPABASE_*`, `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`, `TAVILY_API_KEY`, `RESEND_API_KEY`).
- Domínio verificado no Resend (em sandbox, só envia para o e-mail dono da conta).
- **Vercel Pro ativo** — requerido para os endpoints de PDF (`memory: 3009 MB` do Chromium slim).
- Para rodar migrations locais: `SUPABASE_ACCESS_TOKEN` em `.env.local` + `scripts/run-migration.mjs`.

---

## 1. Criar o projeto

1. Login em `/login` com credenciais master.
2. Em `/adm`, clicar em **Novo Projeto**.
3. Preencher:
   - **Cliente** (nome da empresa)
   - **Segmento** (o mais específico possível — é crítico para Agente 5)
   - **Porte**, **Momento**, **Objetivo**
   - **Tipo de negócio** (B2B / B2C) — afeta condicionais nos formulários
   - **Responsável** (e-mail que acompanhará)
4. Se o projeto **tem escopo de EVP** (Plataforma de Marca Empregadora — Agente 14), isso será consumido pelo Agente 15 / entregável. Hoje o flag é derivado pela presença de output 14; no futuro pode virar coluna explícita em `projetos`.
5. O projeto nasce com status `criado`.

---

## 2. Cadastrar respondentes

No painel do projeto (`/adm/[id]`), abrir o card **Respondentes**. Cada respondente precisa de:

- Nome
- Papel — `socios`, `colaboradores` ou `clientes`
- E-mail
- WhatsApp (opcional)

### Token (FIX.1)

Cada respondente recebe automaticamente um **token único de 48 chars hex** na criação, com expiração de **30 dias**. Esse token é a chave de acesso ao formulário público. Detalhes:

- **Imutável**: editar o respondente (nome, WhatsApp) NÃO regenera o token.
- **Renovação automática**: reenviar convite via `enviar-batch` ou `form-link` estende a expiração por +30 dias, mantendo o mesmo token. Respostas parciais em `sessionStorage` são preservadas.
- **Expiração**: após 30 dias sem reenvio, `/api/respondentes/by-token` retorna 410 Gone e a página mostra "Este link expirou. Solicite um novo convite ao administrador do projeto."

### Como adicionar

- **Manualmente** — preencher e salvar.
- **Import CSV/XLSX** — botão de upload; colunas `nome`, `email`, `papel` (+ `whatsapp` opcional).

### Template de email

Abrir o modal **Editar template** e customizar assunto/corpo com placeholders: `{nome}`, `{empresa}`, `{link_formulario}`, `{link_posicionamento}` (só sócios). Templates são salvos por projeto × papel.

### Preview do formulário (FIX.2)

Ao lado de cada tipo de formulário no painel, ícone **👁 preview** abre `/form/<tipo>?projeto={id}&preview=true` em nova aba. Requer sessão admin ativa. Mostra banner âmbar sticky "respostas NÃO serão salvas", submit disabled. Útil para conferir o formulário antes de convidar respondentes reais.

---

## 3. Disparar os formulários

No card **Respondentes**, selecionar os contatos e clicar em **Enviar convites**.

- **Sócios** recebem DOIS links: Diagnóstico Inicial + Teste de Posicionamento Estratégico (27 perguntas, Treacy & Wiersema).
- **Colaboradores** recebem Pesquisa de Colaboradores (anônima) + link do Mapeamento Comportamental (DISC).
- **Clientes** recebem Entrevista com Clientes do ICP.

Status de cada respondente (pendente / respondido) aparece na tabela.

### Formulários disponíveis

| `tipo` | Rota pública | Quem responde |
|---|---|---|
| `intake_socios` | `/form/socios?t=...` | Sócios |
| `intake_colaboradores` | `/form/colaboradores?t=...` | Colaboradores (anônimo) |
| `intake_clientes` | `/form/clientes?t=...` | Clientes do ICP |
| `posicionamento_estrategico` | `/form/posicionamento?t=...` | Sócios |
| `mapeamento_cis` (DISC) | via `/form/[tipo]?t=...` | Todos os respondentes |

### Opt-in para entrevista

Ao final de `intake_colaboradores` e `intake_clientes`, o respondente pode marcar opt-in para entrevista aprofundada. A resposta gera um registro em `opt_in_entrevistas` com `status='pendente'`. Admin pode priorizar (`priorizado`), marcar como entrevistado (`entrevistado`) ou descartar.

---

## 4. Mapeamento Comportamental (CIS — DISC + Jung + 16 competências + Estilo de Liderança)

No card **Mapeamento Comportamental**, adicionar as mesmas pessoas (sócios + colaboradores). O link é enviado junto com o formulário principal.

O painel mostra:

- Status por participante (respondido / pendente)
- Ícone 📄 — PDF individual do perfil comportamental
- Ícone ✉️ — reenvia convite (útil contra spam)
- **Relatório Comportamental consolidado** — PDF com perfil do time

---

## 5. Posicionamento Estratégico (só sócios)

Após sócios responderem, o card **Posicionamento** exibe:

- **Visão consolidada** — barras EO / IC / LP com média dos sócios
- **Por respondente** — matriz das 27 respostas
- **Alerta de divergência** se sócios escolheram vetores diferentes — insumo crítico para Agente 6

---

## 6. Transcrições de entrevistas

Antes de rodar os consolidados (Agente 2 VI, Agente 4 VE), é preciso transcrever as entrevistas feitas com os roteiros dos Agentes 1 e 3. No painel:

1. Card **Entrevistas** — escolher respondente no dropdown.
2. Colar transcrição no modal (o texto pode vir com timestamps e marcação de interlocutor — o agente tolera formatos).
3. Salvar — grava como `entrevista_socios` / `entrevista_colaboradores` / `entrevista_cliente` em `formularios`.

Sem transcrições, os Agentes 2, 4 e 14 sinalizam limitação e reduzem confiança.

---

## 7. Rodar o pipeline dos 15 agentes

No card **Orquestrador de IA**, clicar em **Executar Agente N**. Na primeira execução, o modal de seleção de modelo pede que você escolha entre os modelos disponíveis (Gemini, Claude, OpenAI).

### Ordem e dependências

```
1 → 2 → 3 → 4
           [5 paralelo, não depende]
2 + 4 + 5 → 6 (CKPT 1) → 7 → 8 → 9 (CKPT 2) → 10 → 11 (CKPT 3)
                                            ↓                 ↓
                                           12 ─────────→ 13 (CKPT 4)
                                                        ↓
                                    14 (modular, se escopo EVP) → 15 (Editorial final)
```

### Dependências por agente (fonte única: `lib/agents/catalog.js`)

| Agente | Consome |
|---|---|
| 1 | `intake_socios`, `intake_colaboradores`, `posicionamento_estrategico`, DISC |
| 2 | Output 1 + `intake_socios/colaboradores/posicionamento`, `entrevista_socios/colaboradores`, DISC |
| 3 | Output 2 + `intake_clientes` |
| 4 | Output 3 + `intake_clientes`, `entrevista_cliente` |
| 5 | `intake_socios` (concorrentes + site) · roda deep research via Claude |
| 6 | Outputs 2, 4, 5 + DISC · **CKPT 1** |
| 7 | Output 6 |
| 8 | Outputs 6, 7 |
| 9 | Outputs 6, 7, 8 · **CKPT 2** |
| 10 | Outputs 6, 9 |
| 11 | Outputs 6, 9, 10 · **CKPT 3** |
| 12 | Outputs 6, 9 |
| 13 | Outputs 6, 7, 8, 9, 10, 11, 12 · **CKPT 4** |
| 14 | Outputs 2, 6, 7, 9 + `intake_colaboradores`, `entrevista_colaboradores` · **modular** (rodar só com escopo EVP contratado) |
| 15 | Outputs 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14 (opcional) · roda **após CKPT 4 aprovado** |

### Validação dura de dependências (FIX.4)

O `Pipeline.runAgent` verifica dependências ANTES de executar. Se faltar input obrigatório, lança erro explícito:

```
Agente 6 depende de output(s) ausente(s): 2, 4, 5. Execute o(s) agente(s) 2, 4, 5 antes.
```

O "próximo agente" sugerido no painel também usa o **primeiro faltante** (FIX.3/4) — respeita buracos. Se os outputs existentes são `[1, 2, 4, 5]`, o próximo sugerido é **3** (não 6).

### Executar

1. Clicar em **Executar Agente N**.
2. Escolher modelo — típicos: Gemini 2.5 Pro para agentes densos (2, 4, 6, 9, 13, 14), Claude Opus 4.7 para Agente 5 (deep research), Gemini Flash para agentes leves.
3. Aguardar 15–90s (Agente 5 pode levar 3-5 min — web search + Tavily).
4. Output aparece na trilha. Clique em **📖 Abrir** para ir à página editorial do output.

### Se der erro

- Abrir output mais recente e ler `[Conclusões]`.
- **Timeout**: tentar de novo com modelo mais rápido (Flash para secundários).
- **"Input insuficiente"**: verificar formulários/entrevistas do estágio.
- **"Agente X depende de output(s) ausente(s): ..."**: rodar os agentes listados antes.
- **Agente 5 falha na web search**: checar `ANTHROPIC_API_KEY`; fallback para Gemini não faz web search — o agente vai sinalizar limitação.
- **Agente 5 não acha o site**: editar `intake_socios` e preencher `site_instagram` com domínio completo.

---

## 8. Página editorial do output (TASK 4.2)

Depois de cada agente rodar, clicar em **📖 Abrir** no card do output → abre `/adm/[id]/outputs/[agent_num]`.

A página mostra:
- **Header** com breadcrumb, nome do agente, data, indicador de confiança colorido (Alta=verde, Média=âmbar, Baixa=vermelho) e botão **📄 Baixar PDF**
- **Sidebar** com lista de outros outputs do projeto + TOC (índice do conteúdo atual, scroll âncora)
- **Conteúdo editorial**: Resumo Executivo em card destacado, corpo do output em tipografia editorial (Andada Pro body + Rebrand Dis headings), visualizações renderizadas inline nos pontos onde o agente emitiu markers `<!-- VIZ:... -->`, Conclusões em card com borda azul

O PDF baixado (`{cliente}_agente-{n}_{data}.pdf`) é 1:1 da tela — mesmo React, mesmas visualizações, mesma tipografia.

---

## 9. Checkpoints — aprovação humana

Quando um checkpoint aparece (bloco amarelo no orquestrador), o pipeline está PAUSADO. Revisar com o cliente e aprovar:

- **CKPT 1** (após Agente 6): valida Decodificação + Direcionamento
- **CKPT 2** (após Agente 9): valida a Plataforma de Branding
- **CKPT 3** (após Agente 11): valida One Page de Personalidade
- **CKPT 4** (após Agente 13): entrega final (destrava Agente 15 Editorial)

Cada aprovação destrava os próximos agentes.

---

## 10. Agente 14 (EVP) — modular

Se o projeto contratou escopo de **Marca Empregadora**, rode o Agente 14 em paralelo aos Agentes 10/11/12. Requisitos:

- Outputs 2, 6, 7, 9 existentes
- `intake_colaboradores` com cobertura ≥ 30% do time (senão Agente declara limitação)

O output do Agente 14 alimenta a Parte 5.2 do entregável consolidado. Se não rodar, Parte 5.2 não aparece — comportamento esperado.

---

## 11. Agente 15 (Editorial) — consolidador final

Só roda **depois do CKPT 4 aprovado**. Consome apenas `resumo_executivo` + `conclusoes` dos demais outputs (não o conteúdo inteiro — context window tratável mesmo com 12 inputs).

Produz dois artefatos-rascunho:
- **Carta de Abertura** (350-450 palavras) — voz pessoal da consultora
- **Sumário Executivo** (450-600 palavras, estrutura rígida: desafio central / 3 achados / 3 direcionamentos / convite)

Output é rascunho editorial — requer 30-60 min de refino manual da consultora humana antes de publicar (voz pessoal, referências ao contexto do cliente). O prompt declara essa fronteira explicitamente.

---

## 12. Entregável final consolidado (TASK 4.4)

No topo do painel do projeto, botão **📘 Entregável final** → abre `/adm/[id]/deliverable`.

Documento editorial de 30-60 páginas com 8 partes:

- **Parte 0 — Abertura**: Carta + Sumário (Agente 15) + "Como lemos sua empresa" (metadados da escuta)
- **Parte 1 — Diagnóstico**: 1.1 Visão Interna (Agente 2 Parte B), 1.2 Visão Externa (Agente 4), 1.3 Leitura de Mercado (Agente 6 §3), 1.4 Cultura × Direção (Agente 6 §1.4)
- **Parte 2 — Direção**: Posicionamento T&W (Agente 6 §2) + Valores (Agente 7) + Diretrizes (Agente 8)
- **Parte 3 — Plataforma**: Agente 9 sem Manifesto + Manifesto em bloco serif destacado
- **Parte 4 — Expressão**: UVV (Agente 10) + One page visual (Agente 11)
- **Parte 5 — Vivência**: 5.1 Experiência (Agente 12); 5.2 EVP (Agente 14) condicional
- **Parte 6 — Ativação**: Plano de Comunicação + Roadmap + KPIs (Agente 13)
- **Parte 7 — Encerramento**: convite próxima fase + créditos

Botão **📘 Baixar PDF consolidado** → gera A4 com capa full-page + TOC + 8 partes, numeração de página no rodapé (exceto capa), footer editorial "Espansione · Método Ana Couto". Arquivo: `{cliente}_entregavel_{data}.pdf`.

Defensividade: cada parte tem empty-state elegante quando a seção esperada não existe ("Curadoria editorial pendente" se Agente 15 não rodou, etc.).

---

## 13. Danger Zone — re-executar um relatório (FIX.4)

No rodapé do painel, seção **Danger Zone** lista outputs gerados. Clicar em **🗑 Excluir relatório** abre modal com:

1. **Preview de cascata** — lista todos os outputs dependentes (transitivos) que serão invalidados junto. Ex.: apagar Agente 2 mostra "também serão apagados: Agentes 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15" (cadeia inteira).
2. **Confirmação forte** — se cascata ≥ 3 outputs, exige digitar **"confirmar"** no campo de texto antes de habilitar o botão vermelho.
3. **Execução** — apaga em transação; `etapa_atual` recalculado pela **última etapa consecutiva** (não max).

Após exclusão, o painel mostra o próximo agente sugerido (primeiro faltante, respeitando dependências). Re-executar é seguro.

---

## 14. Downloads e entregas

- **PDF por agente** — botão 📄 na página editorial (`/api/outputs/.../pdf` via Playwright — 1:1 da tela)
- **PDF consolidado** — botão 📘 em `/adm/[id]/deliverable`
- **Perfil DISC individual** — ícone 📄 no card de Mapeamento Comportamental (jsPDF legado)
- **Relatório Comportamental consolidado** — botão no topo do card de Mapeamento

---

## 15. Arquivando / excluindo um projeto

No topo do painel, **🗑 Excluir Projeto** apaga o projeto inteiro via cascade (outputs, formulários, respondentes, DISC, checkpoints, logs, intake_data, opt_ins). Operação irreversível — só o master pode executar.

---

## 16. Checklist mental antes de cada agente

| Antes de rodar | Confirme |
|---|---|
| Agente 1 | Todos os sócios + ≥ 50% dos colaboradores responderam; DISC rodou; posicionamento (sócios) respondido |
| Agente 2 | Entrevistas feitas e transcritas; output 1 completo; cobertura CIS ≥ 70% para emitir markers VIZ |
| Agente 3 | Output 2 gerado; lista de clientes ICP definida e convidada |
| Agente 4 | `intake_clientes` + `entrevista_cliente` transcritas |
| Agente 5 | `p3_concorrentes` (ou equivalente) preenchido no `intake_socios`; `ANTHROPIC_API_KEY` + `TAVILY_API_KEY` válidas |
| Agente 6 | Outputs 2, 4, 5 existentes; DISC consolidado |
| Agentes 7–9 | Output 6 aprovado no CKPT 1 |
| Agentes 10–13 | Output 9 aprovado no CKPT 2 |
| Agente 14 (modular) | Outputs 2, 6, 7, 9; cobertura intake_colaboradores ≥ 30% |
| Agente 15 (final) | **CKPT 4 aprovado**; maioria dos outputs 2-13 presentes |

---

## 17. Solução de problemas

- **E-mails não chegam** → Resend sandbox só envia pro dono da conta; verifique domínio no Resend.
- **Novo Projeto não aparece** → role precisa ser `master` ou `admin`.
- **Agente 5 não acha o site oficial** → edite `intake_socios` e preencha `site_instagram` com domínio completo.
- **Agente 6 reclama de lente ausente** → rode 2, 4, 5 antes (pipeline valida via `podeExecutar`).
- **Link do formulário diz "Este link expirou"** → disparar `enviar-batch` ou `form-link` — renova automaticamente (mesmo token, +30 dias).
- **PDF falha com 500** → checar plano Vercel (Pro necessário para `memory: 3009`); logs em `[deliverable-pdf] erro:` ou `[api/outputs/pdf]`.
- **PDF demora muito** → Chromium slim tem cold start ~5s; aumentar `timeoutMs` no `generatePdfFromPage` se preciso.
- **Modal de exclusão não aparece** → UI usa `cascadePreview` state — hard refresh se estado ficou preso.
- **Push não deployou** → `vercel deploy --prod --yes` manualmente.
- **Visualização não aparece na página editorial** → verificar se o output emitiu o marker correspondente (`<!-- VIZ:xxx -->`) e se os dados subjacentes existem (CIS coletivo ≥ 70% para markers de time, maturidade 360° para radar 360°).

---

## 18. Rodando um projeto-teste (fixture)

Para validar o pipeline sem dados reais, use os scripts locais (não commitados):

```bash
node --env-file=.env.local scripts/seed-gsim-parte1.mjs   # empresa + 2 sócios
node --env-file=.env.local scripts/seed-gsim-parte2.mjs   # 10 colaboradores + CIS
node --env-file=.env.local scripts/seed-gsim-parte3a.mjs  # 5 clientes + 360° agregado
node --env-file=.env.local scripts/seed-gsim-parte3b.mjs  # 3 entrevistas
```

Cria o projeto **GSIM Brasil** (id conhecido) com 17 respondentes, 22 formulários, 12 CIS, 2 opt-ins, 1 intake_data. Tensões plantadas (declarado × operado, sócios divergentes, cultura × aspiração, EVP gap, ambição × capacidade) permitem medir rigor dos agentes.

Para limpar após os testes:

```bash
node --env-file=.env.local scripts/cleanup-gsim.mjs                   # dry-run
node --env-file=.env.local scripts/cleanup-gsim.mjs --yes-wipe-gsim   # executa
```
