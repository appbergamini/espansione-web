# Mapa de Maturidade Espansione — Textos do Resultado e Régua

> Gerado a partir do código (`lib/mapa-maturidade/{pilares,scoring,textos}.js`). Reflete o modelo vigente: **7 pilares × 7 perguntas** (máx. 21 pts por pilar).

---

## 1. Régua de pontuação

### 1.1. Escala de resposta

| Resposta | Valor |
|---|---:|
| Nunca | 0 |
| Poucas vezes | 1 |
| Muitas vezes | 2 |
| Sempre | 3 |
| Não se aplica | — (excluído do cálculo) |

### 1.2. Como o score do pilar é calculado

- **Respostas válidas** = apenas valores 0–3. "Não se aplica" é **excluído** (não soma nem entra no denominador).
- `pontuação bruta` = soma das respostas válidas.
- `máximo possível` = nº de respostas válidas × 3.
- `percentual` = bruta ÷ máximo × 100.
- `pontuação ajustada (base 15)` = bruta ÷ máximo × 15 — usada para classificar o nível (independe de quantas perguntas/“N/A”).

### 1.3. Régua de nível do pilar (pontuação ajustada base 15)

| Pontuação ajustada | Nível | Nome |
|---|---|---|
| 0 a 4,99 | Nível 1 | Reativo |
| 5 a 8,99 | Nível 2 | Em estruturação |
| 9 a 12,99 | Nível 3 | Em consolidação |
| 13 a 15 | Nível 4 | Integrado |

### 1.4. Índice Geral Espansione

Média simples dos **percentuais** dos pilares **válidos** (0–100).

| Índice Geral | Nível geral |
|---|---|
| 0 a 29 | Reativa |
| 30 a 56 | Em estruturação |
| 57 a 83 | Em consolidação |
| 84 a 100 | Integrada |

### 1.5. Regras especiais

- **Trava de “Nunca”:** se um pilar tiver **2 ou mais** respostas “Nunca” (0), ele **não passa do Nível 2**, mesmo que a pontuação indique nível maior. (“Não se aplica” não conta como “Nunca”.)
- **Dados insuficientes (N/A):** cada pilar precisa de **≥ 4 respostas válidas**. Abaixo disso (muitos “Não se aplica”), o pilar fica **“Dados insuficientes”**, o Índice Geral **não é gerado** e a conclusão é **bloqueada** até revisão.
- **Alerta de maturidade desigual:** se **2 ou mais pilares** ficarem no **Nível 1**, exibe: *“A empresa apresenta maturidade desigual, com lacunas críticas em pilares estruturantes.”*

---

## 2. Textos do resultado (por pilar × nível)

### 1. Direção Estratégica

*Mede: Clareza · Priorização · Foco*

**Nível 1 — Reativo**

> A empresa ainda opera com baixa clareza de direção, decidindo mais por urgência do que por prioridade. O foco se dispersa e o crescimento tende a depender de oportunidades pontuais.

**Nível 2 — Em estruturação**

> A empresa já apresenta sinais de direção, mas falta consistência em definir e sustentar prioridades. O foco se perde diante de demandas e pressões da rotina.

**Nível 3 — Em consolidação**

> A empresa decide com base em prioridades na maior parte do tempo, com algumas oscilações na disciplina de escolha e na visão de futuro.

**Nível 4 — Integrado**

> A direção estratégica está incorporada à rotina decisória — prioridades claras, foco protegido e tempo dedicado a pensar o futuro do negócio.

---

### 2. Liderança

*Mede: Autonomia · Delegação · Desenvolvimento*

**Nível 1 — Reativo**

> A liderança ainda está concentrada na direção ou nos sócios, e as decisões dependem de aprovação. A delegação é frágil e as pessoas são pouco desenvolvidas.

**Nível 2 — Em estruturação**

> A empresa já distribui responsabilidades, mas a autonomia e a delegação variam, e as conversas de desenvolvimento acontecem de forma irregular.

**Nível 3 — Em consolidação**

> As lideranças decidem e desenvolvem pessoas com boa frequência, com espaço para fortalecer a delegação e a antecipação de conflitos.

**Nível 4 — Integrado**

> A liderança opera com autonomia e clareza de papéis, delega com confiança, desenvolve pessoas e tem suas decisões respeitadas pela direção.

