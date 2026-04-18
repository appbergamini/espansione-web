import { getServerUser } from '../../../lib/getServerUser';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { generateNarratives } from '../../../lib/relatorio/narrativeGenerator';
import { generatePdfBuffer } from '../../../lib/relatorio/pdfGenerator';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user } = await getServerUser(req, res);
  if (!user) return res.status(401).json({ error: 'Não autenticado' });

  const { projeto_id, email } = req.query;
  if (!email) return res.status(400).json({ error: 'E-mail obrigatório' });

  const db = supabaseAdmin;
  if (!db) return res.status(500).json({ error: 'Servidor não configurado' });

  if (projeto_id) {
    const [{ data: profile }, { data: projeto }] = await Promise.all([
      db.from('profiles').select('empresa_id, role').eq('id', user.id).single(),
      db.from('projetos').select('empresa_id, responsavel_email').eq('id', projeto_id).single(),
    ]);
    if (!projeto) return res.status(404).json({ error: 'Projeto não encontrado' });
    const isMaster = profile?.role === 'master';
    const sameEmpresa = profile?.empresa_id === projeto.empresa_id;
    const isResponsavel = projeto.responsavel_email && projeto.responsavel_email === user.email;
    if (!isMaster && !sameEmpresa && !isResponsavel) {
      return res.status(403).json({ error: 'Acesso negado a este projeto' });
    }
  } else {
    const { data: profile } = await db.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'master') {
      return res.status(403).json({ error: 'projeto_id obrigatório para não-master' });
    }
  }

  try {
    let query = db
      .from('cis_assessments')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1);

    if (projeto_id) query = query.eq('projeto_id', projeto_id);

    const { data: assessment, error } = await query.single();

    if (error || !assessment) {
      return res.status(404).json({ error: 'Mapeamento não encontrado para este e-mail.' });
    }

    const scores = assessment.scores_json;
    const nome = assessment.nome || email.split('@')[0];

    if (!scores || !scores.disc) {
      return res.status(400).json({ error: 'Dados de scores incompletos no assessment.' });
    }

    const narratives = await generateNarratives(nome, scores);
    const pdfBuffer = await generatePdfBuffer({ nome, email, scores, narratives });

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
