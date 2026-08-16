# SPEC — App do Teste de Competências Empreendedoras

**Espansione · Documento de implementação para Claude Code · Agosto 2026**

Este documento é autossuficiente. Contém todas as decisões de produto, o banco de itens completo, os algoritmos de pontuação e as regras do motor de recomendação. Não depende de conversa anterior.

---

## 1. Contexto e objetivo

A Espansione desenvolve competências comportamentais de empreendedores, sócios e líderes de PME. O **Teste de Competências Empreendedoras** é o primeiro produto pago a ser validado e a porta de entrada do funil: teste → sessão de leitura → workshop → programa.

O produto entrega **dois instrumentos** e **um relatório único**:

| Instrumento | O que mede | Status do código |
|---|---|---|
| **Teste de Competências** | Proficiência em 12 competências, agrupadas em 4 capacidades | A construir — spec completa aqui |
| **Perfil Comportamental** | 4 pilares comportamentais (natural e em contexto), 16 características derivadas | Já existe — `public/cis-app.js`, `lib/cis/parseCis.js` |

Ambos são entregues na compra. O relatório só é gerado quando os dois estiverem completos.

**Stack:** Next.js, Supabase, Vercel, monorepo pnpm/Turborepo. App em `web/apps/diagnostic-web`.

---

## 2. Nomenclatura — regra absoluta

O instrumento comportamental é derivado de DISC, mas **a nomenclatura DISC não aparece em nenhuma superfície de cliente**.

| Nunca usar | Usar |
|---|---|
| DISC, Dominância, Influência, Estabilidade, Conformidade | Determinação, Conexão, Constância, Precisão |
| Self / Adaptado | Natural / Em contexto |
| "competências" para as 16 do CIS | **características** |
| "deficiente", "fraco", "ruim", "problema" | "em desenvolvimento", "ponto de atenção", "exige intenção" |

Isso vale para UI, PDF, e-mail, textos gerados e mensagens de erro visíveis. As chaves internas (`COMPETENCIAS_KEYS`, colunas do banco) permanecem como estão — a mudança é de rótulo, não de schema.

**Cuidado com colisão de vocabulário:** as 16 do CIS são *características* (tendências, sem melhor/pior). As 12 do teste são *competências* (proficiência, mais é melhor). Nunca chamar as duas coisas pelo mesmo nome na mesma tela.

---

## 3. Arquitetura conceitual — três níveis

```
4 PILARES        ← única entrada de dado comportamental. É onde a regra DECIDE.
    ↓
12 COMPETÊNCIAS  ← agrupadas em 4 capacidades. É o RESULTADO que o cliente vê.
    ↓
16 CARACTERÍSTICAS ← LÉXICO. Nomeiam o pilar com precisão editorial dentro do texto.
                     Nunca decidem nada. Nunca aparecem como lista.
```

### 3.1 Os 4 pilares e seu léxico

| Pilar | Fator de origem (interno) | Características (léxico) |
|---|---|---|
| **Determinação** | D | Ousadia · Comando · Objetividade · Assertividade |
| **Conexão** | I | Persuasão · Extroversão · Entusiasmo · Sociabilidade |
| **Constância** | S | Empatia · Paciência · Persistência · Planejamento |
| **Precisão** | C | Organização · Detalhismo · Prudência · Concentração |

**Uso da etiqueta por contexto:**
- Determinação → *Ousadia* diante do risco · *Comando* diante das pessoas · *Objetividade* diante do ruído · *Assertividade* diante do conflito
- Conexão → *Persuasão* para venda · *Entusiasmo* para engajamento · *Sociabilidade* para rede · *Extroversão* para abertura
- Constância → *Empatia* para escuta · *Paciência* para desenvolver gente · *Persistência* para longo prazo · *Planejamento* para antecipação
- Precisão → *Detalhismo* para operação · *Prudência* para decisão · *Concentração* para foco · *Organização* para rotina

### 3.2 As 12 competências em 4 capacidades

| Capacidade | Chave | Competência |
|---|---|---|
| **Sustentar-se** | `autoconsciencia` | Autoconsciência e autoeficácia |
| | `persistir_ajustar` | Persistir e ajustar |
| | `coerencia_etica` | Coerência ética |
| **Decidir** | `leitura_oportunidade` | Leitura de oportunidade e de cliente |
| | `julgamento_incerteza` | Julgamento sob incerteza |
| | `direcao_modelo` | Direção e modelo de negócio |
| **Traduzir Valor** | `formular_valor` | Formular a proposta de valor |
| | `comunicar_posicionar` | Comunicar e posicionar |
| | `vender_negociar` | Vender, negociar e relacionar |
| **Fazer Acontecer** | `iniciativa_experimentacao` | Iniciativa e experimentação |
| | `gestao_recursos` | Gestão de recursos e operação |
| | `liderar_mobilizar` | Liderar e mobilizar pessoas |

---

## 4. Fluxo do usuário

