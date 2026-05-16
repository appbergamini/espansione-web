import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import Logo from '../components/Logo';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao enviar link de recuperação.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#040812] text-white flex flex-col justify-center items-center p-6">
      <Head>
        <title>Recuperar senha | Espansione</title>
      </Head>

      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size="lg" center />
        </div>

        <div className="glass-card p-8 animate-fade-in">
          <h1 className="text-2xl font-bold mb-2 text-center">Recuperar senha</h1>
          <p className="text-slate-400 text-center mb-8 text-sm">
            Informe seu e-mail e enviaremos um link para redefinir a senha.
          </p>

          {sent ? (
            <div className="space-y-6">
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-4 rounded-lg text-sm text-center">
                Link enviado para <strong>{email}</strong>. Confira sua caixa de entrada (e a pasta de spam).
              </div>
              <Link
                href="/login"
                className="block w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/40 text-center"
              >
                Voltar ao login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
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
                {loading ? 'Enviando...' : 'Enviar link de recuperação'}
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-slate-500">
            Lembrou a senha?{' '}
            <Link href="/login" className="text-blue-400 hover:underline font-medium">Fazer login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
