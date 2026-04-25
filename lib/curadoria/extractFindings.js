// FIX.24 — extrai blocos de curadoria a partir de outputs.
//
// Duas estratégias coexistem:
//
//  1) `findings_json` direto. Quando o agente emite estruturado (formato
//     novo, ver AC_REGRA_FINDINGS em _anaCoutoKB), usamos direto.
//
//  2) Parser heurístico de markdown. Para outputs LEGADOS (do GSIM e
//     anteriores ao FIX.24) que só têm `conteudo` markdown denso,
//     varremos heading-by-heading e produzimos blocos de granularidade
//     "## seção" com o agente original como contexto. É melhor esforço,
//     não pretende perfeição — o consultor vai editar/aprovar mesmo.
//
// Categorias canônicas (alinhadas com a UX da curadoria):
const CATEGORIAS = [
  'marca_percepcao',
  'proposito_visao',
  'cultura_valores',
  'lideranca',
  'comunicacao_interna',
  'experiencia_colaborador',
  'posicionamento',
  'diferenciacao_competitiva',
  'jornada_cliente',
  'riscos_tensoes',
  'oportunidades',
  'recomendacoes_prioritarias',
];

// Mapeamento default agente → categoria provável (heurística inicial).
// O consultor reclassifica na UI conforme necessário.
const AGENT_DEFAULT_CATEGORIA = {
  1:  'cultura_valores',          // Roteiros VI — pergunta-evidência sobre cultura
  2:  'cultura_valores',          // Consolidado VI
  3:  'jornada_cliente',          // Roteiros VE
  4:  'marca_percepcao',          // Consolidado VE
  5:  'diferenciacao_competitiva',// VM
  6:  'riscos_tensoes',           // Decodificação (IDA é o coração de riscos/oportunidades)
  7:  'proposito_visao',          // Valores e Atributos
  8:  'recomendacoes_prioritarias', // Diretrizes
  9:  'posicionamento',           // Plataforma
  10: 'comunicacao_interna',      // Identidade Verbal — UVV (também serve comunicação institucional)
  11: 'marca_percepcao',          // Visual
  12: 'jornada_cliente',          // CX
  13: 'comunicacao_interna',      // Comunicação (institucional/comercial/marca empregadora)
  14: 'experiencia_colaborador',  // EVP
  15: 'recomendacoes_prioritarias', // Editorial — síntese
};

export function getCategoriasCanonicas() { return [...CATEGORIAS]; }
export function getDefaultCategoria(agentNum) {
  return AGENT_DEFAULT_CATEGORIA[Number(agentNum)] || 'recomendacoes_prioritarias';
}

/**
 * Extrai o array do bloco <findings_json>...</findings_json> do raw text
 * de um agente. Defensivo: se não existir, JSON inválido, ou não for
 * array, retorna null. O caller decide cair no parser heurístico.
 */
export function parseFindingsFromRaw(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  const m = rawText.match(/<findings_json>([\s\S]*?)<\/findings_json>/i);
  if (!m) return null;
  let body = m[1].trim();
  // Permite markdown wrapper (```json ... ```) caso o modelo tenha emitido
  const fenced = body.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) body = fenced[1].trim();
  try {
    const arr = JSON.parse(body);
    return Array.isArray(arr) ? arr : null;
  } catch {
    return null;
  }
}

/**
 * Extrai findings de um output. Prefere findings_json se válido; senão
 * cai no parser heurístico.
 *
 * @param {Object} output  registro de outputs
 * @returns {Array<{ categoria, titulo, evidencia, interpretacao, recomendacao, confianca }>}
 */
export function extractFindings(output) {
  if (!output) return [];

  // Estratégia 1 — findings_json estruturado
  const fj = output.findings_json;
  if (Array.isArray(fj) && fj.length > 0) {
    return fj.map((f) => normalizeFinding(f, output.agent_num)).filter(Boolean);
  }

  // Estratégia 2 — parser heurístico do conteudo markdown
  return parseFromMarkdown(output);
}

function normalizeFinding(raw, agentNum) {
  if (!raw || typeof raw !== 'object') return null;
  const cat = String(raw.categoria || '').trim();
  const categoria = CATEGORIAS.includes(cat) ? cat : getDefaultCategoria(agentNum);
  const titulo = String(raw.titulo || raw.title || '').trim();
  if (!titulo) return null;
  return {
    categoria,
    titulo: titulo.slice(0, 280),
    evidencia: cleanText(raw.evidencia || raw.evidence || raw.fato),
    interpretacao: cleanText(raw.interpretacao || raw.interpretation),
    recomendacao: cleanText(raw.recomendacao || raw.recommendation),
    confianca: normalizeConfianca(raw.confianca || raw.confidence),
  };
}

function cleanText(s) {
  if (s == null) return null;
  const t = String(s).trim();
  return t || null;
}

function normalizeConfianca(s) {
  const t = String(s || '').trim().toLowerCase();
  if (t.startsWith('alta') || t === 'high') return 'Alta';
  if (t.startsWith('med')  || t === 'medium' || t === 'média' || t === 'media') return 'Media';
  if (t.startsWith('baixa') || t === 'low') return 'Baixa';
  return null;
}

