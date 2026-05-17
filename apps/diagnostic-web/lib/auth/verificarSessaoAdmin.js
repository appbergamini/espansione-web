// lib/auth/verificarSessaoAdmin.js
//
// TASK FIX.2 — helper que verifica se há sessão de usuário com papel
// 'master' ou 'admin' ativa. Mesmo padrão usado em toda rota /adm/*
// (pages/adm/[id]/outputs/[stage].js, pages/adm/[id]/deliverable.js,
// pages/api/outputs/[projetoId]/[stage]/pdf.js, etc.): getServerUser
// → profiles.role.
//
// Retorna { user, profile } quando autorizado, null caso contrário.
// Não lança — deixa o chamador decidir a resposta HTTP.

import { getServerUser } from '../getServerUser';
import { supabaseAdmin } from '../supabaseAdmin';

const PAPEIS_ADMIN = new Set(['master', 'admin']);

/**
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 * @returns {Promise<{ user: object, profile: { role: string } } | null>}
 */
export async function verificarSessaoAdmin(req, res) {
  const { user } = await getServerUser(req, res);
  if (!user) return null;

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || !PAPEIS_ADMIN.has(profile.role)) return null;

  return { user, profile };
}
