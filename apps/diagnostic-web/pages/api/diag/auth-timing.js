// TEMPORÁRIO — mede onde o tempo vai embora nas rotas autenticadas.
// Cada etapa tem timeout próprio: a rota SEMPRE responde. Só milissegundos.
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

const LIMITE = 6000;

export default async function handler(req, res) {
  const t0 = Date.now();
  const m = { regiao: process.env.VERCEL_REGION || null };
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const token = req.headers['x-diag-token'];

  async function etapa(nome, fn) {
    const t = Date.now();
    try { m[nome] = await fn(); } catch (e) { m[nome] = `ERRO: ${String(e.message).slice(0, 60)}`; }
    m[`${nome}_ms`] = Date.now() - t;
  }

  const pega = async (caminho, headers = {}) => {
    const r = await fetch(`${url}${caminho}`, {
      headers: { apikey: anon, ...headers },
      signal: AbortSignal.timeout(LIMITE),
    });
    return r.status;
  };

  // Egress geral, para separar "rede da função" de "serviço do Supabase".
  await etapa('externo', async () => {
    const r = await fetch('https://example.com', { signal: AbortSignal.timeout(LIMITE) });
    return r.status;
  });

  await etapa('rest', async () => {
    const { error } = await supabaseAdmin.from('profiles').select('role').limit(1);
    return error ? `erro: ${error.message.slice(0, 40)}` : 'ok';
  });

  await etapa('auth_health', () => pega('/auth/v1/health'));
  await etapa('auth_settings', () => pega('/auth/v1/settings'));
  await etapa('auth_jwks', () => pega('/auth/v1/.well-known/jwks.json'));
  if (token) await etapa('auth_user', () => pega('/auth/v1/user', { Authorization: `Bearer ${token}` }));

  await etapa('getUser', async () => {
    const supabase = createServerClient(url, anon, {
      cookies: {
        getAll() { return Object.entries(req.cookies || {}).map(([name, value]) => ({ name, value })); },
        setAll() {},
      },
    });
    const p = supabase.auth.getUser();
    const { data, error } = await Promise.race([
      p,
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout 6000ms')), LIMITE)),
    ]);
    return error ? `erro: ${error.message.slice(0, 40)}` : (data?.user ? 'usuario ok' : 'sem sessao');
  });

  m.total_ms = Date.now() - t0;
  return res.status(200).json(m);
}
