# Formulários Espansione — Banco de Perguntas

> Documento gerado a partir do código-fonte do app `diagnostic-web` (Next.js, Pages Router). Todos os textos foram copiados verbatim dos componentes de formulário e dos schemas. Convenções de tipo de resposta aparecem entre colchetes. Asteriscos/“obrigatório” refletem a marcação de campo obrigatório (`RequiredMark`) ou as regras de validação do schema.

---

## Formulário SÓCIOS — Levantamento Inicial

> Schema `socios_v4_schema.js`. Seis partes. Tipo de envio: `intake_socios`. Obrigatórios mínimos: Partes 1, 2, 3 e 6 (≥80% do Diagnóstico 360°).

Partes (títulos e estimativa de tempo):
1. Identificação da Empresa (5 min)
2. A Empresa e sua Marca (10 min)
3. Propósito e Essência (15 min)
4. Marca Empregadora e Cultura (10 min)
5. Visão, Futuro e Estratégia (15 min)
6. Diagnóstico 360° do Negócio (15 min)

### Parte 1 — Identificação da Empresa
*Subtítulo: "Dados objetivos que contextualizam todas as análises seguintes."*

**Sobre você**
1. Nome completo *(obrigatório)* [texto curto]
2. Idade [número]
3. Cidade / Estado [texto curto]
4. E-mail *(obrigatório)* [e-mail]
5. Telefone / WhatsApp *(obrigatório)* [telefone]
6. Grau de escolaridade [múltipla escolha: Até ensino médio completo / Superior incompleto / Superior completo / Pós-graduação (MBA, mestrado, doutorado)]
7. Principal ocupação atual [múltipla escolha: Empresário(a) / sócio(a) / Profissional liberal / Autônomo(a) / Colaborador(a) em cargo de liderança / Outro (com campo "Especifique…")]

**Sobre a empresa**
8. Razão social / nome fantasia *(obrigatório)* [texto curto]
9. Ano de fundação *(obrigatório)* [número]
10. Site / Instagram / redes sociais principais [texto curto]
11. Há quanto tempo sua empresa existe? [múltipla escolha: Menos de 1 ano / 1 a 3 anos / 3 a 7 anos / 7 a 15 anos / Mais de 15 anos]
12. Segmento de atuação *(obrigatório)* [múltipla escolha: Serviço / Comércio varejista / Comércio atacadista / Indústria / Outro (com campo "Especifique…")]
13. Faturamento anual atual [múltipla escolha: Até R$ 120 mil / R$ 120 mil a R$ 500 mil / R$ 500 mil a R$ 2 milhões / R$ 2 a 6 milhões / R$ 6 a 12 milhões / Mais de R$ 12 milhões]
14. Número de colaboradores [múltipla escolha: Apenas eu / 2 a 10 / 11 a 50 / 51 a 100 / Mais de 100]
15. Estágio atual do negócio *(obrigatório)* [seleção única, com descrições: Estruturação — ainda montando as bases / Crescimento — expandindo operação e receita / Reposicionamento — redefinindo direção ou identidade / Consolidação — maturidade e escala / Sucessão — transição de liderança ou sociedade / Virada — correção de rota diante de crise ou ruptura]
16. Como a empresa está organizada hoje? (seu papel, o dos sócios, as áreas principais) [texto aberto]
17. Quais decisões mais importantes a empresa precisa tomar nos próximos 12 meses? *(obrigatório)* [texto aberto]

### Parte 2 — A Empresa e sua Marca
*Subtítulo: "Fotografia do presente — como a marca se apresenta hoje, o que diferencia, como é percebida."*

**2.1 Oferta e cliente**
1. O que vocês vendem e para quem? *(obrigatório)* — *hint: "Descreva o produto/serviço principal, o canal de venda, o ticket médio e o perfil do cliente ideal."* [texto aberto longo]

**2.2 Personalidade e percepção**
2. Se sua marca fosse uma pessoa, como você descreveria a personalidade dela? *(obrigatório)* — *hint: "Tom, jeito de falar, postura, energia."* [texto aberto]
3. Liste 3 palavras para cada lado: [dois grupos de 3 campos de texto]
   - Coluna A: "3 palavras que você GOSTARIA que usassem (ambição)" (Palavra 1, 2, 3)
   - Coluna B: "3 palavras que as pessoas REALMENTE usam hoje (percepção atual)" (Palavra 1, 2, 3)
4. Como você sabe que essas são as palavras que as pessoas realmente usam hoje? [texto aberto] *(placeholder: "Pesquisa formal, feedback direto, observação em reuniões, comentários em redes, intuição...")*

**2.3 Diferenciação e concorrência**
5. O que diferencia sua empresa dos concorrentes? *(obrigatório)* — *hint: "Por que um cliente escolheria vocês em vez de outra opção? Busque diferenciais defensáveis, não slogans."* [texto aberto longo]
6.1. Quando vocês ganham um cliente, quais costumam ser os principais motivos? — *hint: "Marque até 3 — os mais frequentes."* [múltipla escolha (até 3): Confiança na empresa / Relacionamento com sócios/equipe / Qualidade técnica / Preço / Prazo / agilidade / Atendimento / Especialização no segmento / Indicação / Reputação / Portfólio / cases / Conveniência / Experiência anterior positiva / Capacidade de resolver problema complexo]
6.2. Conte um exemplo real de quando vocês ganharam um cliente — e por quê. [texto aberto]
6.3. Quando perdem uma venda, costumam perder para quem ou para quê? — *hint: "Marque até 3 — os mais frequentes."* [múltipla escolha (até 3): Concorrente direto mais barato / Concorrente mais conhecido / com mais marca / Freelancer / profissional independente / Solução interna do cliente (in-house) / Empresa mais rápida / ágil / Empresa mais digital / moderna / Falta de prova de resultado / Cliente não percebeu valor suficiente / Cliente adiou a decisão / Cliente desistiu de comprar / Conflito de relacionamento / Falha na nossa proposta / pitch]
6.4. Conte um exemplo real de quando perderam uma venda — e por quê. [texto aberto]
7.1. Quais são as objeções mais frequentes antes da compra? — *hint: "Marque até 5."* [múltipla escolha (até 5): Preço / Prazo / Medo de não dar resultado / Falta de clareza sobre o que será entregue / Comparação com concorrentes / Preferência por fornecedor conhecido / Dúvida sobre capacidade técnica / Dúvida sobre ROI / Falta de urgência / Processo decisório lento / Cliente acha que consegue fazer internamente / Receio de mudar de fornecedor atual]
7.2. Dê um exemplo de objeção real que vocês escutam. [texto aberto]
8.1. De que tipos de concorrente vocês mais perdem? — *hint: "Pode marcar quantos forem relevantes."* [múltipla escolha: Concorrente direto da mesma categoria / Concorrente indireto / categoria adjacente / Freelancer ou profissional independente / Time interno do cliente (in-house) / Plataforma / software / SaaS / Solução improvisada / "puxadinho" / Não fazer nada (status quo)]
8.2. Quem são seus principais concorrentes (com nome)? Pontos fortes e fracos de cada um. — *hint: "Liste 3-5 concorrentes nominalmente. 1-2 linhas por concorrente."* [texto aberto longo]