```
COMPRA
  ↓
Ambos os instrumentos ficam disponíveis na conta
  ↓
[1] TESTE DE COMPETÊNCIAS  ← obrigatório primeiro, ~9-10 min
  ↓
[2] PERFIL COMPORTAMENTAL  ← desbloqueia só após o [1] concluir
  ↓
RELATÓRIO ÚNICO gerado
  ↓
Convite para a sessão de leitura
```

### Regras de fluxo — não negociáveis

1. **Ordem imposta.** O Perfil Comportamental fica bloqueado até o Teste de Competências ser concluído. Motivo: se a pessoa faz o comportamental antes, ela chega ao teste já se lendo por características e contamina a autoavaliação. A UI deve mostrar o segundo instrumento como bloqueado, com o motivo em uma linha.

2. **Resposta assíncrona.** Podem ser respondidos em momentos diferentes. Salvar progresso item a item.

3. **Nada de relatório parcial.** Após concluir o [1], mostrar apenas sinal de progresso ("Etapa 1 de 2 concluída"), nunca resultado. Resultado parcial vira o produto na cabeça do cliente e o segundo instrumento nunca é feito.

4. **Lembrete.** Se o [2] não for iniciado em 48h, disparar lembrete com o relatório como recompensa explícita.

---

## 5. Instrumento 1 — Teste de Competências

### 5.1 Estrutura

| Etapa | Telas | Formato |
|---|---|---|
| 1 · Escolha forçada | 12 | 4 afirmações, marcar MAIS e MENOS parecida |
| 2 · Ramificação | 6 | Item ancorado: situação + 4 níveis |
| 3 · Âncoras de evidência | 4 | Contagem factual, avanço manual |
| **Total** | **22** | ~9 a 10 minutos |

### 5.2 UX

- Enunciado da escala explicado **uma única vez**, na abertura.
- Uma questão por tela.
- Etapas 1 e 2: avanço automático após a marcação completa.
- Etapa 3 (âncoras): exige toque em **Continuar** — não avança sozinha.
- Progresso mostrado por etapa, nunca por questão individual.
- Sem campo aberto em nenhum ponto.

**Texto exato da abertura:**

> Pensando nos seus últimos 90 dias à frente do negócio, marque a frase **mais parecida** e a **menos parecida** com você.

### 5.3 Os 12 blocos de escolha forçada

Cada bloco traz 4 afirmações, uma de cada capacidade. Cada competência aparece exatamente 4 vezes ao longo dos 12 blocos. **A ordem das 4 opções dentro do bloco deve ser randomizada por sessão** para evitar viés de posição.

#### Bloco B01
| Opção | Afirmação | Competência |
|---|---|---|
| A | Peço a quem trabalha comigo um retorno franco sobre a minha condução | `autoconsciencia` |
| B | Converso com clientes para entender o problema, não para vender | `leitura_oportunidade` |
| C | Explico o que o negócio entrega em uma frase que o cliente repete | `formular_valor` |
| D | Testo uma ideia nova em pequena escala antes de investir | `iniciativa_experimentacao` |

#### Bloco B02
| Opção | Afirmação | Competência |
|---|---|---|
| A | Depois de um mês ruim, mudo a abordagem em vez de insistir | `persistir_ajustar` |
| B | Defino quanto posso perder antes de entrar numa aposta nova | `julgamento_incerteza` |
| C | O mercado entende com clareza no que a minha empresa é boa | `comunicar_posicionar` |
| D | Sei quantos meses o caixa da empresa aguenta hoje | `gestao_recursos` |

#### Bloco B03
| Opção | Afirmação | Competência |
|---|---|---|
| A | Recuso negócio que dá dinheiro mas contraria o que a empresa defende | `coerencia_etica` |
| B | Sei dizer em uma frase como o negócio ganha dinheiro | `direcao_modelo` |
| C | Procuro clientes novos toda semana, mesmo com a agenda cheia | `vender_negociar` |
| D | Delego tarefas importantes e não refaço o trabalho do outro | `liderar_mobilizar` |

#### Bloco B04
| Opção | Afirmação | Competência |
|---|---|---|
| A | Reconheço na frente da equipe quando uma decisão minha deu errado | `autoconsciencia` |
| B | Decido com a informação que tenho, em vez de esperar por mais | `julgamento_incerteza` |
| C | Peço o fechamento em vez de esperar o cliente voltar | `vender_negociar` |
| D | Calculo a margem antes de fechar um preço | `gestao_recursos` |

#### Bloco B05
| Opção | Afirmação | Competência |
|---|---|---|
| A | Atravesso períodos de resultado fraco sem perder o ritmo de trabalho | `persistir_ajustar` |
| B | Escolho conscientemente que tipo de cliente não quero atender | `direcao_modelo` |
| C | Encontro um jeito diferente de resolver o problema do cliente | `formular_valor` |
| D | Dou o retorno difícil na hora, sem adiar para a próxima semana | `liderar_mobilizar` |

