import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import FormColaboradores from '../../components/forms/FormColaboradores';

export default function FormColaboradoresPage() {
  const router = useRouter();
  const token = router.query.t || router.query.token || '';

  const [projetoId, setProjetoId] = useState(null);
  const [projetoNome, setProjetoNome] = useState('');
  const [totalColaboradores, setTotalColaboradores] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (!router.isReady) return;
    if (!token) {
      setLoading(false);
      setErro({
        tipo: 'TOKEN_AUSENTE',
        mensagem: 'Link inválido — token ausente na URL. Solicite um novo convite ao administrador do projeto.',
      });
      return;
    }
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/respondentes/by-token?token=${encodeURIComponent(token)}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          const tipo =
            res.status === 410 ? 'TOKEN_EXPIRADO' :
            res.status === 404 ? 'TOKEN_NAO_EXISTE' :
            'TOKEN_NAO_EXISTE';
          if (!active) return;
          setErro({
            tipo: err.codigo || tipo,
            mensagem: err.mensagem || err.error || 'Link inválido. Solicite um novo convite.',
          });
          return;
        }
        const json = await res.json();
        if (!active) return;
        const data = json.respondente || json;
        if (data.papel !== 'colaboradores') {
          setErro({
            tipo: 'papel_incorreto',
            mensagem: 'Este link é para pesquisa interna com colaboradores. Se você recebeu outro tipo de convite, use o link correto.',
          });
          return;
        }
        if (data.respondido_em) {
          setErro({ tipo: 'ja_respondido', respondido_em: data.respondido_em });
          return;
        }
        // Anonimato: não guardamos nome/e-mail do respondente — só o projetoId.
        setProjetoId(data.projeto_id);
        setProjetoNome(json.projeto?.nome_marca || data.projeto_nome || '');
        if (typeof json.projeto?.total_colaboradores === 'number') {
          setTotalColaboradores(json.projeto.total_colaboradores);
        }
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
            Você já respondeu esta pesquisa. Obrigada pela contribuição!
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
        <title>{projetoNome ? `Pesquisa Interna — ${projetoNome}` : 'Pesquisa Interna'}</title>
      </Head>
      <FormColaboradores token={token} projetoId={projetoId} totalColaboradores={totalColaboradores} />
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
