# Diagnóstico — duplicação de formulários (intake do diagnóstico × Mapa de Identidade FINAL)

**Data:** 27/08/2026 · **Status:** diagnóstico, nenhum código alterado
**Decisão do usuário (27/08):** os formulários corretos são os do `/area` (família B — Mapa de Identidade FINAL). Os que o `/adm/[id]` distribui hoje (família A — intake) estão desatualizados. As seções 1 a 5 mapeiam o que existe; a 6 registra a decisão; a 7 e a 8, o que ela custa e em que ordem.

---

## 1. As duas famílias

| | **A — Intake do diagnóstico** | **B — Mapa de Identidade FINAL** |
|---|---|---|
| Rotas | `/form/socios`, `/form/colaboradores`, `/form/clientes` | `/form/identidade-final/[publico]` |
| Parâmetro de token | `?t=` (aceita `?token=` também) | `?token=` (+ `rid` por respondente) |
| Fonte das perguntas | **Hardcoded em React** — `components/forms/FormSocios/Parte1..6`, `FormColaboradores/Bloco1..8`, `FormClientes/Secao1..7`; constantes em `lib/forms/*_schema.js` | **Data-driven** — `lib/identidade-final/catalog.generated.js` (gerado da planilha FINAL), montado por `lib/identidade-final/forms.js` |
| Persistência | `formularios` (`tipo` = `intake_socios` \| `intake_colaboradores` \| `intake_clientes`, `respostas_json`) + `intake_data.maturidade_360` | `id_v2_assessments` / `id_v2_respondents` / `id_v2_answers` (1 linha por resposta) |
| API | `POST /api/formularios` | `/api/identidade-final/{session,finalize,report,hub,acesso}` |
| Distribuição | `/adm/[id]` → `RespondentesManager`, `/api/convites/form-link`, `/api/convites/enviar-batch` | `/identidade/setup` (pós-compra) e `/area` → `/api/area/dados` |
| Consumidor | **A esteira dos 15 agentes** — `lib/ai/pipeline.js:54` (`AGENT_FORM_TYPES`): agentes 1, 2, 5, 13, 15 leem `intake_socios`; 1, 2, 14 leem `intake_colaboradores`; 3 e 4 leem `intake_clientes` | Scoring e relatório próprios — `lib/identidade-final/{scoring,report,reportHtml}.js` |
| Produto | Consultoria (esteira / entrega Espansione) | Funil pago (`crescimentointegrado.com.br`) |
| Autosave | `lib/forms/useFormPersistence.js` (localStorage) | servidor, via `/api/identidade-final/session` |

**Nenhuma linha de código é compartilhada entre as duas.** Não há adapter, não há mapeamento de IDs, e as duas gravam em conjuntos de tabelas disjuntos.

---

## 2. Volume

| Público | A — intake | B — FINAL |
|---|---|---|
| Sócios | 6 partes: ~17 campos de identificação + ~15 de marca + 16 de propósito + 12 de marca empregadora + ~36 de visão/comercial/comunicação + **48 afirmações do 360** + 12 arquétipos + radar de 11 dimensões | **41 perguntas** (3 perfil + 24 maturidade + 6 ESP + 8 abertas) |
| Colaboradores | 8 blocos: ~31 perguntas numeradas + escalas Likert 1–5 + eNPS + opt-in | **33 perguntas** (3 perfil + 24 maturidade + 6 ESP incl. eNPS) |
| Clientes | 7 seções: ~30 perguntas + escalas 0–10 + opt-in | **32 perguntas** (2 perfil + 24 maturidade + 3 drivers + NPS + satisfação + melhoria) |

O FINAL soma **106 perguntas** no instrumento inteiro, das quais **24 por público são indicadores comparáveis** — o mesmo construto perguntado de forma adequada a cada público. É essa simetria que sustenta a triangulação; o intake não tem nada equivalente.

---

## 3. Sobreposição real, pergunta a pergunta

### 3.1 Sócios