**2.4 Referências admiradas**
9. Alguma marca (de qualquer segmento) que você admira? Qual e por quê? [texto aberto]
10. Se pudesse 'emprestar' um atributo de outra marca para a sua, qual atributo seria e de qual marca? [texto aberto]

### Parte 3 — Propósito e Essência
*Subtítulo: "O porquê da empresa — a razão profunda pela qual ela existe, para além de produtos e resultados. A essência que alimenta toda a plataforma de marca."*

**3.1 Origem**
1. Qual é a história da criação da sua empresa? Como tudo começou? *(obrigatório)* [texto aberto longo]
2. Que problema ou necessidade você (ou os fundadores) queriam resolver quando criaram o negócio? *(obrigatório)* [texto aberto longo]
3. Conte um momento da sua vida em que você viveu na pele o problema que sua empresa resolve hoje. [texto aberto longo]
4. Qual foi o momento em que você percebeu que essa empresa precisava existir? [texto aberto]
5. Que indignação pessoal com o seu setor te fez começar — ou ainda te move hoje? [texto aberto]

**3.2 Propósito e causa**
6. Por que você acredita no produto ou serviço que sua empresa oferece? [texto aberto]
7. Em que aspecto concreto da vida das pessoas sua empresa deixa marca positiva? — *hint: "E em qual aspecto pode também deixar marca negativa ou indiferente?"* [texto aberto longo]
8. Quais impactos você pretende causar nas pessoas, na sociedade e no mercado em que a empresa está inserida? [texto aberto longo]
9. Quais temas são grandes causas para você(s)? [texto aberto] *(placeholder: "sustentabilidade, inclusão, educação, inovação, saúde, etc.")*
10. Contra o que sua empresa existe? Que prática, crença ou hábito do mercado vocês combatem? [texto aberto longo]
11. Qual cliente vocês se recusam a atender, mesmo se pagar? Por quê? [texto aberto]

**3.3 Valores e testes de verdade**
12. Quais valores são inegociáveis na sua atuação? *(obrigatório)* — *hint: "O que jamais seria abandonado, mesmo diante de uma oportunidade financeira?"* [texto aberto longo]
13. Defina em uma frase o que cada valor significa na prática (o que é / o que não é): [3 pares de campos — "Valor N" (nome) + "O que significa na prática" (texto)]
14. Se a empresa deixasse de existir amanhã, o que morreria com ela — aquele algo maior, além da operação e dos negócios que ela administra? [texto aberto longo]
15. Descreva a última vez que vocês tomaram uma decisão cara (financeiramente ou politicamente) em nome do propósito. [texto aberto longo]
16. Sua empresa tem um propósito declarado e comunicado? Se sim, qual é? — *hint: "Cole a frase exata usada."* [texto aberto]

### Parte 4 — Marca Empregadora e Cultura
*Subtítulo: "Uma marca forte começa de dentro para fora. Como a empresa é vivida por dentro."*

**4.1 Clima e cultura atual**
1. Na sua percepção, como é o clima interno da sua empresa hoje? — *hint: "Seja honesto — leitura real, não institucional."* [texto aberto longo]
2. Quais os maiores desafios de comunicação interna que você identifica? [texto aberto]
3. Quais seus maiores desafios em relação a liderança e gestão de pessoas? [texto aberto]

**4.2 Proposta ao colaborador**
4. O que a empresa oferece de concreto hoje a quem trabalha aqui? [texto aberto]
5. O que a empresa pede em troca? [texto aberto]
6. Por que alguém talentoso deveria escolher vocês em vez de um concorrente? [texto aberto]

**4.3 Valores vividos internamente**
7. Na sua visão, quais são os valores inegociáveis da sua empresa no dia a dia com as pessoas? [texto aberto]
8. O que hoje, na cultura atual, ATRAPALHA a marca que vocês querem construir? — *hint: "Incoerências entre o que dizem e praticam, comportamentos que enfraquecem a identidade desejada."* [texto aberto longo]

**4.4 Radar de Marca Empregadora**
*Instrução: "Avalie cada dimensão de 0 a 10, onde 0 = inexistente na empresa e 10 = referência de excelência."* — [11 sliders de 0 a 10, uma para cada dimensão]:
- Propósito Inspirador
- Cultura Organizacional Viva
- Liderança Humanizada
- Clima Organizacional Saudável
- Comunicação Interna Transparente
- Desenvolvimento e Aprendizado
- Reconhecimento e Valorização
- Diversidade e Inclusão
- Visão e Alinhamento Estratégico
- Experiência do Colaborador
- Reputação e Imagem da Marca

9. Qual dessas dimensões do radar você considera mais importante para chegar na sua visão de futuro, e por quê? [texto aberto]
10. E qual destas dimensões você considera que sua empresa JÁ É referência hoje, de fato? [texto aberto]

**4.5 Referência em marca empregadora**
11. Qual empresa (qualquer segmento) você admira como empregadora? Por quê? [texto aberto]
12. Se pudesse 'emprestar' uma prática de outra empresa para sua cultura, qual seria e de qual empresa? [texto aberto]

### Parte 5 — Visão, Futuro e Estratégia
*Subtítulo: "Olhar para frente. Visão, objetivos, alavancas e obstáculos."*

> Observação sobre a numeração no código: a Parte 5 mistura blocos numerados de forma não contígua na tela. A ordem visual e os números exatos são reproduzidos abaixo. As perguntas 1–14 estão nos blocos 5.1–5.5; as perguntas 15–21 no bloco 5.6; e as perguntas 22–36 no bloco 5.7 (que no código aparece antes do 5.6).

**5.1 Visão de futuro**
1. Conte sobre sua visão para esta marca — *hint: "Qual foi a motivação para criá-la, o que ela significa na vida das pessoas, e como quer que ela seja percebida?"* [texto aberto longo]
2. Onde você quer a empresa em 3 anos? E em 5 anos? — *hint: "Seja concreto: faturamento, estrutura, presença, reputação."* [dois textos: "Em 3 anos" / "Em 5 anos"]
3. Qual é, na sua visão, o papel que sua organização tem ou quer ter no mundo? [texto aberto longo]
4. Se pudesse mudar UMA coisa na sua marca amanhã, o que seria? [texto aberto]

**5.2 Objetivos e desafios pessoais**
5. Hoje, enquanto líder do negócio: [dois textos paralelos: "Meu MAIOR OBJETIVO é…" / "Meu MAIOR DESAFIO é…"]
6. Quais metas de negócio a marca e a comunicação precisam sustentar nos próximos 12 meses? [texto aberto] *(placeholder: "Ex.: crescimento, premiumização, expansão de canal, retenção, marca empregadora, fortalecimento comercial")*

