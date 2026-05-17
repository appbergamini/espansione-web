// Script one-shot — popula os campos novos do FIX.30 (Parte 2 híbrida +
// Mapa Lean 5.7) nos 2 sócios do GSIM Brasil. Faz UPDATE merge com
// jsonb concat (||), preservando todas as respostas já existentes.
//
// Uso:
//   set -a && source <(grep -E "^SUPABASE_ACCESS_TOKEN=" .env.local) && set +a
//   node scripts/popula_lean_gsim.js

const PROJETO_ID = '350b05c4-a6de-49e1-915d-41498c505988';

const RAFAEL = {
  // Parte 2 híbrida
  p2_motivos_ganho_opcoes: ['Qualidade técnica', 'Relacionamento com sócios/equipe', 'Capacidade de resolver problema complexo'],
  p2_motivos_perda_opcoes: ['Concorrente direto mais barato', 'Freelancer / profissional independente', 'Empresa mais digital / moderna'],
  p2_objecoes_opcoes: ['Preço', 'Prazo', 'Comparação com concorrentes', 'Cliente acha que consegue fazer internamente', 'Preferência por fornecedor conhecido'],
  p2_concorrentes_tipos: ['Concorrente direto da mesma categoria', 'Freelancer ou profissional independente', 'Time interno do cliente (in-house)'],

  // Parte 5.7 — Mapa Lean
  p7_clientes_atuais_tipos: 'Diretores de marketing e comunicação de empresas B2B médias-grandes (faturamento R$ 500M+) com budget anual de comunicação acima de R$ 1,5M, em setores patrimoniais (indústria tradicional, farma, energia, serviços profissionais). Decisor único em ~70% dos casos.',
  p7_clientes_desejados: [
    'C-Levels e diretores de comunicação de empresas patrimoniais B2B em transição estratégica (IPO, sucessão, reposicionamento)',
    'Heads de marca de gestoras de patrimônio e family offices que precisam de discurso editorial sofisticado',
    'VPs de RH/Pessoas de empresas em movimento de marca empregadora premium',
  ],
  p7_clientes_evitar: [
    'Empresas que tratam comunicação como custo e exigem volume sobre qualidade (ex.: 40 vídeos/mês para redes sociais)',
    'Clientes que escolhem por menor preço ou pulam consultoria estratégica direto pra execução',
    'Marcas de consumo digital-first que precisam de cadência rápida e formato influencer-style',
  ],
  p7_decisores: ['Diretor de marketing / comunicação', 'CEO / presidente', 'Diretor de RH', 'Dono / sócio'],
  p7_influenciadores: 'Equipe interna de comunicação do cliente avalia fit cultural e capacidade técnica antes do diretor decidir. CFO/diretor financeiro libera budget. Em B2B grandes, o conselho/holding influencia em projetos estruturantes (sucessão, reposicionamento).',
  p7_momento_busca: ['Quando recebeu indicação', 'Quando passa por mudança estratégica', 'Quando quer melhorar imagem / reputação', 'Quando precisa profissionalizar algo'],
  p7_perda_para_quem: ['Empresa mais conhecida', 'Empresa mais barata', 'Empresa mais digital / moderna', 'Cliente adiou decisão'],
  p7_objecoes_pre_compra: ['Preço', 'Prazo', 'Comparação com concorrentes', 'Falta de clareza sobre o que será entregue', 'Preferência por fornecedor conhecido'],
  p7_objecoes_pre_compra_exemplo: '"Adorei a proposta de vocês, mas o orçamento veio mais alto do que da agência X. Vocês conseguem alinhar o preço mantendo o escopo?"',
  p7_provas_confianca: ['Cases', 'Portfólio', 'Reputação dos sócios', 'Indicação de cliente conhecido', 'Tempo de mercado', 'Conteúdo técnico', 'Visita / reunião presencial', 'Proposta bem estruturada'],
  p7_provas_existentes: 'Portfólio audiovisual sólido (16 anos), reputação dos sócios em redes profissionais e na indústria, 6-7 cases relevantes que viram referência setorial. Reuniões presenciais com sócio ainda fecham contas grandes — modelo de relacionamento direto.',
  p7_provas_faltantes: 'Não temos depoimentos formais em vídeo, casos com números/ROI mensurados, e quase não publicamos conteúdo técnico próprio. Site precisa ser repensado pra mostrar a profundidade do trabalho — hoje é vitrine de vídeos sem narrativa estratégica explícita.',
  p7_canais_origem: ['Indicação', 'Networking dos sócios', 'Clientes antigos (recorrência)', 'LinkedIn', 'Eventos'],
  p7_mensagens_funcionam: '"Cuidamos do projeto como se fosse da casa do cliente", "entendemos seu negócio antes de propor ideia bonita", "método consistente entre vídeo, PR e evento". Tudo que fala de relacionamento direto e cuidado editorial puxa reunião.',
  p7_mensagens_desconfianca: 'Quando tentamos parecer modernos demais ou usar termos como "transformação digital", "storytelling 360" ou "engajamento viral". Cliente percebe que não é nosso lugar. Também "somos a melhor produtora do Brasil" — soa pretensioso pro nicho consultivo.',
  p7_cliente_ideal_1_descricao: 'Indústria farmacêutica média-grande (R$ 1,5B de faturamento) em campanha global de reposicionamento BR',
  p7_cliente_ideal_1_por_que_ideal: 'Compra projeto integrado anual (vídeo institucional + PR + eventos), valoriza método e respeita prazo de qualidade, fee mensal acima de R$ 200k',
  p7_cliente_ideal_1_valoriza: 'Sigilo, qualidade editorial, capacidade de costurar várias entregas com coerência, sócio direto na conta',
  p7_cliente_ideal_1_como_chegou: 'Indicação de ex-cliente do mesmo grupo industrial — relacionamento de 8 anos com a diretora de comunicação',
  p7_cliente_ideal_2_descricao: 'Gestora de patrimônio com family office, 30 anos de mercado, em processo de sucessão',
  p7_cliente_ideal_2_por_que_ideal: 'Projeto complexo de narrativa patrimonial, decisão direta com sócio fundador, budget alto pra qualidade editorial',
  p7_cliente_ideal_2_valoriza: 'Sofisticação visual, discrição, capacidade de traduzir cultura familiar em discurso público sem perder essência',
  p7_cliente_ideal_2_como_chegou: 'Networking pessoal do Rafael em jantar de relacionamento setorial',
  p7_cliente_ideal_3_descricao: 'Banco de investimento brasileiro de médio porte em campanha de marca empregadora pra atrair talento sênior',
  p7_cliente_ideal_3_por_que_ideal: 'Projeto longo (12-18 meses), budget alto, integra audiovisual + PR + comunicação interna numa narrativa única',
  p7_cliente_ideal_3_valoriza: 'Posicionamento institucional, atração de talento qualificado, narrativa de cultura sustentada por evidência',
  p7_cliente_ideal_3_como_chegou: 'Indicação do head de marketing que já trabalhou conosco em outra empresa',
};