#### Bloco B06
| Opção | Afirmação | Competência |
|---|---|---|
| A | Cumpro o combinado com fornecedor mesmo quando ninguém cobraria | `coerencia_etica` |
| B | Percebo o que o cliente faz, não só o que ele diz | `leitura_oportunidade` |
| C | Falo do meu trabalho de um jeito que desperta interesse | `comunicar_posicionar` |
| D | Começo o que precisa ser feito sem esperar o momento ideal | `iniciativa_experimentacao` |

#### Bloco B07
| Opção | Afirmação | Competência |
|---|---|---|
| A | Sei nomear as duas coisas que eu faço pior no negócio | `autoconsciencia` |
| B | Defino metas com número e prazo, e acompanho numa rotina fixa | `direcao_modelo` |
| C | Mantenho uma mensagem consistente em todos os canais | `comunicar_posicionar` |
| D | Trato o conflito diretamente com quem está envolvido | `liderar_mobilizar` |

#### Bloco B08
| Opção | Afirmação | Competência |
|---|---|---|
| A | Abandono uma linha de produto quando os números não confirmam a aposta | `persistir_ajustar` |
| B | Identifico um segmento mal atendido antes dos concorrentes | `leitura_oportunidade` |
| C | Sustento o preço quando o cliente pede desconto | `vender_negociar` |
| D | Faço mudanças no negócio a partir do que o teste mostrou | `iniciativa_experimentacao` |

#### Bloco B09
| Opção | Afirmação | Competência |
|---|---|---|
| A | Considero o efeito sobre a equipe antes de decidir um corte | `coerencia_etica` |
| B | Comparo dois ou três caminhos antes de escolher um | `julgamento_incerteza` |
| C | Sei dizer por que o cliente escolhe a gente e não o concorrente | `formular_valor` |
| D | Padronizo o que se repete para não depender de mim | `gestao_recursos` |

#### Bloco B10
| Opção | Afirmação | Competência |
|---|---|---|
| A | Assumo projetos que exigem mais do que eu já provei que dou conta | `autoconsciencia` |
| B | Descubro por que um cliente parou de comprar, indo atrás dele | `leitura_oportunidade` |
| C | Mantenho contato com clientes antigos sem ter nada a vender | `vender_negociar` |
| D | Deixo claro para cada pessoa o que se espera dela | `liderar_mobilizar` |

#### Bloco B11
| Opção | Afirmação | Competência |
|---|---|---|
| A | Retomo negociações que travaram, com um ângulo diferente | `persistir_ajustar` |
| B | Assumo um risco calculado quando a janela de oportunidade é curta | `julgamento_incerteza` |
| C | Transformo um pedido difícil de cliente numa oferta nova | `formular_valor` |
| D | Levo uma ideia adiante mesmo sem ter todo o time convencido | `iniciativa_experimentacao` |

#### Bloco B12
| Opção | Afirmação | Competência |
|---|---|---|
| A | Digo ao cliente quando a minha solução não é a melhor para ele | `coerencia_etica` |
| B | Recuso oportunidades que não cabem na direção que escolhi | `direcao_modelo` |
| C | Adapto a mensagem a públicos diferentes sem perder o essencial | `comunicar_posicionar` |
| D | Separo com rigor as contas pessoais das contas da empresa | `gestao_recursos` |

### 5.4 Âncoras de evidência

Não usam escolha forçada. **Não entram no score das competências.** Alimentam o Índice de Aderência, que é informação do avaliador e nunca aparece no relatório do cliente.

| ID | Pergunta | Opções (valor 0→4) | Verifica |
|---|---|---|---|
| `EVI-01` | Nos últimos 30 dias, com quantos clientes ou potenciais clientes você conversou? | 0 · 1 a 3 · 4 a 10 · 11 a 20 · mais de 20 | `leitura_oportunidade`, `vender_negociar` |
| `EVI-02` | Nos últimos 90 dias, quantas mudanças você fez no negócio a partir de um teste? | 0 · 1 · 2 a 3 · 4 a 6 · 7 ou mais | `iniciativa_experimentacao`, `julgamento_incerteza` |
| `EVI-03` | Quando você olhou o fluxo de caixa da empresa pela última vez? | Nunca · Há mais de 6 meses · Neste trimestre · Neste mês · Esta semana | `gestao_recursos`, `direcao_modelo` |
| `EVI-04` | Nos últimos 90 dias, quantas conversas difíceis você teve com alguém do time? | 0 · 1 · 2 a 3 · 4 a 6 · 7 ou mais | `liderar_mobilizar`, `autoconsciencia` |

### 5.5 Ramificação — itens ancorados

**PENDÊNCIA: 22 dos 24 itens ancorados ainda não foram escritos.** Ver seção 12.

Após os 12 blocos, o sistema ordena as 12 competências e seleciona as **3 de menor score**. Cada uma recebe **2 itens ancorados** — sempre 6 telas, não varia.

**Formato:** uma situação concreta do negócio + 4 respostas em ordem crescente de proficiência. A opção escolhida **é** o nível (1 a 4).

