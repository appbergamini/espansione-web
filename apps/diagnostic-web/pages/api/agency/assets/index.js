import { getServerUser } from '../../../../lib/getServerUser';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { requireAgencyUser } from '../../../../lib/agency/runtime';
import {
  attachCreativeAssetToRun,
  createCreativeAsset,
  createVisualPromptAssetFromStep,
  listCreativeAssetsByBrand,
  listCreativeAssetsByRun,
} from '../../../../lib/agency/creativeAssets';

export default async function handler(req, res) {
  const { user } = await getServerUser(req, res);
  if (!user) return res.status(401).json({ success: false, error: 'Não autenticado' });
  if (!supabaseAdmin) return res.status(500).json({ success: false, error: 'Supabase admin indisponível' });

  try {
    await requireAgencyUser(supabaseAdmin, user);

    if (req.method === 'GET') {
      const {
        brand_id,
        run_id,
        status,
        asset_type,
        request_id,
        search,
      } = req.query || {};

      const filters = {
        status,
        assetType: asset_type,
        agencyRequestId: request_id,
        search,
      };

      const assets = run_id
        ? await listCreativeAssetsByRun(supabaseAdmin, run_id, filters)
        : await listCreativeAssetsByBrand(supabaseAdmin, brand_id, filters);

      return res.status(200).json({ success: true, assets });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      if (body.action === 'save_visual_prompt') {
        const asset = await createVisualPromptAssetFromStep(supabaseAdmin, body.runId || body.run_id, body.sourceStepId || body.source_step_id);
        return res.status(200).json({ success: true, asset });
      }
      if (body.action === 'attach_to_run') {
        const asset = await attachCreativeAssetToRun(supabaseAdmin, body.assetId || body.asset_id, body.runId || body.run_id);
        return res.status(200).json({ success: true, asset });
      }

      const asset = await createCreativeAsset(supabaseAdmin, body);
      return res.status(200).json({ success: true, asset });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('[agency/assets]', error);
    return res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
}
