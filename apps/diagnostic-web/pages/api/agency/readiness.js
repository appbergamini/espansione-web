import { getServerUser } from '../../../lib/getServerUser';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import {
  getAgencyReadiness,
  requireAgencyUser,
  resolveBrandContext,
} from '../../../lib/agency/runtime';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { user } = await getServerUser(req, res);
  if (!user) return res.status(401).json({ success: false, error: 'Não autenticado' });
  if (!supabaseAdmin) return res.status(500).json({ success: false, error: 'Supabase admin indisponível' });

  try {
    await requireAgencyUser(supabaseAdmin, user);

    const { projeto_id, brand_id } = req.query || {};
    const { brand, projeto } = await resolveBrandContext(supabaseAdmin, {
      projetoId: projeto_id,
      brandId: brand_id,
    });
    const { readiness, brandKernel } = await getAgencyReadiness(supabaseAdmin, brand?.id);

    return res.status(200).json({
      success: true,
      projeto,
      brand,
      readiness,
      audienceOptions: brandKernel
        ? [...brandKernel.audience.clusters, ...brandKernel.audience.personas]
        : [],
      brandKernelPreview: brandKernel
        ? {
            strategy: brandKernel.strategy,
            audience: brandKernel.audience,
            voice: brandKernel.voice,
            visual: brandKernel.visual,
            communication: brandKernel.communication,
          }
        : null,
    });
  } catch (error) {
    console.error('[agency/readiness]', error);
    return res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
}

