# `intake_clientes` v2 — Spec de conteúdo

## Diretrizes transversais

- **Clientes são identificados** (diferente do formulário de colaboradores) — já se identificam no próprio formulário, então não há questão de anonimato aqui. O `_respondente_id` é persistido normalmente.
- **Tempo-alvo:** 10 a 15 minutos.
- **Tom editorial:** agradecimento pelo tempo, respeito à inteligência do cliente, sem jargão. Cliente ICP tipicamente é alguém sofisticado — perguntas tipo "qual é sua dor?" em aspas soam amadoras.
- **Opt-in para entrevista** aparece no final (já existia na v1, mas expandido): convidar para conversa de 45 min (não 15), com campos estruturados.
- **Divisão em 6 seções**, com progresso visível.

---

## Abertura

**Título:** Pesquisa de Percepção — [Nome da Marca]
**Subtítulo:** Sua voz nos ajuda a evoluir

**Texto de abertura:**

> Obrigada por dedicar alguns minutos para nos ajudar a construir uma marca mais coerente e uma experiência cada vez melhor. A pesquisa leva de 10 a 15 minutos.
>
> O que fazemos com suas respostas: elas alimentam um processo de reposicionamento estratégico da marca. Seus dados são confidenciais e usados exclusivamente para esse fim. Se em algum momento preferir não responder uma pergunta, pule — sua voz no que responder já será valiosa.

**Botão:** Começar

---

## SEÇÃO 1 — Quem é você

Perfil e contexto — quanto mais específico, mais preciso o diagnóstico.

**1.** Nome completo — `text` (obrigatório)
**2.** Idade — `text` (opcional)
**3.** Profissão / Cargo — `text`
**4.** Cidade / Estado — `text`
**5.** *(Condicional — só se a marca for B2B)* Empresa / Organização — `text`
**6.** **Há quanto tempo** é cliente da [Marca]? *(nova — ancoragem temporal)* — `radio`
- Menos de 3 meses
- 3 a 12 meses
- 1 a 3 anos
- Mais de 3 anos

**7.** **Com que frequência** usa / consome [Marca]? *(nova)* — `radio`
- Diariamente / Semanalmente
- Mensalmente
- Algumas vezes por ano
- Esporadicamente, conforme necessidade

**8.** Qual foi a sua **última interação ou compra** com a marca (mês/ano aproximado)? *(nova)* — `text`

**9.** Qual a **importância** desse tipo de produto/serviço no seu dia a dia? — `radio`
- Essencial (não vivo sem)
- Importante (uso com frequência)
- Ocasional (uso apenas quando necessário)

**10.** Que **problema da sua vida ou rotina** te fez procurar por esse tipo de produto/serviço? *(reformulada — era "qual é sua dor?" com aspas)* — `textarea`

---

## SEÇÃO 2 — Como você decide

Entendendo como você escolhe onde investir.

**11.** Ao escolher uma marca neste segmento, **o que é mais importante para você**? Ordene de 1 a 5, sendo 1 o mais importante. — `ranking` 1-5
- Preço / Custo-benefício
- Qualidade técnica / Resultado
- Atendimento / Experiência do cliente
- Recomendação de terceiros / Autoridade
- Localização / Facilidade de acesso

**12.** **Quem influenciou** sua decisão de escolher a [Marca]? (Amigos, familiares, influenciadores, busca na internet...) — `textarea`

**13.** **Antes de [Marca], você usava outra** marca/fornecedor semelhante? Se sim, qual? E **por que trocou**? *(nova — migração de fornecedor anterior)* — `textarea`

**14.** **O que quase te fez desistir** da [Marca] antes de contratar? E **o que te fez decidir pelo sim**? *(reformulada — era só "receio ou dúvida")* — `textarea`

**15.** Quais **outras marcas** (de qualquer segmento) você admira e consome na sua rotina? — `textarea`

---

## SEÇÃO 3 — Jornada e atendimento

Os pontos de contato e a qualidade da interação.

**16.** Por quais canais você **já interagiu** com a [Marca]? — `checkbox` (múltipla escolha)
- Instagram / Redes Sociais
- WhatsApp
- Site oficial
- Google (busca ou mapas)
- Indicação pessoal
- Espaço físico / presencial
- E-mail
- Outro → `text`