**5.3 Mapeamento estratégico (IDA)**
Liste 3 em cada coluna, frases curtas de uma linha: [3 colunas de 3 campos cada]
- "3 IMPULSIONADORES (forças)" (Impulsionador 1, 2, 3)
- "3 DETRATORES (fragilidades)" (Detrator 1, 2, 3)
- "3 ACELERADORES (oportunidades)" (Acelerador 1, 2, 3)
7. O que é necessário para chegar até a sua visão de futuro? Com quem você pode aprender? — *hint: "Mentores, referências, parceiros, formações."* [texto aberto]

**5.4 Reflexão Final (opcional)**
*Aviso: "⭐ As próximas perguntas são mais francas. Elas costumam ficar de fora de questionários, mas são as que mais ajudam a entender a realidade por trás do negócio. Responda só o que fizer sentido agora — respostas vazias também são dado. Você pode pular este bloco e voltar depois. Todos os campos abaixo são opcionais."*
8. O que mais te tira o sono em relação ao negócio? [texto aberto]
9. Qual o maior medo em relação ao futuro da empresa? [texto aberto]
10. Do que você tem vergonha na empresa hoje? [texto aberto]
11. O que sua marca promete publicamente que você sente que nem sempre consegue entregar por dentro? [texto aberto]
12. Qual incoerência entre o que a empresa diz e o que pratica você gostaria de resolver primeiro? [texto aberto]

**5.5 Alinhamento entre sócios**
*Aviso: "Se sua empresa tem 2 ou mais sócios, responda as duas perguntas abaixo. Caso contrário, pode pular."*
13. Quais destas perguntas anteriores você acha que seu(s) sócio(s) responderia(m) muito diferente de você? [texto aberto]
14. Se hoje vocês tivessem que optar por uma direção e divergissem, onde seria a maior tensão entre os sócios? [texto aberto]

**5.6 Comunicação atual e investimento**
*Aviso: "Esta seção alimenta o Plano de Comunicação. Quanto mais detalhado, mais o plano será calibrado à realidade da sua empresa. Todos os campos são opcionais."*
15. Quais canais de comunicação a empresa USA HOJE de forma recorrente? — *hint: "Site, blog, redes (LinkedIn / Instagram / YouTube / TikTok / outras), e-mail marketing, podcasts, eventos próprios, mídia paga, PR, etc. Diga quais canais estão ATIVOS — não os planejados."* [texto aberto]
16. Para cada canal ativo, qual é o papel principal hoje? — *hint: "Ex.: 'LinkedIn — autoridade institucional', 'Instagram — relação com cliente final', 'E-mail — pós-venda'. Se não souber, escreva 'sem direção definida'."* [texto aberto]
17. Quem cuida da comunicação hoje? — *hint: "Time interno (com quantas pessoas e papéis), agência terceirizada, freelancers, sócio acumulando, ninguém dedicado."* [texto aberto]
18. Faixa anual de investimento em comunicação (incluindo mídia, agência, produção, eventos) [seleção: Até R$ 50 mil/ano / R$ 50 mil a R$ 150 mil/ano / R$ 150 mil a R$ 500 mil/ano / R$ 500 mil a R$ 1,5 milhão/ano / R$ 1,5 a R$ 5 milhões/ano / Acima de R$ 5 milhões/ano / Ainda não tenho orçamento definido / Prefiro não informar]
19. Observações sobre o orçamento (opcional) — *hint: "Ex.: 'crescemos 30% em mídia paga este ano', 'vamos investir mais em conteúdo próprio', 'não há orçamento dedicado mas há disposição', etc."* [texto aberto]
20. O que está funcionando e o que NÃO está na sua comunicação hoje? — *hint: "Seja honesto. Achados aqui guiam onde o plano vai investir vs onde vai cortar."* [dois textos: "O que está funcionando" / "O que NÃO está funcionando"]
21. O que você espera DA COMUNICAÇÃO especificamente nos próximos 12 meses? — *hint: "Não é meta de negócio (já respondida em 5.2). É o que comunicação precisa ENTREGAR — ex.: posicionamento institucional, geração de demanda qualificada, atração de talento, recall em determinada audiência, presença em prêmios."* [texto aberto]

**5.7 Públicos externos: mapa lean**
*Aviso: "Agora vamos entender melhor os públicos externos da empresa. As respostas abaixo ajudam a IA a sugerir grupos prioritários de comunicação, mensagens, provas de confiança e canais. Não precisa ser uma pesquisa formal — responda com base na experiência prática de venda e relacionamento com clientes. Todos os campos são opcionais."*
22. Quais são os principais TIPOS de clientes que compram de vocês HOJE? — *hint: "Liste por perfil, não por nome. Ex.: 'Diretores de marketing de empresas B2B grandes', 'Gestoras de patrimônio familiar', 'Equipes técnicas de operação'."* [texto aberto]
23. Quais tipos de clientes vocês mais querem ATRAIR nos próximos 12 meses? — *hint: "Até 3 perfis prioritários."* [lista curta, até 3]
24. Quais tipos de clientes vocês querem ATRAIR MENOS ou EVITAR? — *hint: "Até 3 perfis a evitar — pode ser por margem ruim, mau encaixe cultural, perfil tóxico, etc."* [lista curta, até 3]
25. Quem normalmente DECIDE a compra do lado do cliente? — *hint: "Marque os papéis típicos."* [múltipla escolha: Dono / sócio / CEO / presidente / Diretor financeiro / Diretor de marketing / comunicação / Diretor comercial / Diretor de RH / Compras / suprimentos / Área técnica / Usuário final / Influenciador interno (sem decidir formalmente) / Indicação externa]
26. Quem influencia ou bloqueia essa decisão, mesmo sem decidir formalmente? — *hint: "Ex.: 'a equipe técnica que avalia se a solução é boa', 'o sócio mais conservador que freia investimentos', 'um consultor externo do cliente'."* [texto aberto]
27. Em que momento o cliente costuma procurar vocês? — *hint: "Marque os gatilhos típicos."* [múltipla escolha: Quando tem um problema urgente / Quando quer crescer / Quando quer melhorar imagem / reputação / Quando precisa substituir fornecedor / Quando recebeu indicação / Quando está comparando preços / Quando passa por mudança estratégica / Quando precisa profissionalizar algo / Quando viu algum conteúdo / case / Quando está insatisfeito com solução atual]
28. Quando vocês perdem uma venda, costumam perder para quem ou para o quê? — *hint: "Marque os mais frequentes."* [múltipla escolha: Concorrente direto / Freelancer / profissional independente / Solução interna do cliente / Empresa mais barata / Empresa mais conhecida / Empresa mais rápida / Empresa mais digital / moderna / Cliente desistiu de comprar / Cliente adiou decisão / Cliente não percebeu valor suficiente]
29. Quais objeções aparecem ANTES da compra? — *hint: "Marque até 5 — as mais frequentes."* [múltipla escolha (até 5): Preço / Prazo / Medo de não dar resultado / Falta de clareza sobre o que será entregue / Comparação com concorrentes / Preferência por fornecedor conhecido / Dúvida sobre capacidade técnica / Dúvida sobre ROI / Falta de urgência / Processo decisório lento / Cliente acha que consegue fazer internamente]
30. Conte uma objeção REAL que vocês escutam (palavras do cliente). [texto aberto] *(placeholder: "Ex.: 'Adorei a proposta, mas como sei que vai dar certo?'")*
31. Que provas fazem o cliente CONFIAR em vocês? — *hint: "Marque as que importam mais nas decisões reais."* [múltipla escolha: Depoimentos / Avaliações Google / Cases / Portfólio / Antes e depois / Números / resultados / Certificações / Tempo de mercado / Reputação dos sócios / Indicação de cliente conhecido / Demonstração / amostra / Diagnóstico inicial / Proposta bem estruturada / Conteúdo técnico / Visita / reunião presencial]
32. Dessas provas, quais vocês JÁ TÊM bem estruturadas e quais ainda FALTAM? [dois textos: "Já temos bem estruturadas" / "Faltam criar ou melhorar"]
33. De onde vêm os MELHORES clientes hoje? — *hint: "Canais que mais trazem cliente bom (não necessariamente o canal com mais volume)."* [múltipla escolha: Indicação / Google (busca) / Instagram / LinkedIn / WhatsApp / Site / Eventos / Prospecção ativa (outbound) / Parcerias / Tráfego pago / Clientes antigos (recorrência) / Networking dos sócios / Vendedores / representantes]
34. Quais mensagens ou argumentos MAIS FUNCIONAM na venda? [texto aberto] *(placeholder: "Ex.: 'somos especialistas em X', 'evitamos dor de cabeça', 'temos método', 'entregamos no prazo'.")*
35. Quais mensagens NÃO funcionam ou geram desconfiança? [texto aberto] *(placeholder: "Ex.: 'líderes de mercado', 'sustentável', 'humanizado' — quando não vem com prova.")*
36. Liste até 3 clientes REAIS que representam o perfil ideal. — *hint: "Pode descrever sem nomear se houver questão de privacidade. Para cada cliente, preencha os 4 campos abaixo."* [para cada um dos 3 "Cliente ideal" N: Nome ou descrição / Por que ele é ideal? / O que ele valoriza? / Como chegou até vocês?]