| Construto | A — intake (sócios) | B — FINAL (sócios) | Veredito |
|---|---|---|---|
| Identidade e propósito claros | P3.16 "Sua empresa tem um propósito declarado e comunicado?" + P3.1–15 (história, indignação, causas) | `V30-SD-MAR-01` (escala) + `AB-SD-MAR-01/02` (abertas) | **Duplicado.** B mede; A explora em profundidade. |
| Diferenciação | P2.5 "diferenciais" + P2.6.1–6.4 (ganha/perde) | `V30-SD-MAR-02` (escala) | **Duplicado.** |
| Promessa × entrega | P5.11 "o que a marca promete que nem sempre entrega" + P5.12 (incoerência) | `V30-SD-MAR-03` (escala) + `V30-SD-ESP-06` (aberta: principal desalinhamento) | **Duplicado, quase palavra por palavra.** |
| Valores vividos | P3.12/P3.13 (valores inegociáveis + definição) + P4.7 | `V30-SD-MAR-04` | **Duplicado.** |
| Reputação e confiança | — (só indireto, via P2.9) | `V30-SD-MAR-05` | Só em B. |
| Consistência da identidade | P5.13/P5.14 (divergência entre sócios) | `V30-SD-MAR-06` | Parcial. |
| Direção / visão de futuro | P5.1, P5.2 (3 e 5 anos), P5.6 (metas 12m), P5.7 | `V30-SD-NEG-01` + `AB-SD-MAR-04` (reputação desejada em 3 anos) | **Duplicado.** |
| Conhecimento do cliente / ICP | P5.22–P5.27, P5.36 (3 clientes reais) | `V30-SD-NEG-02` | **Duplicado**, mas A é muito mais granular (ICP operacional). |
| Valor entregue / oferta | P2.1 "o que a empresa oferece ao cliente" | `V30-SD-NEG-03` + `AB-SD-NEG-01` (o que vende / p/ quem / transformação) | **Duplicado.** |
| Concorrência | P2.8.1/8.2 (concorrentes com nome, fortes/fracos) | `V30-SD-NEG-04` + `V30-SD-ESP-01` (até 3 concorrentes) | **Duplicado.** A é mais rico (usado pelo Agente 5 de busca web). |
| Processos e gestão | 360 itens 3, 6, 7, 41–48 | `V30-SD-NEG-05` | **Duplicado** em granularidade diferente (10 afirmações × 1). |
| Resultados / capacidade de crescer | 360 itens 9–16, 47 | `V30-SD-NEG-06` + `V30-SD-ESP-03` (satisfação 0–10) | **Duplicado.** |
| Comunicação interna | P4.2 "desafios de comunicação interna" | `V30-SD-COM-01/02` | **Duplicado.** |
| Comunicação externa / canais | P5.15–P5.21 (canais, papel, quem cuida, orçamento, o que funciona) | `V30-SD-COM-03/04/05` | **Duplicado** — mas **P5.15–P5.21 é insubstituível**: o Agente 13 lê `p5_canais_ativos_hoje`, `p5_canais_papel_principal`, `p5_equipe_comunicacao`, `p5_orcamento_comunicacao_faixa`. |
| Feedback → melhoria | — | `V30-SD-COM-06` | Só em B. |
| Liderança e pessoas | P4.1 (clima), P4.3 (desafios de liderança), P4.8; 360 itens 33–40; radar de 11 dimensões (P4.9/P4.10) | `V30-SD-PES-01..06` + `V30-SD-ESP-05` + `AB-SD-PES-01` | **Duplicado.** |
| Proposta de valor ao colaborador | P4.4/P4.5/P4.6 ("o que oferece / o que pede / por que escolher vocês") | `AB-SD-MAR-03` (mesma pergunta, condensada em uma) | **Duplicado quase literal.** |
| Riscos / medos | P5.8 (tira o sono), P5.9 (maior medo), P5.10 (vergonha) | `V30-SD-ESP-04` (riscos, múltipla até 3) | **Duplicado** — A qualitativo, B categórico. |
| Prioridades 12 meses | P5.6 | `V30-SD-ESP-02` (ranking top 3) | **Duplicado.** |
| Referências / benchmarks | P2.9, P2.10, P4.11, P4.12 (marca/empresa admirada + atributo/prática a emprestar) | `AB-SD-NEG-03` | **Duplicado.** |
| **Arquétipos (12)** | P2 — seleção de arquétipos de marca | — | **Só em A.** |
| **Radar Marca Empregadora (11 dimensões)** | P4 | — | **Só em A.** |
| **Diagnóstico 360 (48 afirmações, 6 pilares)** | P6 — Estratégia, Finanças, Comercial, Marketing, Pessoas, Operação | — (B tem 24 itens em 4 pilares: Marca, Negócios, Comunicação, Pessoas) | **Só em A.** Estruturas incompatíveis. |
| **Identificação da empresa (17 campos)** | P1 — razão social, ano, faturamento, nº colaboradores, site/redes, organização societária | `D-SD-01/02/03` (papel, porte, segmento) | A é muito mais completo. |
| **Bloco de origem/essência (16 perguntas de propósito)** | P3 inteiro | 4 abertas (`AB-SD-MAR-*`) | A é muito mais profundo — matéria-prima dos Agentes 1, 2 e 15. |