**Regras de escrita das opções:**
- Nível 1 evita ou terceiriza · Nível 2 age por hábito · Nível 3 age com critério explícito · Nível 4 age com critério e reconfigura a situação
- Nenhuma opção pode ser obviamente errada — todas plausíveis para um dono de PME
- Nenhuma opção contém a palavra que nomeia a competência
- Situação em até 15 palavras; cada opção em até 18

**Exemplos trabalhados (usar como gabarito):**

`vender_negociar` — *Um cliente diz que o seu preço está alto.*
1. Ofereço um desconto para não perder a venda
2. Explico com mais detalhe tudo o que está incluído
3. Pergunto com o que ele está comparando
4. Investigo o resultado que ele espera e reabro a conversa

`gestao_recursos` — *Aparece uma oportunidade que exige investir agora.*
1. Decido pelo que o movimento do caixa parece permitir
2. Confiro o saldo em conta antes de decidir
3. Projeto o caixa dos próximos meses e vejo se cabe
4. Defino quanto posso perder e a que ponto eu desisto

### 5.6 Algoritmo de pontuação

```
// ETAPA 1 — escolha forçada
para cada bloco b em B01..B12:
    score[competencia_da_opcao_MAIS]  += 1
    score[competencia_da_opcao_MENOS] -= 1
    // as duas não marcadas ficam em 0

// faixa por competência: -4 a +4 (cada uma aparece em 4 blocos)
// faixa por capacidade: -12 a +12 (soma das suas 3 competências)
// CHECAGEM DE INTEGRIDADE: soma dos 12 scores == 0, sempre

// ORDENAÇÃO
ranking = competencias ordenadas por score, decrescente
// empate: prevalece a que estiver na capacidade de menor score

// ETAPA 2 — seleção da ramificação
tres_mais_baixas = ranking[-3:]
// empate na terceira posição: desempatar pela capacidade

// NÍVEL AFIRMADO (só para as 3 aprofundadas)
para cada competencia c em tres_mais_baixas:
    n1, n2 = níveis escolhidos nos 2 ancorados
    se n1 == n2:              nivel[c] = n1;          confianca = "afirmado"
    se |n1 - n2| == 1:        nivel[c] = max(n1,n2);  confianca = "afirmado"
    se |n1 - n2| >= 2:        nivel[c] = round(média); confianca = "estimado"
```

**Escala de saída para o relatório** — converter o score relativo em 5 posições:

`Mais forte` · `Forte` · `Intermediária` · `Frágil` · `Mais frágil`

> ⚠️ **Não usar número nem percentil enquanto não houver base normativa.** Ver seção 11.

### 5.7 Índice de Aderência

```
evidencia_media   = média das 4 âncoras, normalizada 0-100
declaracao_media  = score relativo médio das competências verificadas pelas âncoras,
                    normalizado para a mesma escala
aderencia = evidencia_media - declaracao_media

aderencia >= -10   → "coerente"
-25 < aderencia < -10 → "atenção"
aderencia <= -25   → "REVISAR NA SESSÃO DE LEITURA"
```

Nunca exibido ao respondente. Aparece apenas no painel do avaliador.

---

## 6. Instrumento 2 — Perfil Comportamental

### 6.1 O que já existe

Código em `web/apps/diagnostic-web`:
- `lib/cis/parseCis.js` → `COMPETENCIAS_KEYS` (as 16 chaves em snake_case)
- `public/cis-app.js` → matriz de coeficientes `CC`, função `calcScores`, `fixSum` (linha ~48)
- `components/pdf/RelatorioDisc.js` → relatório próprio do instrumento
- Saída atual: 8 scores de fator (natural + em contexto), 16 características 0–100, 4 estilos de liderança, rótulo de perfil, agregação de time

### 6.2 O que o relatório integrado consome

**Apenas os 4 pilares (natural e em contexto).** As 16 características entram só como léxico, buscadas por tabela.

**Não é necessário rodar a matriz `CC` no fluxo Espansione.** Basta derivar o pilar dos 4 scores de fator. A `CC` continua servindo o relatório próprio do CIS, se ele for usado avulso. Menos código, menos superfície de erro, mesmo resultado.

### 6.3 Fatos estruturais que restringem a implementação

Estes achados vêm da análise dos coeficientes da matriz `CC` e **devem ser respeitados pelo motor**:

**As 16 características não são 16 sinais independentes.** São transformação linear dos 4 fatores. Correlações entre vetores centrados:

| Par | r |
|---|---|
| Persuasão × Extroversão × Entusiasmo | 0,9996 – 0,9999 |
| Assertividade × Concentração | 0,9974 |
| Planejamento × Prudência | 0,9966 |
| Sociabilidade × Empatia | 0,9945 |
| Detalhismo × Concentração | 0,9941 |
| Objetividade × Assertividade | 0,9695 |

→ **Regra: nunca citar duas características do mesmo pilar como causas distintas.** É dizer a mesma coisa duas vezes.

