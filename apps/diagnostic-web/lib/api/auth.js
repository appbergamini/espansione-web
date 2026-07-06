// Helpers de autenticação/autorização para rotas de API.
// Reutiliza getServerUser (sessão via cookie) + supabaseAdmin (checagem de role).
// Lançam HttpError (401/403/404) — capturados por createApiHandler.

import { getServerUser } from '../getServerUser';
import { supabaseAdmin } from '../supabaseAdmin';
import { httpErrors } from './http';

const ROLES_ADMIN = ['master', 'admin'];

/** Exige um usuário autenticado. @returns o user. */
export async function requireUser(req, res) {
  const { user } = await getServerUser(req, res);
  if (!user) throw httpErrors.unauthorized();
  return user;
}

/**
 * Exige um usuário com um dos papéis (default: master/admin).
 * @returns { user, profile } — profile tem { role, empresa_id }.
 */
export async function requireRole(req, res, roles = ROLES_ADMIN) {
  const user = await requireUser(req, res);
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role, empresa_id')
    .eq('id', user.id)
    .single();
  if (!profile || !roles.includes(profile.role)) {
    throw httpErrors.forbidden(`Apenas ${roles.join('/')}`);
  }
  return { user, profile };
}

/**
 * Exige acesso a um projeto: master vê tudo; admin só o da sua empresa.
 * @returns { user, profile, projeto }.
 */
export async function requireProjectAccess(req, res, projetoId, { roles = ROLES_ADMIN, select = '*' } = {}) {
  if (!projetoId) throw httpErrors.badRequest('projetoId obrigatório');
  const { user, profile } = await requireRole(req, res, roles);
  const { data: projeto } = await supabaseAdmin
    .from('projetos')
    .select(select)
    .eq('id', projetoId)
    .maybeSingle();
  if (!projeto) throw httpErrors.notFound('Projeto não encontrado');
  if (profile.role === 'admin' && projeto.empresa_id !== profile.empresa_id) {
    throw httpErrors.forbidden();
  }
  return { user, profile, projeto };
}
