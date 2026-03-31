import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Logo from '../components/Logo';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState(1); // 1 = Email, 2 = PIN
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const requestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    // Supabase signInWithOtp enviará o Magic Link e o PIN (Token 6-digitos)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false // O recomendado é que o email já exista no Supabase ou aceite nativamente
      }
    });

    if (error) {
      if (error.message.includes('Signups not allowed')) {
          setErrorMsg('Cadastro não habilitado. Apenas e-mails autorizados.');
      } else {
          setErrorMsg(error.message);
      }
    } else {
      setStep(2);
    }
    setLoading(false);
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: pin,
      type: 'email'
    });

    if (error) {
      setErrorMsg('PIN incorreto ou expirado. Tente novamente.');
      setLoading(false);
    } else {
      // Sessão ativada (O Cookie é setado automaticamente pelo SSR client)
      router.push('/adm');
    }
  };

  return (
    <>
      <Head>
        <title>Espansione | Login</title>
      </Head>
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', paddingTop: '0' }}>
        <div className="container" style={{ maxWidth: '450px', width: '100%', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Logo size="lg" />
            <h1 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontSize: '1.5rem' }}>Acesso Restrito</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Painel de Controle Espansione</p>
          </div>

          <div className="glass-card animate-fade-in" style={{ padding: '2.5rem 2rem' }}>
            
            {errorMsg && (
              <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--brand-red)', borderRadius: '6px', color: 'var(--brand-red)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                {errorMsg}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={requestOTP}>
                <div className="form-group">
                  <label>E-mail Corporativo</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="voce@espansione.com" 
                    required 
                    autoComplete="email"
                  />
                </div>
                <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
                  {loading ? 'Enviando...' : 'Receber Código de Acesso'}
                </button>
              </form>
            ) : (
              <form onSubmit={verifyOTP}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem', textAlign: 'center' }}>
                  Enviamos um código de 6 dígitos para o e-mail: <strong style={{color: '#fff'}}>{email}</strong>
                </p>
                <div className="form-group">
                  <label>Código PIN (6 Dígitos)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={pin} 
                    onChange={e => setPin(e.target.value)} 
                    placeholder="000000"
                    maxLength={6}
                    style={{ textAlign: 'center', letterSpacing: '0.2rem', fontSize: '1.5rem' }}
                    required 
                    autoComplete="one-time-code"
                  />
                </div>
                <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem', marginBottom: '1rem' }}>
                  {loading ? 'Verificando...' : 'Acessar Painel'}
                </button>
                <div style={{ textAlign: 'center' }}>
                  <button type="button" onClick={() => setStep(1)} style={{ background: 'transparent', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: '0.9rem' }}>
                    &larr; Usar outro e-mail
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