### Parte 6 — Diagnóstico 360° do Negócio
*Subtítulo: "48 afirmações em 6 pilares (Estratégia, Finanças, Comercial, Marketing, Pessoas, Operação). Atribua uma nota de 1 (nunca/não é verdade) a 4 (sempre/plenamente verdade)."* — Todas as afirmações usam [escala 1–4, rótulos "Nunca" (1) a "Sempre" (4)]. Mínimo recomendado: 38 de 48 (80%).

**Estratégia (1–8)**
1. Sua empresa tem visão de futuro clara (horizonte de 3 a 5 anos) definida, documentada e compartilhada pela liderança.
2. A missão, os valores e o posicionamento da marca estão definidos e disseminados na empresa.
3. Existe um planejamento estratégico formal, com metas e indicadores acompanhados de forma recorrente.
4. Você possui Plano de Ação específico para combater os atuais pontos fracos da empresa.
5. Decisões estratégicas são tomadas com base em dados de mercado, concorrência e clientes — não apenas em intuição.
6. Os processos mais relevantes estão definidos e são executados sistematicamente com o mesmo rigor.
7. Há reuniões formais mensais de resultado para discutir e projetar os próximos passos do negócio.
8. Está claro para você a atuação, com direitos e deveres, dos sócios do negócio.

**Finanças (9–16)**
9. Sua empresa tem clareza mensal sobre receitas, custos, margem de lucro e fluxo de caixa.
10. Há separação clara entre contas da pessoa física (sócios) e contas da pessoa jurídica (empresa).
11. Sua empresa possui reserva financeira capaz de sustentar a operação por pelo menos 3 meses em cenário de baixa.
12. Sua empresa é gerenciada por um orçamento claro de despesas e receitas para os próximos 12 meses.
13. Você calcula a margem de contribuição dos produtos/serviços com todos os custos atualizados.
14. Investimentos relevantes (marketing, tecnologia, expansão, contratações) são avaliados com métricas de retorno (ROI, payback, ponto de equilíbrio).
15. Sua empresa possui demonstrativos contábeis (DRE, balanço) mensalmente atualizados e efetivamente usados para tomada de decisão.
16. A política de preços é revisada periodicamente considerando custos, concorrência e percepção de valor do cliente.

**Comercial (17–24)**
17. Seus vendedores sabem claramente quais são as metas semanais e mensais.
18. Sua equipe de vendas possui técnicas claras de prospecção de novos clientes.
19. Sua empresa possui processos de pós-venda e relacionamento que garantem a fidelidade do cliente.
20. Há acompanhamento sistemático dos resultados individuais de cada vendedor, com feedbacks regulares.
21. Sua empresa possui uma política de Gestão da Carteira de Clientes que potencializa cada cliente.
22. Seus vendedores são treinados em técnicas de negociação e superação de objeções.
23. Seu modelo de Comissionamento estimula os vendedores e propicia crescimento sustentável.
24. Seu negócio possui trabalho ativo de Funil de Vendas e sistema de CRM adequado à operação.

**Marketing (25–32)**
25. Sua empresa possui estratégia desenhada para conquista de novos clientes, praças e mercados.
26. Sua empresa entende as principais mudanças de comportamento do consumidor (dores, jornada, novos problemas).
27. Sua empresa possui canais de atendimento ativos (WhatsApp, site, telefone, e-mail, redes sociais).
28. Sua empresa pesquisa concorrentes para avaliar oportunidades, ameaças e boas práticas.
29. Sua empresa possui planejamento de marketing estruturado e em implementação.
30. Sua empresa produz conteúdos consistentes para redes sociais, com assuntos relevantes ao público.
31. Sua empresa faz gestão de tráfego nas plataformas digitais (Google, Meta etc.).
32. Sua empresa mede o ROI do marketing e gerencia o investimento com precisão.

**Pessoas (33–40)**
33. Sua empresa possui Plano de Treinamento e Desenvolvimento ativo para capacitar colaboradores.
34. Todas as pessoas sabem especificamente as atribuições do seu cargo e os resultados que devem gerar.
35. Sua empresa possui Plano de Cargos e Carreira transparente e conhecido por todos.
36. Sua empresa vivencia e reconhece quem atua de acordo com seus Valores e Missão.
37. Os líderes inspiram confiança e engajamento por meio de um comportamento profissional exemplar.
38. Há sistemática periódica de feedbacks e Planos de Desenvolvimento Individual.
39. O Clima Organizacional propicia que as pessoas trabalhem felizes, entendendo seu trabalho como algo maior.
40. Os processos de seleção, recrutamento e gestão de pessoas são claros, eficientes e alinhados à cultura.

