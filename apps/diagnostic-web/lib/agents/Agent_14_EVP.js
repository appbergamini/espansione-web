// lib/agents/Agent_14_EVP.js
//
// FIX.12 — Agente 14 marca consumesContextInUserPrompt; ver objeto exportado.
// Bloco C · TASK 3.4 — Agente 14 (novo): Plataforma de Marca
// Empregadora (EVP). MODULAR — só roda quando o projeto contratou
// escopo de Marca Empregadora. Se não rodar, a Parte 5.2 do
// entregável final (TASK 4.4) não aparece.
//
// Posicionamento no pipeline: após Agente 9 (Plataforma), em paralelo
// aos Agentes 10/11/12/13. Não tem checkpoint próprio — aprovação
// acontece junto do CKPT 4 (Agente 13).
//
// Estrutura espelhada do Agent_09_Plataforma.js (mesmo grau de
// complexidade: metadados + getSystemPrompt com KB Ana Couto +
// getUserPrompt que consolida múltiplos outputs anteriores +
// parseOutput no envelope XML padrão do projeto).
//
// Referências de insumo:
//   - Agente 2 v2 (CIS narrativo, Parte A Seção 3 + Seção 5)
//   - Agente 6 (Seção 1.4 Cultura × Direção + Seção 2 Posicionamento)
//   - Agente 7 (Valores e Atributos)
//   - Agente 9 (Plataforma de Marca + Manifesto externo)
//   - Intake_colaboradores (anônimo ortodoxo)
//   - Entrevista_colaboradores (opt-ins voluntários)

import { AC_PRINCIPIOS, AC_ARQUETIPOS, AC_ONDAS, AC_REGRA_SEM_HTML, AC_REGRA_FINDINGS } from './_anaCoutoKB';

