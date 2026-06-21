import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import Logo from '../components/Logo';

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [ready, setReady] = useState(false);
  const [noSession, setNoSession] = useState(false);

  useEffect(() => {
    // O app usa PKCE: o link de recuperação volta com `?code=` (não `#access_token`).
    // O cliente @supabase/ssr troca o code por sessão automaticamente (detectSessionInUrl)
    // e dispara PASSWORD_RECOVERY/SIGNED_IN. Tratamos os 3 cenários: erro (link
    // expirado/consumido), code/token presente (aguardar troca) e sem nada (link inválido).
    let cancelled = false;
    const q = new URLSearchParams(window.location.search);
    const h = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const temErro = q.get('error') || q.get('error_code') || h.get('error') || h.get('error_code');
    const temCode = !!q.get('code');
    const temHashToken = window.location.hash.includes('access_token');

    if (temErro) { setNoSession(true); return; }

    const marcarPronto = () => { if (!cancelled) setReady(true); };

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || session) marcarPronto();
    });

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data?.session) marcarPronto();
      else if (!temCode && !temHashToken) setNoSession(true); // sem sessão e sem token → inválido
      // com code/token: o cliente troca sozinho; aguardamos o evento (+ fallback abaixo).
    });

    // fallback: se a troca não resolver em 7s (code consumido/inválido), mostra erro amigável
    const timer = setTimeout(() => {
      if (cancelled) return;
      supabase.auth.getSession().then(({ data }) => {
        if (!cancelled && !data?.session) setNoSession(true);
      });
    }, 7000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 8) {
      setErrorMsg('A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      setErrorMsg('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const adminRoles = ['master', 'admin'];
      router.replace(adminRoles.includes(profile?.role) ? '/adm' : '/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao redefinir senha.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#040812] text-white flex flex-col justify-center items-center p-6">
      <Head>
        <title>Nova senha | Espansione</title>
      </Head>

      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size="lg" center />
        </div>

        <div className="glass-card p-8 animate-fade-in">
          <h1 className="text-2xl font-bold mb-2 text-center">Definir nova senha</h1>
          <p className="text-slate-400 text-center mb-8 text-sm">
            Escolha uma senha com pelo menos 8 caracteres.
          </p>

          {noSession ? (
            <div className="space-y-6">
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-lg text-sm text-center">
                Link inválido ou expirado. Solicite um novo link de recuperação.
              </div>
              <Link
                href="/forgot-password"
                className="block w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/40 text-center"
              >
                Solicitar novo link
              </Link>
            </div>
          ) : !ready ? (
            <div className="text-center text-slate-400 text-sm py-4">Validando link…</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Nova senha</label>
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-[#0a1122] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Confirmar senha</label>
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-[#0a1122] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>

              {errorMsg && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs text-center">
                  {errorMsg}
                </div>
              )}

              <button
                disabled={loading}
                type="submit"
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/40"
              >
                {loading ? 'Salvando...' : 'Redefinir senha'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
