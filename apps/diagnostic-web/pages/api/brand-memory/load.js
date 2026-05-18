import { loadBrandMemory } from '@espansione/brand-memory';
import { getServerUser } from '../../../lib/getServerUser';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

function extractBrandMemoryExport(content = '') {
  const matches = Array.from(content.matchAll(/<brand_memory_export>([\s\S]*?)<\/brand_memory_export>/gi));
  if (!matches.length) return null;

  const candidates = matches
    .map((match) => normalizeJsonCandidate(match[1]))
    .filter(Boolean);

  return candidates.find((candidate) => canParseJson(candidate)) || candidates.at(-1) || null;
}

function normalizeJsonCandidate(value = '') {
  let text = value.trim();
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim();

  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    text = text.slice(firstBrace, lastBrace + 1).trim();
  }

  return text;
}

function canParseJson(value) {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

function hasUsableSlice(diagnostic, key) {
  const value = diagnostic?.[key];
  if (!value) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

function isAgencyUsableDiagnostic(diagnostic) {
  return ['decodificacao', 'plataforma_branding', 'experiencia', 'plano_comunicacao']
    .every((key) => hasUsableSlice(diagnostic, key));
}

function compactOutput(output) {
  if (!output) return null;
  return {
    output_id: output.id,
    agent_num: output.agent_num,
    generated_at: output.created_at,
    resumo_executivo: output.resumo_executivo || '',
    conclusoes: output.conclusoes || '',
    conteudo: output.conteudo || '',
  };
}

function legacyPersonaFromOutput(output) {
  const raw = compactOutput(output);
  return raw
    ? [{
        name: 'Públicos e personas mapeados na Fase 1',
        role_profession: 'ver relatório do Agente 12',
        jtbd: raw.resumo_executivo || raw.conclusoes || 'Consultar relatório legado do Agente 12.',
        pains: [],
        raw_report: raw,
      }]
    : [];
}

function buildLegacyDiagnostic(projeto, outputsByAgent) {
  const out = (agent) => compactOutput(outputsByAgent.get(agent));
  const ag6 = out(6);
  const ag9 = out(9);
  const ag10 = out(10);
  const ag11 = out(11);
  const ag12 = out(12);
  const ag13 = out(13);

  return {
    brand_slug: projeto.slug || projeto.cliente_slug || String(projeto.cliente || 'marca').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    brand_name: projeto.cliente || projeto.nome || 'Marca sem nome',
    industry: projeto.segmento || projeto.industry || null,
    espansione_project_id: projeto.id,
    schema_version: '2.0',
    vi: out(2),
    ve: out(4),
    vm: out(5),
    vm_sources: [],
    decodificacao: ag6
      ? {
          legacy_source: true,
          sumario_estrategico: ag6.resumo_executivo || ag6.conclusoes || 'Relatório legado do Agente 6.',
          ida_consolidado: null,
          de_para: [],
          raw_report: ag6,
        }
      : null,
    values_and_attributes: out(7) ? { legacy_source: true, raw_report: out(7), values: [], personality_attributes: [] } : null,
    diretrizes_estrategicas: out(8) ? [{ numero: 1, titulo: 'Diretrizes estratégicas legadas', o_que: out(8).resumo_executivo || out(8).conclusoes || 'Consultar relatório legado do Agente 8.', raw_report: out(8) }] : [],
    diretrizes_reinforcement_logic: '',
    plataforma_branding: ag9
      ? {
          legacy_source: true,
          marca_e: {
            proposito: { statement: ag9.resumo_executivo || ag9.conclusoes || 'Consultar relatório legado do Agente 9.' },
            arquetipo: { dominante: null },
            valores: [],
            atributos: [],
          },
          comunicacao_fala: {
            discurso_posicionamento: ag9.conclusoes || ag9.resumo_executivo || '',
            tagline: null,
          },
          raw_report: ag9,
        }
      : null,
    voice_profile: ag10
      ? {
          legacy_source: true,
          tons_de_voz: [{ nome: 'Tom legado da Fase 1', descricao: ag10.resumo_executivo || ag10.conclusoes || 'Consultar relatório legado do Agente 10.', quando_usar: 'Revisar manualmente antes de publicar.' }],
          territorios_palavras: [],
          palavras_proibidas: [],
          convencoes_naming: [],
          raw_report: ag10,
        }
      : null,
    visual_identity: ag11
      ? {
          legacy_source: true,
          manter_perder_ganhar: { manter: [], perder: [], ganhar: [] },
          color_palette: { principal: [], complementar: [] },
          typography: null,
          raw_report: ag11,
        }
      : null,
    experiencia: ag12
      ? {
          legacy_source: true,
          personas: legacyPersonaFromOutput(outputsByAgent.get(12)),
          customer_journey: { stages: [] },
          brand_moments: [],
          raw_report: ag12,
        }
      : null,
    plano_comunicacao: ag13
      ? {
          legacy_source: true,
          atemporal: { tagline: null },
          clusters_comunicacao: [],
          narrativa_marca: { historia_central: ag13.resumo_executivo || ag13.conclusoes || 'Consultar relatório legado do Agente 13.' },
          ondas_branding: [],
          plano_conexoes: {},
          diferenciais: [],
          raw_report: ag13,
        }
      : null,
    meta: {
      consolidated_at: new Date().toISOString(),
      schema_version: '2.0',
      agents_present: Array.from(outputsByAgent.keys()).sort((a, b) => a - b),
      agents_missing: [2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].filter((agent) => !outputsByAgent.has(agent)),
      has_evp: outputsByAgent.has(14),
      validation_errors: [],
      missing_required_fields: [],
      gaps_by_agent: {},
      load_status: 'legacy_loaded',
      legacy_fallback: true,
    },
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { user } = await getServerUser(req, res);
  if (!user) return res.status(401).json({ success: false, error: 'Não autenticado' });

  const { projetoId } = req.body || {};
  if (!projetoId) return res.status(400).json({ success: false, error: 'projetoId obrigatório' });

  const db = supabaseAdmin;

  try {
    const [{ data: profile }, { data: projeto }] = await Promise.all([
      db.from('profiles').select('empresa_id, role').eq('id', user.id).single(),
      db.from('projetos').select('empresa_id, responsavel_email').eq('id', projetoId).single(),
    ]);

    if (!projeto) return res.status(404).json({ success: false, error: 'Projeto não encontrado' });

    const isMaster = profile?.role === 'master';
    const isAdmin = profile?.role === 'admin';
    const sameEmpresa = profile?.empresa_id === projeto.empresa_id;
    const isResponsavel = projeto.responsavel_email && projeto.responsavel_email === user.email;
    if (!isMaster && !(isAdmin && sameEmpresa) && !isResponsavel) {
      return res.status(403).json({ success: false, error: 'Acesso negado a este projeto' });
    }

    const { data: output, error: outputError } = await db
      .from('outputs')
      .select('id, conteudo')
      .eq('projeto_id', projetoId)
      .eq('agent_num', 16)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (outputError) throw outputError;
    if (!output) {
      return res.status(400).json({ success: false, error: 'Agente 16 ainda não foi gerado.' });
    }

    const exportJson = extractBrandMemoryExport(output.conteudo);
    if (!exportJson) {
      return res.status(400).json({ success: false, error: 'Output mais recente do Agente 16 não contém <brand_memory_export>.' });
    }

    let parsed;
    try {
      parsed = JSON.parse(exportJson);
    } catch {
      parsed = null;
    }

    let diagnostic = parsed?.espansione_diagnostic || parsed;
    if (!isAgencyUsableDiagnostic(diagnostic)) {
      const { data: upstreamOutputs, error: upstreamError } = await db
        .from('outputs')
        .select('id, agent_num, created_at, conteudo, resumo_executivo, conclusoes')
        .eq('projeto_id', projetoId)
        .in('agent_num', [2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14])
        .order('created_at', { ascending: false });

      if (upstreamError) throw upstreamError;

      const outputsByAgent = new Map();
      for (const item of upstreamOutputs || []) {
        if (!outputsByAgent.has(item.agent_num)) outputsByAgent.set(item.agent_num, item);
      }

      diagnostic = buildLegacyDiagnostic(projeto, outputsByAgent);
    }

    if (!isAgencyUsableDiagnostic(diagnostic)) {
      return res.status(400).json({ success: false, error: 'Brand Memory insuficiente: faltam relatórios críticos 6, 9, 12 ou 13.' });
    }

    const result = await loadBrandMemory(db, diagnostic, {
      reviewedAt: new Date().toISOString(),
      reviewedBy: user.id,
      agent16OutputId: output.id,
    });

    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.error('[BrandMemory Load] Erro:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