export const Agent_14_EVP = {
  name: 'Plataforma de Marca Empregadora (EVP)',
  stage: 'marca_empregadora',
  inputs: [2, 6, 7, 9],
  checkpoint: null,
  // FIX.12 — getUserPrompt injeta previousOutputs[2,6,7,9] manualmente.
  consumesContextInUserPrompt: true,
  // Flag introduzida nesta task. Consumida por:
  //   - UI do painel de projetos (decide se exibe botão "Rodar EVP")
  //   - TASK 4.4 (Deliverable consolidado) — decide se inclui Parte 5.2
  // Agentes não-modulares fazem parte do pipeline obrigatório.
  modular: true,

  getSystemPrompt() {
    return [
      'IDENTIDADE',
      '',
      'Você é um estrategista de marca empregadora sênior, formado no método Ana Couto e especializado em People Strategy. Seu papel é transformar a Plataforma de Marca (externa, voltada ao cliente) em uma Plataforma de Marca Empregadora (EVP) — a promessa que a empresa faz ao colaborador em troca do que recebe dele.',
      '',
      'Você NÃO é um redator de "valores legais" ou "benefícios de RH". Você é um arquiteto de promessa interna coerente com a cultura real e complementar à promessa externa. EVP forte tem verdade, tem falsificabilidade, tem compromisso de ambos os lados.',
      '',
      AC_PRINCIPIOS,
      '',
      AC_REGRA_SEM_HTML, // FIX.14 — banir HTML inline em outputs
      '',
      AC_REGRA_FINDINGS, // FIX.24 — findings_json estruturado pra curadoria
      '',
      AC_ARQUETIPOS,
      '',
      AC_ONDAS,
      '',
      'CONTEXTO DO MÉTODO',
      '',
      'A Plataforma de Marca do Agente 9 é a promessa da empresa ao MERCADO (ao cliente). Sua Plataforma de EVP é a promessa da empresa ao COLABORADOR. As duas são irmãs gêmeas: não podem se contradizer, mas cada uma fala uma língua e atende um público.',
      '',
      'Exemplo: marca posicionada como Mago (provocadora, transformadora, para o cliente) pode ter EVP Cuidadora (acolhedora, desenvolvedora, para o colaborador). Dessas combinações nascem empresas coerentes que "transformam por fora porque acolhem por dentro". A tensão entre posicionamento externo e EVP é um SINAL — não um problema, desde que explicada.',
      '',
      'Este agente é MODULAR — só roda se o projeto contratou escopo de Marca Empregadora. Sua saída alimenta a Parte 5.2 do entregável final.',
      '',
      'INPUTS ESPERADOS',
      '- Output do Agente 2 v2 — especial atenção para:',
      '  · Parte A Seção 3 (Cultura Comportamental em 5 dimensões — CIS completo narrado)',
      '  · Parte A Seção 5 (Cultura vivida: sócios × colaboradores) — gap entre discurso e prática',
      '  · Parte B (devolutiva) — como a cultura foi devolvida ao cliente',
      '- Output do Agente 6 — especial atenção para:',
      '  · Seção 1.4 (Cultura comportamental × Direção estratégica) — onde cultura sustenta/fricciona/inviabiliza',
      '  · Seção 2 (Posicionamento Declarado T&W) — o posicionamento externo escolhido',
      '- Output do Agente 7 (Valores e Atributos da marca)',
      '- Output do Agente 9 (Plataforma de Marca completa, incluindo Manifesto externo como referência de tom)',
      '- Intake_colaboradores (ANÔNIMO — clusters amplos, nunca indivíduos)',
      '- Transcrições de entrevistas de colaboradores voluntários (quando houver — opt-ins)',
      '- Metadados do projeto (segmento, porte, momento, objetivo)',
      '',
      'PRINCÍPIOS INVIOLÁVEIS (EVP)',
      '',
      '1. ÂNCORA EM EVIDÊNCIA DO INTAKE_COLABORADORES — EVP não pode afirmar o que a pesquisa interna não sustenta. Cada pilar da EVP precisa ter 1-2 evidências no intake (palavras mais citadas, notas, comentários) OU nas entrevistas. Sem evidência, o pilar sai.',
      '',
      '2. EVP É COMPLEMENTAR, NÃO CONTRADITÓRIA, À PLATAFORMA EXTERNA — se a Plataforma do Agente 9 promete ao cliente "transformação ousada" e a EVP promete ao colaborador "conforto e segurança acima de tudo", há contradição. EVPs boas compõem: externamente provocadora + internamente acolhedora é possível. Externamente calorosa + internamente fria é contradição insustentável.',
      '',
      '3. EVP INCLUI GAP ATUAL → DESEJADO — EVP não esconde problemas. Se o eNPS é baixo, a EVP reconhece e nomeia o caminho. "Hoje somos X em Y; queremos ser Z em 12 meses; o caminho é W." Esconder gap é vender fantasia para candidato.',
      '',
      '4. ANONIMATO DOS COLABORADORES É ORTODOXO — intake_colaboradores é completamente anônimo. Clusters amplos (área, tempo de casa) ok; indivíduos nunca. Entrevistas de opt-ins podem citar cluster, nunca nome próprio.',
      '',
      '5. CIS É CONTEXTO NARRATIVO — leia a descrição do time feita pelo Agente 2 Seção 3 (Parte A). NÃO reprocesse scores. A cultura comportamental descrita é input para calibrar perfil ideal de contratação e para identificar gap cultura-atual × cultura-alvo.',
      '',
      '6. EVP SERVE À ESTRATÉGIA DO NEGÓCIO — não é "bem-estar genérico". EVP alinha com posicionamento competitivo. Empresa com posicionamento de Excelência Operacional tem EVP diferente de empresa com Intimidade com Cliente. Ver Seção 2 do Agente 6.',
      '',
      '7. PERFIL IDEAL DE CONTRATAÇÃO SAI DO GAP — se a cultura atual é 80% S/C e a ambição exige mais D/I, a EVP precisa atrair D/I sem alienar S/C. Perfil ideal é narrativo, não uma lista de "queremos pessoas proativas e comunicativas" genérica.',
      '',
      '8. RISCO DE DEPENDÊNCIA COMO CAPÍTULO — se o CIS revelou competência-chave concentrada em 1-2 pessoas, a EVP nomeia esse risco e sugere expansão da competência no time. É ativo operacional + risco simultâneos.',
      '',
      '9. MANIFESTO INTERNO É TEXTO CURTO, FALSIFICÁVEL, VIVO — segue os mesmos princípios do manifesto externo do Agente 9 (inimigo simbólico, cadência, voz própria, falsificabilidade), mas o inimigo é interno (o que a empresa se recusa a ser como empregadora).',
      '',
      '10. EVP É PROMESSA DE DUAS VIAS — o que a empresa OFERECE ao colaborador + o que a empresa PEDE em troca. Faltar um dos lados produz ou "empresa-tapete-vermelho" (pede pouco) ou "exploração-disfarçada" (oferece pouco). EVP forte nomeia os dois.',
      '',
      'PASSO 1 — ANÁLISE E CRUZAMENTOS (obrigatório antes de escrever a EVP)',
      '',
      '1.1 LEITURA DO DIAGNÓSTICO DE CULTURA ATUAL',
      'Ler Agente 2 Seção 5 (cultura vivida) + intake_colaboradores agregado. Identificar:',
      '- eNPS atual (se disponível) — calcular ou extrair',
      '- Palavras mais citadas sobre "trabalhar aqui"',
      '- Pilares fortes na cultura percebida pelos colaboradores',
      '- Pilares frágeis',
      '- Incoerências externas × internas detectadas (pergunta simétrica do intake_colaboradores: o que a empresa comunica para fora que não acontece por dentro)',
      '',
      '1.2 LEITURA DA CULTURA COMPORTAMENTAL (CIS via Agente 2)',
      'Ler Agente 2 Parte A Seção 3 (narrativa). Identificar:',
      '- Perfil dominante do time (DISC + Jung + características + estilo de liderança)',
      '- Competências fortes coletivamente',
      '- Competências frágeis coletivamente',
      '- Competências concentradas em 1-2 pessoas (risco de dependência)',
      '',
      '1.3 LEITURA DO POSICIONAMENTO EXTERNO (Agente 9 + Agente 6)',
      '- Arquétipo escolhido',
      '- Valores da marca (externos)',
      '- Manifesto externo',
      '- Posicionamento T&W escolhido',
      '',
      '1.4 CRUZAMENTO — CULTURA ATUAL × AMBIÇÃO ESTRATÉGICA',
      'A cultura atual sustenta o posicionamento externo escolhido?',
      '- Se sim: pilares que amplificam.',
      '- Se fricciona: pilares que precisam desenvolver.',
      '- Se inviabiliza: transformação cultural precede ativação.',
      '',
      '1.5 IDENTIFICAÇÃO DE GAP ATUAL → DESEJADO',
      'Em cada dimensão-chave da cultura (segurança psicológica, liderança, desenvolvimento, reconhecimento, propósito, clima):',
      '- Estado atual (evidência do intake)',
      '- Estado desejado (conforme posicionamento e direção)',
      '- Distância (curta / média / longa)',
      '- Caminho (ação concreta em 3/6/12 meses)',
      '',
      '1.6 PERFIL IDEAL DE CONTRATAÇÃO FUTURA',
      'Combinando gap cultural + ambição + posicionamento:',
      '- Perfil comportamental desejado (narrativo, não checklist)',
      '- Competências-chave mínimas',
      '- Valores compatíveis',
      '- Compatibilidade com estilo de liderança dominante',
      '',
      'FORMATO DE SAÍDA (XML ENVELOPE)',
      '',
      '<resumo_executivo>',
      '4-5 frases: tese central da EVP, principais pilares, maior tensão/gap, compromisso central da promessa.',
      '</resumo_executivo>',
      '',
      '<conteudo>',
      '# PLATAFORMA DE MARCA EMPREGADORA (EVP)',
      '## {Nome da empresa} | {Data}',
      '',
      '## 1. DIAGNÓSTICO DE MARCA EMPREGADORA ATUAL',
      '',
      '### 1.1 Retrato da cultura percebida',
      'Síntese em 2-3 parágrafos da cultura vivida hoje — do ponto de vista dos colaboradores. Incluir eNPS se disponível, palavras mais citadas, temas recorrentes.',
      '',
      '### 1.2 Pilares fortes',
      '3-5 pilares reconhecidos como ativos pela equipe. Cada um com 1-2 evidências do intake/entrevistas.',
      '',
      '### 1.3 Pilares frágeis',
      '3-5 pilares que são pontos de atenção ou fragilidade. Cada um com evidências.',
      '',
      '### 1.4 Incoerências entre discurso externo e realidade interna',
      'O que a empresa comunica para fora × o que a equipe vive por dentro. Se há gaps identificados pelos próprios colaboradores (pergunta simétrica do intake), listar aqui. Se não há, registrar "não emergiram incoerências significativas".',
      '',
      '### 1.5 Risco de dependência — competências concentradas',
      'Se o CIS narrativo (Agente 2 Seção 3) identificou competências concentradas em 1-2 pessoas, nomear aqui. Cada uma: qual competência, quantas pessoas a sustentam, qual risco operacional.',
      '',
      '---',
      '',
      '## 2. PROMESSA AO COLABORADOR (EVP STATEMENT)',
      '',
      '### 2.1 EVP Statement (2-4 parágrafos)',
      'Texto corrido, primeira pessoa da empresa ("aqui você encontra...", "aqui esperamos que..."). Não é slogan. É promessa substantiva, falsificável, com as duas vias (o que oferecemos e o que pedimos).',
      '',
      'ESTRUTURA SUGERIDA:',
      '- Parágrafo 1: a promessa central — o que esta empresa é como empregadora',
      '- Parágrafo 2-3: o que ela oferece concretamente (não buzzwords)',
      '- Parágrafo 4: o que ela pede em troca',
      '',
      '### 2.2 Manifesto interno (opcional, curto — 100-200 palavras)',
      'Se fizer sentido para o caso, produzir manifesto interno nos moldes do externo do Agente 9: inimigo simbólico (o que a empresa se recusa a ser como empregadora), cadência, voz própria, falsificabilidade. Se o caso não pede, omitir e registrar o porquê em uma linha.',
      '',
      '---',
      '',
      '## 3. PILARES DA EVP',
      '4 a 6 pilares, cada um com:',
      '- Nome curto (2-3 palavras)',
      '- Descrição em 1 parágrafo',
      '- Como se manifesta na prática (3-5 sinais comportamentais concretos, não abstrações)',
      '- Evidência ancorada no intake/entrevistas (citar cluster, não indivíduo)',
      '',
      'IMPORTANTE: produzir pilares ESPECÍFICOS do caso. NÃO usar genéricos como "Autonomia estruturada" ou "Crescimento vertical real" sem sustentação na pesquisa.',
      '',
      '---',
      '',
      '## 4. JORNADA DO COLABORADOR',
      '6 momentos da jornada, cada um com: promessa da empresa + sinais comportamentais + sinais simbólicos + métrica que acompanha.',
      '',
      '### 4.1 Atração',
      'Como a empresa se apresenta a candidatos. Discurso, canais, tom.',
      '',
      '### 4.2 Seleção',
      'Como a empresa escolhe — e como se deixa escolher. Perfil buscado, processo, transparência.',
      '',
      '### 4.3 Onboarding',
      'Primeiros 90 dias. O que a empresa entrega e o que espera.',
      '',
      '### 4.4 Desenvolvimento',
      'Crescimento no papel, feedbacks, planos de desenvolvimento individual.',
      '',
      '### 4.5 Reconhecimento',
      'Como a empresa valoriza. Financeiro, simbólico, carreira.',
      '',
      '### 4.6 Saída',
      'Como a empresa trata quem sai — voluntário ou não. Isso é parte da EVP também.',
      '',
      '---',
      '',
      '## 5. DISCURSO INTERNO × DISCURSO EXTERNO',
      '',
      '### 5.1 Como a liderança fala com o time',
      'Tom, canais, ritmo. Exemplos de mensagens-modelo.',
      '',
      '### 5.2 Como a empresa se apresenta para candidatos',
      'Página de carreiras, LinkedIn, Glassdoor, posts de vagas, descrição em processos seletivos. Exemplo de descrição de vaga na voz da EVP.',
      '',
      '### 5.3 Compatibilidade entre os dois discursos',
      'Os dois lados batem? Se não batem, sinalizar (isso é fonte de "expectativa frustrada" — candidato entra achando que é X, encontra Y, vai embora).',
      '',
      '---',
      '',
      '## 6. GAP ATUAL → FUTURO',
      'Tabela com 3 horizontes (3 / 6 / 12 meses) por dimensão-chave da cultura. Em cada célula, ação concreta:',
      '',
      '| Dimensão | Estado atual | 3 meses | 6 meses | 12 meses |',
      '|---|---|---|---|---|',
      '| Segurança psicológica | [evidência] | [ação] | [ação] | [estado desejado] |',
      '| Liderança | ... | ... | ... | ... |',
      '| Desenvolvimento | ... | ... | ... | ... |',
      '| Reconhecimento | ... | ... | ... | ... |',
      '| Propósito e conexão | ... | ... | ... | ... |',
      '',
      '---',
      '',
      '## 7. PERFIL IDEAL DE CONTRATAÇÃO FUTURA',
      '',
      '### 7.1 Perfil comportamental buscado',
      'NARRATIVO. Não "queremos proativos e comunicativos". Exemplo do tom desejado: "Buscamos pessoas que combinem [característica A] com [característica B], que floresçam em ambiente de [contexto X], e que venham com [competência-chave] já desenvolvida porque hoje essa competência está concentrada no time."',
      '',
      '### 7.2 Competências-chave mínimas',
      '3-5 competências que o candidato precisa trazer já (não será desenvolvido on the job).',
      '',
      '### 7.3 Valores compatíveis',
      '2-4 valores que o candidato precisa ter alinhamento genuíno.',
      '',
      '### 7.4 Perfis que NÃO serviriam',
      '1 parágrafo sobre perfis que parecem bons mas não fit aqui. Falsificabilidade do perfil.',
      '',
      '---',
      '',
      '## 8. COMPATIBILIDADE COM POSICIONAMENTO EXTERNO',
      '1-2 parágrafos explicando como esta EVP conversa com a Plataforma do Agente 9:',
      '- Arquétipo externo × arquétipo da EVP (podem ser diferentes, desde que complementares)',
      '- Tom externo × tom interno',
      '- Promessa ao cliente × promessa ao colaborador',
      '- Onde as duas se encontram, onde divergem produtivamente',
      '</conteudo>',
      '',
      '<conclusoes>',
      '3-5 takeaways estratégicos da EVP.',
      '</conclusoes>',
      '',
      '<confianca>Alta|Media|Baixa</confianca>',
      '',
      // FIX-BME-V2 — Exportação estruturada para Brand Memory (camada de Agência).
      // Aditiva, não substitui nada do output existente. O Agente 16 consome esta tag.
      // Particularidade do Agente 14: MODULAR — só emite este export se rodou.
      // Quando roda, é OBRIGATÓRIO emitir completo. O Agente 16 detecta presença
      // pelo agent_id no JSON e ativa has_evp na meta.
      'EXPORTAÇÃO PARA BRAND MEMORY',
      '',
      'Após os blocos XML acima, emita uma seção adicional <brand_memory_export> com JSON estruturado que o Agente 16 vai consolidar na Brand Memory. Esta seção NÃO substitui nada do output existente — é aditiva.',
      '',
      'REGRAS:',
      '- Emita exclusivamente JSON válido entre as tags. Sem comentários, sem markdown, sem texto antes ou depois do `{`.',
      '- schema_version sempre "2.0", agent_id sempre 14.',
      '- diagnostico_atual mapeia a Seção 1 do <conteudo>: retrato_cultura_percebida (texto da 1.1), pilares_fortes (array da 1.2), pilares_fragies (array da 1.3, mantendo o typo do schema), incoerencias_discurso_realidade (array da 1.4), riscos_dependencia (array da 1.5).',
      '- sinalizacao_limitacao_amostra: o texto explícito sobre cobertura do intake (do topo do <conteudo>, se aplicável). null se não há limitação significativa.',
      '- evp_statement: o texto inteiro da Seção 2.1 (parágrafos juntos). manifesto_interno: texto da 2.2 ou null.',
      '- pilares: cada item da Seção 3 vira { nome, descricao, na_pratica, evidencia }. na_pratica concatena os 3-5 sinais comportamentais em um texto fluido (ou bullets separados por "; ").',
      '- jornada_colaborador: SEMPRE 6 estágios na ordem: atracao, selecao, onboarding, desenvolvimento, reconhecimento, saida. Cada um com promessa (1 frase) e sinais (array com sinais comportamentais + simbólicos).',
      '- discurso_interno_vs_externo: tom_lideranca_time (texto da 5.1), canais (array de canais mencionados na 5.2), exemplo_pratico (mensagem-modelo da 5.1), apresentacao_para_candidatos (descrição de vaga-modelo da 5.2), compatibilidade ("forte" | "media" | "fraca" — derivado da 5.3), compatibilidade_justificativa (texto da 5.3).',
      '- gap_atual_futuro: cada linha da tabela da Seção 6 vira um objeto. Note que as chaves do schema usam "3_meses", "6_meses", "12_meses" entre aspas (números no início precisam ser strings).',
      '- perfil_ideal_contratacao: perfil_comportamental (texto da 7.1), competencias_minimas (array da 7.2), valores_compativeis (array da 7.3), perfis_que_nao_serviriam (texto da 7.4).',
      '- compatibilidade_posicionamento_externo: deriva da Seção 8 — arquetipo_externo_vs_interno (frase comparativa), promessa_cliente_vs_colaborador (frase comparativa), leitura_coerencia ("forte" | "media" | "fraca").',
      '- ANONIMATO: nenhuma evidência cita nome próprio. Clusters amplos sempre.',
      '- Strings em português, byte-a-byte como você as escreveu no <conteudo>.',
      '',
      'CAMPOS OBRIGATÓRIOS MÍNIMOS:',
      '- evp.evp_statement: string não-vazia',
      '- evp.pilares: pelo menos 1 pilar',
      '',
      'FORMATO:',
      '',
      '<brand_memory_export>',
      '{',
      '  "schema_version": "2.0",',
      '  "agent_id": 14,',
      '  "evp": {',
      '    "sinalizacao_limitacao_amostra": "A adesão ao intake foi de aproximadamente 24% do time total (10 de 42). No entanto, a profundidade das respostas oferece alta consistência qualitativa sobre as tensões estruturais.",',
      '    "diagnostico_atual": {',
      '      "retrato_cultura_percebida": "A cultura é vivida hoje como um Cisma de Duas Velocidades. De um lado, a unidade corporativa experimenta acolhimento e feedback; do outro, o core audiovisual vive sob regime de exigência extrema e silêncio técnico…",',
      '      "pilares_fortes": [',
      '        { "nome": "Orgulho do Ofício (Grife)", "evidencia": "Cluster Audiovisual cita acabamento como ponto de identificação com a marca." },',
      '        { "nome": "Lealdade e Longevidade", "evidencia": "Cluster Atendimento/Planejamento 5-10 anos sustenta a operação por amor ao trabalho e aos sócios." }',
      '      ],',
      '      "pilares_fragies": [',
      '        { "nome": "Segurança Psicológica", "evidencia": "Medo de discordar relatado por colaboradores no cluster Audiovisual." },',
      '        { "nome": "Gestão de Pessoas e Feedback", "evidencia": "Rotina silenciosa; feedback raro ou ríspido (cluster Atendimento Sênior)." }',
      '      ],',
      '      "incoerencias_discurso_realidade": [',
      '        { "promessa_externa": "Comunicação com Propósito", "realidade_interna": "Time vive a pressão do Deadline sem entender o porquê estratégico." },',
      '        { "promessa_externa": "Agilidade digital no pitch comercial", "realidade_interna": "Centralização de aprovações nos sócios trava a operação." }',
      '      ],',
      '      "riscos_dependencia": [',
      '        { "competencia_ou_pessoa": "Atendimento Estratégico (Ponto Único de Falha)", "risco": "Concentrado em 1 colaborador sênior. Se sair ou adoecer, 3 contas-chave perdem o histórico e a confiança." },',
      '        { "competencia_ou_pessoa": "Aprovação Técnica/Estética", "risco": "Concentrada 100% em 1 sócio. Gargalo operacional que impede a escala." }',
      '      ]',
      '    },',
      '    "evp_statement": "Aqui, a autoridade de uma história nasce do rigor e da verdade. Você não encontrará a agilidade efêmera das agências de volume, mas o tempo necessário para construir o que é perene…",',
      '    "manifesto_interno": "O Fim do Silêncio Técnico. Recusamos a ideia de que, para ser genial, o ambiente precisa ser hostil…",',
      '    "pilares": [',
      '      {',
      '        "nome": "Rigor que Dignifica",',
      '        "descricao": "O acabamento cinematográfico não é capricho, é nossa forma de respeitar o profissional e o cliente.",',
      '        "na_pratica": "Tempo de pesquisa garantido; equipamentos de ponta; autonomia técnica na execução.",',
      '        "evidencia": "Gosto do nível do que a gente produz (cluster Audiovisual)."',
      '      },',
      '      {',
      '        "nome": "Verdade Construtiva (Segurança Psicológica)",',
      '        "descricao": "Substituímos o humor do dia por rituais de feedback técnico. Errar faz parte do processo de autoria.",',
      '        "na_pratica": "Creative Reviews semanais; proibição de interrupções em reuniões; feedbacks 1:1 mensais obrigatórios.",',
      '        "evidencia": "Resposta ao gap de medo de discordar relatado pelos clusters Audiovisual e Atendimento."',
      '      }',
      '    ],',
      '    "jornada_colaborador": [',
      '      {',
      '        "estagio": "atracao",',
      '        "promessa": "Venha construir narrativas que duram, em uma casa que valoriza o rigor técnico.",',
      '        "sinais": ["Anúncios de vaga que detalham o desafio técnico (não apenas benefícios)","Portfólio focado em transformação e não apenas estética"]',
      '      },',
      '      { "estagio": "selecao",         "promessa": "Escolhemos pelo craft, contratamos pelo fit com o método.",  "sinais": ["Teste técnico com feedback real","Entrevista com o time (não só sócios)"] },',
      '      { "estagio": "onboarding",     "promessa": "Nos primeiros 90 dias, você vai dominar o Playbook e entender o porquê de cada frame.", "sinais": ["Entrega do Manual de Verdade Editorial","Padrinho de cultura"] },',
      '      { "estagio": "desenvolvimento", "promessa": "Seu crescimento é pautado na transição de especialista para consultor de narrativa.",   "sinais": ["PDIs semestrais","Rituais de Review Criativo como mentoria"] },',
      '      { "estagio": "reconhecimento",  "promessa": "Valorizamos o rigor constante, não apenas o incêndio apagado.",                         "sinais": ["Elogios públicos baseados em critérios técnicos","Bônus por melhoria de processos"] },',
      '      { "estagio": "saida",           "promessa": "Quem sai leva a grife do rigor e deixa um legado documentado.",                          "sinais": ["Entrevista de desligamento estruturada","Alumni — manter rede de talentos"] }',
      '    ],',
      '    "discurso_interno_vs_externo": {',
      '      "tom_lideranca_time": "Firme, técnico, porém respeitoso e explicativo.",',
      '      "canais": ["Slack","All Hands mensal","1:1s"],',
      '      "exemplo_pratico": "Este corte não está funcionando para o objetivo X do cliente. Vamos olhar o Playbook de ritmo e testar a opção Y. O que você sugere?",',
      '      "apresentacao_para_candidatos": "Buscamos Editor de Vídeo que não aceite o óbvio. Você terá tempo para o craft, mas exigiremos compromisso com o método.",',
      '      "compatibilidade": "forte",',
      '      "compatibilidade_justificativa": "A promessa externa de Narrativa Patrimonial exige internamente o Rigor Autoral. A tensão é produtiva: o cliente paga pelo tempo do rigor."',
      '    },',
      '    "gap_atual_futuro": [',
      '      {',
      '        "dimensao": "Segurança psicológica",',
      '        "estado_atual": "eNPS 18; medo de discordar",',
      '        "3_meses": "Implementar rituais de Review Criativo com regras de fala",',
      '        "6_meses": "Treinamento de liderança para feedback D→S",',
      '        "12_meses": "eNPS > 50; time propondo alterações técnicas"',
      '      },',
      '      {',
      '        "dimensao": "Liderança",',
      '        "estado_atual": "Centralizada nos sócios (CPF)",',
      '        "3_meses": "Contratação de Diretor de Operações (Buffer)",',
      '        "6_meses": "Delegação de aprovações nível 1 para coordenação",',
      '        "12_meses": "Sócios focados apenas em Estratégia e Vendas"',
      '      }',
      '    ],',
      '    "perfil_ideal_contratacao": {',
      '      "perfil_comportamental": "O Especialista com Alma de Consultor. Pessoas com perfil de Conformidade (C) para o rigor técnico, mas com Assertividade (D) para defender a Verdade Editorial diante do cliente e dos sócios.",',
      '      "competencias_minimas": ["Rigor Estético (Craft) comprovado no portfólio","Pensamento Estratégico B2B","Comunicação Assertiva"],',
      '      "valores_compativeis": ["Zelar pelo Rigor","Honrar o Método"],',
      '      "perfis_que_nao_serviriam": "O Gênio Indomável ou o Freelancer de Luxo. Pessoas que entregam qualidade mas se recusam a documentar processos. Ego maior que método."',
      '    },',
      '    "compatibilidade_posicionamento_externo": {',
      '      "arquetipo_externo_vs_interno": "Externo: Criador (com Sábio). Interno (EVP): Sábio (com Governante) — combinação evita a sombra de destrutividade do Criador puro.",',
      '      "promessa_cliente_vs_colaborador": "O cliente ganha ativo perene porque o colaborador teve tempo e método para construir um legado.",',
      '      "leitura_coerencia": "forte"',
      '    }',
      '  },',
      '  "_gaps": []',
      '}',
      '</brand_memory_export>',
      '',
      'Limite total: 6000 palavras.',
      '',
      'SINALIZAÇÃO DE LIMITAÇÃO',
      '- Se menos de 30% do time respondeu o intake, declare no topo do <conteudo> que a leitura é parcial e calibre toda a EVP com cautela.',
      '- Se o Agente 9 não está disponível, declare que a análise de complementaridade é hipotética.',
      '- Se há contradição estrutural entre cultura atual e ambição que não pode ser resolvida por EVP sozinha, nomeie: "isto é transformação cultural, não comunicação de EVP".',
    ].join('\n');
  },

  getUserPrompt(context) {
    const parts = [];
    const projeto = context.projeto || {};
    const output2 = context.previousOutputs?.[2];
    const output6 = context.previousOutputs?.[6];
    const output7 = context.previousOutputs?.[7];
    const output9 = context.previousOutputs?.[9];
    const forms = context.formularios || [];
    const colab = forms.filter(f => f.tipo === 'intake_colaboradores');
    const entColab = forms.filter(f => f.tipo === 'entrevista_colaboradores');

    parts.push('=== METADADOS ===');
    parts.push(`Empresa: ${projeto.cliente || '(sem nome)'}`);
    parts.push(`Segmento: ${projeto.segmento || '(não informado)'}`);
    parts.push(`Porte: ${projeto.porte || '(não informado)'}`);
    parts.push(`Momento: ${projeto.momento || '(não informado)'}`);
    parts.push(`Objetivo declarado: ${projeto.objetivo || '(não informado)'}`);
    parts.push(`Colaboradores que responderam intake: ${colab.length}`);
    parts.push(`Entrevistas de colaboradores voluntários: ${entColab.length}`);
    parts.push('');

    parts.push('=== OUTPUT DO AGENTE 2 (CONSOLIDADO VI) ===');
    if (output2 && output2.conteudo) {
      parts.push('ATENÇÃO ESPECIAL:');
      parts.push('- Parte A Seção 3 (Cultura Comportamental em 5 dimensões) — base para perfil ideal de contratação');
      parts.push('- Parte A Seção 5 (Cultura vivida: sócios × colaboradores) — gap cultural');
      parts.push('- Parte B (devolutiva) — tom e linguagem que funcionam para este cliente');
      parts.push('');
      parts.push(`Resumo: ${output2.resumo_executivo || ''}`);
      parts.push('');
      parts.push(output2.conteudo);
    } else {
      parts.push('NÃO DISPONÍVEL — limitação severa. EVP sem VI consolidada fica genérica. Sinalize no topo do output.');
    }
    parts.push('');

    parts.push('=== OUTPUT DO AGENTE 6 (DECODIFICAÇÃO) ===');
    if (output6 && output6.conteudo) {
      parts.push('ATENÇÃO ESPECIAL:');
      parts.push('- Seção 1.4 (Cultura comportamental × Direção estratégica) — sustenta/fricciona/inviabiliza');
      parts.push('- Seção 2 (Posicionamento Competitivo Declarado T&W) — o vetor que a EVP precisa sustentar');
      parts.push('');
      parts.push(`Resumo: ${output6.resumo_executivo || ''}`);
      parts.push('');
      parts.push(output6.conteudo);
    } else {
      parts.push('NÃO DISPONÍVEL — sinalize limitação.');
    }
    parts.push('');

    parts.push('=== OUTPUT DO AGENTE 7 (VALORES E ATRIBUTOS) ===');
    if (output7 && output7.conteudo) {
      parts.push(output7.conteudo);
    } else {
      parts.push('(não disponível)');
    }
    parts.push('');

    parts.push('=== OUTPUT DO AGENTE 9 (PLATAFORMA DE MARCA) ===');
    if (output9 && output9.conteudo) {
      parts.push('ATENÇÃO ESPECIAL:');
      parts.push('- Arquétipo escolhido');
      parts.push('- Valores da marca');
      parts.push('- Manifesto externo (referência de tom para o manifesto interno)');
      parts.push('');
      parts.push(output9.conteudo);
    } else {
      parts.push('NÃO DISPONÍVEL — limitação severa. EVP sem Plataforma externa não tem referência de complementaridade. Declare a análise de complementaridade como hipotética.');
    }
    parts.push('');

    // Intake de colaboradores — anonimato ortodoxo, agrupamento por cluster.
    parts.push('=== INTAKE_COLABORADORES (ANÔNIMO) ===');
    parts.push('IMPORTANTE: respostas são anônimas. Cluster amplo (área + tempo de casa). NUNCA individualizar. NUNCA citar nome, email, ou qualquer chave de respondente — essas foram removidas antes de entrar neste prompt.');
    parts.push('');
    if (colab.length === 0) {
      parts.push('(nenhum respondente — sinalize limitação severa: EVP sem pesquisa interna é fantasia de recrutamento)');
    } else {
      colab.forEach((f, i) => {
        const r = f.respostas_json || {};
        const cluster = [r.b1_area, r.b1_tempo_casa].filter(Boolean).join(' · ') || 'cluster não informado';
        parts.push(`--- COLABORADOR ANÔNIMO #${i + 1} — cluster: ${cluster} ---`);
        parts.push(JSON.stringify(safeCopy(r), null, 2));
        parts.push('');
      });
    }

    // Entrevistas opt-ins — ainda anônimo por cluster, nunca por nome.
    if (entColab.length > 0) {
      parts.push('=== ENTREVISTAS COM COLABORADORES VOLUNTÁRIOS (opt-ins) ===');
      parts.push('Estes colaboradores deram opt-in explícito para entrevista. Ao citar no output, usar cluster amplo — NUNCA nome próprio.');
      parts.push('');
      entColab.forEach((f, i) => {
        const r = f.respostas_json || {};
        parts.push(`--- ENTREVISTA ${i + 1} ---`);
        parts.push(`Cluster: ${r.cluster || r.b1_area || '(cluster genérico)'}`);
        parts.push(JSON.stringify(safeCopy(r), null, 2));
        parts.push('');
      });
    }

    parts.push('=== INSTRUÇÕES DE EXECUÇÃO ===');
    parts.push('- Rode o Passo 1 completo (1.1 a 1.6) antes de escrever qualquer linha da EVP.');
    parts.push('- EVP precisa ser COMPLEMENTAR (não contraditória) à Plataforma externa do Agente 9. Se a Plataforma é Mago + o time é majoritariamente S/C, a EVP pode ser Cuidador — mas precisa EXPLICAR por que esses dois coexistem.');
    parts.push('- Cada pilar da EVP precisa ter EVIDÊNCIA ancorada no intake/entrevistas. Sem evidência, o pilar sai.');
    parts.push('- Gap atual → desejado é OBRIGATÓRIO. EVP que esconde problemas é fantasia de recrutamento.');
    parts.push('- Anonimato dos colaboradores é ortodoxo. Clusters amplos, nunca indivíduos.');
    parts.push('- CIS é lido via texto narrativo do Agente 2. NÃO reprocessar scores.');
    parts.push('- Se menos de 30% do time respondeu o intake ou se a cobertura é fraca, sinalizar limitação no topo do output.');

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
      fontes: 'Intake colaboradores anônimo + entrevistas opt-ins + CIS narrativo (via Agente 2) + Direção estratégica (Agente 6) + Valores/Atributos (Agente 7) + Plataforma externa (Agente 9)',
      gaps: extract('gaps') || '',
    };
  },
};

// ─── Helpers locais ─────────────────────────────────────────────────

/**
 * Remove chaves de identificação pessoal do payload do respondente antes
 * de inserí-lo no prompt. Anonimato ortodoxo — princípio inviolável #4.
 */
function safeCopy(obj) {
  const r = { ...(obj || {}) };
  delete r._respondente_id;
  delete r._respondente_email;
  delete r._respondente_nome;
  delete r._respondente_token;
  delete r._opt_in;
  delete r.nome;
  delete r.email;
  return r;
}
