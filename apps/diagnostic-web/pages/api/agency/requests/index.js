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
      const payload = {
        brand_id: brand.id,
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
        created_by: user.id,
      };

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