---

### 3. Cultura e Pessoas

*Mede: Coerência cultural · Comportamento · Engajamento*

**Nível 1 — Reativo**

> Comportamentos esperados e valores ainda não são claros nem reforçados, e a cultura se forma por hábito. Atrair e reter pessoas alinhadas tende a ser difícil.

**Nível 2 — Em estruturação**

> A empresa reconhece seus valores, mas eles ainda não aparecem de forma consistente nas decisões e na rotina; o reforço depende de pessoas específicas.

**Nível 3 — Em consolidação**

> A cultura está presente nas decisões e na liderança com boa frequência, com espaço para padronizar como comportamentos são orientados e reconhecidos.

**Nível 4 — Integrado**

> A cultura é viva e coerente: orienta atitudes e decisões, é reforçada com consistência, e a empresa atrai, engaja e retém pessoas alinhadas.

---

### 4. Posicionamento e Marca

*Mede: Clareza · Diferenciação · Coerência*

**Nível 1 — Reativo**

> A empresa comunica de forma genérica o que faz e por que é diferente, e o posicionamento não orienta decisões. A diferença frente aos concorrentes é pouco percebida.

**Nível 2 — Em estruturação**

> Há elementos de posicionamento, mas ainda não são usados como referência consistente; a diferenciação percebida pelo cliente varia.

**Nível 3 — Em consolidação**

> O posicionamento está claro e é percebido com boa frequência por time e clientes, com espaço para reforçar a diferença frente aos concorrentes.

**Nível 4 — Integrado**

> O posicionamento é claro, diferenciado e coerente entre promessa e entrega — usado como referência interna e percebido nitidamente pelo mercado.

---

### 5. Experiência do Cliente

*Mede: Entrega · Valor · Satisfação*

**Nível 1 — Reativo**

> A experiência entregue é inconsistente e depende de quem atende. Feedbacks de clientes raramente viram melhoria e a confiança é frágil.

**Nível 2 — Em estruturação**

> A empresa já se preocupa com a experiência, mas a consistência e o uso de feedbacks ainda são irregulares.

**Nível 3 — Em consolidação**

> A experiência é consistente na maior parte do tempo e reforça o posicionamento, com espaço para sistematizar a escuta e a geração de valor percebido.

**Nível 4 — Integrado**

> A experiência é consistente, reforça a marca e supera expectativas; a empresa escuta o cliente e transforma isso em valor e fidelização.

---

### 6. Desenvolvimento Comercial

*Mede: Iniciativa comercial · Escuta do cliente · Comunicação de valor*

**Nível 1 — Reativo**

> A geração de oportunidades é reativa e depende de poucas pessoas; as conversas comerciais se apoiam muito no preço e as objeções desestabilizam o processo.

**Nível 2 — Em estruturação**

> Há iniciativa comercial, mas a escuta do cliente e a comunicação de valor ainda são irregulares, com dependência do preço como argumento.

**Nível 3 — Em consolidação**

> A equipe cria oportunidades e comunica valor com boa frequência, com espaço para fortalecer o trato de objeções e reduzir a dependência de preço.

**Nível 4 — Integrado**

> A área comercial age com iniciativa, entende o cliente antes de propor, conduz conversas por valor e lida bem com objeções e perdas.

---

### 7. Gestão da Execução

*Mede: Planejamento · Acompanhamento · Escalabilidade*

**Nível 1 — Reativo**

> Prioridades raramente viram planos com responsáveis e prazos; o acompanhamento é reativo e o crescimento gera caos e sobrecarga.

**Nível 2 — Em estruturação**

> A empresa já transforma parte das prioridades em planos, mas o acompanhamento e a antecipação de riscos ainda são irregulares.

**Nível 3 — Em consolidação**

> Planejamento e acompanhamento acontecem com boa frequência, com espaço para antecipar desvios e ganhar escalabilidade.

**Nível 4 — Integrado**

> A empresa transforma prioridades em planos claros, acompanha a execução, antecipa riscos e absorve crescimento sem perder o controle.

---

## 3. Texto de “Dados insuficientes”

> Dados insuficientes para classificar este pilar com segurança. Revise as respostas marcadas como "Não se aplica".
