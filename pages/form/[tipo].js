import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Logo from '../../components/Logo';

// Uma casca genérica que pode carregar lógicas específicas de React por Form (Propósito será um Chat, Clima será questionário)
export default function FormDinamico() {
  const router = useRouter();
  const { tipo, projeto } = router.query;
  const [respostas, setRespostas] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // POST para a API (que chamará db.saveFormulario)
      const res = await fetch('/api/formularios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projetoId: projeto,
          tipo: tipo,
          respostas
        })
      });
      if (res.ok) setSuccess(true);
    } catch(err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getFormTitle = () => {
    if (tipo === 'proposito') return 'Exercício de Propósito (Agente P)';
    if (tipo === 'colaboradores') return 'Pesquisa de Clima e Cultura';
    if (tipo === 'externo') return 'Pesquisa de Marca Externa';
    return `Formulário: ${tipo}`;
  };

  if (!router.isReady) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando formulário...</div>;
  }

  if (!tipo || !projeto) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--error)', marginBottom: '1rem' }}>Link Inválido</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Este formulário requer um código de projeto válido para ser preenchido.<br/>
          Certifique-se de que você acessou o link correto fornecido pela plataforma.<br/><br/>
          Exemplo esperado na URL: <code style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>?projeto=codigo-do-projeto</code>
        </p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Espansione | {getFormTitle()}</title>
      </Head>
      <div className="page-container" style={{ paddingTop: '2rem' }}>
        <main className="container" style={{ maxWidth: '800px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
            <Logo size="md" showTagline={false} center={true} />
          </div>
          <div className="glass-card animate-fade-in">
            <h1 style={{ marginBottom: '1rem', color: 'var(--accent-purple)' }}>{getFormTitle()}</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Por favor, preencha as informações do formulário para o projeto <strong>{projeto}</strong>.
            </p>

            {success ? (
              <div style={{ background: 'var(--bg-tertiary)', padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
                <h3 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>Respostas submetidas com sucesso!</h3>
                <p>O Consultor de IA foi notificado.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Como você se identifica? (Opcional)</label>
                  <input className="form-input" 
                         onChange={(e) => setRespostas({...respostas, respondente: e.target.value})} 
                         placeholder="Ex: Funcionario anonimo, Fundador..." />
                </div>
                
                {/* Campos fictícios dinâmicos - A lógica completa renderizará via array num JSON em produção */}
                <div className="form-group">
                  <label>Quais são os principais diferenciais que você nota internamente?</label>
                  <textarea className="form-input" rows="4" 
                            onChange={(e) => setRespostas({...respostas, q1: e.target.value})} 
                            required></textarea>
                </div>
                
                <button className="btn-primary" type="submit" disabled={submitting}>
                  {submitting ? "Enviando..." : "Submeter Pesquisa"}
                </button>
              </form>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