/**
 * Parser heurístico: quebra o conteudo markdown em seções "## " ou "### "
 * e cria 1 bloco por seção. Tenta inferir evidência (primeiro parágrafo
 * com números/citações) vs interpretação (parágrafos seguintes).
 * Recomendação fica vazia — fica responsabilidade do consultor preencher.
 *
 * É melhor esforço — consultor sempre revisa.
 */
function parseFromMarkdown(output) {
  const conteudo = String(output?.conteudo || '');
  if (!conteudo.trim()) {
    // Fallback: cria 1 bloco "guarda-chuva" só pra garantir presença na curadoria
    const titulo = output?.resumo_executivo
      ? `Achado consolidado — Agente ${output.agent_num}`
      : `Output do Agente ${output?.agent_num ?? '?'}`;
    return [{
      categoria: getDefaultCategoria(output?.agent_num),
      titulo,
      evidencia: null,
      interpretacao: cleanText(output?.resumo_executivo),
      recomendacao: cleanText(output?.conclusoes),
      confianca: normalizeConfianca(output?.confianca),
    }];
  }

  const findings = [];
  const linhas = conteudo.split('\n');
  let atual = null;
  const flush = () => {
    if (atual && atual.titulo) {
      const corpo = atual.buf.join('\n').trim();
      const split = splitEvidenciaInterpretacao(corpo);
      findings.push({
        categoria: getDefaultCategoria(output.agent_num),
        titulo: atual.titulo.slice(0, 280),
        evidencia: cleanText(split.evidencia),
        interpretacao: cleanText(split.interpretacao),
        recomendacao: null,
        confianca: normalizeConfianca(output.confianca),
      });
    }
    atual = null;
  };

  for (const ln of linhas) {
    const h = ln.match(/^#{2,4}\s+(.+?)\s*$/);
    if (h) {
      flush();
      atual = { titulo: h[1].replace(/^[\d.]+\s*/, '').trim(), buf: [] };
      continue;
    }
    if (atual) atual.buf.push(ln);
  }
  flush();

  // Se nada saiu (ex.: conteudo sem headings), cria 1 bloco-resumo
  if (findings.length === 0) {
    findings.push({
      categoria: getDefaultCategoria(output.agent_num),
      titulo: `Síntese do Agente ${output.agent_num}`,
      evidencia: null,
      interpretacao: cleanText(output.resumo_executivo) || cleanText(conteudo.slice(0, 600)),
      recomendacao: cleanText(output.conclusoes),
      confianca: normalizeConfianca(output.confianca),
    });
  }

  return findings;
}

function splitEvidenciaInterpretacao(corpo) {
  // Heurística leve: o primeiro parágrafo com número/citação é "evidencia".
  // O resto é "interpretacao". Se não tem números, primeiro parágrafo vai
  // pra interpretacao e evidência fica null (consultor preenche depois).
  const paragrafos = corpo.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
  if (paragrafos.length === 0) return { evidencia: null, interpretacao: null };

  const isEvidencia = (p) => /\d|[""].+["”]/.test(p) && /[a-zA-ZáéíóúÁÉÍÓÚãõâêîôûç]/.test(p);
  const idxEv = paragrafos.findIndex(isEvidencia);

  if (idxEv === -1) {
    return { evidencia: null, interpretacao: paragrafos.join('\n\n') };
  }
  const evidencia = paragrafos[idxEv];
  const interpretacao = paragrafos.filter((_, i) => i !== idxEv).join('\n\n') || null;
  return { evidencia, interpretacao };
}

/**
 * Materializa os findings de um output em rows de analysis_blocks.
 * Idempotente: se já existem blocos para output_id, não duplica.
 *
 * @param {SupabaseClient} db (supabaseAdmin)
 * @param {Object} output
 * @returns {Promise<{ inserted: number, skipped: boolean }>}
 */
export async function materializarFindings(db, output) {
  if (!db || !output) return { inserted: 0, skipped: true };

  const { count } = await db
    .from('analysis_blocks')
    .select('id', { count: 'exact', head: true })
    .eq('output_id', output.id);

  if ((count || 0) > 0) {
    return { inserted: 0, skipped: true }; // já materializado
  }

  const findings = extractFindings(output);
  if (findings.length === 0) return { inserted: 0, skipped: true };

  const rows = findings.map((f) => ({
    projeto_id: output.projeto_id,
    output_id: output.id,
    agent_num: output.agent_num,
    categoria: f.categoria,
    titulo: f.titulo,
    ai_evidencia: f.evidencia,
    ai_interpretacao: f.interpretacao,
    ai_recomendacao: f.recomendacao,
    ai_confianca: f.confianca,
    status: 'pendente_revisao',
    incluir_no_relatorio: false,
  }));

  const { data: inserted, error } = await db
    .from('analysis_blocks')
    .insert(rows)
    .select('id');

  if (error) {
    console.error('[materializarFindings] erro:', error);
    return { inserted: 0, skipped: true, error: error.message };
  }

  // Snapshot ai_original em versions
  const versions = inserted.map((row, i) => ({
    block_id: row.id,
    tipo: 'ai_original',
    snapshot_json: rows[i],
  }));
  await db.from('analysis_block_versions').insert(versions);

  return { inserted: inserted.length, skipped: false };
}