**Leitura:** dos 24 indicadores comparáveis do FINAL para sócios, **~20 já são perguntados no intake** de alguma forma. O intake pergunta mais e mais fundo; o FINAL pergunta de forma comparável e pontuável.

### 3.2 Colaboradores

| Construto | A — intake | B — FINAL | Veredito |
|---|---|---|---|
| Perfil (área, tempo de casa) | Bloco 1 A/B | `D-CL-01/02/03` (+ liderança formal) | **Duplicado.** B acrescenta o corte de liderança. |
| Compreensão do propósito | Bloco 2, itens 1–5 | `V30-CL-MAR-01` | **Duplicado.** |
| Diferenciação percebida | Bloco 2, item 6 (literal) | `V30-CL-MAR-02` + `V30-CL-ESP-01` (aberta, literal) | **Duplicado quase palavra por palavra.** |
| Promessa × entrega | Bloco 6, item 18 ("o que comunica pra fora que não acontece por dentro") | `V30-CL-MAR-03` | **Duplicado.** |
| Valores vividos / cultura | Bloco 3 (itens 7–10, cultura em 1 palavra, fortalece/enfraquece) | `V30-CL-MAR-04` | **Duplicado.** |
| Segurança psicológica | Bloco 4 (Likert 1–5) | — | **Só em A.** |
| Liderança imediata | Bloco 5 (item 17, aberta) | `V30-CL-PES-01` + `V30-CL-ESP-02` (satisfação 0–10) | **Duplicado.** |
| Clareza de papéis / autonomia | — | `V30-CL-PES-02` | Só em B. |
| Preparo, feedback, desenvolvimento | Bloco 7 parcial | `V30-CL-PES-03/04` | Parcial. |
| Colaboração entre áreas | — | `V30-CL-PES-05` | Só em B. |
| Responsabilização por resultados | — | `V30-CL-PES-06` | Só em B. |
| eNPS | Bloco 7 (seção "Recomendação (eNPS)") | `V30-CL-ESP-05` | **Duplicado.** |
| Motivação / permanência / saída | Bloco 7, itens 22–25, 27 | `V30-CL-ESP-06` (mudança prioritária) | Parcial — A é bem mais rico. |
| Indicação de vaga | Bloco 7, item 28 | — | **Só em A.** |
| Barreiras à entrega | Bloco 7, item 29 | `V30-CL-NEG-05` | **Duplicado.** |
| Momentos marcantes (orgulho / pensou em sair) | Bloco 6, itens 20–21 | — | **Só em A.** Alimenta o Agente 14. |
| Opt-in de entrevista | Bloco 8 | — | **Só em A.** |

### 3.3 Clientes

| Construto | A — intake | B — FINAL | Veredito |
|---|---|---|---|
| Perfil / tempo de relação | Seção 1 + item 8 (última interação) | `CLI-DAD-001/002` | **Duplicado.** |
| Fatores de escolha | Seção 2, item 11 (`FATORES_ESCOLHA`) | `CLI-VAL-001/002` (até 3 + o decisivo) | **Duplicado**, B mais bem estruturado. |
| Diferencial percebido | Seção 4, item 17 | `CLI-MAR-003` | **Duplicado.** |
| Credibilidade / reputação | — | `CLI-MAR-001/004` | Só em B. |
| Promessa × experiência | Seção 4, item 21 (esperava × encontrou) | `CLI-MAR-005` | **Duplicado.** |
| Recompra / 1ª opção | Seção 6 | `CLI-MAR-006` | **Duplicado.** |
| Entendimento da necessidade | Seção 3 | `CLI-NEG-001` + `CLI-PES-004` | **Duplicado.** |
| Resolução / resultado / investimento | Seção 4 | `CLI-NEG-002/003/004` | **Duplicado.** |
| Cumprimento de combinados | Seção 3 | `CLI-NEG-005/006` | **Duplicado.** |
| Qualidade do atendimento (0–10) | Seção 3 (`DIMENSOES_ATENDIMENTO`) | `CLI-PES-001..006` (6 escalas 4pt) | **Duplicado** em escalas diferentes. |
| Canais de contato | Seção 3 (`CANAIS_INTERACAO`) | `CLI-COM-004` | **Duplicado.** |
| Comunicação na jornada / momentos críticos | Seção 4, item 18 | `CLI-COM-005/006` | **Duplicado.** |
| Preço × valor | Seção 4 (`PERCEPCAO_PRECO`, `MUDARIA_POR_PRECO`) | `CLI-NEG-004` + `CLI-VAL-003` | **Duplicado.** |
| NPS + satisfação | Seção 6 | `CLI-EXP-001/002` | **Duplicado.** |
| Prioridade de melhoria | — | `CLI-VAL-004` | Só em B. |
| **Personalidade da marca / palavra que nunca usaria** | Seção 5 (itens 26–27) | — | **Só em A.** Alimenta o Agente 3. |
| **Marcas admiradas / migração** | Seção 2, item 14 | — | **Só em A.** |
| Opt-in de entrevista | Seção 7 | — | **Só em A.** |

