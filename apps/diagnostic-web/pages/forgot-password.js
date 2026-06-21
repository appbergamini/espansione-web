import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import Logo from '../components/Logo';

// Recuperação de senha por CÓDIGO de 6 dígitos (verifyOtp type=recovery).
// Imune a scanners de e-mail / re-clique que invalidam o magic link.
// O e-mail traz o código (e o link como alternativa → /reset-password).

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState('email'); // email | code
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function enviarCodigo(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
      if (error) throw error;
      setStep('code');
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao enviar o código de recuperação.');
    } finally {
      setLoading(false);
    }
  }

  async function redefinir(e) {
    e.preventDefault();
    setErrorMsg('');
    const codigo = code.replace(/\D/g, '').trim();
    if (codigo.length < 6) { setErrorMsg('Digite o código de 6 dígitos enviado por e-mail.'); return; }
    if (password.length < 8) { setErrorMsg('A senha deve ter pelo menos 8 caracteres.'); return; }
    if (password !== confirm) { setErrorMsg('As senhas não coincidem.'); return; }

    setLoading(true);
    try {
      const { error: otpErr } = await supabase.auth.verifyOtp({ email: email.trim(), token: codigo, type: 'recovery' });
      if (otpErr) throw new Error('Código inválido ou expirado. Confira o código ou solicite um novo.');

      const { error: upErr } = await supabase.auth.updateUser({ password });
      if (upErr) throw upErr;

      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      const adminRoles = ['master', 'admin'];
      router.replace(adminRoles.includes(profile?.role) ? '/adm' : '/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao redefinir a senha.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#040812] text-white flex flex-col justify-center items-center p-6">
      <Head><title>Recuperar senha | Espansione</title></Head>

      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8"><Logo size="lg" center /></div>

        <div className="glass-card p-8 animate-fade-in">
          <h1 className="text-2xl font-bold mb-2 text-center">Recuperar senha</h1>

          {step === 'email' ? (
            <>
              <p className="text-slate-400 text-center mb-8 text-sm">
                Informe seu e-mail e enviaremos um código para redefinir a senha.
              </p>
              <form onSubmit={enviarCodigo} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">E-mail</label>
                  <input
                    required type="email" placeholder="nome@empresa.com"
                    className="w-full bg-[#0a1122] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {errorMsg && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs text-center">{errorMsg}</div>}
                <button disabled={loading} type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/40">
                  {loading ? 'Enviando...' : 'Enviar código'}
                </button>
              </form>
            </>
          ) : (
            <>
              <p className="text-slate-400 text-center mb-6 text-sm">
                Enviamos um código de 6 dígitos para <strong>{email}</strong>. Digite o código e a nova senha.
                <br />Confira também a pasta de spam.
              </p>
              <form onSubmit={redefinir} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Código</label>
                  <input
                    required inputMode="numeric" maxLength={6} placeholder="000000"
                    className="w-full bg-[#0a1122] border border-slate-800 rounded-xl px-4 py-3 text-center text-lg tracking-[0.5em] font-mono focus:border-blue-500 outline-none transition-all"
                    value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Nova senha</label>
                  <input required type="password" placeholder="••••••••" className="w-full bg-[#0a1122] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Confirmar senha</label>
                  <input required type="password" placeholder="••••••••" className="w-full bg-[#0a1122] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                </div>
                {errorMsg && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs text-center">{errorMsg}</div>}
                <button disabled={loading} type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/40">
                  {loading ? 'Redefinindo...' : 'Redefinir senha'}
                </button>
                <button type="button" onClick={enviarCodigo} disabled={loading} className="w-full text-xs text-slate-500 hover:text-slate-300">
                  Não recebeu? Reenviar código
                </button>
              </form>
            </>
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
