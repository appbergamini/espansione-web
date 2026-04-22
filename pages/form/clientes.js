import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import FormClientes from '../../components/forms/FormClientes';

export default function FormClientesPage() {
  const router = useRouter();
  const token = router.query.t || router.query.token || '';

  const [respondente, setRespondente] = useState(null);
  const [projetoMeta, setProjetoMeta] = useState(null);
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
        if (data.papel !== 'clientes') {
          setErro({
            tipo: 'papel_incorreto',
            mensagem: 'Este link é para clientes. Se você recebeu outro tipo de convite, use o link correto.',
          });
          return;
        }
        if (data.respondido_em) {
          setErro({ tipo: 'ja_respondido', respondido_em: data.respondido_em });
          return;
        }
        setRespondente(data);
        setProjetoMeta(json.projeto || { nome_marca: data.projeto_nome || 'nossa marca', tipo_negocio: 'B2C' });
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
        <Head><title>Carregando pesquisa…</title></Head>
        <div style={msgBox}>Carregando pesquisa…</div>
      </>
    );
  }

  if (erro?.tipo === 'ja_respondido') {
    return (
      <>
        <Head><title>Pesquisa já respondida</title></Head>
        <div style={msgBox}>
          <h2 style={{ marginTop: 0 }}>Respostas já registradas</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Obrigada! Suas respostas já foram recebidas em{' '}
            <strong>{new Date(erro.respondido_em).toLocaleString('pt-BR')}</strong>.
          </p>
        </div>
      </>
    );
  }

  if (erro) {
    return (
      <>
        <Head><title>Erro ao carregar pesquisa</title></Head>
        <div style={msgBox}>
          <h2 style={{ marginTop: 0 }}>Não foi possível abrir o formulário</h2>
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
        <title>Pesquisa de Percepção — {projetoMeta?.nome_marca || 'Espansione'}</title>
      </Head>
      <FormClientes token={token} respondente={respondente} projetoMeta={projetoMeta} />
    </>
  );
}

const msgBox = {
  maxWidth: 560,
  margin: '5rem auto',
  padding: '2rem',
  textAlign: 'center',
  color: 'var(--text-primary)',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid var(--glass-border)',
  borderRadius: 12,
};