**Operação (41–48)**
41. Os processos críticos de entrega ao cliente estão documentados e são executados com consistência.
42. A promessa comunicada pela marca encontra capacidade real de execução na operação do dia a dia.
43. Existe visibilidade sobre os principais gargalos que afetam a experiência do cliente.
44. Sua empresa possui sistemas/ferramentas de gestão (ERP, CRM, planilhas integradas) adequados ao porte atual.
45. Há indicadores operacionais acompanhados recorrentemente (prazo de entrega, retrabalho, produtividade, satisfação).
46. Fornecedores e parceiros-chave estão mapeados, com planos de contingência para eventuais rupturas.
47. A operação está preparada para suportar um crescimento de 30–50% sem colapso estrutural.
48. Existe documentação e padronização mínima para que a ausência ou saída de uma pessoa-chave não pare a operação.

### Anexo Parte 6 — Lista de Arquétipos disponíveis no schema
> A lista `ARQUETIPOS` existe no schema `socios_v4_schema.js` (seleção de arquétipo), com label e descrição. Não há campo de seleção de arquétipo renderizado nas Partes 1–6 dos componentes lidos; reproduzida aqui por completude:
- Mago — Transforma, revela o invisível, provoca mudança
- Herói — Vence desafios, prova valor, inspira pela coragem
- Sábio — Ensina, esclarece, conduz pelo conhecimento
- Rebelde — Rompe com o estabelecido, provoca
- Cuidador — Acolhe, protege, serve
- Explorador — Busca o novo, desafia limites, descobre
- Criador — Inventa, dá forma ao que não existia
- Bobo-da-corte — Diverte, provoca pelo humor, quebra a seriedade
- Amante — Conecta, encanta, cria laços
- Cara-comum — Se iguala, representa o cotidiano
- Inocente — Traz leveza, simplicidade, pureza
- Governante — Lidera, organiza, traz ordem

---

## Formulário COLABORADORES — Pesquisa Interna (anônima)

> Schema `colaboradores_v3_schema.js`. Oito blocos. Tipo de envio: `intake_colaboradores`. Formulário ANÔNIMO (nome/e-mail do respondente não são exibidos nem persistidos junto às respostas; o Bloco 8 de opt-in é gravado em área separada). Escalas Likert do Bloco 2 em diante são de 1 a 5, salvo onde indicado.

Blocos (títulos):
1. Perfil
2. Marca e Propósito
3. Cultura vivida
4. Segurança psicológica
5. Liderança imediata
6. Coerência e momentos-chave
7. Motivação e permanência
8. Participação opcional em entrevista

### Bloco 1 — Perfil
*Subtítulo: "Dois dados amplos, suficientes para análise por cluster e insuficientes para identificação individual."* — *Aviso condicional (equipe ≤10): "⚠️ Como nossa equipe é pequena, algumas combinações de área e tempo de casa podem tornar você identificável. Responda apenas o que se sentir à vontade."*

**Contexto de trabalho**
A. Em qual área você atua? *(obrigatório)* [múltipla escolha: Administrativo / Financeiro / Comercial / Vendas / Marketing / Comunicação / Operação / Produção / Entrega / Atendimento / Relacionamento / Tecnologia / Produto / Pessoas / Gestão / Liderança / Outro (com campo "Especifique (opcional)…")]
B. Há quanto tempo você está na empresa? *(obrigatório)* [múltipla escolha: Menos de 6 meses / 6 a 12 meses / 1 a 3 anos / 3 a 5 anos / Mais de 5 anos]

### Bloco 2 — Marca e Propósito
*Subtítulo: "Como você percebe a empresa hoje e o quanto se sente conectado(a) com o que ela diz ser."*

**Palavras-espelho**
1. Quando você pensa na empresa, quais são as 3 primeiras palavras que vêm à sua mente? *(obrigatório — mínimo 2 das 3)* — *hint: "Escreva a primeira coisa que vem — sem filtro."* [3 campos: Palavra 1, 2, 3]
2. Como é trabalhar aqui, em 3 palavras? [3 campos: Palavra 1, 2, 3]

**Percepções de marca**
3. Você acredita que nossa empresa tem uma imagem forte no mercado? *(obrigatório)* [escala 1–5, rótulos "Muito fraca" (1) a "Muito forte" (5)]
4. Você conhece o propósito e os valores da empresa? *(obrigatório)* [escala 1–5, rótulos "Não conheço" (1) a "Conheço muito bem" (5)]
5. Em uma frase, como seu trabalho específico contribui para o propósito da empresa? [texto aberto] *(placeholder: "Se você não conseguir responder ou tiver dúvida, escreva isso mesmo — é informação importante.")*
6. Na sua visão, o que mais diferencia nossa empresa de concorrentes ou empresas parecidas? Se você não percebe grande diferença, escreva isso. [texto aberto]

### Bloco 3 — Cultura vivida
*Subtítulo: "Como a empresa é, na prática, no dia a dia."*

**Cultura no dia a dia**
7. Em uma única palavra, como você descreveria nossa cultura hoje? [texto curto, máx. 40 caracteres]
8. Na prática, os valores da empresa são vividos no dia a dia? *(obrigatório)* [escala 1–5, "Nunca" (1) a "Sempre" (5)]
9. Minha opinião é ouvida e considerada. *(obrigatório)* [escala 1–5, "Nunca" (1) a "Sempre" (5)]
10. O que mais fortalece e o que mais enfraquece nossa cultura hoje? [dois textos: "O que FORTALECE" / "O que ENFRAQUECE"]

### Bloco 4 — Segurança psicológica e relações
*Subtítulo: "Perguntas sobre o quanto você se sente seguro(a) para ser você mesmo(a) no trabalho. Todas opcionais — responda só o que fizer sentido."* — Todas [escala 1–5, "Nunca" (1) a "Sempre" (5)].
11. Me sinto à vontade para discordar da minha liderança.
12. Quando erro, posso falar abertamente sem medo de punição ou julgamento.
13. Trago ideias novas ou arriscadas em reuniões.
14. Confio nos meus colegas de equipe.
15. A colaboração entre áreas funciona bem.

### Bloco 5 — Liderança imediata
*Subtítulo: "Sobre quem lidera seu dia a dia."*

**Avaliação da liderança**
16. De 0 a 10, que nota você daria à sua liderança imediata? *(obrigatório)* [escala/slider 0–10]
17. Sobre sua liderança imediata: quais são os pontos fortes e o que poderia melhorar? [dois textos: "Pontos FORTES" / "O que poderia MELHORAR"]

### Bloco 6 — Coerência e momentos-chave
*Aviso: "⭐ Estas próximas perguntas pedem um pouco mais de reflexão. São opcionais — responda só o que fizer sentido. São as que mais nos ajudam a entender o que funciona bem e o que pode melhorar."*

**Coerência externa × interna**
18. O que a empresa comunica para fora (site, redes, anúncios) que você sente que na prática não acontece por dentro? [texto aberto longo]
19. E o contrário: o que a gente faz bem aqui dentro que ninguém lá fora sabe? [texto aberto longo]

**Momentos marcantes**
20. Descreva uma situação em que você se orgulhou de trabalhar aqui. [texto aberto longo]
21. Descreva uma situação em que você pensou em sair. [texto aberto longo]

### Bloco 7 — Motivação e permanência
*Subtítulo: "Vínculo com a empresa — o que move, o que trava, o que faria sair ou ficar."*

