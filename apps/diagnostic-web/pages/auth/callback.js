import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../lib/supabaseClient';
import Logo from '../../components/Logo';

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState('processing'); // processing | success | error
  const [message, setMessage] = useState('Autenticando via Magic Link...');

  useEffect(() => {
    handleCallback();
  }, []);

  async function handleCallback() {
    try {
      // 1. O Supabase automaticamente processa o token da URL (hash fragment)
      //    e estabelece a sessão. Precisamos aguardar isso completar.
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session) {
        // Pode ser que o token ainda esteja sendo processado.
        // Escuta o evento de auth state change.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          if (event === 'SIGNED_IN' && newSession) {
            subscription.unsubscribe();
            await processUser(newSession.user);
          }
        });

        // Timeout de seguranca: se em 10s nao receber evento, da erro
        setTimeout(() => {
          subscription.unsubscribe();
          setStatus('error');
          setMessage('Tempo esgotado. O link pode ter expirado. Solicite um novo convite.');
        }, 10000);

        return;
      }

      // Sessao ja existe
      await processUser(session.user);

    } catch (err) {
      console.error('Erro no callback:', err);
      setStatus('error');
      setMessage(err.message || 'Erro ao processar autenticacao.');
    }
  }

  async function processUser(user) {
    setMessage('Verificando seu perfil...');

    // 2. Verificar se o profile ja existe
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, empresa_id, role')
      .eq('id', user.id)
      .single();

    if (existingProfile && existingProfile.empresa_id) {
      // Profile ja existe e esta vinculado — tudo certo
      setStatus('success');
      setMessage('Perfil encontrado! Redirecionando...');
      setTimeout(() => router.push('/dashboard'), 1500);
      return;
    }

    // 3. Profile nao existe — o trigger do banco deveria ter criado.
    //    Se nao criou (ex: timing), tentamos criar via client-side como fallback.
    setMessage('Configurando seu acesso...');

    // Buscar convite pendente para este e-mail
    // Nota: precisamos usar uma abordagem diferente porque o RLS pode bloquear
    // a leitura de convites para usuarios sem profile ainda.
    // O trigger do banco (handle_invite_on_signup) deveria ter cuidado disso.
    // Se chegou aqui, vamos tentar buscar o convite via uma API route.

    const res = await fetch('/api/convites/aceitar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, email: user.email }),
    });

    if (res.ok) {
      setStatus('success');
      setMessage('Conta configurada com sucesso! Redirecionando...');
      setTimeout(() => router.push('/dashboard'), 1500);
    } else {
      const data = await res.json().catch(() => ({}));
      // Se nao encontrou convite, pode ser login normal — redireciona pro dashboard
      if (data.error?.includes('convite')) {
        setStatus('error');
        setMessage('Nenhum convite encontrado para o seu e-mail. Solicite um novo convite ao administrador.');
      } else {
        // Usuario existente fazendo login normal via magic link
        setStatus('success');
        setMessage('Autenticado! Redirecionando...');
        setTimeout(() => router.push('/dashboard'), 1500);
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#040812] text-white flex flex-col justify-center items-center p-6">
      <Head>
        <title>Autenticando | Espansione</title>
      </Head>

      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-8">
          <Logo size="lg" center />
        </div>

        <div className="glass-card p-10 animate-fade-in">
          {/* Spinner */}
          {status === 'processing' && (
            <div className="flex justify-center mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Icone de sucesso */}
          {status === 'success' && (
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          )}

          {/* Icone de erro */}
          {status === 'error' && (
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          )}

          <p className={`text-sm ${
            status === 'success' ? 'text-emerald-400' :
            status === 'error' ? 'text-rose-400' :
            'text-slate-400'
          }`}>
            {message}
          </p>

          {status === 'error' && (
            <button
              onClick={() => router.push('/login')}
              className="mt-6 px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-bold transition-all"
            >
              Voltar ao Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