---

## 4. O que trava a unificação

Estes quatro pontos são o motivo de as duas famílias ainda coexistirem. Qualquer decisão precisa tratá-los.

1. **O 360 de 48 afirmações.** A tem 6 pilares (Estratégia, Finanças, Comercial, Marketing, Pessoas, Operação); B tem 4 (Marca, Negócios, Comunicação, Pessoas). **As taxonomias não são redutíveis uma à outra** — Finanças e Operação não têm correspondente em B, e Marca não tem em A. O resultado agregado vive em `intake_data.maturidade_360` (calculado em `pages/api/formularios.js:115`) e é consumido pelo Agente 2.
2. **Campos que a esteira lê por nome.** O Agente 13 depende literalmente de `p5_canais_ativos_hoje`, `p5_canais_papel_principal`, `p5_equipe_comunicacao`, `p5_orcamento_comunicacao_faixa`. O Agente 15 extrai o sócio-fundador de `intake_socios`. Nenhum desses campos existe no catálogo FINAL.
3. **Profundidade qualitativa.** O intake tem ~60 perguntas abertas longas por sócio (origem, indignação, incoerências, tensões societárias, ICP, provas, objeções reais). O FINAL tem 8. **Os agentes 1, 2, 5, 13 e 15 vivem dessa matéria-prima** — trocar o intake pelo FINAL puro empobrece drasticamente a entrega da consultoria.
4. **Modelos de dado incompatíveis.** A grava um blob (`formularios.respostas_json`); B grava linha a linha (`id_v2_answers`, 1 por pergunta). Consolidar exige migração ou adapter permanente.

**Na direção contrária**, o que só B tem e A nunca terá do jeito atual: comparabilidade entre os três públicos (mesmo construto, escala idêntica), pontuação de maturidade automática, autosave no servidor, e perguntas que vivem em planilha em vez de em JSX.

---

## 5. Resíduo morto — REMOVIDO em 27/08

Eram seis diretórios das gerações anteriores do módulo de identidade (as versões "Estratégica" e "v2" que o FINAL substituiu):

- `lib/mapa-identidade/`
- `lib/identidade-v2/` (e o `__tests__` dentro dela)
- `pages/form/identidade/`
- `pages/form/identidade-v2/`
- `pages/api/identidade/`
- `pages/api/identidade-v2/`

**Correção do que este documento dizia antes:** não era "resíduo no repositório". Os arquivos já tinham sido apagados em 05/07; o que sobrou foram **diretórios completamente vazios** — `lib/identidade-v2/__tests__` inclusive — que o **git nunca rastreou** (git não versiona diretório vazio). Nada no monorepo importava desses caminhos.

Removidos com `rmdir` (que se recusa a apagar diretório não-vazio, e por isso é a verificação e a ação ao mesmo tempo). **`git status` ficou inalterado: a limpeza não produziu commit nenhum**, porque não havia nada versionado para remover.

⚠️ Não confundir com as tabelas `id_v2_*` em produção: `id_v2_assessments` / `id_v2_respondents` / `id_v2_answers` são a persistência **viva** do Mapa de Identidade FINAL. O prefixo é herança de nome; as tabelas estão em uso.

---
## 6. A decisão já está tomada

**Os formulários corretos são os da família B** — os que o cliente recebe em `crescimentointegrado.com.br/area`. Os que o `/adm/[id]` distribui hoje (família A) estão desatualizados.