const LAURA = {
  // Parte 2 híbrida — perspectiva mais comercial/integradora
  p2_motivos_ganho_opcoes: ['Confiança na empresa', 'Capacidade de resolver problema complexo', 'Especialização no segmento'],
  p2_motivos_perda_opcoes: ['Concorrente mais conhecido / com mais marca', 'Concorrente direto mais barato', 'Falta de prova de resultado'],
  p2_objecoes_opcoes: ['Preço', 'Dúvida sobre ROI', 'Comparação com concorrentes', 'Preferência por fornecedor conhecido', 'Processo decisório lento'],
  p2_concorrentes_tipos: ['Concorrente direto da mesma categoria', 'Concorrente indireto / categoria adjacente', 'Time interno do cliente (in-house)'],

  // Parte 5.7 — Mapa Lean (perspectiva comercial)
  p7_clientes_atuais_tipos: 'Heads e diretores de comunicação de empresas B2B médias-grandes que querem comunicação integrada (não só audiovisual avulso). Buscam parceiro que costure marca, conteúdo, eventos e relacionamento com imprensa numa narrativa única.',
  p7_clientes_desejados: [
    'Empresas em IPO ou processos de M&A que precisam de comunicação institucional sofisticada',
    'Multinacionais com headquarters BR que querem unificar discurso de marca em mais de um país',
    'Empresas familiares profissionalizando governança e marca',
  ],
  p7_clientes_evitar: [
    'Clientes que querem terceirizar pensamento estratégico — a gente não vira braço de execução',
    'Empresas que mudam de fornecedor de comunicação a cada ciclo curto (não constroem relação)',
    'Marcas que pedem velocidade acima de cuidado editorial — desencaixe cultural',
  ],
  p7_decisores: ['Diretor de marketing / comunicação', 'CEO / presidente', 'Compras / suprimentos', 'Diretor financeiro'],
  p7_influenciadores: 'Compras/suprimentos costuma travar projeto grande mesmo depois do diretor decidir — exigem 3 cotações e processo formal. Jurídico influencia em contas grandes (confidencialidade, propriedade intelectual). Em algumas empresas, a agência incumbente bloqueia entrada via vínculo de relacionamento.',
  p7_momento_busca: ['Quando passa por mudança estratégica', 'Quando precisa substituir fornecedor', 'Quando quer melhorar imagem / reputação', 'Quando quer crescer'],
  p7_perda_para_quem: ['Empresa mais conhecida', 'Concorrente direto', 'Cliente adiou decisão', 'Cliente não percebeu valor suficiente'],
  p7_objecoes_pre_compra: ['Preço', 'Dúvida sobre ROI', 'Processo decisório lento', 'Comparação com concorrentes', 'Falta de urgência'],
  p7_objecoes_pre_compra_exemplo: '"Adoramos a proposta, mas no momento estamos congelando contratações novas — vamos retomar no próximo trimestre."',
  p7_provas_confianca: ['Cases', 'Reputação dos sócios', 'Proposta bem estruturada', 'Diagnóstico inicial', 'Indicação de cliente conhecido', 'Conteúdo técnico'],
  p7_provas_existentes: 'Cases narrativos bons (mas em formato apresentação, não publicado), proposta comercial estruturada (template forte que vira referência interna do cliente), reputação dos sócios em LinkedIn e em pequenos círculos do setor. Diagnóstico inicial gratuito costuma fechar venda.',
  p7_provas_faltantes: 'Métricas de impacto comercial dos clientes (NPS de comunicação, CRM, recall), conteúdo técnico publicado regularmente (blog/podcast/webinar), advocacy de C-Levels que falam por nós em fóruns. Sala de imprensa do site é fraca; quase não temos cobertura editorial sobre nós.',
  p7_canais_origem: ['Indicação', 'Networking dos sócios', 'LinkedIn', 'Eventos', 'Parcerias'],
  p7_mensagens_funcionam: '"Comunicação como investimento, não custo", "método integrado de marca, narrativa e relacionamento", "parceria de longa data com a área de comunicação". Cliente B2B qualificado responde a discurso consultivo, não a "pacote" ou "campanha".',
  p7_mensagens_desconfianca: '"Resultado garantido", "engajamento viral", "storyteller". Mensagens vagas ou de auto-elogio quebram credibilidade. "Líderes de mercado" sem prova é a mais comum — provoca recuo.',
  p7_cliente_ideal_1_descricao: 'Indústria de bens de capital com 50 anos de história, em primeira sucessão familiar para CEO contratado',
  p7_cliente_ideal_1_por_que_ideal: 'Comunicação integrada estratégica de transição, projeto de 18 meses, fee fixo + escopos pontuais, decisão consolidada entre CEO contratado e sócio fundador',
  p7_cliente_ideal_1_valoriza: 'Discrição, capacidade de traduzir legado em discurso contemporâneo, parceria de relacionamento (não de fornecedor)',
  p7_cliente_ideal_1_como_chegou: 'Indicação do CFO que conheceu os sócios em conferência setorial',
  p7_cliente_ideal_2_descricao: 'Multinacional europeia com unidade brasileira em reposicionamento regional',
  p7_cliente_ideal_2_por_que_ideal: 'Budget alto, escopo amplo (institucional + comercial + interno), busca parceiro local com chops editoriais que não traga só execução',
  p7_cliente_ideal_2_valoriza: 'Sofisticação editorial, capacidade de operar em PT e EN, sensibilidade cultural BR',
  p7_cliente_ideal_2_como_chegou: 'Resposta a RFP via indicação de consultor de management',
  p7_cliente_ideal_3_descricao: 'Empresa de tecnologia financeira (regulada) em posicionamento institucional pré-IPO',
  p7_cliente_ideal_3_por_que_ideal: 'Projeto longo (12-24 meses), integra comunicação institucional + investor relations + employer branding',
  p7_cliente_ideal_3_valoriza: 'Rigor editorial, conformidade regulatória, capacidade de operar em ritmo institucional sem perder agilidade',
  p7_cliente_ideal_3_como_chegou: 'Indicação do diretor de relações institucionais (ex-cliente em outra empresa)',
};

async function aplicarMerge(email, novoCampos) {
  const sqlObj = JSON.stringify(novoCampos).replace(/'/g, "''");
  const query = `UPDATE formularios SET respostas_json = respostas_json || '${sqlObj}'::jsonb WHERE projeto_id = '${PROJETO_ID}' AND tipo = 'intake_socios' AND respostas_json->>'_respondente_email' = '${email}' RETURNING id, respostas_json->>'_respondente_nome' as nome;`;

  const r = await fetch('https://api.supabase.com/v1/projects/qjmokydtdwisznttipvi/database/query', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.SUPABASE_ACCESS_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });
  const text = await r.text();
  console.log(`[${email}] status=${r.status}`, text.slice(0, 400));
  return r.ok;
}

(async () => {
  if (!process.env.SUPABASE_ACCESS_TOKEN) {
    console.error('SUPABASE_ACCESS_TOKEN ausente.');
    process.exit(1);
  }
  console.log('Aplicando merge nos 2 sócios do GSIM Brasil…');
  await aplicarMerge('rafael@gsimbrasil.com.br', RAFAEL);
  await aplicarMerge('laura@gsimbrasil.com.br', LAURA);
  console.log('Done.');
})();