**O bloco "em contexto" quase não diferencia entre características.** Os coeficientes `dA` somam entre 0,54 e 0,58 em todas as 16 linhas, são todos positivos e variam pouco entre si. O perfil em contexto desloca as 16 para cima de forma quase uniforme.

→ **Regra: a leitura de gap natural × em contexto opera SEMPRE sobre os 4 pilares brutos, nunca sobre as 16 características.**

**Organização tem amplitude 0,42** — a menor do conjunto (o topo é 1,13). Varia pouco, discrimina pouco.

→ **Regra: usar Organização apenas como léxico, nunca como argumento central.**

**Os 4 fatores somam 200 (perfil ipsativo).** Alto em um pilar implica baixo em outro, por construção. Ver seção 11.

---

## 7. Motor de cruzamento — faixas desejadas

### 7.1 Modelo

Para cada competência, cada pilar tem uma **faixa desejada**. Dentro da faixa, o comportamento contribui. Fora dela — **por cima ou por baixo** — é ponto de atenção.

Isso substitui um modelo anterior de habilitador/inibidor com direção fixa, e resolve dois problemas: o mesmo score gera leituras diferentes conforme a competência, e a curvilinearidade deixa de ser exceção.

### 7.2 As 48 faixas

| Competência | Determinação | Conexão | Constância | Precisão | Confiança |
|---|---|---|---|---|---|
| `autoconsciencia` | 35–70 | 45–85 | 40–80 | 10–45 | MÉDIA |
| `persistir_ajustar` | 35–75 | 25–65 | 50–90 | 10–50 | ALTA |
| `coerencia_etica` | 10–50 | 40–80 | 45–85 | 30–60 | **BAIXA** |
| `leitura_oportunidade` | 20–55 | 50–90 | 45–85 | 10–45 | ALTA |
| `julgamento_incerteza` | 50–90 | 25–65 | 20–55 | 30–65 | ALTA |
| `direcao_modelo` | 35–70 | 15–50 | 40–80 | 40–80 | MÉDIA |
| `formular_valor` | 30–65 | 50–90 | 30–70 | 10–50 | ALTA |
| `comunicar_posicionar` | 35–70 | 55–95 | 25–60 | 10–45 | ALTA |
| `vender_negociar` | 45–85 | 50–90 | 10–45 | 25–60 | ALTA |
| `iniciativa_experimentacao` | 55–95 | 35–75 | 20–55 | 10–45 | ALTA |
| `gestao_recursos` | 15–50 | 20–55 | 40–80 | 50–90 | ALTA |
| `liderar_mobilizar` | 45–85 | 45–85 | 30–65 | 10–45 | MÉDIA |

**Regra de viabilidade — implementar como teste automatizado:** como os pilares somam 200, a soma dos pontos médios das 4 faixas de cada competência precisa ficar **entre 185 e 215**. Fora disso, a faixa é insatisfazível e marcaria todo respondente como não aderente. Todas as 12 acima passam (195 a 205).

Corolário: **no máximo dois pilares podem ter faixa alta simultânea** numa mesma competência.

### 7.3 Textos de leitura por posição na faixa

Para cada competência, o pilar mais crítico e o texto de referência:

| Competência | Pilar crítico | Abaixo (falta) | Dentro (contribuição) | Acima (excesso) |
|---|---|---|---|---|
| `autoconsciencia` | Precisão | Age sem checar o efeito que causa | Reflete sem travar | Corta a reflexão antes que ela aconteça |
| `persistir_ajustar` | Constância | Abandona antes do resultado aparecer | Atravessa e ajusta | Sustenta além do que faz sentido |
| `coerencia_etica` | Determinação | Cede diante de pressão | Sustenta a posição com equilíbrio | Decide sozinho, sem freio externo |
| `leitura_oportunidade` | Conexão | Não abre a conversa | Escuta e extrai padrão | Fala mais do que escuta |
| `julgamento_incerteza` | Precisão | Arrisca sem calcular a perda | Calcula e decide | Paralisa buscando mais informação |
| `direcao_modelo` | Conexão | Fecha direção sem consultar | Escolhe e comunica | Abraça toda oportunidade, não fecha nada |
| `formular_valor` | Precisão | Promete o que não entrega | Estrutura sem engessar | Não consegue simplificar: quer dizer tudo |
| `comunicar_posicionar` | Conexão | Comunica sem conquistar | Convence e engaja | Encanta sem sustentar |
| `vender_negociar` | Determinação | Não pede o fechamento nem defende preço | Propõe com firmeza | Pressiona e queima o relacionamento |
| `iniciativa_experimentacao` | Determinação | Espera autorização para agir | Começa e testa barato | Age sem critério e não fecha |
| `gestao_recursos` | Precisão | Não acompanha o que gasta | Controla sem burocratizar | Controla tanto que trava a operação |
| `liderar_mobilizar` | Precisão | Delega sem acompanhar | Confia e cobra | Refaz o trabalho do outro — não delega |

### 7.4 Regra de acionamento da trilha

