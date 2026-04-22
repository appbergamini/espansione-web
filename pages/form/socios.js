import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import FormSocios from '../../components/forms/FormSocios';

export default function FormSociosPage() {
  const router = useRouter();
  // Aceita ?t= (convenção atual dos emails) e ?token= (convenção da spec v4)
  const token = router.query.t || router.query.token || '';

  const [respondente, setRespondente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (!router.isReady) return;
    if (!token) {
      setLoading(false);
      setErro({ tipo: 'sem_token', mensagem: 'Link inválido — token ausente na URL.' });
      return;
    }
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/respondentes/by-token?token=${encodeURIComponent(token)}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Token inválido');
        }
        const json = await res.json();
        if (!active) return;
        const data = json.respondente || json;
        if (data.papel !== 'socios') {
          setErro({
            tipo: 'papel_incorreto',
            mensagem: 'Este link é para sócios. Se você recebeu outro tipo de convite, use o link correto.',
          });
          return;
        }
        if (data.respondido_em) {
          setErro({ tipo: 'ja_respondido', respondido_em: data.respondido_em });
          return;
        }
        setRespondente(data);
      } catch (err) {
        if (!active) return;
        setErro({ tipo: 'token_invalido', mensagem: err.message });
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [router.isReady, token]);

  if (loading) {
    return (
      <>
        <Head><title>Carregando formulário…</title></Head>
        <div style={msgWrapper}>Carregando formulário…</div>
      </>
    );
  }

  if (erro?.tipo === 'ja_respondido') {
    return (
      <>
        <Head><title>Formulário já respondido</title></Head>
        <div style={msgWrapper}>
          <h2 style={{ marginTop: 0 }}>Respostas já registradas</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Este formulário já foi respondido em{' '}
            <strong>{new Date(erro.respondido_em).toLocaleString('pt-BR')}</strong>.
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Se precisar refazer, entre em contato com a consultoria.
          </p>
        </div>
      </>
    );
  }

  if (erro) {
    return (
      <>
        <Head><title>Erro ao carregar formulário</title></Head>
        <div style={msgWrapper}>
          <h2 style={{ marginTop: 0 }}>Não foi possível carregar o formulário</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{erro.mensagem}</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Verifique se o link está correto ou entre em contato com quem enviou o convite.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Levantamento Inicial — {respondente?.projeto_nome || 'Espansione'}</title>
      </Head>
      <FormSocios token={token} respondente={respondente} />
    </>
  );
}

const msgWrapper = {
  maxWidth: 560,
  margin: '5rem auto',
  padding: '2rem',
  textAlign: 'center',
  color: 'var(--text-primary)',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid var(--glass-border)',
  borderRadius: 12,
};