**Motivação**
22. O que mais te motiva na empresa? [texto aberto]
23. E o que mais te desmotiva? [texto aberto]
24. Por que você escolheu trabalhar aqui? [texto aberto]
25. O que poderia te fazer sair da empresa? [texto aberto]

**Recomendação (eNPS)**
26. De 0 a 10, o quanto você recomendaria nossa empresa como um bom lugar para trabalhar? *(obrigatório)* [escala/slider 0–10]
27. Por quê? *(obrigatório)* [texto aberto]
28. Nos últimos 12 meses, você já indicou alguém da sua rede para uma vaga aqui? [múltipla escolha: Sim, indiquei / Não, mas indicaria se tivesse vaga alinhada / Não indicaria / Nunca houve vaga aberta no meu período]

**Barreiras e melhorias**
29. Qual é a principal barreira que dificulta sua entrega no dia a dia? [texto aberto]
30. Se pudesse melhorar uma coisa na empresa nos próximos 6 meses, o que priorizaria? [texto aberto]

### Bloco 8 — Participação opcional em entrevista
*Aviso: "Esta última seção é completamente opcional e fica em área separada das suas respostas anteriores. Queremos entender algumas questões em mais profundidade com um grupo pequeno de colaboradores. Se você aceitar essa conversa confidencial de 30 minutos, deixe seu contato abaixo. Os dados aqui informados são usados exclusivamente para agendar a entrevista — e não são cruzados com suas respostas da pesquisa anterior, que permanecem totalmente anônimas. Se preferir não participar, selecione 'Não' e envie. Sua voz já foi capturada no que você respondeu."*

31. Você toparia participar de uma conversa confidencial de 30 minutos para aprofundarmos alguns temas? [sim/não: "Sim, podem me convidar" / "Não, prefiro apenas as respostas da pesquisa"]

*Campos condicionais (somente se "Sim"):*
32. Nome completo *(obrigatório se sim)* [texto curto]
33. WhatsApp ou e-mail para contato *(obrigatório se sim)* [texto curto]
- Consentimento (checkbox obrigatório se sim): "Aceito que meu nome e contato sejam registrados em área separada do banco de dados, para uso exclusivo de agendamento de entrevista. Entendo que minhas respostas anteriores permanecem anônimas e não serão vinculadas a esta identificação."

---

## Formulário CLIENTES — Pesquisa de Percepção (identificada)

> Schema `clientes_v2_schema.js`. Sete seções. Tipo de envio: `intake_clientes`. Formulário IDENTIFICADO. Nota: os textos usam `{marca}` (nome da marca do projeto); na ausência, exibe "a marca". Algumas perguntas usam exemplos do segmento de consultoria de negócios (texto verbatim do código).

Seções (títulos):
1. Quem é você
2. Como você decide
3. Jornada e atendimento
4. Experiência e valor
5. Personalidade da marca
6. Futuro e recomendação
7. Participação opcional em entrevista

### Seção 1 — Quem é você
*Subtítulo: "Perfil e contexto — quanto mais específico, mais preciso o diagnóstico."*

**Perfil**
1. Nome completo *(obrigatório)* [texto curto]
2. Idade (opcional) [número]
3. Profissão / Cargo *(obrigatório)* [texto curto]
4. Cidade / Estado *(obrigatório)* [texto curto]
5. Empresa / Organização *(somente se projeto B2B/B2B2C)* [texto curto]

**Relação com a marca**
6. Há quanto tempo é cliente de {marca}? *(obrigatório)* [múltipla escolha: Menos de 3 meses / 3 a 12 meses / 1 a 3 anos / Mais de 3 anos]
7. Com que frequência usa / consome {marca}? *(obrigatório)* [múltipla escolha: Diariamente / Semanalmente / Mensalmente / Algumas vezes por ano / Esporadicamente, conforme necessidade]
8. Qual foi a sua última interação ou compra com a marca (mês/ano aproximado)? [texto curto] *(placeholder: "ex.: outubro/2025")*
9. Qual a importância desse tipo de produto/serviço no seu dia a dia? *(obrigatório)* [múltipla escolha: Essencial (não vivo sem) / Importante (uso com frequência) / Ocasional (uso apenas quando necessário)]
10. Que problema da sua vida ou rotina te fez procurar por esse tipo de produto/serviço? *(obrigatório)* [texto aberto]

### Seção 2 — Como você decide
*Subtítulo: "Entendendo como você escolhe onde investir."*

**Fatores de escolha**
11. Ao escolher uma marca neste segmento, o que é mais importante para você? *(obrigatório — ordenar os 5)* [ranking/ordenação dos 5 fatores: Preço / Custo-benefício; Qualidade técnica / Resultado; Atendimento / Experiência do cliente; Recomendação de terceiros / Autoridade; Localização / Facilidade de acesso]

**Influências e migração**
12. Quem influenciou sua decisão de escolher {marca}? — *hint: "Amigos, familiares, influenciadores, busca na internet..."* [texto aberto]
13. Antes de contratar {marca}, você já teve experiência com algum outro serviço de consultoria de negócios? O que deu certo? O que deu errado? [texto aberto longo]
14. Quais outras marcas (de qualquer segmento) você admira e consome na sua rotina? [texto aberto]

### Seção 3 — Jornada e atendimento
*Subtítulo: "Os pontos de contato e a qualidade da interação."*

**Canais de contato**
15. Por quais canais você já interagiu com {marca}? *(obrigatório — ≥1)* — *hint: "Marque todos que se aplicam."* [múltipla escolha: Instagram / Redes Sociais / WhatsApp / Site oficial / Google (busca ou mapas) / Indicação pessoal / Espaço físico / presencial / E-mail / Outro (com campo "Especifique…")]

**Qualidade do atendimento (0-10)**
16. De 0 a 10, como você avalia nosso atendimento nos seguintes quesitos? *(obrigatório — avaliar ao menos 3 das 5 dimensões)* [5 sliders 0–10]:
- Cordialidade e empatia
- Conhecimento técnico / do produto
- Tempo de resposta / agilidade
- Clareza nas informações
- Confiança transmitida

**Diferenças e última comunicação**
17. Em qual desses itens você viu diferença real vs outros lugares que já usou? [texto aberto]
18. Qual foi a última vez que você viu algo da marca nos canais (redes, WhatsApp, site, e-mail)? O que você lembra? [texto aberto]

### Seção 4 — Experiência e valor
*Subtítulo: "Entendendo o impacto real que nós entregamos na sua vida."*

**Satisfação e impacto**
19. Em uma escala de 0 a 10, o quanto você está satisfeito(a) com os resultados obtidos? *(obrigatório)* [escala/slider 0–10]
20. Como {marca} impactou sua rotina ou a forma como você se sente? [texto aberto longo]
21. O que você esperava antes de contratar, e o que encontrou? Em que foi superado, em que foi frustrado? [texto aberto longo]
22. Descreva uma situação específica com {marca} que te marcou — positiva ou negativa. [texto aberto longo]
23. Qual é o maior diferencial de {marca} em relação às outras opções que você conhece? [texto aberto]

