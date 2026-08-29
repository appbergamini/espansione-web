// TEMPORÁRIO — mede onde o tempo vai embora nas rotas autenticadas.
// Sem dados sensíveis: devolve só milissegundos por etapa.
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export default async function handler(req, res) {
  const t0 = Date.now();
  const marcos = {};
  const marca = (nome, desde) => { marcos[nome] = Date.now() - desde; };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 1) alcance da rede: um GET simples no auth
  let t = Date.now();
  try {
    const r = await fetch(`${url}/auth/v1/health`, { headers: { apikey: anon } });
    marca('health', t); marcos.health_status = r.status;
  } catch (e) { marca('health', t); marcos.health_erro = String(e.message).slice(0, 80); }

  // 2) getUser() via cookie — o suspeito
  t = Date.now();
  let user = null;
  try {
    const supabase = createServerClient(url, anon, {
      cookies: {
        getAll() { return Object.entries(req.cookies || {}).map(([name, value]) => ({ name, value })); },
        setAll() {},
      },
    });
    const { data, error } = await supabase.auth.getUser();
    user = data?.user || null;
    marca('getUser', t);
    marcos.getUser_ok = !!user;
    if (error) marcos.getUser_erro = String(error.message).slice(0, 80);
  } catch (e) { marca('getUser', t); marcos.getUser_erro = String(e.message).slice(0, 80); }

  // 3) consulta em profiles com a service role
  t = Date.now();
  try {
    const { error } = await supabaseAdmin.from('profiles').select('role').limit(1);
    marca('profiles', t);
    if (error) marcos.profiles_erro = String(error.message).slice(0, 80);
  } catch (e) { marca('profiles', t); marcos.profiles_erro = String(e.message).slice(0, 80); }

  marcos.total = Date.now() - t0;
  marcos.regiao = process.env.VERCEL_REGION || null;
  return res.status(200).json(marcos);
}
