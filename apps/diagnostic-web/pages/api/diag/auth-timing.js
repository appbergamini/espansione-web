// TEMPORÁRIO — mede onde o tempo vai embora nas rotas autenticadas.
// Cada etapa tem timeout próprio: a rota SEMPRE responde, mesmo com o
// Supabase pendurado. Devolve só milissegundos, sem dados sensíveis.
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

const LIMITE = 6000;

function comLimite(promessa, ms = LIMITE) {
  return Promise.race([
    promessa,
    new Promise((_, rej) => setTimeout(() => rej(new Error(`timeout ${ms}ms`)), ms)),
  ]);
}

export default async function handler(req, res) {
  const t0 = Date.now();
  const m = { regiao: process.env.VERCEL_REGION || null };
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  async function etapa(nome, fn) {
    const t = Date.now();
    try { m[nome] = await comLimite(fn()); } catch (e) { m[nome] = `ERRO: ${String(e.message).slice(0, 70)}`; }
    m[`${nome}_ms`] = Date.now() - t;
  }

  await etapa('health', async () => {
    const r = await fetch(`${url}/auth/v1/health`, { headers: { apikey: anon }, signal: AbortSignal.timeout(LIMITE) });
    return r.status;
  });

  await etapa('rest', async () => {
    const { error } = await supabaseAdmin.from('profiles').select('role').limit(1);
    return error ? `erro: ${error.message.slice(0, 40)}` : 'ok';
  });

  await etapa('getUser', async () => {
    const supabase = createServerClient(url, anon, {
      cookies: {
        getAll() { return Object.entries(req.cookies || {}).map(([name, value]) => ({ name, value })); },
        setAll() {},
      },
    });
    const { data, error } = await supabase.auth.getUser();
    return error ? `erro: ${error.message.slice(0, 40)}` : (data?.user ? 'usuario ok' : 'sem sessao');
  });

  m.total_ms = Date.now() - t0;
  return res.status(200).json(m);
}