Confirmado no código: `/area` entrega `/form/identidade-final/{socios,colaboradores,clientes}?token=` (`pages/api/area/dados.js:61-63`), enquanto o `/adm` entrega `/form/{socios,colaboradores,clientes}?t=` (`pages/api/convites/form-link.js:7-9` e `enviar-batch.js:7-9`). São dois mapas de rota diferentes, em dois arquivos, e nenhum dos dois sabe do outro.

Isso encerra a escolha entre os três caminhos: **é a Opção 1** (catálogo único do FINAL, com módulos extras para a consultoria). O que resta não é decidir a direção — é o que ela custa.

---

## 7. O que a decisão custa, em três frentes

### 7.1 Ligar o `/adm` aos formulários do FINAL — barato, o backend já existe

`id_v2_assessments` **já é chaveado por `projeto_id`**, que é exatamente o `/adm/[id]`. E `POST /api/identidade-final/hub` com `{ projeto_id }` cria o assessment se não existir e devolve os três tokens (`hub.js:26-46`).

Ou seja: o painel pode distribuir os formulários certos **sem nenhum endpoint novo**. Falta só trocar o mapa de rota em `form-link.js` / `enviar-batch.js` e fazer o `RespondentesManager` chamar o `hub`. Hoje o `/adm` não tem uma única referência a `identidade-final`.

### 7.2 A esteira dos 15 agentes — é aqui que está o trabalho

Os agentes leem `formularios` por `tipo` (`pipeline.js:54`): 1, 2, 5, 13, 15 leem `intake_socios`; 1, 2, 14 leem `intake_colaboradores`; 3 e 4 leem `intake_clientes`. O FINAL grava em `id_v2_answers`, linha a linha, e nada disso chega aos agentes.

**Ordem obrigatória: o adapter vem antes da troca no `/adm`.** Trocar o painel primeiro deixa a esteira cega — os projetos novos passam a não ter `intake_*` nenhum, e os agentes 1, 2, 3, 4, 5, 13, 14 e 15 perdem a entrada.

### 7.3 O que só existe no intake e a esteira consome — decisão de metodologia

Estes blocos não têm equivalente no catálogo FINAL, e cada um tem um agente do outro lado:

| Bloco | Quem consome |
|---|---|
| 360 de 48 afirmações, 6 pilares (`intake_data.maturidade_360`) | Agente 2 |
| Campos `p5_canais_ativos_hoje`, `p5_canais_papel_principal`, `p5_equipe_comunicacao`, `p5_orcamento_comunicacao_faixa` | Agente 13 |
| ~60 perguntas abertas longas por sócio (origem, indignação, incoerências, tensões societárias, ICP, provas, objeções) | Agentes 1, 2, 5, 15 |
| Momentos marcantes do colaborador (orgulho / pensou em sair) | Agente 14 |
| Personalidade da marca / palavra que nunca usaria | Agente 3 |
| Arquétipos (12) e radar de Marca Empregadora (11 dimensões) | Entrega da consultoria |

Cada um entra no catálogo FINAL como módulo do perfil "consultoria", ou é aposentado. **Isso é decisão de metodologia, não de engenharia — precisa da Vanessa.** O caso mais pesado é o 360: são 6 pilares (Estratégia, Finanças, Comercial, Marketing, Pessoas, Operação) contra os 4 do FINAL (Marca, Negócios, Comunicação, Pessoas), e as taxonomias não são redutíveis uma à outra.

---

## 8. Ordem de execução

1. ~~**Limpar o resíduo morto** da §5~~ — **FEITO em 27/08.** Custou menos que o previsto: eram diretórios vazios não-versionados, sem commit.
2. **Levar ao catálogo FINAL, como módulo de consultoria**, os blocos da §7.3 que a Vanessa decidir manter. — *bloqueado na decisão de metodologia.*
3. **Escrever o adapter** `id_v2_answers` → formato que os agentes esperam, mantendo `AGENT_FORM_TYPES` funcionando. — *não depende da Vanessa para os ~20 construtos que já existem nos dois instrumentos; os blocos exclusivos ficam como lacuna que degrada.*
4. **Só então** trocar o `/adm` para distribuir `/form/identidade-final/*` via `hub`.
5. Aposentar `/form/socios|colaboradores|clientes` e os schemas em JSX.

O passo 4 é o único que quebra algo se for feito fora de ordem. O passo 3 é o caminho crítico.