Aplicada a cada competência classificada como frágil ou intermediária:

| Ordem | Condição | Diagnóstico | Rota |
|---|---|---|---|
| 1 | Pilar **acima** da faixa | Fragilidade por excesso — padrão invisível, a pessoa não sabe que a própria força atrapalha | **REGULAR** (prioridade sobre o caso 2) |
| 2 | Pilar **abaixo** da faixa | Fragilidade por falta — a pessoa costuma sentir e reconhecer | **DESENVOLVER** |
| 3 | Dois ou mais pilares fora | Padrão múltiplo | Tratar o excesso primeiro. Um pilar por ciclo |
| 3b | Pilar fora, mas dificilmente desenvolvível ou não exigido pelo papel | Nem todo desvio deve ser corrigido. Fundador com Precisão baixa não vira detalhista com curso | **COMPENSAR**: processo, parceria, contratação, delegação |
| 4 | Todos os pilares **dentro** da faixa | Fragilidade **técnica**, não comportamental — a pessoa simplesmente não sabe fazer | Conteúdo técnico. **NÃO acionar módulo comportamental** |
| 5 | Competência com Confiança BAIXA | A leitura comportamental explica pouco | Não gerar recomendação comportamental. Sinalizar a limitação |

**Limites de volume:**
- Máximo 3 competências tratadas por ciclo
- Máximo 3 características nomeadas por competência, **nunca duas do mesmo pilar**
- Ordem de prioridade: 1º competências com nível afirmado mais baixo · 2º maior distância da faixa · 3º menor esforço
- **Sustentar-se não puxa prioridade de trilha.** É pré-condição, não diferenciação

### 7.5 Leitura do gap natural × em contexto

Opera sobre os **4 pilares brutos**. Corte provisório para "gap grande": diferença superior a 20 pontos.

| Padrão | Significado | Onde entra |
|---|---|---|
| Em contexto muito **acima** do natural num pilar | Compensação: a pessoa força uma postura que não é natural. Funciona, e cobra caro | Sustentar-se. Texto sobre custo de energia — **nunca como fragilidade** |
| Em contexto muito **abaixo** do natural | O ambiente suprime algo natural. Indica desalinhamento de papel ou de sociedade | Sustentar-se, com leitura de contexto |
| Gap grande em 3 ou 4 pilares | Esforço de adaptação generalizado. O papel atual não cabe na pessoa | Abre a conversa de próximo estágio. Gancho comercial forte |
| Gap pequeno em toda a linha | Coerência entre quem a pessoa é e o que o papel exige | Mencionar como força. Não gera trilha |
| Competência **alta** sustentada por pilar com gap grande | A competência existe por compensação, não por capacidade natural. Insustentável no médio prazo | A leitura mais valiosa do cruzamento — nenhum instrumento isolado enxerga isso |

**Nunca expor números de gap ao cliente.** Apenas texto.

---

## 8. Relatório integrado

### 8.1 Estrutura

| Bloco | Conteúdo |
|---|---|
| 1 · Onde você está | As 4 capacidades com posição. Vem do Teste de Competências |
| 2 · Suas competências | As 12, agrupadas nas capacidades, com posição relativa. Nível afirmado apenas nas 3 aprofundadas |
| 3 · Por que você está aí | Para cada competência frágil: a leitura da faixa, nomeando no máximo 3 características. Vem do cruzamento |
| 4 · O que sustenta e o que custa | Leitura do gap natural × em contexto, em Sustentar-se. Texto puro |
| 5 · Sua trilha | Até 3 competências, com rota (regular / desenvolver / compensar) e conteúdo |
| 6 · Um passo para os próximos 7 dias | Ação concreta ligada à primeira competência da trilha |
| 7 · Convite | Sessão de leitura de 45 minutos |

### 8.2 O que NÃO entra — lista de proibições

- ❌ **Lista das 16 características.** Não existe bloco comportamental separado, não existe inventário de 16 barras. As características aparecem apenas nomeadas dentro da leitura de uma competência frágil.
- ❌ Qualquer termo DISC.
- ❌ Números de score de pilar, de característica ou de gap.
- ❌ Percentil ou comparação com outros respondentes (até existir base normativa validada).
- ❌ Rótulo de perfil ("você é um visionário"). Não é teste de personalidade.
- ❌ Previsão de sucesso.
- ❌ O Índice de Aderência.
- ❌ Pontuação item a item.

### 8.3 Regras editoriais do gerador de texto

1. Nunca dizer "deficiente", "fraco", "ruim", "problema". Score baixo é ponto de atenção.
2. Sempre dizer "em desenvolvimento", "ponto de atenção", "exige intenção".
3. **Se todos os pilares estiverem dentro da faixa numa competência, dizer isso explicitamente**: "sem pontos de atenção comportamentais nesta competência". Não forçar um achado. Quem sempre encontra problema parece estar vendendo.
4. Se Precisão aparecer como pilar fora de faixa em 3 ou mais competências, **dizer uma vez com força** e diferenciar pelo par de pilares — não repetir o mesmo diagnóstico N vezes.
5. Escolher a etiqueta da característica pelo contexto da competência (tabela 3.1).
6. Competência com Confiança BAIXA: sinalizar ao cliente que a leitura comportamental explica pouco ali.

