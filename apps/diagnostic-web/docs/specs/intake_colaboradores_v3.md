# `intake_colaboradores` v3 — Spec de conteúdo

## Diretrizes transversais

- **Anonimato real.** O formulário não carrega `_respondente_id` para gravação (implementado na TASK 1.2). O token existe só para marcar o respondente como "respondido" (via `respondentes.respondido_em`). Nenhuma resposta é rastreável ao indivíduo — exceto o bloco final de opt-in, que é voluntário, consentido e gravado em tabela separada.
- **Tempo de preenchimento alvo:** 8 a 12 minutos. A pesquisa com colaboradores precisa ser significativamente mais curta que a dos sócios — senão a taxa de resposta despenca.
- **Divisão em 5 seções** — sem salvamento automático por seção (pesquisa curta demais pra precisar), mas com barra de progresso visível.
- **Tom editorial:** acolhedor, sem corporativês. Nada de "colaborador" no corpo das perguntas — preferir "você" ou referência direta à empresa. "Colaborador" só no título institucional.
- **Perguntas opcionais:** sinalizadas claramente. Perguntas sensíveis (momentos narrativos, incoerências externas/internas) vêm com texto de contexto tranquilizador.

---

## Abertura (tela 1)

**Título:** Pesquisa Interna — [Nome da Empresa]
**Subtítulo:** Sua voz na construção da nossa marca e cultura

**Texto de abertura:**

> Estamos em um momento de construção estratégica da nossa marca e da nossa cultura, e a sua visão é essencial. Esta pesquisa leva de 8 a 12 minutos e é **100% anônima e confidencial**.
>
> O que isso significa, na prática:
> - Suas respostas são gravadas sem associação ao seu nome, e-mail ou qualquer dado que te identifique.
> - A análise é feita de forma coletiva. Ninguém — nem a liderança, nem a consultoria externa — verá respostas individuais.
> - No final, você pode voluntariamente nos dar seu contato se quiser aprofundar em uma conversa. Isso é opcional e fica em área separada — não se cruza com suas respostas.
>
> Como responder: seja honesto(a). Elogios, críticas e sugestões são todos bem-vindos. Não existe resposta certa ou errada. Quanto mais real for a sua visão, mais preciso será o diagnóstico — e melhores as decisões que virão dele.

**Botão:** Começar

---

## BLOCO 1 — Perfil (anônimo)

Dois dados amplos, suficientes para análise por cluster e insuficientes para identificação individual.

**A.** Em qual área você atua? — `radio`
- Administrativo / Financeiro
- Comercial / Vendas
- Marketing / Comunicação
- Operação / Produção / Entrega
- Atendimento / Relacionamento
- Tecnologia / Produto
- Pessoas / Gestão / Liderança
- Outro → `text` (opcional para especificar)

**B.** Há quanto tempo você está na empresa? — `radio`
- Menos de 6 meses
- 6 a 12 meses
- 1 a 3 anos
- 3 a 5 anos
- Mais de 5 anos

**Observação de UX:** se a empresa for muito pequena (ex: 8 pessoas), essa segmentação pode permitir identificação — vale adicionar aviso condicional no topo quando o total de colaboradores for baixo:
> "Como nossa equipe é pequena, algumas combinações podem tornar você identificável. Responda apenas o que se sentir à vontade."

---

## BLOCO 2 — Marca e Propósito

Como você percebe a empresa hoje, e o quanto se sente conectado(a) com o que ela diz ser.

**1.** Quando você pensa na empresa, quais são as **3 primeiras palavras** que vêm à sua mente? — tabela 1×3
- Placeholder: "Escreva a primeira coisa que vem — sem filtro."

**2.** Como é **trabalhar aqui**, em 3 palavras? *(nova — simétrica à pergunta 1, mas pega cultura vivida em vez de imagem)* — tabela 1×3

**3.** Você acredita que nossa empresa tem uma **imagem forte no mercado**? — escala-1-5 (1 = Muito fraca → 5 = Muito forte)

**4.** Você **conhece o propósito e os valores** da empresa? — escala-1-5 (1 = Não conheço → 5 = Conheço muito bem)

