// pages/api/projetos/[id]/preview-check.js
//
// TASK FIX.2 — endpoint auxiliar exclusivo para o modo preview das
// páginas /form/*. Consumido pelo client quando a página detecta
// `?projeto={id}&preview=true` na URL. NÃO valida token — valida
// sessão de usuário admin (getServerUser + profile.role).
//
// Respostas:
//   200 → { success: true, projeto: { id, cliente, tipo_negocio, total_colaboradores? } }
//   401 → não autenticado
//   403 → autenticado mas sem papel admin/master
//   404 → projeto não existe
//
// A UI intencionalmente traduz 401/403 para "esta página não está
// disponível" (mensagem genérica) — não vaza a existência do modo
// preview para quem não tem permissão.

import { verificarSessaoAdmin } from '../../../../lib/auth/verificarSessaoAdmin';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const projetoId = String(req.query.id || '');
  if (!projetoId) {
    return res.status(400).json({ success: false, error: 'projeto_id obrigatório' });
  }

  const admin = await verificarSessaoAdmin(req, res);
  if (!admin) {
    // Não distinguimos 401 vs 403 aqui — a UI trata ambos como
    // "página não disponível". Devolvemos 403 pra diferenciar
    // claramente de by-token (que usa 401/404/410 para tokens).
    return res.status(403).json({ success: false, error: 'Acesso negado' });
  }

  const db = supabaseAdmin;
  const { data: projeto, error } = await db
    .from('projetos')
    .select('id, cliente, nome, tipo_negocio')
    .eq('id', projetoId)
    .maybeSingle();

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
  if (!projeto) {
    return res.status(404).json({ success: false, error: 'Projeto não encontrado' });
  }

  // Contagem de colaboradores (mesma lógica do by-token, usada pelo
  // FormColaboradores pra renderizar avisos condicionais sobre
  // amostras pequenas).
  const { count: totalColaboradores } = await db
    .from('respondentes')
    .select('id', { count: 'exact', head: true })
    .eq('projeto_id', projetoId)
    .eq('papel', 'colaboradores');

  const nomeMarca = projeto.cliente || projeto.nome || '';
  const tipoNegocio = projeto.tipo_negocio || 'B2C';

  return res.status(200).json({
    success: true,
    projeto: {
      id: projeto.id,
      nome_marca: nomeMarca,
      tipo_negocio: tipoNegocio,
      total_colaboradores: typeof totalColaboradores === 'number' ? totalColaboradores : null,
    },
  });
}
