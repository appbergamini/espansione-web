import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import FormSocios from '../../components/forms/FormSocios';
import PreviewBanner from '../../components/forms/shared/PreviewBanner';

export default function FormSociosPage() {
  const router = useRouter();
  // Aceita ?t= (convenção atual dos emails) e ?token= (convenção da spec v4)
  const token = router.query.t || router.query.token || '';
  // Modo preview (TASK FIX.2): admin usa ?projeto={id}&preview=true
  // pra inspeção visual; validação é por sessão, não por token.
  const projetoQuery = router.query.projeto || '';
  const modoPreview = router.query.preview === 'true' && !!projetoQuery;

  const [respondente, setRespondente] = useState(null);
  const [projetoMeta, setProjetoMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (!router.isReady) return;

    // ─── Fluxo preview (admin autenticado) ─────────────────────────
    if (modoPreview) {
      let active = true;
      (async () => {
        try {
          const res = await fetch(`/api/projetos/${encodeURIComponent(projetoQuery)}/preview-check`);
          if (!res.ok) {
            if (!active) return;
            // Mensagem genérica — não revela a existência do modo
            // preview pra quem não tem permissão.
            setErro({
              tipo: 'PREVIEW_NEGADO',
              mensagem: 'Esta página não está disponível. Se você foi convidado a responder, use o link recebido por email.',
            });
            return;
          }
          const json = await res.json();
          if (!active) return;
          setProjetoMeta(json.projeto || null);
          // Respondente sintético — só dados pra UI do formulário
          // mostrar "Respondendo como: Pré-visualização".
          setRespondente({
            id: null,
            projeto_id: projetoQuery,
            nome: 'Pré-visualização',
            email: 'preview@espansione.local',
            papel: 'socios',
            status_convite: 'pendente',
            respondido_em: null,
            projeto_nome: json.projeto?.nome_marca || '',
          });
        } catch (err) {
          if (!active) return;
          setErro({ tipo: 'PREVIEW_ERRO', mensagem: err.message });
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => { active = false; };
    }

    // ─── Fluxo normal (respondente com token) ──────────────────────
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
          // Distingue ausente / inexistente / expirado pelo status HTTP
          // (400 / 404 / 410) e pelo codigo no body (TASK FIX.1).
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
  }, [router.isReady, token, modoPreview, projetoQuery]);

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
        <title>
          {modoPreview ? 'Pré-visualização — ' : ''}
          Levantamento Inicial — {respondente?.projeto_nome || projetoMeta?.nome_marca || 'Espansione'}
        </title>
      </Head>
      {modoPreview && (
        <PreviewBanner
          tipo="sócios"
          nomeMarca={projetoMeta?.nome_marca || respondente?.projeto_nome}
        />
      )}
      <FormSocios
        token={modoPreview ? '__preview__' : token}
        respondente={respondente}
        modoPreview={modoPreview}
      />
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