**5.** Em uma frase, **como seu trabalho específico contribui** para o propósito da empresa? *(nova — se a pessoa não consegue responder, é diagnóstico em si)* — `textarea`
- Placeholder: "Se você não conseguir responder ou tiver dúvida, escreva isso mesmo — é informação importante."

**6.** Na sua visão, o que mais **diferencia** nossa empresa de concorrentes ou empresas parecidas? Se você não percebe grande diferença, escreva isso. — `textarea`

---

## BLOCO 3 — Cultura vivida

Como a empresa é, na prática, no dia a dia.

**7.** Em uma única palavra, como você descreveria nossa **cultura hoje**? — `text` (1 palavra)

**8.** Na prática, os **valores da empresa são vividos** no dia a dia? — escala-1-5 (1 = Nunca → 5 = Sempre)

**9.** **Minha opinião é ouvida e considerada.** — escala-1-5 (1 = Nunca → 5 = Sempre)

**10.** O que mais **fortalece** e o que mais **enfraquece** nossa cultura hoje? — tabela 1×2
- O que FORTALECE
- O que ENFRAQUECE

---

## BLOCO 4 — Segurança psicológica e relações

Perguntas sobre o quanto você se sente seguro(a) para ser você mesmo(a) no trabalho.

**11.** **Me sinto à vontade para discordar** da minha liderança. — escala-1-5
**12.** Quando erro, posso **falar abertamente sem medo** de punição ou julgamento. — escala-1-5
**13.** **Trago ideias novas ou arriscadas** em reuniões. — escala-1-5
**14.** **Confio nos meus colegas** de equipe. — escala-1-5
**15.** A **colaboração entre áreas** funciona bem. — escala-1-5

---

## BLOCO 5 — Liderança imediata

Sobre quem lidera seu dia a dia.

**16.** De 0 a 10, que nota você daria à sua **liderança imediata**? — escala-0-10

**17.** Sobre sua liderança imediata: quais são os **pontos fortes** e o que poderia **melhorar**? — tabela 1×2
- Pontos FORTES
- O que poderia MELHORAR

---

## BLOCO 6 — Coerência e momentos-chave

**Aviso no topo do bloco:**

> Estas próximas perguntas pedem um pouco mais de reflexão. São opcionais — responda só o que fizer sentido. São as perguntas que mais ajudam a gente a entender o que funciona bem por aqui e o que pode melhorar.

**18.** O que a empresa **comunica para fora** (site, redes, anúncios) que você sente que **na prática não acontece por dentro**? *(nova — coerência externa/interna, lado colaborador)* — `textarea` (opcional)

**19.** E o contrário: o que a gente **faz bem aqui dentro** que **ninguém lá fora sabe**? *(nova)* — `textarea` (opcional)

**20.** Descreva uma situação em que você se **orgulhou** de trabalhar aqui. *(nova — momento-assinatura positivo)* — `textarea` (opcional)

**21.** Descreva uma situação em que você **pensou em sair**. *(nova — momento-assinatura negativo)* — `textarea` (opcional)

---

## BLOCO 7 — Motivação e permanência

**22.** O que mais te **motiva** na empresa? — `textarea`
**23.** E o que mais te **desmotiva**? — `textarea`
**24.** **Por que você escolheu** trabalhar aqui? — `textarea`
**25.** O que poderia **te fazer sair** da empresa? — `textarea`
**26.** De 0 a 10, **o quanto você recomendaria** nossa empresa como um bom lugar para trabalhar? *(eNPS clássico)* — escala-0-10
**27.** **Por quê?** *(follow-up do eNPS)* — `textarea`
**28.** Nos últimos 12 meses, **você já indicou alguém** da sua rede para uma vaga aqui? *(nova — comportamento real, não só intenção)* — `radio`
- Sim, indiquei
- Não, mas indicaria se tivesse vaga alinhada
- Não indicaria
- Nunca houve vaga aberta no meu período

**29.** Qual é a **principal barreira** que dificulta sua entrega no dia a dia? — `textarea`
**30.** Se pudesse **melhorar uma coisa** na empresa nos próximos 6 meses, o que priorizaria? — `textarea`

---

## BLOCO 8 — Opt-in para entrevista (voluntário e desacoplado)

