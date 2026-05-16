import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import Logo from '../components/Logo';

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    email: '',
    password: '',
    empresaNome: '',
    whatsapp: ''
  });

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Criar a conta no Supabase Auth passando os metadados
      // O gatilho (trigger) no Supabase cuidará de criar a empresa e o perfil automaticamente
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.nomeCompleto,
            company_name: formData.empresaNome, // Isso diz ao gatilho para criar uma nova empresa
            whatsapp: formData.whatsapp
          }
        }
      });

      if (authError) throw authError;

      const user = authData.user;
      if (!user) throw new Error("Erro ao criar usuário.");

      // Se o email não foi confirmado ainda (se habilitado no Supabase), avisar
      if (authData.session) {
        alert("Conta criada com sucesso!");
        router.push('/dashboard');
      } else {
        alert("Conta pré-cadastrada! Se o e-mail de confirmação estiver ativado, por favor verifique sua caixa de entrada.");
        router.push('/login');
      }

    } catch (err) {
      setErrorMsg(err.message || 'Ocorreu um erro no registro.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#040812] text-white flex flex-col justify-center items-center p-6">
      <Head>
        <title>Registro | Espansione</title>
      </Head>

      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size="lg" center />
        </div>

        <div className="glass-card p-8 animate-fade-in">
          <h1 className="text-2xl font-bold mb-2 text-center">Comece sua expansão</h1>
          <p className="text-slate-400 text-center mb-8 text-sm">Crie sua conta e configure sua empresa em segundos.</p>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Seu Nome</label>
              <input
                required
                type="text"
                placeholder="Ex: João Silva"
                className="w-full bg-[#0a1122] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
                value={formData.nomeCompleto}
                onChange={(e) => setFormData({...formData, nomeCompleto: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">WhatsApp</label>
              <input
                required
                type="tel"
                placeholder="(00) 00000-0000"
                className="w-full bg-[#0a1122] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
                value={formData.whatsapp}
                onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Nome da Empresa</label>
              <input
                required
                type="text"
                placeholder="Ex: Espansione Digital"
                className="w-full bg-[#0a1122] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
                value={formData.empresaNome}
                onChange={(e) => setFormData({...formData, empresaNome: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">E-mail Corporativo</label>
              <input
                required
                type="email"
                placeholder="nome@empresa.com"
                className="w-full bg-[#0a1122] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Senha</label>
              <input
                required
                type="password"
                placeholder="••••••••"
                className="w-full bg-[#0a1122] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
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
              {loading ? 'Sincronizando...' : 'Criar Conta e Empresa'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Já possui uma conta?{' '}
            <Link href="/login" className="text-blue-400 hover:underline font-medium">Fazer Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
