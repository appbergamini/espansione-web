import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import Logo from '../components/Logo';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      router.push(profile?.role === 'master' ? '/adm' : '/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao entrar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#040812] text-white flex flex-col justify-center items-center p-6">
      <Head>
        <title>Login | Espansione</title>
      </Head>

      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size="lg" center />
        </div>

        <div className="glass-card p-8 animate-fade-in">
          <h1 className="text-2xl font-bold mb-2 text-center">Acessar conta</h1>
          <p className="text-slate-400 text-center mb-8 text-sm">Entre com seu e-mail e senha.</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">E-mail</label>
              <input
                required
                type="email"
                placeholder="nome@empresa.com"
                className="w-full bg-[#0a1122] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Senha</label>
              <input
                required
                type="password"
                placeholder="••••••••"
                className="w-full bg-[#0a1122] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Ainda não tem conta?{' '}
            <Link href="/register" className="text-blue-400 hover:underline font-medium">Criar conta</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
