// Lê o JSON exportado da Mgmt API com os intake_socios e gera um
// arquivo Markdown organizado por sócio, com labels amigáveis.
//
// Uso:
//   node scripts/gera_md_intake_socios.js <input.json> <output.md> [titulo_projeto]
//
// O input deve ser o array retornado pelo /database/query da Mgmt API.

const fs = require('fs');

const PARTES = [
  { id: 1, titulo: 'Identificação da Empresa' },
  { id: 2, titulo: 'A Empresa e sua Marca' },
  { id: 3, titulo: 'Propósito e Essência' },
  { id: 4, titulo: 'Marca Empregadora e Cultura' },
  { id: 5, titulo: 'Visão, Futuro e Estratégia' },
  { id: 6, titulo: 'Diagnóstico 360° do Negócio' },
];

// Labels canônicos. Não preciso ser exaustivo — campos sem label aparecem
// pelo nome bruto (com fallback humanizado).
const LABELS = {
  // Parte 1
  p1_nome_completo: 'Nome completo',
  p1_email: 'E-mail',
  p1_telefone: 'Telefone',
  p1_razao_social: 'Razão social',
  p1_ano_fundacao: 'Ano de fundação',
  p1_segmento: 'Segmento',
  p1_estagio_negocio: 'Estágio do negócio',
  p1_decisoes_12m: 'Decisões nos próximos 12 meses',
  p1_faturamento: 'Faturamento',
  p1_numero_colaboradores: 'Número de colaboradores',

  // Parte 2
  p2_oferta_cliente: 'Oferta ao cliente (produto/serviço, ticket, ICP)',
  p2_personalidade_marca: 'Personalidade da marca',
  p2_diferenciais: 'Diferenciais',
  p2_palavra_real_1: 'Palavra que define a marca HOJE — 1',
  p2_palavra_real_2: 'Palavra que define a marca HOJE — 2',
  p2_palavra_real_3: 'Palavra que define a marca HOJE — 3',
  p2_palavra_ambicao_1: 'Palavra que define a marca AMBICIONADA — 1',
  p2_palavra_ambicao_2: 'Palavra que define a marca AMBICIONADA — 2',
  p2_palavra_ambicao_3: 'Palavra que define a marca AMBICIONADA — 3',
  p2_como_sabe_palavras_reais: 'Como sabe que essas são as palavras reais',
  p2_quando_vencemos: 'Quando ganhamos um cliente, é por quê?',
  p2_quando_perdemos: 'Quando perdemos um cliente, é por quê?',
  p2_objecoes_frequentes: 'Objeções frequentes',
  p2_concorrentes_analise: 'Análise dos concorrentes',
  p2_marca_admirada: 'Marca admirada (referência)',
  p2_emprestar_atributo: 'Atributo que pegaria emprestado dessa marca',

  // Parte 3
  p3_historia_criacao: 'História de criação da empresa',
  p3_problema_resolver: 'Problema que a empresa resolve',
  p3_vivi_problema_na_pele: 'Vivi esse problema na pele?',
  p3_momento_epifania: 'Momento de epifania (porque a empresa precisava existir)',
  p3_por_que_acredita: 'Por que acredita nesse caminho',
  p3_proposito_declarado: 'Propósito declarado (o que a marca diz hoje)',
  p3_contra_o_que_existe: 'A marca existe CONTRA o quê?',
  p3_indignacao_setor: 'O que indigna no setor',
  p3_se_empresa_morresse: 'Se a empresa morresse amanhã, o que se perderia?',
  p3_marca_positiva_negativa: 'Se a marca virasse pessoa: que faria positivamente / o que diria de negativo',
  p3_marca_personagem: 'A marca como personagem (filme/livro)',
  p3_arquetipo_primario: 'Arquétipo primário',
  p3_arquetipo_secundario: 'Arquétipo secundário (atenuação)',
  p3_valores_inegociaveis: 'Valores inegociáveis',
  p3_valor_1_nome: 'Valor 1 — nome',
  p3_valor_1_pratica: 'Valor 1 — como se manifesta na prática',
  p3_valor_2_nome: 'Valor 2 — nome',
  p3_valor_2_pratica: 'Valor 2 — como se manifesta na prática',
  p3_valor_3_nome: 'Valor 3 — nome',
  p3_valor_3_pratica: 'Valor 3 — como se manifesta na prática',
  p3_decisao_cara_em_nome_proposito: 'Decisão cara tomada em nome do propósito',
  p3_cliente_recusado: 'Cliente recusado por incoerência com o propósito',
  p3_causas: 'Causas que a empresa abraça',
  p3_impactos_intencionais: 'Impactos intencionais',

  // Parte 4
  p4_radar_empregadora: 'Radar Empregadora (notas por dimensão)',
  p4_radar_dimensao_mais_importante: 'Dimensão mais importante hoje',
  p4_radar_dimensao_ja_referencia: 'Dimensão em que já é referência',
  p4_proposta_oferece: 'EVP — o que a empresa oferece',
  p4_proposta_pede: 'EVP — o que a empresa pede de volta',
  p4_proposta_por_que_escolher: 'EVP — por que alguém escolheria trabalhar aqui',
  p4_clima_interno: 'Clima interno',
  p4_cultura_atrapalha_marca: 'Onde a cultura atrapalha a marca externa',
  p4_desafios_comunicacao_interna: 'Desafios de comunicação interna',
  p4_desafios_lideranca_gestao: 'Desafios de liderança e gestão',
  p4_empresa_admira_como_empregadora: 'Empresa admirada como empregadora',
  p4_pratica_a_emprestar: 'Prática (de outra empresa) que pegaria emprestada',
  p4_valores_no_dia_a_dia: 'Como os valores aparecem no dia a dia',

  // Parte 5
  p5_visao_marca: 'Visão para a marca (motivação, significado, percepção desejada)',
  p5_visao_3_anos: 'Onde quer a empresa em 3 anos',
  p5_visao_5_anos: 'Onde quer a empresa em 5 anos',
  p5_papel_no_mundo: 'Papel da organização no mundo',
  p5_mudaria_uma_coisa: 'Se pudesse mudar UMA coisa, o que seria',
  p5_maior_objetivo: 'Maior objetivo enquanto líder',
  p5_maior_desafio: 'Maior desafio enquanto líder',
  p5_metas_12_meses: 'Metas de negócio para os próximos 12 meses',
  p5_impulsionador_1: 'Impulsionador 1 (força)',
  p5_impulsionador_2: 'Impulsionador 2 (força)',
  p5_impulsionador_3: 'Impulsionador 3 (força)',
  p5_detrator_1: 'Detrator 1 (fragilidade)',
  p5_detrator_2: 'Detrator 2 (fragilidade)',
  p5_detrator_3: 'Detrator 3 (fragilidade)',
  p5_acelerador_1: 'Acelerador 1 (oportunidade)',
  p5_acelerador_2: 'Acelerador 2 (oportunidade)',
  p5_acelerador_3: 'Acelerador 3 (oportunidade)',
  p5_o_que_necessario_chegar: 'O que é necessário pra chegar à visão de futuro',
  p5_tira_o_sono: 'O que mais tira o sono',
  p5_maior_medo: 'Maior medo em relação ao futuro',
  p5_vergonha: 'Do que tem vergonha na empresa hoje',
  p5_promete_fora_nao_entrega_dentro: 'Promete fora e não entrega por dentro',
  p5_incoerencia_a_resolver: 'Incoerência entre discurso e prática a resolver',
  p5_divergencia_entre_socios: 'Divergência esperada com sócio(s)',
  p5_maior_tensao_socios: 'Maior tensão entre sócios',

  // FIX.29 — campos novos
  p5_canais_ativos_hoje: 'Canais de comunicação ativos hoje',
  p5_canais_papel_principal: 'Papel principal de cada canal',
  p5_equipe_comunicacao: 'Quem cuida da comunicação',
  p5_orcamento_comunicacao_faixa: 'Faixa anual de orçamento de comunicação',
  p5_orcamento_comunicacao_observacoes: 'Observações sobre o orçamento',
  p5_comunicacao_funciona: 'O que está funcionando na comunicação',
  p5_comunicacao_nao_funciona: 'O que NÃO está funcionando na comunicação',
  p5_objetivos_comunicacao_12m: 'Objetivos da comunicação nos próximos 12 meses',
};

