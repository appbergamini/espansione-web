// POST /api/mapa/create  — admin (master/admin)
// Body: { projeto_id, novo? }
// Cria (ou recupera) a avaliação do Mapa de Maturidade de um projeto e
// devolve o token + link público de convite. Idempotente por padrão:
// retorna a avaliação mais recente do projeto; com `novo:true` força uma nova.

import crypto from 'crypto';
import { getServerUser } from '../../../lib/getServerUser';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

function gerarToken() {
  return crypto.randomBytes(24).toString('hex'); // 48 chars hex
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  if (!supabaseAdmin) {
    return res.status(500).json({ success: false, error: 'Supabase indisponível' });
  }

  const { user } = await getServerUser(req, res);
  if (!user) return res.status(401).json({ success: false, error: 'Não autenticado' });

  const db = supabaseAdmin;
  const { data: profile } = await db
    .from('profiles')
    .select('role,empresa_id')
    .eq('id', user.id)
    .single();
  if (!profile || !['master', 'admin'].includes(profile.role)) {
    return res.status(403).json({ success: false, error: 'Apenas master/admin' });
  }

  const { projeto_id, novo } = req.body || {};
  if (!projeto_id) return res.status(400).json({ success: false, error: 'projeto_id obrigatório' });

  // admin só mexe na própria empresa
  const { data: proj } = await db
    .from('projetos')
    .select('id, empresa_id, cliente')
    .eq('id', projeto_id)
    .single();
  if (!proj) return res.status(404).json({ success: false, error: 'Projeto não encontrado' });
  if (profile.role === 'admin' && proj.empresa_id !== profile.empresa_id) {
    return res.status(403).json({ success: false, error: 'Projeto de outra empresa' });
  }

  try {
    if (!novo) {
      const { data: existente } = await db
        .from('mapa_assessments')
        .select('id, token, status')
        .eq('projeto_id', projeto_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (existente) {
        return res.status(200).json({
          success: true,
          created: false,
          assessment: existente,
          link: `/mapa/${existente.token}`,
        });
      }
    }

    const token = gerarToken();
    const { data: nova, error } = await db
      .from('mapa_assessments')
      .insert([{ projeto_id, token, status: 'pendente' }])
      .select('id, token, status')
      .single();
    if (error) throw error;

    return res.status(201).json({
      success: true,
      created: true,
      assessment: nova,
      link: `/mapa/${nova.token}`,
    });
  } catch (e) {
    console.error('[mapa/create]', e);
    return res.status(500).json({ success: false, error: e.message || 'Erro ao criar avaliação' });
  }
}
