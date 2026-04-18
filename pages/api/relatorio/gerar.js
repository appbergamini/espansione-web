import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { generateNarratives } from '../../../lib/relatorio/narrativeGenerator';
import { generatePdfBuffer } from '../../../lib/relatorio/pdfGenerator';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { projeto_id, email } = req.query;
  if (!email) {
    return res.status(400).json({ error: 'E-mail obrigatório' });
  }

  const db = supabaseAdmin;
  if (!db) {
    return res.status(500).json({ error: 'Servidor não configurado' });
  }

  try {
    // Buscar assessment do participante
    let query = db
      .from('cis_assessments')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1);

    if (projeto_id) {
      query = query.eq('projeto_id', projeto_id);
    }

    const { data: assessment, error } = await query.single();

    if (error || !assessment) {
      return res.status(404).json({ error: 'Mapeamento não encontrado para este e-mail.' });
    }

    // Reconstruir scores a partir dos dados salvos
    const scores = assessment.scores_json;
    const nome = assessment.nome || email.split('@')[0];

    if (!scores || !scores.disc) {
      return res.status(400).json({ error: 'Dados de scores incompletos no assessment.' });
    }

    // Gerar narrativas
    const narratives = await generateNarratives(nome, scores);

    // Gerar PDF
    const pdfBuffer = await generatePdfBuffer({ nome, email, scores, narratives });

    // Retornar como download
    const fileName = `Espansione_Perfil_${nome.replace(/\s+/g, '_')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);

  } catch (err) {
    console.error('[RELATORIO/GERAR] Erro:', err);
    return res.status(500).json({ error: err.message });
  }
}