function camposPorParte(respostas) {
  const map = {};
  for (let p = 1; p <= 6; p++) map[p] = [];
  for (const [k, v] of Object.entries(respostas)) {
    if (k.startsWith('_')) continue;
    const m = k.match(/^p(\d)_/) || k.match(/^parte(\d)_/);
    const parte = m ? Number(m[1]) : null;
    if (parte && map[parte]) {
      map[parte].push([k, v]);
    }
  }
  return map;
}

function humanizar(key) {
  return key
    .replace(/^p\d+_/, '')
    .replace(/^parte\d+_/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function formatValue(v) {
  if (v === null || v === undefined || v === '') return '_(em branco)_';
  if (typeof v === 'object') {
    return '\n```json\n' + JSON.stringify(v, null, 2) + '\n```';
  }
  const s = String(v).trim();
  if (!s) return '_(em branco)_';
  if (s.length > 200 || /\n/.test(s)) {
    return '\n\n' + s.split('\n').map(l => '> ' + l).join('\n');
  }
  return s;
}

function gerarMd(data, tituloProjeto) {
  const out = [];
  out.push(`# Formulários dos Sócios — ${tituloProjeto}`);
  out.push('');
  out.push(`> Sócios respondentes: **${data.length}**`);
  out.push(`> Gerado em: ${new Date().toISOString().slice(0, 10)}`);
  out.push('');
  out.push('---');
  out.push('');

  data.forEach((row, idx) => {
    const respostas = typeof row.respostas === 'string'
      ? JSON.parse(row.respostas)
      : (row.respostas_json || row.respostas || {});
    const nome = respostas.p1_nome_completo || respostas._respondente_nome || '(sem nome)';
    const email = respostas.p1_email || respostas._respondente_email || '';
    const data_envio = row.created_at ? new Date(row.created_at).toISOString().slice(0, 10) : '';

    out.push(`## Sócio ${idx + 1} — ${nome}`);
    out.push('');
    out.push(`> ${email}${data_envio ? ' · respondido em ' + data_envio : ''}`);
    out.push('');

    const campos = camposPorParte(respostas);
    for (const parteMeta of PARTES) {
      const items = campos[parteMeta.id] || [];
      if (items.length === 0) continue;

      out.push(`### Parte ${parteMeta.id} — ${parteMeta.titulo}`);
      out.push('');

      for (const [k, v] of items) {
        const label = LABELS[k] || humanizar(k);
        const val = formatValue(v);
        out.push(`**${label}:** ${val}`);
        out.push('');
      }
    }

    out.push('---');
    out.push('');
  });

  return out.join('\n');
}

if (require.main === module) {
  const [inputPath, outputPath, ...tituloParts] = process.argv.slice(2);
  if (!inputPath || !outputPath) {
    console.error('Uso: node gera_md_intake_socios.js <input.json> <output.md> [titulo_projeto]');
    process.exit(1);
  }
  const titulo = tituloParts.join(' ') || 'Projeto';
  const raw = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const md = gerarMd(raw, titulo);
  fs.writeFileSync(outputPath, md, 'utf8');
  console.log(`Gerado: ${outputPath} · ${md.length} chars · ${raw.length} sócio(s).`);
}