**Valor percebido vs preço**
24. Sobre o valor investido, como você percebe o preço em relação ao benefício entregue? *(obrigatório)* [múltipla escolha: Preço justo pelo alto valor entregue / Preço elevado, mas vale o investimento / Preço abaixo do que a entrega vale / Preço alto para a entrega atual]

### Seção 5 — Personalidade da marca
*Subtítulo: "A identidade simbólica e emocional da marca, na sua percepção."*

**Identidade simbólica**
25. Se {marca} fosse uma pessoa, como você descreveria a personalidade dela? — *hint: "Tom, jeito, energia, forma de se relacionar."* [texto aberto]
26. Você indicaria a {marca}? Se sim, como você apresentaria em poucas palavras? [texto aberto]
27. Qual palavra você nunca usaria para descrever essa marca? [texto curto]
28. Defina {marca} em uma única palavra. *(obrigatório)* [texto curto, máx. 40 caracteres]

### Seção 6 — Futuro
*Subtítulo: "Fechamento."*

**Futuro**
29. Existe algo que você gostaria de encontrar com {marca} e que ainda não oferecemos? [texto aberto]

### Seção 7 — Participação opcional em entrevista em profundidade
*Aviso: "Queremos entender alguns pontos em mais profundidade com um grupo pequeno de clientes. São conversas de cerca de 45 minutos, por vídeo ou presencial, confidenciais e muito valiosas para nossa construção. Se topar participar, deixe seu contato e preferências abaixo."*

30. Você toparia participar de uma conversa de ~45 minutos? [sim/não: "Sim, podem me convidar" / "No momento não, prefiro apenas as respostas do formulário"]

*Campos condicionais (somente se "Sim"):*
31. Melhor forma de contato *(obrigatório se sim)* [múltipla escolha: WhatsApp / E-mail / Telefone]
32. WhatsApp / e-mail / telefone para contato *(obrigatório se sim)* [texto curto]
33. Melhor horário para conversar *(obrigatório se sim)* [múltipla escolha: Manhã (8h-12h) / Tarde (12h-18h) / Final de tarde (18h-20h)]
- Nota de consentimento exibida: "Ao informar seu contato, você autoriza o uso dessas informações exclusivamente para agendamento da entrevista sobre sua experiência com a marca." (Texto registrado no opt-in: "Autorizo o contato para agendamento de entrevista em profundidade sobre minha experiência com a marca.")

---

## Formulário POSICIONAMENTO ESTRATÉGICO — Teste de Posicionamento

> Página `pages/form/posicionamento.js`. Tipo de envio: `posicionamento_estrategico`. 27 afirmações baseadas no teste PWR Gestão, mapeando 3 disciplinas de valor (Treacy & Wiersema). Para cada afirmação, o respondente marca de **1 (Mínima)** a **4 (Máxima)** o quanto a afirmação se aproxima da realidade da empresa.

**Legenda das categorias (cat):**
- **EO** = Excelência Operacional
- **IC** = Intimidade com Cliente
- **LP** = Liderança em Produto

*Instrução de topo: "⏱ 10 a 15 minutos. 27 afirmações. Para cada, marque de 1 (Mínima) a 4 (Máxima) o quanto a afirmação se aproxima da realidade da empresa. O teste identifica o Posicionamento Estratégico dominante entre: Excelência Operacional, Intimidade com Cliente ou Liderança em Produto."*

Cada questão a seguir traz o enunciado (`titulo`) e as âncoras das pontas da escala (Mínima/1 = `min`; Máxima/4 = `max`).

1. (cat: EO, peso 1.5) Preço é um fator primordial no meu segmento de atuação?
   - Mínima (1): As variações de preços entre concorrentes são grandes e o preço não é fator preponderante na decisão de compra do cliente.
   - Máxima (4): Variações mínimas de preços fazem perder pedidos.

2. (cat: IC, peso 1.5) Conhecer o meu cliente para lhe oferecer exatamente o que ele precisa é fundamental no meu segmento?
   - Mínima (1): O entendimento e mapeamento dos públicos-alvo são genéricos, superficiais e não científicos.
   - Máxima (4): Pesquisas de análise de perfis, comportamento e satisfação de clientes são constantes.

3. (cat: LP, peso 2) Lançar produtos/serviços novos constantemente é um dos maiores diferenciais que uma empresa pode ter no meu segmento?
   - Mínima (1): Poucas mudanças nos produtos são suficientes para gerar nova curva de continuidade de produtos.
   - Máxima (4): O ciclo de vida de produtos é muito curto; o cliente rapidamente substitui a compra e precisa constantemente de melhorias e novidades.

4. (cat: EO, peso 1) Meus produtos/serviços deveriam ser oferecidos de forma padronizada, seguindo um modelo preconcebido?
   - Mínima (1): A padronização é um desafio: não há procedimentos documentados e há variação do produto/serviço.
   - Máxima (4): A execução e processamento do produto/serviço é toda estudada, formalizada em manuais, padronizada e auditada.

5. (cat: LP, peso 1.5) Procuro sempre oferecer o melhor produto do mercado e me diferenciar dos meus concorrentes por meio da inovação?
   - Mínima (1): Não há muitos problemas em fornecer produto/serviço com qualidade similar à dos meus concorrentes.
   - Máxima (4): Preço não é fator primordial para o negócio — singularidade, diferenciação e alto valor agregado são as principais estratégias.

6. (cat: IC, peso 1) Primeiramente entendo o que meu cliente quer para depois construir meu produto/serviço — o cliente é quase um coprodutor?
   - Mínima (1): As necessidades não são analisadas cliente a cliente e não há relação próxima com o indivíduo.
   - Máxima (4): A definição dos requisitos, aspectos e características do produto/serviço é feita em conjunto com o cliente.

7. (cat: EO, peso 1) Minha equipe de vendas/atendimento é treinada para realizar um script padronizado, atendendo várias pessoas em um mesmo dia?
   - Mínima (1): A venda/atendimento é específica para cada cliente; não há abordagem pré-definida e padronizada.
   - Máxima (4): Todos os passos da venda/atendimento são mapeados, documentados e auditados.

8. (cat: LP, peso 1) Meu produto é muito inovador — minha equipe de vendas é treinada para vender um produto único no mercado?
   - Mínima (1): A equipe de vendas não precisa entender as características específicas do produto/serviço, nem dos concorrentes.
   - Máxima (4): A equipe precisa estar atenta constantemente a novidades, lançamentos, inovações e características técnicas.

9. (cat: IC, peso 1) Necessito de pessoas bem qualificadas na minha equipe comercial para entender a necessidade do cliente e gerar relação pessoal?
   - Mínima (1): O grau de instrução da equipe de vendas pode ser baixo e não precisa de competências comportamentais elevadas.
   - Máxima (4): As pessoas precisam entender de perfis comportamentais, fazer perguntas certas e ter boas habilidades comportamentais.