---

## 9. Modelo de dados sugerido

Mapear para as convenções do repo. Supabase, projeto `qjmokydtdwisznttipvi`.

```sql
-- sessão por instrumento
assessment_sessions (
  id, user_id, instrumento,          -- 'competencias' | 'comportamental'
  status,                            -- 'nao_iniciado' | 'em_andamento' | 'concluido'
  iniciado_em, concluido_em
)

-- etapa 1
cf_respostas (
  session_id, bloco,                 -- 'B01'..'B12'
  competencia_mais, competencia_menos,
  ordem_exibida,                     -- para auditar viés de posição
  respondido_em
)

-- etapa 2
cf_ancoradas (
  session_id, competencia_key, item_id, nivel_escolhido  -- 1..4
)

-- etapa 3
cf_evidencia (
  session_id, ancora_id, valor       -- 0..4
)

-- resultado consolidado
competencia_scores (
  session_id, competencia_key, capacidade,
  score_bruto,                       -- -4..+4
  posicao,                           -- 'mais_forte'..'mais_fragil'
  nivel_afirmado,                    -- 1..4, null se não aprofundada
  confianca_nivel                    -- 'afirmado' | 'estimado' | null
)

pilar_scores (
  session_id, pilar,                 -- 'determinacao'|'conexao'|'constancia'|'precisao'
  natural, em_contexto               -- 0..100
)

-- motor
faixas (competencia_key, pilar, minimo, maximo, confianca)  -- seed com a tabela 7.2
aderencia_faixa (session_id, competencia_key, pilar, posicao) -- 'abaixo'|'dentro'|'acima'
trilha (session_id, ordem, competencia_key, rota, pilar_alvo, conteudo_id)
```

**Seed obrigatório:** tabela `faixas` a partir da seção 7.2, com teste automatizado da regra de viabilidade (185–215).

---

## 10. Métricas e instrumentação

| Métrica | Por que importa |
|---|---|
| **% que completa OS DOIS instrumentos** | Métrica-chefe. Como os dois são entregues na compra e respondidos de forma assíncrona, quem não completa não recebe relatório, e quem não recebe relatório não compra workshop. Este é o gargalo real do funil |
| Tempo médio por etapa | Se a etapa 1 passar de ~5 min, os blocos estão difíceis demais |
| Taxa de abandono por tela | Identifica blocos problemáticos |
| Distribuição de escolha MAIS por afirmação | **Crítico para calibração** — ver seção 11 |
| Distribuição de nível nos ancorados | Verifica se as opções estão ordenadas |
| Distribuição do Índice de Aderência | Calibra os cortes |
| Conversão teste → sessão de leitura | Objetivo comercial do produto |

---

## 11. Cautelas técnicas — ler antes de implementar

### 11.1 Ambos os instrumentos são ipsativos

O Teste de Competências usa escolha forçada (soma dos 12 scores = 0). O Perfil Comportamental soma 200. Consequências:

- Nenhum dos dois produz **nível absoluto**. Produzem posição relativa dentro do perfil.
- Comparação entre pessoas numa única dimensão é tecnicamente frágil com dado ipsativo.
- **Norma percentílica precisa ser do PERFIL, não da dimensão isolada.**
- Ninguém fica dentro das 48 faixas. Aderência de 100% é impossível por construção — calibrar a expectativa com a distribuição real.

### 11.2 O que o produto pode e não pode afirmar hoje

**PODE:** posição relativa das 12 competências · nível afirmado nas 3 aprofundadas · perfil dominante nos pilares · tensões entre pilares opostos · esforço de adaptação · coerência entre declaração e evidência.

**NÃO PODE (ainda):** nível absoluto das 12 competências · percentil · comparação com outros respondentes · precisão de 16 dimensões independentes.

Até a base normativa existir, o relatório fala em *mais forte* e *mais frágil*. **Não inventar percentil.** Este é o tipo de coisa que escorrega para o material de marketing sem ninguém perceber.

### 11.3 O que o piloto precisa verificar

1. **Equilíbrio de desejabilidade dentro dos blocos.** As 4 afirmações de um bloco precisam ser igualmente atraentes. Se uma for escolhida como MAIS em muito mais que 25% dos casos, está inflada e precisa ser reescrita ou trocada de bloco. **É o ponto que mais provavelmente vai exigir ajuste, e não se resolve por julgamento — só por dado.** Conte com 150 a 200 respondentes.
2. **Ordenação das opções ancoradas.** Verificar se a opção 3 é de fato mais avançada que a 2 na percepção dos respondentes. Método: cruzar com critério externo — faturamento, tempo de empresa, avaliação de mentor.
3. **Concordância entre os 2 ancorados de cada competência.** Se discordam com frequência, um deles mede outra coisa.
4. **Faixas.** Comparar a distribuição de quem tem a competência avaliada como forte contra a faixa proposta. Onde a faixa não separar forte de fraco, ela está errada — reescrever ou marcar Confiança BAIXA.
5. **Base normativa.** Cada respondente alimenta a norma. A partir de algumas centenas de casos, o relatório pode passar de posição relativa para percentil.

