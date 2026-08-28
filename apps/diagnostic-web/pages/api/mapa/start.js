// POST /api/mapa/start — PÚBLICO (funil de captação)
// Body: { cadastro: { nome, empresa, papel, porte, segmento, contato } }
// Cria uma avaliação-lead SEM projeto (projeto_id null) e devolve o token.
// O comercial converte o lead em projeto depois (projeto_id preenchido).

import crypto from 'crypto';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { CADASTRO_MATURIDADE } from '../../../lib/mapa-maturidade/catalog';
import { sanitizarUtms } from '../../../lib/marketing/utm';
import { whatsappValido } from '../../../lib/whatsapp/phone';

function gerarToken() {
  return crypto.randomBytes(24).toString('hex');
}

// campos essenciais do lead (os demais do cadastro são opcionais)
const ESSENCIAIS = ['CAD-MM-001', 'CAD-MM-002']; // nome e empresa

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  if (!supabaseAdmin) {
    return res.status(500).json({ success: false, error: 'Supabase indisponível' });
  }
  const db = supabaseAdmin;

  const cadastro = req.body?.cadastro;
  if (!cadastro || typeof cadastro !== 'object') {
    return res.status(400).json({ success: false, error: 'cadastro obrigatório' });
  }

  // valida os essenciais (por ID de campo do catálogo)
  const faltando = ESSENCIAIS.filter((id) => !String(cadastro[id] || '').trim());
  if (faltando.length) {
    return res.status(422).json({ success: false, error: 'Preencha nome e empresa', faltando });
  }
  if (!whatsappValido(cadastro['CAD-MM-006'])) {
    return res.status(422).json({ success: false, error: 'Informe um WhatsApp válido com DDD', faltando: ['CAD-MM-006'] });
  }

  // mantém só chaves conhecidas do cadastro (sanitização)
  const idsValidos = new Set(CADASTRO_MATURIDADE.map((c) => c.id));
  const limpo = {};
  for (const [k, v] of Object.entries(cadastro)) {
    if (idsValidos.has(k)) limpo[k] = typeof v === 'string' ? v.trim() : v;
  }
  limpo.empresa = limpo['CAD-MM-002'] || null; // atalho legível p/ listagens
  const utms = sanitizarUtms(req.body?.utm);

  const token = gerarToken();
  const { data: nova, error } = await db
    .from('mapa_assessments')
    .insert([
      {
        projeto_id: null,
        token,
        status: 'em_andamento',
        started_at: new Date().toISOString(),
        cadastro_json: limpo,
        extras_json: Object.keys(utms).length
          ? { acquisition: { ...utms, captured_at: new Date().toISOString() } }
          : {},
      },
    ])
    .select('id, token, status')
    .single();
  if (error) {
    console.error('[mapa/start]', error);
    return res.status(500).json({ success: false, error: 'Erro ao iniciar o check-up' });
  }

  return res.status(201).json({ success: true, token: nova.token, link: `/mapa/${nova.token}` });
}
