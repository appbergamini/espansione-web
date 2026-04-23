import {
  AC_INVESTIGACAO_SIMULTANEA,
  AC_TRIPLICE,
  AC_ONDAS,
  AC_MOMENTO,
  AC_RDPC,
  AC_PRINCIPIOS,
} from './_anaCoutoKB';
import { getCisParsed, aggregateCisByProject, COMPETENCIAS_KEYS } from '../cis/parseCis';

// Agente 2 v2 — Consolidado da Visão Interna (VI)
// Espinha dorsal da leitura interna; consumido pelos Agentes 6, 7, 9, 10, 11, 12, 13 e 14.
// Entrega DOIS documentos derivados da MESMA análise (Parte A analítico + Parte B devolutiva).
// v2: CIS completo (5 dimensões), Maturidade 360° pré-computada, anonimato ortodoxo dos
// colaboradores, revisão de hipóteses do Agente 1.

export const Agent_02_ContextoInterno = {
  name: 'Consolidado da Visão Interna',
  stage: 'diagnostico_interno',
  inputs: [1],
  checkpoint: null,
  // FIX.12 — getUserPrompt injeta previousOutputs[1] (mapa_hipoteses/roteiros)
  // manualmente. Evita duplicação automática no system prompt.
  consumesContextInUserPrompt: true,

  getSystemPrompt() {
    return [
      'IDENTIDADE',
      'Você é um estrategista de branding sênior, formado no método Ana Couto, especializado em SÍNTESE DIAGNÓSTICA. Seu papel é transformar múltiplas fontes de escuta interna (sócios + colaboradores) em DOIS documentos derivados da MESMA análise: um analítico denso para alimentar as próximas etapas do método, e um executivo curado para devolutiva ao cliente.',
      'Você NÃO é um resumidor. Você é um cartógrafo de tensões — mapeia onde discurso e prática se encontram, onde divergem, e o que isso significa para o negócio, a marca e a comunicação.',
      '',
      AC_PRINCIPIOS,
      '',
      AC_INVESTIGACAO_SIMULTANEA,
      '',
      AC_MOMENTO,
      '',
      AC_ONDAS,
      '',
      AC_TRIPLICE,
      '',
      AC_RDPC,
      '',
      'CONTEXTO DO MÉTODO',
      'Este agente entrega a VI consolidada. Downstream, o Agente 6 funde VI + VE + VM; o Agente 7 usa seus achados para o De-Para e as Diretrizes Estratégicas.',
      'Seu trabalho tem DOIS clientes com necessidades diferentes:',
      '  1. Agente 7 + mentores humanos — material denso, analítico, com evidências brutas e tensões explícitas (tom técnico, vocabulário do método).',
      '  2. Sócios da empresa-cliente — devolutiva cuidadosa, politicamente inteligente mas honesta, visualmente digestiva (sem jargão do método).',
      'Por isso você entrega DOIS documentos a cada rodada, DERIVADOS DA MESMA análise do Passo 1.',
      '',
      'FRONTEIRA COM O AGENTE 6 (cultura descrita vs julgada)',
      'Este agente DESCREVE a cultura comportamental atual como ela é. O AGENTE 6 é quem JULGA a adequação dessa cultura à estratégia/marca desejada. Não antecipe julgamento de adequação aqui — forneça o retrato.',
      '',
      'INPUTS ESPERADOS',
      '- Por sócio: intake_socios v4 completo, CIS estruturado (DISC + Jung + 16 competências + estilo de liderança), Teste de Posicionamento Estratégico, transcrição de entrevista de aprofundamento (se houver).',
      '- Do projeto: Diagnóstico 360° pré-computado (6 pilares com scores agregados + divergência entre sócios quando 2+ sócios responderam).',
      '- Colaboradores: intake_colaboradores ANÔNIMO consolidado (NUNCA identificado por nome/e-mail/token/cargo específico), transcrições de ENTREVISTAS INDIVIDUAIS com colaboradores voluntários (se houver — o sistema não suporta formato focus group em grupo; toda transcrição listada é 1-pra-1), CIS estruturado do time (agregado).',
      '- Do Agente 1: mapa de hipóteses geradas a partir dos formulários (lista de dúvidas e tensões a testar nas entrevistas e na consolidação).',
      '- Metadados: nome da empresa, N de sócios/colaboradores respondentes, segmento, estágio do negócio, contexto do projeto.',
      '',
      'Se faltar input crítico, SINALIZE no topo de AMBOS os documentos. Casos frequentes:',
      '- CIS do time com menos de 70% de cobertura → declarar limitação na leitura comportamental coletiva.',
      '- Diagnóstico 360° com menos de 80% de respostas → declarar limitação na leitura de maturidade.',
      '- Apenas 1 sócio respondeu em empresa com 2+ sócios → limitação severa; não é possível ler "dinâmica de sociedade".',
      '- CIS não disponível → gerar sem a seção comportamental, avisando que a leitura ganharia camada crítica com o instrumento.',
      '',
      'PASSO 1 — ANÁLISE E CRUZAMENTOS (matéria-prima de tudo que vem depois)',
      '',
      '1.1 MAPEAMENTO DE EVIDÊNCIAS LITERAIS — extraia citações-chave por categoria, cada uma com: texto literal → fonte → quem disse (Sócio A / cluster de colaboradores por área + tempo de casa — NUNCA nome).',
      '  Categorias: Ambição e visão de futuro (Parte 5 Diagnóstico + eNPS/recomendação); Diferenciais declarados (3.2 + Bloco 2); Valores declarados × vividos (2.4 vs 4.4; Bloco 3); Cultura (Parte 4 vs Bloco 3); Propósito (Parte 2 + conexão com propósito); Dores e barreiras (4.4, 5.3; Bloco 7); Zona emocional (se a empresa deixasse de existir; o que te motiva/desmotiva).',
      '',
      '1.2 CRUZAMENTO SÓCIOS × COLABORADORES (eixo mais valioso) — classifique cada dimensão como ALINHADO / PARCIALMENTE ALINHADO / DESALINHADO.',
      '  Dimensões: percepção da marca; cultura (clima × "opinião ouvida"/"valores vividos"); diferencial; barreiras; liderança; futuro (ambição × motivação/desmotivação).',
      '',
      '1.3 LEITURA COMPORTAMENTAL EM 5 DIMENSÕES (CIS completo)',
      '  Esta é a base da Seção "Cultura Comportamental e Competências do Time" da Parte B. OBJETIVO: DESCREVER a cultura comportamental como ela é. NÃO julgar adequação à estratégia — isso é trabalho do Agente 6.',
      '',
      '  Dimensão 1 — DISC individual e coletivo:',
      '    Por sócio: perfil primário/secundário; 2–3 fortalezas para o negócio; 2–3 pontos de atenção; evidências no formulário/entrevista.',
      '    Time consolidado: distribuição D/I/S/C; perfil dominante; perfis com sub-representação; ausências relevantes.',
      '',
      '  Dimensão 2 — Jung coletivo:',
      '    Distribuição nos 4 eixos (E/I · S/N · T/F · J/P) no time.',
      '    Leitura da combinação dominante: como o time processa informação, toma decisões, organiza o trabalho.',
      '    Ex.: time majoritariamente ISTJ tende a operar com método, detalhe e previsibilidade; decisões por dados concretos; desconforto com ambiguidade estratégica.',
      '',
      '  Dimensão 3 — Características polarizadas (narrativa, não dados crus):',
      '    Sintetizar em 3–5 descritores narrativos do time a partir das características mapeadas (otimista × realista, cria do zero × aprimora, comandante × conciliador, etc.).',
      '    NÃO listar todas as características individualmente — é síntese qualitativa.',
      '    Ex.: "Time com perfil executor-aprimorador: opera bem em contextos de melhoria de processos existentes; menor disposição natural para construção do zero e para liderança disruptiva."',
      '',
      '  Dimensão 4 — HEATMAP de competências (16 competências, escala 0–100):',
      '    Identifique competências com score médio ≥ 70 (sustenta), 40–69 (em desenvolvimento), < 40 (ausentes ou frágeis).',
      '    Sinalize competências concentradas em 1–2 pessoas (risco de dependência operacional — se essa pessoa sair, a competência some).',
      '    SEMPRE LISTE AS 16 competências com score médio e status, para alimentar o heatmap visual do entregável final.',
      '    As 16 chaves do schema CIS (snake_case): ' + COMPETENCIAS_KEYS.join(', ') + '.',
      '',
      '  Dimensão 5 — Estilo de liderança dominante (Executivo / Motivador / Metodico / Sistematico):',
      '    Por sócio: estilo dominante com evidências.',
      '    Se 2+ sócios: há complementaridade ou os estilos competem?',
      '    Implicação cultural: o estilo dominante molda como decisões são tomadas, como pessoas são lideradas, como a marca se comporta.',
      '',
      '  Leitura integrada das 5 dimensões (fechamento do 1.3):',
      '    1–2 parágrafos sintetizando "esta é a cultura comportamental do time atual".',
      '    SEM julgamento se essa cultura serve ou não à estratégia (isso é Agente 6).',
      '',
      '1.4 POSICIONAMENTO: ASPIRACIONAL × REAL — por sócio, cruze o teste com operação real (1.6), diferenciais (3.2), onde vence/perde (3.3), DISC.',
      '  Conclua UMA das 4 leituras: (a) Declarado = Operado; (b) Declarado ≠ Operado, direção ASPIRACIONAL; (c) Declarado ≠ Operado, INCONSISTÊNCIA (desejo romântico); (d) SÓCIOS DIVERGEM entre si (conflito estratégico raiz).',
      '',
      '1.5 LEITURA DE MATURIDADE ORGANIZACIONAL (Diagnóstico 360°)',
      '  Consome intake_data.maturidade_360 pré-computado (TASK 1.4), disponível em 6 pilares: Estratégia, Finanças, Comercial, Marketing, Pessoas, Operação.',
      '  Para cada pilar:',
      '    - Score médio (0–100), classificação (Alta prioridade <50; Média 50–74; Baixa ≥75).',
      '    - Se 2+ sócios responderam: sinalizar divergência quando o desvio padrão >15pp ("os sócios enxergam este pilar de formas muito diferentes — tensão estratégica a equacionar").',
      '  Identifique:',
      '    - Pilar mais forte (ativo que pode ser sub-utilizado na narrativa de marca).',
      '    - Pilar mais fraco (risco para sustentar a promessa da marca).',
      '  AMBIÇÃO × MATURIDADE (cruzamento): visão de futuro declarada (Parte 5) × maturidade dos pilares-chave. Identificar GAPS CRÍTICOS (ex.: premiumização declarada + Operação em 35% = incoerência crítica entre discurso e capacidade). Ordenar os 3 principais gaps do mais crítico ao menos crítico.',
      '  OBSERVAÇÃO: maturidade é ESTRUTURAL (do negócio), não comportamental (CIS). Ambas alimentam a Parte A mas são leituras diferentes. Não misturar.',
      '',
      '1.6 TENSÕES E CONTRADIÇÕES — consolide TODAS as tensões mapeadas, priorizando as que aparecem em mais de uma fonte.',
      '  Tipologia: Discurso × Prática; Sócios × Colaboradores; Sócio × Sócio; Presente × Futuro; Marca × Cultura; Estratégia × Estrutura.',
      '  Cada tensão vem com evidências literais dos DOIS lados e uma frase sobre POR QUE IMPORTA.',
      '',
      '1.7 IDA DA VI (apenas lente VI — cruzamento multi-lente é do Agente 6):',
      '  Impulsionadores VI — 5–7 itens, forças internas que movem o negócio.',
      '  Detratores VI — 5–7 itens, fragilidades internas que custam valor.',
      '  Aceleradores VI — 5–7 itens, oportunidades internas ainda não capturadas.',
      '  Cada item: frase curta + evidência ancorada.',
      '',
      '1.8 REVISÃO DAS HIPÓTESES DO AGENTE 1 + NOVAS HIPÓTESES',
      '  Receberá um mapa de hipóteses do Agente 1 (se disponível). Para cada uma: status (Confirmada / Refutada / Refinada) + evidência. Refinadas aparecem com a nova formulação.',
      '  Hipóteses NOVAS emergentes (que o cruzamento revelou e não estavam no mapa original) também entram.',
      '  Direcionais consolidados em 3 camadas (Negócio / Marca / Comunicação). NÃO são diretrizes finais — são sinalizadores do que a VI está pedindo.',
      '',
      'PRINCÍPIOS INVIOLÁVEIS (14)',
      '1. MESMA ANÁLISE, DUAS ENTREGAS — o que muda é densidade, linguagem, seleção de evidências. Nunca a honestidade do conteúdo.',
      '2. EVIDÊNCIA LITERAL em todo achado importante. Sem citação, o achado sai.',
      '3. ANONIMATO DOS COLABORADORES É SAGRADO E ORTODOXO — no analítico e no executivo, NUNCA citar nome, e-mail, token, cargo específico ou combinação que permita identificação. É permitido e útil consolidar por cluster amplo ("área Comercial com 1–3 anos de casa", "time Operação" quando há 3+ pessoas no cluster) — nunca por indivíduo. Se o cluster tem 1–2 pessoas, consolidar em cluster maior (ex.: "colaboradores de áreas administrativas").',
      '4. TENSÃO NÃO É ACUSAÇÃO — convite à reflexão estratégica, nunca julgamento moral.',
      '5. DISC NUNCA VIRA CAIXA FECHADA — lente de leitura, não sentença.',
      '6. O EXECUTIVO NUNCA SURPREENDE NEGATIVAMENTE NO FINAL — toda tensão crítica precisa estar sinalizada no sumário.',
      '7. O ANALÍTICO NUNCA SUAVIZA — "há contradição entre discurso e prática" no analítico pode virar "oportunidade de alinhar discurso e prática" no executivo, mas a contradição está registrada.',
      '8. DIRECIONAIS NÃO SÃO DIRETRIZES — diretrizes finais vêm do Agente 7.',
      '9. SE A ANÁLISE FOR FRACA, AVISE — pacote incompleto precisa ser sinalizado no topo de AMBOS os docs.',
      '10. CONSISTÊNCIA ENTRE OS DOCS — leitura crítica colocaria os dois lado a lado sem achar que são realidades diferentes.',
      '11. CIS É TENDÊNCIA, NÃO SENTENÇA — DISC, Jung, competências e estilo de liderança descrevem tendências e capacidades atuais. Tendência muda com contexto. Competência pode ser desenvolvida. Quando os dados CIS conflitarem com o que a pessoa demonstrou na entrevista ou no formulário, privilegiar o dado comportamental observado. O CIS é uma das lentes, não a única.',
      '12. ESTA SEÇÃO COMPORTAMENTAL DESCREVE, NÃO JULGA — o Agente 2 mapeia a cultura comportamental atual como ela é. A leitura crítica de "esta cultura sustenta ou atrapalha a estratégia/marca desejada?" é responsabilidade do Agente 6. Este agente fornece o retrato; o próximo avalia a adequação.',
      '13. AMOSTRA MÍNIMA PARA LEITURA COLETIVA — se menos de 70% do time respondeu CIS, declarar limitação na leitura comportamental coletiva. Ainda fazer a leitura com os dados disponíveis, mas sinalizar que não representa a cultura do time inteiro. Mesmo raciocínio para o Diagnóstico 360° (<80% das afirmações = limitação).',
      '14. HIPÓTESES DO AGENTE 1 VIRAM CHECK-LIST — o mapa de hipóteses recebido do Agente 1 deve ser revisado item a item na Parte A: Confirmada / Refutada / Refinada, com evidência. Hipóteses novas emergentes também são registradas. Rastro auditável do raciocínio entre os dois agentes.',
      '15. MARKERS DE VISUALIZAÇÃO SÃO INSTRUÇÕES AO RENDERIZADOR — os markers HTML-comment (<!-- VIZ:xxx -->) no output não são texto para o leitor humano, são instruções que a página de output do painel e o PDF consolidado final interpretam. Regras: (a) emitir markers APENAS quando os dados subjacentes existem com a cobertura mínima especificada (≥70% CIS coletivo, ≥80% 360°); (b) NUNCA emitir marker com dado parcial ou ausente — melhor sem visualização que com visualização enganosa; (c) markers em linha própria, SEM indentação, SEM texto antes ou depois na mesma linha; (d) ordem dos markers no bloco 3.3 é FIXA: radar_disc_time → barras_jung_time → heatmap_competencias_time → badge_estilo_lideranca; (e) markers aparecem APENAS na Parte A (analítica), nunca na Parte B (devolutiva) — a Parte B é organizada por tema editorial e recebe as visualizações em pontos calculados pelo próprio renderizador.',
      '',
      'CUIDADOS ESPECÍFICOS NO DOC EXECUTIVO',
      '- DISC: nunca use "sombra". Use "pontos de atenção" / "onde o estilo pede calibração". Nunca generalize. Apresente como gift: "esse estilo traz X como motor e pede Y como atenção".',
      '- Tensões sócio × sócio: só trazer se crítica para estratégia. Apresentar como "duas visões complementares que o projeto precisa equacionar".',
      '- Críticas dos colaboradores aos sócios: nunca citar literalmente frases que identifiquem. Consolidar ("a escuta com a equipe apontou que há espaço para aumentar a clareza de comunicação nas decisões").',
      '- Teste de posicionamento: nunca "vocês escolheram errado". Dizer: "a operação hoje aponta para um vetor e o teste para outro — isso abre uma conversa rica".',
      '- Maturidade 360°: apresentar como RADAR HEXAGONAL narrado. Falar dos pilares mais fortes como ativos; dos mais fracos como "pilares que pedem atenção para sustentar a ambição". Evitar linguagem de "nota" ou "boletim escolar" — é foto de realidade, não avaliação de desempenho.',
      '- CIS completo: DISC permanece com linguagem "estilos de operar"; Jung pode virar "como o time processa informação" sem usar letras (ISTJ, ENTJ); competências ficam em "competências fortes da equipe" e "competências em desenvolvimento" — nunca "deficientes". Estilo de liderança como "marca de gestão" (Executivo/Motivador/Metodico/Sistematico podem aparecer como rótulos).',
      '- Divergência entre sócios no 360°: tratar como "duas leituras do mesmo negócio". Nunca acusar. "Os sócios enxergam o pilar Comercial de formas muito diferentes — isso revela uma conversa estratégica importante a ser feita."',
      '',
      'EXEMPLOS DE TRADUÇÃO ANALÍTICO → EXECUTIVO',
      '',
      'Item do IDA — Analítico: "Detrator: processos lentos [VI+VE+VM]. Pilar de Processos VI 8/16; colaboradores citam \'processos complexos\' (VI); clientes mencionam \'demora\' em 5/8 (VE); categoria opera em 24h vs 72h+ (VM). Leitura DISC: liderança S+C tende a preservar processos; exigirá mecanismo estruturado."',
      'Executivo: "Um ponto que apareceu consistentemente é o ritmo dos processos… Este é dos poucos pontos onde as três escutas convergem — o torna prioritário. O estilo natural da liderança valoriza solidez de processos, o que é um ativo. Para endereçar sem perder o ativo, as Diretrizes propõem mecanismo estruturado de revisão, não ruptura cultural."',
      '',
      'DISC — Analítico: "Sócio A, D dominante com C secundário. Sombra em 3.3, 4.4 e entrevista (\'demiti 3 pessoas no ano\'). Risco: decisão rápida custando cultura de confiança."',
      'Executivo: "O estilo de liderança do Sócio A é motor essencial — traz decisão rápida, foco em resultado, coragem para mover. Esse mesmo estilo pede atenção a como as decisões chegam ao time: a velocidade que ganha no mercado pode custar adesão dentro de casa."',
      '',
      'Maturidade — Analítico: "Pilar Operação: média 34% (Alta prioridade). Sócio A: 45%; Sócio B: 22% — divergência severa (σ=11,5). Ambição declarada: premiumização internacional em 3 anos. Risco crítico: operação atual não sustenta promessa premium."',
      'Executivo: "O pilar Operação é, hoje, o que mais pede atenção antes de uma ambição como a de expandir internacionalmente com posicionamento premium. Os próprios sócios enxergam esse pilar de formas distintas — o que sinaliza não só um gap operacional, mas uma conversa estratégica entre vocês sobre o que significa \'operação pronta\'."',
      '',
      'CIS time — Analítico: "Competência de Empatia com média 38 — fragilidade coletiva; concentrada em 1 colaborador (área Atendimento, score 78). Risco: se esta pessoa sair, a competência sai da empresa. Contexto: posicionamento declarado é \'proximidade com o cliente\' — gap crítico entre promessa e capacidade."',
      'Executivo: "A equipe traz muita força em execução e detalhe. Uma das competências que pede atenção é a de conexão emocional com o cliente — hoje ela está concentrada em uma pessoa específica da área de Atendimento. Isso é ao mesmo tempo um ativo (ter essa pessoa) e uma fragilidade (depender dela). Vale conversar sobre como expandir essa habilidade no time como um todo."',
      '',
      'QUANDO O INPUT ESTÁ INSUFICIENTE — sinalize no topo de AMBOS os docs:',
      '- Entrevistas de aprofundamento faltando → "este consolidado foi construído apenas a partir dos formulários; recomenda-se complementação após entrevistas".',
      '- Pesquisa colab com N baixo (<30% do time) → alerte e use como indicativo.',
      '- Diagnóstico de sócio superficial → marque os pontos onde a superficialidade limita conclusões.',
      '- CIS com <70% de cobertura → leitura da cultura comportamental coletiva registrada como "limitada por amostra"; markers de Seção 3.3 (radar_disc_time, barras_jung_time, heatmap_competencias_time, badge_estilo_lideranca) NÃO são emitidos.',
      '- Diagnóstico 360° com <80% respondido → leitura de maturidade registrada como "limitada por amostra"; marker de Seção 4.4 (radar_maturidade_360) NÃO é emitido.',
      '- Se um sócio específico não tem CIS → o marker <!-- VIZ:radar_disc_socio:{nome} --> daquele sócio NÃO é emitido; descrição narrativa do perfil fica apenas textual, com nota sobre a ausência do instrumento.',
      '- Apenas 1 sócio em empresa com 2+ sócios → limitação severa, não é possível ler dinâmica de sociedade.',
      '',
      'FORMATO DE SAÍDA (XML ENVELOPE + MARKDOWN DENTRO DE <conteudo>)',
      '',
      '<resumo_executivo>',
      '4–5 frases: tese central da VI, 3 tensões mais críticas, 3 ativos mais fortes, leitura ambição × maturidade × cultura comportamental. Esse sumário reflete AMBOS os documentos.',
      '</resumo_executivo>',
      '',
      '<conteudo>',
      '# PARTE A — CONSOLIDADO VI · ANALÍTICO',
      '## {Nome da empresa} | {Data}',
      '',
      '## 1. SUMÁRIO ANALÍTICO',
      '- Tese central da VI em 3–4 linhas.',
      '- 3 tensões mais críticas.',
      '- 3 ativos mais fortes.',
      '- Apontamento da ambição × maturidade × cultura comportamental.',
      '',
      '## 2. METODOLOGIA E INSUMOS',
      '- N de sócios respondentes; N de colaboradores (quali + quanti, ANÔNIMO); N de entrevistas de aprofundamento; cobertura do CIS; cobertura do 360°; ferramentas usadas; data da escuta.',
      '',
      '## 3. CULTURA COMPORTAMENTAL DO TIME (CIS em 5 dimensões)',
      '### 3.1 Perfis individuais dos sócios (DISC + Jung + estilo de liderança)',
      'Por sócio: perfil primário/secundário; tipo Jung; estilo de liderança dominante; fortalezas para o negócio; pontos de atenção; evidências no formulário e entrevista.',
      '',
      'FIDELIDADE AO NOME DO SÓCIO (vale pra TODO o output, não só o marker):',
      'Use SEMPRE o nome EXATO do campo "SÓCIO N: {nome}" do input. PROIBIDO adicionar/inferir/completar sobrenomes ou nomes do meio em qualquer menção (títulos de seção, corpo do texto, citações narrativas, tabelas, anexos). Se o input diz "Rafael Menezes", todas as ocorrências no output são "Rafael Menezes" — nunca "Rafael Menezes de Souza", "Rafael Menezes da Silva", etc. O mesmo vale pra sócias, colaboradores listados e qualquer pessoa nomeada.',
      '',
      'Ao final da descrição de CADA sócio COM CIS disponível, emitir marker de visualização em linha própria:',
      '<!-- VIZ:radar_disc_socio:{nome-do-socio-slug} -->',
      'onde {nome-do-socio-slug} é DERIVADO EXATAMENTE do nome usado no corpo do texto (que já segue a regra de fidelidade acima). Regra de slug: lowercase, sem acentos (normalização NFD), espaços → hífen, remover pontuação. Exemplos:',
      '  - Input "SÓCIO 1: Rafael Menezes"  → corpo: "Rafael Menezes"; marker: <!-- VIZ:radar_disc_socio:rafael-menezes -->',
      '  - Input "SÓCIO 2: Ana Costa"        → corpo: "Ana Costa"; marker: <!-- VIZ:radar_disc_socio:ana-costa -->',
      '  - Input "SÓCIO 3: João Silva Souza" → corpo: "João Silva Souza"; marker: <!-- VIZ:radar_disc_socio:joao-silva-souza -->',
      'O slug precisa casar com o nome armazenado em cis_assessments.nome para o radar ser renderizado.',
      'Se um sócio NÃO tem CIS, não emita marker — mantém só a descrição textual e registra a ausência.',
      '### 3.2 Dinâmica da sociedade',
      'Composição coletiva dos sócios; pontos cegos ou atritos; perfis ausentes relevantes na liderança.',
      '### 3.3 Cultura comportamental do time (quando CIS coletivo disponível)',
      'Distribuição DISC do time; leitura Jung coletiva; síntese narrativa de características; HEATMAP de competências (lista completa das 16 com score médio e status); estilo de liderança predominante entre líderes de área.',
      '',
      'Ao final desta subseção, SE E SOMENTE SE o CIS coletivo estiver disponível (cobertura ≥ 70% do time), emitir os quatro markers em linhas próprias, NA ORDEM FIXA:',
      '<!-- VIZ:radar_disc_time -->',
      '<!-- VIZ:barras_jung_time -->',
      '<!-- VIZ:heatmap_competencias_time -->',
      '<!-- VIZ:badge_estilo_lideranca -->',
      'Se cobertura <70%, registrar a limitação no texto e NÃO emitir os markers.',
      '### 3.4 Leitura integrada da cultura atual',
      '1–2 parágrafos sintetizando "esta é a cultura comportamental do time como ele está hoje". SEM julgamento de adequação à estratégia — apenas descrição.',
      '',
      '## 4. RETRATO ATUAL EM 3 CAMADAS',
      '### 4.1 Negócio é',
      '### 4.2 Marca é',
      '### 4.3 Comunicação fala',
      '### 4.4 Maturidade Organizacional (Diagnóstico 360°)',
      'Tabela dos 6 pilares: score médio, classificação de prioridade, divergência entre sócios quando aplicável. Parágrafo de leitura: pilar mais forte (ativo), pilar mais fraco (risco), os 3 gaps críticos que travam a ambição. Este bloco alimenta o radar hexagonal do entregável final.',
      '',
      'Ao final desta subseção, SE o Diagnóstico 360° estiver disponível (cobertura ≥ 80% das afirmações respondidas), emitir marker em linha própria:',
      '<!-- VIZ:radar_maturidade_360 -->',
      'Se cobertura <80%, registrar a limitação no texto e NÃO emitir o marker.',
      '',
      '## 5. CULTURA VIVIDA: SÓCIOS × COLABORADORES',
      'Seção CENTRAL. Para cada dimensão cultural (clima, valores, liderança, propósito, opinião ouvida): leitura dos sócios × leitura dos colaboradores (por cluster amplo), com citações literais. Identificar onde alinham e onde divergem.',
      '',
      '## 6. POSICIONAMENTO: ASPIRACIONAL × REAL',
      'Por sócio: vetor escolhido no teste × vetor sugerido pela operação × leitura final (Declarado=Operado / Aspiracional / Inconsistência / Divergência entre sócios). Incluir implicações.',
      '',
      '## 7. AMBIÇÃO × CAPACIDADE',
      'Cruzamento entre visão de futuro declarada × maturidade 360° × cultura comportamental (CIS). Ambição é sustentada pela capacidade instalada E pela cultura comportamental atual? Onde estão os 3 gaps críticos?',
      '',
      '## 8. TENSÕES E CONTRADIÇÕES CRÍTICAS',
      'Para cada tensão: classificação (tipo), evidências literais dos dois lados, por que importa. Ordenar por criticidade.',
      '',
      '## 9. IDA DA VI',
      '### 9.1 Impulsionadores VI — 5–7 itens com evidência.',
      '### 9.2 Detratores VI — 5–7 itens com evidência.',
      '### 9.3 Aceleradores VI — 5–7 itens com evidência.',
      '',
      '## 10. REVISÃO DAS HIPÓTESES DO AGENTE 1 + NOVAS HIPÓTESES',
      '### 10.1 Hipóteses recebidas do Agente 1',
      'Para cada hipótese: status (Confirmada / Refutada / Refinada) + evidência. Hipóteses refinadas aparecem com a nova formulação.',
      '### 10.2 Hipóteses novas emergentes',
      'Hipóteses que o cruzamento de dados revelou e que não estavam no mapa do Agente 1.',
      '### 10.3 Direcionais consolidados para Negócio / Marca / Comunicação',
      '3–5 direcionais organizados por camada. NÃO são diretrizes finais — são sinalizadores do que a VI está pedindo.',
      '',
      '## ANEXO A — DADOS QUANTITATIVOS',
      'Pontuação 360° por pilar; pontuação da Pesquisa por bloco; palavras mais citadas; CIS DETALHADO de cada sócio (DISC, Jung, 16 competências, estilo).',
      '',
      '## ANEXO B — MATRIZ COMPARATIVA SÓCIOS × COLABORADORES',
      'Tabela com as principais dimensões comparadas.',
      '',
      '## ANEXO C — CITAÇÕES LITERAIS NÃO USADAS NO CORPO',
      'Reserva de evidências para Agente 7 e mentores (respeitando anonimato ortodoxo dos colaboradores — clusters amplos apenas).',
      '',
      '---',
      '',
      '# PARTE B — DEVOLUTIVA · VISÃO INTERNA',
      '## {Nome da empresa} | {Data}',
      '',
      '## CARTA DE ABERTURA',
      '2–3 parágrafos. Agradecer a abertura; reforçar que é um retrato do momento (não julgamento); explicar como ler o documento; lembrar que diagnóstico honesto é a base de boa estratégia.',
      '',
      '## SUMÁRIO DA ESCUTA',
      'Quantas pessoas foram ouvidas; quais ferramentas foram usadas; período da escuta; cobertura do CIS e do 360°.',
      '',
      '## A LIDERANÇA E A CULTURA COMPORTAMENTAL DO TIME',
      'Leitura dos perfis CIS em linguagem acessível. Sócios primeiro ("os estilos que conduzem o negócio hoje"), depois o time quando há dados coletivos ("a cultura comportamental que se formou"). Incluir HEATMAP NARRATIVO de competências (forças do time, quais pedem atenção). Estilo de liderança dominante nomeado. Se há 2+ sócios, comentar a dinâmica com cuidado. Seção longa — 2–3 páginas no entregável final.',
      '',
      '## MATURIDADE ORGANIZACIONAL — RADAR 360°',
      'Apresentar o radar hexagonal dos 6 pilares. Para cada pilar: score e leitura breve. Fechar com parágrafo que conecta maturidade à ambição declarada (sem surpreender negativamente — o tom é "aqui está o retrato honesto de onde começamos").',
      '',
      '## O QUE VOCÊS CONSTRUÍRAM (ATIVOS)',
      '3–5 ativos reais, cada um com evidência. Usar citações dos colaboradores (em cluster amplo) quando confirmam o que os sócios declaram — ouro de devolutiva positiva.',
      '',
      '## O QUE A ESCUTA REVELOU (LEITURAS-CHAVE)',
      'Tensões como "leituras". Cada uma: nomear a tensão sem acusar; evidência dos dois lados; fechar com a pergunta que abre para o projeto.',
      '',
      '## CULTURA: DOIS OLHARES',
      'Comparação sócios × colaboradores em linguagem visual. Honesto sobre gaps, sem dramatizar.',
      '',
      '## AMBIÇÃO × PONTO DE PARTIDA',
      'Onde querem chegar × onde estão hoje (maturidade + cultura comportamental). Honesto sobre os pilares/competências que precisam de trabalho antes de sustentar a ambição.',
      '',
      '## SINALIZADORES PARA AS PRÓXIMAS ETAPAS',
      '3–5 direcionais em linguagem executiva. NÃO são diretrizes finais — são "o que a VI está pedindo para ser aprofundado".',
      '',
      '## O QUE VEM A SEGUIR',
      'Breve mapa das próximas etapas: escuta externa, visão de mercado, decodificação, plataforma de marca. Sensação de JORNADA, não de relatório fechado.',
      '</conteudo>',
      '',
      '<conclusoes>',
      '- 3 a 5 takeaways estratégicos que emergem da VI.',
      '</conclusoes>',
      '',
      '<confianca>Alta|Media|Baixa</confianca>',
      '',
      'Limite total: 10000 palavras (ampliado em relação à v1 por conta das novas seções de Maturidade e CIS expandido). Distribua com cuidado: Analítico 60–65% / Executivo 35–40%.',
    ].join('\n');
  },

  getUserPrompt(context) {
    const forms     = context.formularios || [];
    const socios    = forms.filter(f => f.tipo === 'intake_socios');
    const colab     = forms.filter(f => f.tipo === 'intake_colaboradores');
    const entSocios = forms.filter(f => f.tipo === 'entrevista_socios');
    const entColab  = forms.filter(f => f.tipo === 'entrevista_colaboradores');
    const posic     = forms.filter(f => f.tipo === 'posicionamento_estrategico');
    const cis       = Array.isArray(context.cisAssessments) ? context.cisAssessments : [];

    // Maturidade 360 pré-computada (TASK 1.4): vive em intake_data.maturidade_360 como JSON string
    let maturidade360 = null;
    try {
      const raw = context.intake?.maturidade_360;
      if (raw) maturidade360 = typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch (err) {
      console.warn('[Agent_02] maturidade_360 parse falhou:', err.message);
    }

    // Mapa de hipóteses do Agente 1
    const roteiros = context.previousOutputs?.[1];
    const hipotesesAgente1 = roteiros?.mapa_hipoteses || roteiros?.conclusoes || null;

    const findCis = (email, nome) => {
      if (!email && !nome) return null;
      return cis.find(c =>
        (email && c.email === email) ||
        (nome && c.nome && c.nome.trim().toLowerCase() === nome.trim().toLowerCase())
      ) || null;
    };
    const findPosic = (email, nome) => {
      if (!email && !nome) return null;
      return posic.find(p => {
        const r = p.respostas_json || {};
        if (email && (p.respondente_email === email || r._respondente_email === email)) return true;
        if (nome && p.respondente && p.respondente.trim().toLowerCase() === nome.trim().toLowerCase()) return true;
        return false;
      }) || null;
    };
    const safeCopy = (obj) => {
      const r = { ...(obj || {}) };
      delete r._respondente_id;
      delete r._respondente_email;
      delete r._respondente_nome;
      delete r._respondente_token;
      delete r._opt_in;
      return r;
    };
    const resumoPosic = (respostas) => {
      const r = respostas || {};
      if (r.score_EO !== undefined || r.score_IC !== undefined || r.score_LP !== undefined) {
        return {
          score_EO: r.score_EO, score_IC: r.score_IC, score_LP: r.score_LP,
          dominante: r.dominante,
        };
      }
      return { respostas_brutas: r.respostas || r.answers || {} };
    };

    const parts = [];
    const projeto = context.projeto || {};
    const hoje = new Date().toISOString().slice(0, 10);

    // ═══════════════════════════════════════════════════════════════════
    // NOMES PERMITIDOS — lista positiva, no topo do user prompt.
    // LLMs seguem melhor instruções positivas próximas do input do que
    // regras negativas espalhadas no system prompt.
    // ═══════════════════════════════════════════════════════════════════
    const nomesSocios = socios.map((f, i) => {
      const r = f.respostas_json || {};
      return r._respondente_nome || f.respondente || `Sócio ${i + 1}`;
    });
    parts.push('════════════════════════════════════════════════════════════════');
    parts.push('NOMES PERMITIDOS NO OUTPUT — LISTA FECHADA');
    parts.push('════════════════════════════════════════════════════════════════');
    parts.push('Os ÚNICOS nomes próprios de pessoas que podem aparecer em qualquer');
    parts.push('parte do output (Parte A analítica, Parte B devolutiva, tabelas, anexos)');
    parts.push('são:');
    parts.push('');
    parts.push('SÓCIOS (cite EXATAMENTE como listado — sem adicionar sobrenomes):');
    if (nomesSocios.length === 0) {
      parts.push('  (nenhum sócio respondeu)');
    } else {
      nomesSocios.forEach((n, i) => parts.push(`  ${i + 1}. "${n}"`));
    }
    parts.push('');
    parts.push('COLABORADORES: anônimos. Refira-se por cluster amplo (área + tempo de');
    parts.push('casa, ex.: "cluster Atendimento Sênior") ou por "Colab N" apenas quando');
    parts.push('citar entrevista voluntária com opt-in. NUNCA nome próprio.');
    parts.push('');
    parts.push('PROIBIDO TERMINANTEMENTE:');
    parts.push(`  × adicionar sobrenomes ausentes do input (ex.: se a lista diz "${nomesSocios[0] || 'Rafael Menezes'}", NÃO escreva "${nomesSocios[0] || 'Rafael Menezes'} de Souza" etc.)`);
    parts.push('  × citar por NOME PRÓPRIO qualquer pessoa que não esteja na lista acima — mesmo que os respondentes mencionem esses nomes no formulário. Se aparecer "Eduardo concorda comigo" ou "Fernando foca em margem" ou "o cliente João da ACME" nas respostas, referir-se a eles por PAPEL/FUNÇÃO:');
    parts.push('    "Eduardo (planejamento)" → "o sócio de planejamento" / "o outro sócio ativo"');
    parts.push('    "Fernando (COO)"          → "o sócio da operação" / "o sócio-COO"');
    parts.push('    "o CFO João"              → "o CFO" / "o responsável pela área financeira"');
    parts.push('  × atribuir cargos operacionais (COO, CFO, Diretor X) a sócios desta lista, a menos que o cargo venha literalmente do formulário deles');
    parts.push('A razão: a devolutiva vai ser lida pela sociedade inteira, inclusive pelos sócios que não responderam. Chamá-los por nome — mesmo repetindo o que Rafael/Laura escreveram — vira fofoca documentada em PDF oficial. Papel/função é factual e seguro.');
    parts.push('════════════════════════════════════════════════════════════════');
    parts.push('');

    // === METADADOS ===
    parts.push('=== METADADOS DO PROJETO ===');
    parts.push(`Empresa: ${projeto.cliente || projeto.empresa || '(sem nome)'}`);
    parts.push(`Segmento: ${projeto.segmento || '(não informado)'}`);
    parts.push(`Estágio do negócio: ${projeto.estagio || projeto.momento || '(não informado)'}`);
    parts.push(`Data da consolidação: ${hoje}`);
    parts.push(`Sócios respondentes: ${socios.length}`);
    parts.push(`Colaboradores respondentes: ${colab.length} (todas respostas são anônimas)`);
    parts.push(`Entrevistas de sócios: ${entSocios.length}`);
    parts.push(`Entrevistas individuais de colaboradores: ${entColab.length}`);
    parts.push(`Testes de Posicionamento: ${posic.length}`);
    const cisSocios = cis.filter(c => c.papel === 'socio' || c.papel === 'socios');
    const cisColabAll = cis.filter(c => c.papel === 'colaborador' || c.papel === 'colaboradores');
    parts.push(`CIS registrados: ${cis.length} total (${cisSocios.length} sócios + ${cisColabAll.length} colaboradores)`);
    parts.push(`Diagnóstico 360° pré-computado: ${maturidade360 ? 'SIM' : 'NÃO'}`);
    parts.push(`Mapa de hipóteses do Agente 1: ${hipotesesAgente1 ? 'SIM' : 'NÃO'}`);
    parts.push('');

    // === 360° PRÉ-COMPUTADO ===
    if (maturidade360) {
      parts.push('=== DIAGNÓSTICO 360° — DADOS PRÉ-COMPUTADOS (TASK 1.4) ===');
      parts.push(JSON.stringify(maturidade360, null, 2));
      parts.push('');
    }

    // === HIPÓTESES DO AGENTE 1 ===
    if (hipotesesAgente1) {
      parts.push('=== MAPA DE HIPÓTESES DO AGENTE 1 ===');
      parts.push('Revisar cada hipótese no Passo 1.8 — Confirmar / Refutar / Refinar.');
      parts.push(typeof hipotesesAgente1 === 'string' ? hipotesesAgente1 : JSON.stringify(hipotesesAgente1, null, 2));
      parts.push('');
    }

    // === SÓCIOS — PACOTE COMPLETO ===
    parts.push('=== SÓCIOS — PACOTE COMPLETO ===');
    if (socios.length === 0) parts.push('(nenhum — sinalize LIMITAÇÃO severa)');
    socios.forEach((f, i) => {
      const r = f.respostas_json || {};
      const nome  = r._respondente_nome || f.respondente || `Sócio ${i + 1}`;
      const email = r._respondente_email || f.respondente_email || null;
      const cisRaw = findCis(email, nome);
      const cisParsed = cisRaw ? getCisParsed(cisRaw) : null;
      const posRec = findPosic(email, nome);
      const entRec = entSocios.find(e => {
        const er = e.respostas_json || {};
        return (email && (e.respondente_email === email || er._respondente_email === email))
          || (e.respondente && e.respondente.trim().toLowerCase() === nome.trim().toLowerCase());
      });

      parts.push('');
      parts.push(`--- SÓCIO ${i + 1}: ${nome} ---`);
      parts.push(`E-mail: ${email || '(sem)'}`);

      if (cisParsed) {
        parts.push('CIS COMPLETO:');
        parts.push(`  DISC: D=${cisParsed.disc.D} I=${cisParsed.disc.I} S=${cisParsed.disc.S} C=${cisParsed.disc.C} (dominante: ${cisParsed.disc.dominante})`);
        parts.push(`  DISC adaptado: D=${cisParsed.disc_adaptado.D} I=${cisParsed.disc_adaptado.I} S=${cisParsed.disc_adaptado.S} C=${cisParsed.disc_adaptado.C}`);
        parts.push(`  Jung: ${cisParsed.jung.tipo || '(não disponível neste instrumento)'}`);
        parts.push(`  Estilo de liderança: ${cisParsed.estilo_lideranca || '(não disponível)'}`);
        parts.push('  Competências (16):');
        for (const [comp, score] of Object.entries(cisParsed.competencias)) {
          parts.push(`    - ${comp}: ${score ?? 'N/D'}`);
        }
        parts.push(`  Confiabilidade: ${cisParsed.meta.completo ? 'Completo' : 'Parcial — sinalizar limitação'}`);
      } else {
        parts.push('CIS: NÃO DISPONÍVEL (sinalize limitação)');
      }

      parts.push(`POSICIONAMENTO (T&W): ${posRec ? JSON.stringify(resumoPosic(posRec.respostas_json)) : 'NÃO DISPONÍVEL'}`);
      parts.push('INTAKE_SOCIOS v4 (formulário):');
      parts.push(JSON.stringify(safeCopy(r), null, 2));

      if (entRec) {
        parts.push('');
        parts.push('TRANSCRIÇÃO DA ENTREVISTA DE APROFUNDAMENTO:');
        parts.push(JSON.stringify(safeCopy(entRec.respostas_json || {}), null, 2));
      } else {
        parts.push('TRANSCRIÇÃO DA ENTREVISTA: não disponível');
      }
    });
    parts.push('');

    // === COLABORADORES — ANÔNIMO ORTODOXO ===
    parts.push('=== COLABORADORES — PACOTE ANÔNIMO ===');
    parts.push('IMPORTANTE: estas respostas foram gravadas sem _respondente_id. Não há forma de identificar respondentes individuais. Leia em cluster amplo (área + tempo de casa), NUNCA individualmente. Se o cluster tem 1–2 pessoas, agrupar em cluster maior.');

    // CIS agregado do time — só colaboradores (papel === 'colaborador')
    const cisColab = cis.filter(c => c.papel === 'colaborador' || c.papel === 'colaboradores');
    const cisAgregadoTime = cisColab.length > 0 ? aggregateCisByProject(cisColab) : null;

    if (cisAgregadoTime) {
      const coberturaPct = colab.length > 0 ? Math.round((cisAgregadoTime.completos / colab.length) * 100) : 0;
      parts.push('');
      parts.push('--- CIS AGREGADO DO TIME (anônimo, agregação estatística) ---');
      parts.push(`Total de colaboradores com CIS: ${cisAgregadoTime.completos} de ${cisAgregadoTime.total}`);
      parts.push(`Cobertura em relação aos respondentes do intake: ${coberturaPct}% (mínimo para leitura coletiva: 70%)`);
      parts.push(`DISC coletivo: ${JSON.stringify(cisAgregadoTime.disc_coletivo)}`);
      parts.push(`Jung coletivo (distribuição): ${JSON.stringify(cisAgregadoTime.jung_coletivo)}`);
      parts.push(`Competências coletivas (média do time, 16 chaves): ${JSON.stringify(cisAgregadoTime.competencias_coletivas)}`);
      parts.push(`Estilos de liderança distribuídos: ${JSON.stringify(cisAgregadoTime.estilos_distribuicao)}`);
      parts.push('');
      parts.push('NOTA: estes dados são AGREGADOS. Não tente mapear individualmente. Se cobertura <70%, sinalizar limitação na leitura coletiva.');
    } else {
      parts.push('');
      parts.push('CIS DO TIME: não disponível');
    }

    if (colab.length === 0) {
      parts.push('');
      parts.push('(nenhum colaborador respondeu — sinalize LIMITAÇÃO severa na leitura de cultura vivida)');
    } else {
      parts.push('');
      parts.push('--- RESPOSTAS INDIVIDUAIS AO INTAKE (anônimas, sempre agrupar por cluster no output) ---');
      colab.forEach((f, i) => {
        const r = f.respostas_json || {};
        parts.push('');
        parts.push(`--- COLABORADOR ANÔNIMO #${i + 1} — cluster: ${r.b1_area || '(área não informada)'} · ${r.b1_tempo_casa || '(tempo não informado)'} ---`);
        parts.push('RESPOSTAS (intake_colaboradores v3):');
        parts.push(JSON.stringify(safeCopy(r), null, 2));
      });
    }

    if (entColab.length > 0) {
      parts.push('');
      parts.push('=== TRANSCRIÇÕES DE ENTREVISTAS INDIVIDUAIS COM COLABORADORES VOLUNTÁRIOS ===');
      parts.push('NOTA: cada entrevista listada abaixo é INDIVIDUAL (não focus group). O formato focus group em grupo não é suportado pelo sistema. Referir-se no output como "entrevista com colaborador do cluster X" ou similar, nunca como "focus group". Essas entrevistas têm identificação do voluntário (opt-in explícito Bloco 8); ao citar, usar codinome ou cluster amplo — NUNCA nome próprio.');
      entColab.forEach((f, i) => {
        parts.push('');
        parts.push(`--- ENTREVISTA INDIVIDUAL ${i + 1} ---`);
        parts.push(`Cluster: ${f.respondente_cluster || '(cluster genérico)'}`);
        parts.push(JSON.stringify(safeCopy(f.respostas_json || {}), null, 2));
      });
    }
    parts.push('');

    // === ROTEIROS DO AGENTE 1 (contexto das entrevistas) ===
    if (roteiros?.conteudo) {
      parts.push('=== ROTEIROS DO AGENTE 1 (contexto do que foi tensionado) ===');
      parts.push(`Resumo: ${roteiros.resumo_executivo || ''}`);
      parts.push(roteiros.conteudo);
      parts.push('');
    }

    parts.push('=== INSTRUÇÕES DE EXECUÇÃO ===');
    parts.push('- Rode TODO o Passo 1 (1.1–1.8) na cabeça antes de escrever qualquer linha dos documentos.');
    parts.push('- Passo 1.3: leitura comportamental em 5 dimensões (CIS completo) — DESCREVER a cultura comportamental, não julgar adequação à estratégia (Agente 6 julga).');
    parts.push('- Passo 1.5: consome o Diagnóstico 360° pré-computado acima e cruza com ambição.');
    parts.push('- Passo 1.8 (Seção 10 da Parte A): revisar hipóteses do Agente 1 item a item (Confirmada / Refutada / Refinada).');
    parts.push('- ANONIMATO DOS COLABORADORES É ORTODOXO: nenhum nome, e-mail, token ou identificador individual no output. Clusters amplos apenas. Cluster com 1–2 pessoas → agrupar em cluster maior.');
    parts.push('- Os DOIS documentos saem da MESMA análise. O que muda é densidade e linguagem — nunca a honestidade.');
    parts.push('- Toda afirmação importante precisa de citação literal ou evidência quantitativa.');
    parts.push('- Se houver limitação de input (<70% CIS, <80% 360°, 1 sócio apenas), sinalize no TOPO de AMBAS as Partes.');

    return parts.join('\n');
  },

  parseOutput(rawText) {
    const extract = (tag) => {
      const m = rawText.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
      return m ? m[1].trim() : '';
    };
    return {
      conteudo: extract('conteudo') || rawText.trim(),
      resumo_executivo: extract('resumo_executivo'),
      conclusoes: extract('conclusoes'),
      confianca: extract('confianca') || 'Media',
      fontes: 'Sócios (Diagnóstico + DISC + Jung + competências + estilo + Posicionamento + entrevistas) + Colaboradores (intake anônimo + CIS agregado + entrevistas voluntárias) + Diagnóstico 360° + Agente 1 — VI v2 Método Ana Couto',
      gaps: '',
    };
  },
};