10. (cat: EO, peso 1.5) O produto/serviço que ofereço possui grande demanda? Vários tipos diferentes de pessoas o demandam?
    - Mínima (1): O produto/serviço é específico para um perfil de cliente, dificilmente um mesmo cliente compra exatamente o mesmo produto.
    - Máxima (4): O produto/serviço tem capacidade de atender a qualquer tipo de pessoa e o consumo é recorrente.

11. (cat: IC, peso 1.5) Meus produtos/serviços atendem determinado tipo de cliente — entrego uma solução específica e pontual para ele?
    - Mínima (1): As soluções são genéricas, independente do tipo de cliente.
    - Máxima (4): Cada cliente possui sua demanda analisada e seu produto/serviço é desenvolvido para atender necessidade específica.

12. (cat: LP, peso 1.5) É imprescindível que meu cliente compreenda o diferencial do meu produto/serviço em relação ao mercado?
    - Mínima (1): O cliente não percebe o diferencial, seria indiferente para ele e não pagaria mais pelo produto/serviço.
    - Máxima (4): O cliente busca diferenciação e características específicas entre fornecedores dos produtos/serviços.

13. (cat: EO, peso 1) Meu cliente gosta de saber que meu preço é competitivo com o mercado?
    - Mínima (1): Cliente não costuma fazer cotações, comparar preços e mantém certo nível de fidelidade.
    - Máxima (4): Cliente utiliza constantemente como argumento de barganha a comparação com preços dos concorrentes.

14. (cat: LP, peso 1) Meu cliente gosta de saber que tem o melhor produto/serviço do mercado?
    - Mínima (1): É indiferente para a maioria dos clientes saber se o produto está entre os melhores — a marca não é importante.
    - Máxima (4): O cliente expressa o produto como fator de status — não se preocupa com o preço pago, mas sim com possuir o melhor do mercado.

15. (cat: IC, peso 2) Meu cliente gosta de saber que tem produto/serviço feito exatamente para ele, da forma que ele precisa?
    - Mínima (1): É indiferente para o cliente a informação de que o produto é único.
    - Máxima (4): Cliente costuma agradecer, envaidecer-se e ficar satisfeito ao saber que poucas pessoas possuem o mesmo produto/serviço.

16. (cat: EO, peso 2) Para mim, é mais importante no meu segmento controlar custos?
    - Mínima (1): As margens são altas; variações nos custos não impactam consideravelmente os preços nem fazem perder pedidos para a concorrência.
    - Máxima (4): Custos são rigorosamente controlados — existe metodologia de apuração e energia interna investida na redução de custos.

17. (cat: LP, peso 1) Para mim, é mais importante no meu segmento ter o melhor produto/serviço?
    - Mínima (1): A importância de ter o melhor produto no mercado não compensa o investimento de tempo, energia e dinheiro.
    - Máxima (4): Com uma marca forte, constante inovação e alta qualidade, é possível ter preço premium no mercado.

18. (cat: IC, peso 1.5) Entender profundamente meu cliente é mais importante que ter o melhor produto ou o menor preço?
    - Mínima (1): O cliente se importa mais com o produto em si ou com o preço do que com o atendimento personalizado.
    - Máxima (4): A proximidade e o entendimento profundo do cliente são os principais diferenciais do negócio.

19. (cat: EO, peso 1) O negócio depende de grandes volumes para ter boa rentabilidade?
    - Mínima (1): Baixos volumes com alto ticket médio são perfeitamente viáveis.
    - Máxima (4): O negócio só funciona bem com grande escala; margem unitária é baixa.

20. (cat: LP, peso 1) A diferenciação do meu produto é mais forte que a eficiência operacional ou o relacionamento?
    - Mínima (1): O diferencial do produto em si não é o mais importante.
    - Máxima (4): O que segura o cliente é o produto diferenciado — acima de tudo.

21. (cat: IC, peso 1) Eu gostaria de ter um portfólio de soluções amplo o suficiente para todos os problemas do meu cliente?
    - Mínima (1): Quanto menos produtos, sendo estes seriados com pouca variação, melhor para mim.
    - Máxima (4): É fundamental ter um leque maior de opções pré-formatadas para atender diferentes necessidades dos clientes.

22. (cat: EO, peso 1.5) Tenho muita dificuldade quando o cliente pede para modificar algo no meu produto/serviço para atendê-lo?
    - Mínima (1): Fornecimento do produto/serviço é flexível — alterações são relativamente fáceis de fazer e não exigem burocracia.
    - Máxima (4): Exige mudança de procedimentos; diferentes áreas precisam estar envolvidas e é necessária análise prévia de viabilidade.

23. (cat: IC, peso 1) Fazer uma expansão do negócio para nova região/cidade é grande desafio, por não conhecer o público local?
    - Mínima (1): O produto/serviço é vendável em novos locais sem muitas dificuldades, independente da região ou cultura local.
    - Máxima (4): As relações com clientes são próximas, às vezes pessoais. Conhecer cultura e hábito de uma nova região é fator de sucesso para expansão.

24. (cat: LP, peso 1) Não ser conhecido como pioneiro no meu mercado é grande problema para mim?
    - Mínima (1): A questão de pioneirismo é indiferente para cliente, acionistas e mercado.
    - Máxima (4): Vanguarda, tradição e reconhecimento pelo histórico de produto/serviço diferenciado seriam diferencial de mercado.

25. (cat: EO, peso 1) Pessoas com disponibilidade e alta capacidade de trabalhar somente cumprindo processos é o que preciso para ter sucesso?
    - Mínima (1): As pessoas precisam ser criativas, têm dificuldade de utilizar controles e gostam de horários flexíveis.
    - Máxima (4): Pessoas são regidas por regras e padrões pré-estabelecidos, possuem facilidade com atividades repetitivas e são flexíveis aos horários da empresa.

26. (cat: LP, peso 1.5) Preciso ter gente inovadora, estudiosa e criativa dentro do meu quadro de pessoas?
    - Mínima (1): Não há necessidade de ter pessoas criativas — desenvolvimento e melhoria de produtos/serviços podem ser centralizados em poucos.
    - Máxima (4): Pessoas que estudam, fazem cursos, têm ideias e são criativas são fundamentais para sobrevivência do negócio.

27. (cat: IC, peso 1) Pessoas bem relacionadas que entendam o mercado em que atuo são fatores preponderantes para mim?
    - Mínima (1): A capacidade de geração de negócios por meio de indicações não é relevante.
    - Máxima (4): O principal caminho de geração de novos negócios é por meio de indicação — quanto mais influente o cliente, mais importante ele é.

---

*Fim do documento. Fontes: `pages/form/{socios,colaboradores,clientes,posicionamento}.js`; `lib/forms/{socios_v4_schema,colaboradores_v3_schema,clientes_v2_schema}.js`; e os componentes em `components/forms/{FormSocios,FormColaboradores,FormClientes}/`.*
agentId: ac826e18f5509d52e (use SendMessage with to: 'ac826e18f5509d52e' to continue this agent)
<usage>subagent_tokens: 124122
tool_uses: 29
duration_ms: 260777</usage>