**17.** De 0 a 10, como você avalia **nosso atendimento** nos seguintes quesitos? — escala-0-10 para cada:
- Cordialidade e empatia
- Conhecimento técnico / do produto
- Tempo de resposta / agilidade
- Clareza nas informações
- Confiança transmitida

**18.** Em qual desses itens você **viu diferença real** vs outros lugares que já usou? *(nova)* — `textarea`

**19.** Qual foi a **última vez que você viu algo da marca** nos canais (redes, WhatsApp, site, e-mail)? O que você lembra? *(reformulada — era "você se lembra de alguma comunicação?")* — `textarea`

---

## SEÇÃO 4 — A experiência e o valor real

Entendendo o impacto real que nós entregamos na sua vida.

**20.** Em uma escala de 0 a 10, **o quanto você está satisfeito(a)** com os resultados obtidos? — escala-0-10

**21.** Como a [Marca] **impactou sua rotina ou a forma como você se sente**? — `textarea`

**22.** **O que você esperava antes de contratar**, e o que encontrou? Em que foi **superado**, em que foi **frustrado**? *(nova — expectativa vs realidade)* — `textarea`

**23.** Descreva uma **situação específica com a marca que te marcou** — positiva ou negativa. *(nova — momento narrativo)* — `textarea`

**24.** Qual é o **maior diferencial** da [Marca] em relação às outras opções que você conhece? — `textarea`

**25.** Sobre o **valor investido**, como você percebe o preço em relação ao benefício entregue? — `radio`
- Preço justo pelo alto valor entregue
- Preço elevado, mas vale o investimento
- Preço abaixo do que a entrega vale
- Preço alto para a entrega atual

**26.** Se **não pudesse mais usar** a [Marca], **qual seria sua segunda opção**? *(nova — revela concorrente real na cabeça do cliente)* — `textarea`

**27.** Se um concorrente oferecesse o **mesmo serviço 20% mais barato**, você mudaria? *(nova — testa força do vínculo vs preço)* — `radio`
- Sim, mudaria sem pensar
- Pensaria no assunto
- Não, o vínculo com a [Marca] é mais forte que preço

---

## SEÇÃO 5 — Personalidade da marca

A identidade simbólica e emocional da marca, na sua percepção.

**28.** Se a [Marca] **fosse uma pessoa**, como você descreveria a personalidade dela? — `textarea`
- Placeholder: "Tom, jeito, energia, forma de se relacionar."

**29.** **Como você apresentaria** a [Marca] para um amigo em poucas palavras? — `textarea`

**30.** Se um amigo te perguntasse "**vale a pena?**", o que você responderia em 2 frases? *(nova — linguagem natural do cliente)* — `textarea`

**31.** Qual palavra você **nunca usaria** para descrever essa marca? *(nova — território proibido pelo próprio cliente)* — `text`

**32.** Defina a [Marca] em **uma única palavra**. — `text` (1 palavra)

---

## SEÇÃO 6 — Futuro e recomendação

Fechamento e convite opcional.

**33.** Existe algo que **você gostaria de encontrar** conosco e que ainda não oferecemos? — `textarea`

**34.** De 0 a 10, **o quanto você recomendaria** esta marca para um amigo ou familiar? *(NPS 0-10 — reformulado — era radio de 3 opções)* — escala-0-10

**35.** **Por quê?** *(follow-up obrigatório do NPS)* — `textarea`

---

## SEÇÃO 7 — Opt-in para entrevista em profundidade

> Queremos entender alguns pontos em mais profundidade com um grupo pequeno de clientes. São conversas de cerca de 45 minutos, por vídeo ou presencial, confidenciais e muito valiosas para nossa construção. Se topar participar, deixe seu contato abaixo.

**36.** Você toparia participar de uma **conversa de ~45 minutos** para aprofundarmos os pontos dessa pesquisa? — `radio`
- Sim, podem me convidar
- No momento não, prefiro apenas as respostas do formulário

*(Se sim:)*

**37.** Melhor forma de contato — `radio`
- WhatsApp
- E-mail
- Telefone

**38.** WhatsApp / e-mail / telefone para contato — `text` (obrigatório neste caso)