**Aviso destacado:**

> Esta última seção é **completamente opcional** e **fica em área separada** das suas respostas anteriores.
>
> Queremos entender algumas questões em mais profundidade com um grupo pequeno de até 5-7 colaboradores. Se você aceitar essa conversa confidencial de 30 minutos, deixe seu contato abaixo. Os dados aqui informados são usados exclusivamente para agendar a entrevista — e não são cruzados com suas respostas da pesquisa anterior, que permanecem totalmente anônimas.
>
> Se preferir não participar, pule esta seção e envie. Sua voz já foi capturada no que você respondeu.

**31.** Você toparia participar de uma **conversa confidencial de 30 minutos** para aprofundarmos alguns temas? — `radio`
- Sim, podem me convidar
- Não, prefiro apenas as respostas da pesquisa

*(condicional: se escolher "Sim", aparecem os campos abaixo)*

**32.** Nome completo — `text` (obrigatório neste caso)
**33.** WhatsApp ou e-mail para contato — `text` (obrigatório neste caso)
**34.** Texto de consentimento — `checkbox` (obrigatório)
> "Aceito que meu nome e contato sejam registrados em área separada do banco de dados, para uso exclusivo de agendamento de entrevista. Entendo que minhas respostas anteriores permanecem anônimas e não serão vinculadas a esta identificação."

---

## Encerramento (tela final)

**Texto de encerramento:**

> Obrigada pelo tempo e pela honestidade. Sua voz é essencial para construirmos juntos uma empresa mais coerente e mais humana.
>
> **O que acontece agora:** suas respostas serão analisadas junto com as dos seus colegas, de forma coletiva. Os achados orientarão decisões reais sobre cultura, liderança e marca. Caso você tenha aceitado participar da entrevista, entraremos em contato nas próximas semanas.

**Botão:** Enviar respostas

---

## Resumo de mudanças (v2 → v3)

**Blocos reorganizados:**
- Marca e Propósito + Cultura separados em 2 blocos (antes juntos)
- Segurança Psicológica virou bloco próprio (era ausente)
- Momentos narrativos virou bloco opcional com aviso (era ausente)
- Motivação/Permanência consolidado (as perguntas soltas do v2 "acrescentar essas perguntas" agora estão integradas)
- Opt-in criado como bloco final com consentimento explícito

**Perguntas novas (em relação ao v2):**
- Trabalhar aqui em 3 palavras (par da pergunta 1)
- Conexão do trabalho com propósito (pergunta 5)
- Segurança psicológica (3 escalas)
- Relações peer (2 escalas)
- Coerência externa/interna (2 perguntas)
- Momentos de orgulho e de pensar em sair (2 narrativas)
- Por que escolheu / o que te faria sair (2 perguntas)
- Comportamento real de indicação (pergunta 28)
- Consentimento explícito de opt-in (bloco 8 completo)

**Total de perguntas:** ~25 obrigatórias + 6-7 opcionais. Tempo-alvo 8-12 min (ok).

---

## Notas de implementação para o front

- **Bloco 8 (opt-in)** precisa enviar payload com `_opt_in: { aceito: true/false, nome, contato, consentimento_texto }` — que `/api/formularios` (ajustado na TASK 1.2) reconhece e grava em tabela separada.
- **Nenhum campo** dos blocos 1-7 pode carregar `_respondente_id`. O backend (TASK 1.2) já descarta defensivamente, mas o frontend não deve nem enviar.
- **Persistência entre sessões:** pesquisa é curta o suficiente para não precisar salvamento automático por campo. Pode usar `sessionStorage` simples para preservar em caso de refresh acidental.
- **Mobile-first:** maioria dos colaboradores responde no celular. Tabelas viram cards empilhados; sliders para escalas 0-10 e 1-5.
- **Validação mínima para submit:** obrigatórios são blocos 1 e perguntas do 22-30 (motivação, eNPS). Tudo do bloco 6 é opcional. Bloco 8 só exige campos se a pessoa marcou "Sim".
- **Mensagem de sucesso após submit:** simples e respeitosa. Não redirecionar para site da consultoria ou da empresa — encerrar limpo.
