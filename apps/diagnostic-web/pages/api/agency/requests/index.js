import { getServerUser } from '../../../../lib/getServerUser';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import {
  getAgencyReadiness,
  normalizeStringArray,
  requireAgencyUser,
  resolveBrandContext,
  validateAgencyRequestPayload,
} from '../../../../lib/agency/runtime';

export default async function handler(req, res) {
  const { user } = await getServerUser(req, res);
  if (!user) return res.status(401).json({ success: false, error: 'Não autenticado' });
  if (!supabaseAdmin) return res.status(500).json({ success: false, error: 'Supabase admin indisponível' });

  try {
    await requireAgencyUser(supabaseAdmin, user);

    if (req.method === 'GET') {
      const { projeto_id, brand_id } = req.query || {};
      const { brand } = await resolveBrandContext(supabaseAdmin, {
        projetoId: projeto_id,
        brandId: brand_id,
      });

      if (!brand) {
        return res.status(200).json({ success: true, brand: null, requests: [] });
      }

      const { data, error } = await supabaseAdmin
        .from('agency_requests')
        .select('*')
        .eq('brand_id', brand.id)
        .neq('status', 'archived')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.status(200).json({ success: true, brand, requests: data || [] });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const { brand } = await resolveBrandContext(supabaseAdmin, {
        projetoId: body.projeto_id,
        brandId: body.brand_id,
      });

      if (!brand) {
        return res.status(400).json({
          success: false,
          error: 'Brand Memory não carregada para este projeto. Rode/revise o Agente 16 antes de criar pedidos.',
        });
      }

      const { readiness } = await getAgencyReadiness(supabaseAdmin, brand.id);
      if (body.campaign_mode === 'campaign_programmed') {
        const campaignRows = buildCampaignProgrammedRows({
          body,
          brandId: brand.id,
          readiness,
          userId: user.id,
        });
        const validationErrors = campaignRows.flatMap((row) => validateAgencyRequestPayload(row, readiness));
        if (validationErrors.length) {
          return res.status(400).json({ success: false, error: Array.from(new Set(validationErrors)).join('; '), readiness });
        }

        const { data, error } = await supabaseAdmin
          .from('agency_requests')
          .insert(campaignRows)
          .select('*')
          .order('campaign_item_order', { ascending: true });
        if (error) throw error;
        return res.status(200).json({
          success: true,
          requests: data || [],
          campaign_group_id: campaignRows[0]?.campaign_group_id || null,
          created_count: data?.length || 0,
          readiness,
        });
      }

      const payload = buildSingleRequestPayload({
        body,
        brandId: brand.id,
        readiness,
        userId: user.id,
      });

      const errors = validateAgencyRequestPayload(payload, readiness);
      if (errors.length) {
        return res.status(400).json({ success: false, error: errors.join('; '), readiness });
      }

      const { data, error } = await supabaseAdmin
        .from('agency_requests')
        .insert(payload)
        .select('*')
        .single();

      if (error) throw error;
      return res.status(200).json({ success: true, request: data, readiness });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('[agency/requests]', error);
    return res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
}

function buildSingleRequestPayload({ body, brandId, readiness, userId }) {
  return {
    brand_id: brandId,
    execution_profile_id: body.execution_profile_id || null,
    request_type: body.request_type,
    channel: body.channel,
    objective: body.objective,
    audience_cluster: body.audience_cluster || null,
    offer: body.offer || null,
    context: body.context || '',
    desired_cta: body.desired_cta || null,
    restrictions: normalizeStringArray(body.restrictions),
    reference_material: normalizeStringArray(body.reference_material),
    readiness_warnings: readiness.warnings,
    status: body.status || 'draft',
    created_by: userId,
  };
}

function buildCampaignProgrammedRows({ body, brandId, readiness, userId }) {
  const blueprint = normalizeCampaignBlueprint(body.campaign_blueprint);
  if (!blueprint.items.length) {
    const err = new Error('Adicione pelo menos uma linha de cadência para a campanha programada.');
    err.statusCode = 400;
    throw err;
  }

  const durationWeeks = blueprint.duration_weeks;
  const campaignGroupId = crypto.randomUUID();
  const campaignTitle = String(body.campaign_title || '').trim() || `Campanha ${new Date().toLocaleDateString('pt-BR')}`;
  const cadenceSummary = blueprint.items.map((item) => `${item.quantity_per_period}x/${item.period_label} ${item.request_type} em ${item.channel}`);
  const sharedRestrictions = normalizeStringArray(body.restrictions);
  const sharedReferences = normalizeStringArray(body.reference_material);
  const waveLabel = `${durationWeeks} semana${durationWeeks > 1 ? 's' : ''}`;
  const baseContext = String(body.context || '').trim();

  let order = 0;
  const rows = [];
  for (const item of blueprint.items) {
    const occurrences = item.period === 'month'
      ? Math.max(1, item.quantity_per_period)
      : durationWeeks * item.quantity_per_period;

    for (let occurrence = 1; occurrence <= occurrences; occurrence += 1) {
      order += 1;
      const weekIndex = item.period === 'week'
        ? Math.floor((occurrence - 1) / item.quantity_per_period) + 1
        : null;
      const pieceIndexInWeek = item.period === 'week'
        ? ((occurrence - 1) % item.quantity_per_period) + 1
        : occurrence;
      const context = [
        '[Campanha programada]',
        `Campanha: ${campaignTitle}`,
        `Janela: ${waveLabel}`,
        `Cadência planejada: ${cadenceSummary.join(' | ')}`,
        weekIndex ? `Semana ${weekIndex} · peça ${pieceIndexInWeek} de ${item.quantity_per_period}` : `Entrega ${occurrence} de ${occurrences} para este formato`,
        `Canal: ${item.channel}`,
        `Formato: ${item.request_type}`,
        '',
        baseContext,
      ].join('\n').trim();

      rows.push({
        brand_id: brandId,
        execution_profile_id: body.execution_profile_id || 'campaign_light',
        campaign_group_id: campaignGroupId,
        campaign_title: campaignTitle,
        campaign_wave_label: waveLabel,
        campaign_item_key: `${item.channel}:${item.request_type}`,
        campaign_item_order: order,
        campaign_blueprint_json: {
          duration_weeks: durationWeeks,
          cadence_summary: cadenceSummary,
          total_planned_items: blueprint.total_items,
          source_item: item,
        },
        request_type: item.request_type,
        channel: item.channel,
        objective: body.objective,
        audience_cluster: body.audience_cluster || null,
        offer: body.offer || null,
        context,
        desired_cta: body.desired_cta || null,
        restrictions: sharedRestrictions,
        reference_material: sharedReferences,
        readiness_warnings: readiness.warnings,
        status: body.status || 'draft',
        created_by: userId,
      });
    }
  }

  return rows;
}

function normalizeCampaignBlueprint(rawBlueprint) {
  const durationWeeks = Math.max(1, Math.min(52, Number(rawBlueprint?.duration_weeks || 4)));
  const items = Array.isArray(rawBlueprint?.items) ? rawBlueprint.items : [];
  const normalizedItems = items
    .map((item) => ({
      request_type: item?.request_type,
      channel: item?.channel,
      period: item?.period === 'month' ? 'month' : 'week',
      period_label: item?.period === 'month' ? 'mes' : 'semana',
      quantity_per_period: Math.max(0, Math.min(31, Number(item?.quantity_per_period || 0))),
    }))
    .filter((item) => item.request_type && item.channel && item.quantity_per_period > 0);

  const totalItems = normalizedItems.reduce((sum, item) => sum + (item.period === 'month' ? item.quantity_per_period : durationWeeks * item.quantity_per_period), 0);

  return {
    duration_weeks: durationWeeks,
    items: normalizedItems,
    total_items: totalItems,
  };
}