**39.** Melhor horário para conversar — `radio`
- Manhã (8h-12h)
- Tarde (12h-18h)
- Final de tarde (18h-20h)

---

## Encerramento

> Obrigada pelo tempo e pela honestidade. Sua voz é parte essencial da construção que estamos fazendo. Se você aceitou participar da entrevista, entraremos em contato nas próximas semanas para agendar.

**Rodapé fixo:** *Seus dados serão utilizados exclusivamente para o desenvolvimento deste projeto e não serão partilhados com terceiros.*

**Botão:** Enviar respostas

---

## Resumo de mudanças (v1 → v2)

**Novas perguntas/seções:**
- Seção 1: ancoragem temporal (há quanto tempo, frequência, última interação)
- Seção 2: migração de fornecedor anterior, reformulação de "receios" em "quase te fez desistir / te fez decidir pelo sim"
- Seção 3: "em qual diferença viu diferença real"
- Seção 4: expectativa vs realidade, momento narrativo, segunda opção (concorrente real), teste de força do vínculo vs preço (mudaria por 20% mais barato?)
- Seção 5: linguagem natural ("vale a pena?"), palavra proibida
- Seção 6: NPS 0-10 + "por quê" obrigatório (substituindo radio de 3 opções)
- Seção 7: opt-in expandido com canal preferido e horário

**Perguntas reformuladas:**
- "Qual sua dor?" → "Que problema da sua vida te fez procurar?"
- "Você se lembra de alguma comunicação?" → "Última vez que viu algo da marca, o que lembra?"
- Recomendação 3-opções → NPS 0-10 com follow-up

**Total de perguntas:** ~35 obrigatórias + opt-in condicional. Tempo-alvo 10-15 min.

---

## Notas de implementação para o front

- **Pergunta 5 (empresa)** é condicional — só aparece se a marca for B2B. Pode ser configurado por projeto (em `projetos.tipo_negocio` ou similar — coluna não existe hoje; criar em task futura se for implementar o B2B toggle).
- **Ranking (pergunta 11)** precisa de componente drag-and-drop em desktop + setas up/down em mobile. Validar que os 5 itens foram ordenados (sem ranking duplicado).
- **Condicionais do opt-in (seção 7)** — perguntas 37-39 só aparecem se 36 = "Sim". Validação deve tornar 37 e 38 obrigatórios só nesse caso.
- **NPS 0-10 + follow-up** — o follow-up da pergunta 35 é obrigatório. Respostas do tipo "porque sim" ou 1-2 palavras podem ser sinalizadas com pedido de expansão.
- **Payload de opt-in** — mesmo formato que colaboradores: `_opt_in: { aceito: true, nome, contato, canal_preferido, horario_preferido, consentimento_texto? }`. O `/api/formularios` já lida com o tipo cliente (TASK 1.2).
- **Atenção a placeholders:** todas as referências a [Marca] e [Nome da Marca] devem ser substituídas no frontend pelo nome real da empresa/marca — configurado por projeto. Se o projeto tem um nome fantasia específico, usar ele.

---

## Observações transversais às duas specs

- **Sobre o fluxo completo do kit de escuta:** com o `intake_socios` v4, este `intake_colaboradores` v3 e este `intake_clientes` v2, o Espansione tem um kit de escuta coerente. Cada stakeholder tem perguntas simétricas onde faz sentido (coerência externa/interna, momento narrativo, NPS/eNPS), e perguntas específicas onde o papel exige (DISC/CIS só nos sócios e colaboradores; jornada de compra só em clientes).
- **Sobre triagem pelo Agente 1:** as perguntas abertas qualificadas (momento narrativo, coerência, por que mudaria) são exatamente o que o Agente 1 precisa para identificar quem vale aprofundar em entrevista. Alta riqueza narrativa num respondente + NPS/eNPS extremo (0-6 ou 9-10) = candidato prioritário.
- **Sobre o opt-in e Agente 1 Modo B:** para colaboradores, o Agente 1 consome a tabela `opt_in_entrevistas` (sem acesso às respostas do formulário anônimo) + dados agregados por cluster. Gera roteiros individuais para os voluntários priorizados, com perguntas baseadas em perfil DISC individual + cluster + padrões coletivos — não em respostas específicas daquela pessoa. Documentar isso no prompt do Agente 1 quando formos lá.
