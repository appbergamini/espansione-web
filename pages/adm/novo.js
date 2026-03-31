import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Logo from '../components/Logo';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const formData = new FormData(e.target);
    const campos = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/projetos/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campos)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro na API');
      
      if (data.success && data.projetoId) {
        // Redireciona diretamente para o Painel de Controle daquele projeto
        router.push(`/adm/${data.projetoId}`);
      } else {
        setErrorMsg(data.error || "Erro desconhecido ao processar.");
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Espansione | Nova Estratégia</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="page-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <main className="container" style={{ maxWidth: '450px', width: '100%', margin: '0 auto', paddingTop: '0' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="animate-fade-in" style={{ marginBottom: '1.5rem' }}>
              <Logo size="lg" showTagline={true} center={true} />
            </div>
          </div>

          <div className="glass-card animate-fade-in" style={{ animationDelay: '0.1s', padding: '2.5rem 2rem' }}>
            <h2 style={{ marginBottom: '0.5rem', color: 'var(--accent-blue)', textAlign: 'center' }}>Novo Projeto</h2>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2rem', fontSize: '0.95rem' }}>
              Crie a célula do cliente para acessar o Painel de Controle.
            </p>
            
            {errorMsg && (
              <div style={{ background: 'var(--error)', color: '#fff', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Empresa / Cliente</label>
                <input className="form-input" name="nome_empresa" required placeholder="Ex: Acme Corp" />
              </div>
              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label>Segmento de Mercado (Opcional)</label>
                <input className="form-input" name="segmento" placeholder="Ex: Tecnologia Financeira" />
              </div>

              <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
                {loading ? (
                  <>
                    <span className="spinner"></span> <span>Abrindo Célula...</span>
                  </>
                ) : (
                  "Criar Painel de Controle"
                )}
              </button>
            </form>
          </div>
        </main>
      </div>

      <style jsx>{`
        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