**As faixas da seção 7.2 são hipóteses testáveis, não normas validadas.** Foram definidas por julgamento.

### 11.4 QA obrigatório antes de publicar

Checar chaves de tradução não resolvidas no corpo do texto gerado. Instrumentos concorrentes já vazaram chaves cruas em relatórios de cliente — erro barato de evitar, caro de explicar numa devolutiva.

---

## 12. Pendências que bloqueiam partes do sistema

| # | Pendência | Bloqueia |
|---|---|---|
| 1 | **22 itens ancorados** (2 por competência, menos os 2 exemplos da seção 5.5) — 88 opções calibradas | A etapa 2 do teste. Sem eles, o nível sai sempre como estimado |
| 2 | **De-para dos 4 pilares para as 24 características do acervo** | A entrega de conteúdo. O motor identifica o pilar fora de faixa e para ali |
| 3 | Base normativa | Percentil no relatório |

### Sobre a pendência 2

O acervo de conteúdo já produzido está indexado numa taxonomia **diferente** das 16 características. São 24 características em três famílias:

- **Estratégica (5):** Realista · Reflexivo · Lógico · Ponderado/Controlado · Baseado em fatos
- **Laboral (10):** Ritmo de trabalho · Autossuficiência · Planejamento e Organização · Multitarefa · Necessidade de Conclusão de Tarefas · Aceitação e Controle · Tolerância a Frustração · Necessidade de Liberdade · Necessidade de Reconhecimento · Orientação para Detalhes
- **Relacional (9):** Assertividade · Sociabilidade · Necessidade de Ser Estimado · Positividade com relação às Pessoas · Observador · Otimismo · Tolerância a Crítica · Autocontrole · Adaptação Cultural

Cada uma tem variante alta e baixa, com ferramenta própria. As Ondas de conteúdo do plano estratégico foram priorizadas sobre **essa** taxonomia.

Sobreposição direta com as 16: apenas Assertividade e Sociabilidade.

**Recomendação:** mapear das 16 (ou dos 4 pilares) **para** a taxonomia do acervo, não o contrário. O acervo é o ativo caro e já produzido. Onde não houver correspondência, isso indica lacuna real de conteúdo — e é informação de roadmap.

**Contorno até lá:** nas primeiras turmas, a recomendação de trilha sai da sessão de leitura, na mão. Entregar manualmente no primeiro lote e automatizar quando houver volume.

---

## 13. O que NÃO construir agora

Princípio de decisão do plano estratégico: *se uma ação não ajuda a vender, validar, desenvolver, gerar recorrência ou construir um ativo reutilizável, não é prioridade neste ciclo.*

- ❌ Plataforma completa com biblioteca, trilhas automatizadas e remedição. Vender, entregar e medir primeiro.
- ❌ Motor de recomendação de conteúdo automatizado (bloqueado pela pendência 2 e desnecessário no primeiro lote).
- ❌ Painel agregado de time. É produto B2B, fase posterior.
- ❌ 360 multifonte. Fase posterior.
- ❌ Cálculo das 16 características no fluxo Espansione — derivar o pilar direto dos 4 fatores.
- ❌ IRT ou modelo estatístico para a ramificação. Regra simples de comparação entre 2 itens basta.

**Escopo do primeiro release:** os dois instrumentos, o motor de faixas, o relatório integrado e o painel do avaliador com o Índice de Aderência. Nada além disso.

---

## 14. Checklist de aceite

- [ ] Ordem imposta: comportamental bloqueado até competências concluir
- [ ] Randomização da ordem das 4 opções dentro de cada bloco, registrada em `ordem_exibida`
- [ ] Escala explicada uma única vez, na abertura
- [ ] Avanço automático nas etapas 1 e 2; manual nas âncoras
- [ ] Progresso por etapa, não por questão
- [ ] Checagem de integridade: soma dos 12 scores = 0
- [ ] Teste automatizado da regra de viabilidade das faixas (185–215)
- [ ] Relatório só é gerado com os dois instrumentos concluídos
- [ ] Nenhum termo DISC em superfície de cliente (teste de string no build)
- [ ] Nenhuma lista das 16 características no relatório
- [ ] Nenhum número de pilar, característica ou gap exposto
- [ ] Máximo 3 características nomeadas por competência, nunca duas do mesmo pilar
- [ ] Texto explícito quando não há pontos de atenção numa competência
- [ ] Índice de Aderência visível apenas no painel do avaliador
- [ ] Varredura de chaves de tradução não resolvidas antes do deploy
- [ ] Métrica de conclusão dos dois instrumentos instrumentada
