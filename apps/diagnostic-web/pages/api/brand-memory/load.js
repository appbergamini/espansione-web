import { loadBrandMemory } from '@espansione/brand-memory';
import { getServerUser } from '../../../lib/getServerUser';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

function extractBrandMemoryExport(content = '') {
  const match = content.match(/<brand_memory_export>([\s\S]*?)<\/brand_memory_export>/i);
  if (!match) return null;
  return match[1].trim();
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
      return res.status(400).json({ success: false, error: 'JSON do <brand_memory_export> é inválido.' });
    }

    const diagnostic = parsed.espansione_diagnostic || parsed;
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
