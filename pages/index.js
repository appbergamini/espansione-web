import Head from 'next/head';
import { useState } from 'react';
import Logo from '../components/Logo';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessData(null);

    const formData = new FormData(e.target);
    const campos = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campos })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro na API');
      
      if (data.success) {
        setSuccessData(data);
      } else {
        setErrorMsg(data.error || "Erro desconhecido ao processar.");
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Espansione | Branding Escalável</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="page-container">
        <main className="container">
          
          <div style={{ textAlign: 'center', marginBottom: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="animate-fade-in" style={{ marginBottom: '1.5rem' }}>
              <Logo size="lg" showTagline={true} center={true} />
            </div>
            <p className="animate-fade-in" style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto', animationDelay: '0.1s' }}>
              Plataforma de Diagnóstico e Estratégia de Marca.
            </p>
          </div>

          <div className="grid-2">
            
            {/* INTAKE FORM */}
            {!successData && (
              <div className="glass-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-blue)' }}>Briefing Inicial</h2>
                
                {errorMsg && (
                  <div style={{ background: 'var(--error)', color: '#fff', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Nome da Empresa</label>
                    <input className="form-input" name="nome_empresa" required placeholder="Ex: Espansione" />
                  </div>
                  <div className="form-group">
                    <label>Tempo de Mercado</label>
                    <input className="form-input" name="tempo_mercado" placeholder="Ex: 5 anos" />
                  </div>
                  <div className="form-group">
                    <label>O que vendem e para quem?</label>
                    <textarea className="form-input" name="produtos_publico" rows="3" placeholder="Produtos principais e público-alvo"></textarea>
                  </div>
                  <div className="form-group">
                    <label>Propósito Declarado</label>
                    <textarea className="form-input" name="proposito_declarado" rows="3" placeholder="Qual o propósito da marca aos olhos do mundo?"></textarea>
                  </div>

                  <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
                    {loading ? (
                      <>
                        <span className="spinner"></span> Analisando dados c/ IA...
                      </>
                    ) : "Gerar Diagnóstico Inicial"}
                  </button>
                </form>
              </div>
            )}

            {/* RESULTS VIEW */}
            {successData && (
              <div className="glass-card animate-fade-in" style={{ animationDelay: '0.1s', gridColumn: '1 / -1' }}>
                <h2 style={{ color: 'var(--success)', marginBottom: '1rem' }}>🎉 Documento Inicial de Contexto Gerado!</h2>
                <div style={{ marginBottom: '2rem' }}>
                  <strong>ID do Projeto:</strong> <span style={{ fontFamily: 'monospace', color: 'var(--accent-purple)' }}>{successData.projetoId}</span>
                </div>

                <div style={{ background: 'var(--bg-tertiary)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                  <h3 style={{ color: 'var(--accent-blue)', marginBottom: '1rem' }}>Resumo Executivo (Agente 00)</h3>
                  <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                    {successData.output.resumo_executivo}
                  </p>
                </div>

                <div style={{ background: 'var(--bg-tertiary)', padding: '1.5rem', borderRadius: '12px' }}>
                  <h3 style={{ color: 'var(--accent-blue)', marginBottom: '1rem' }}>Conteúdo Completo</h3>
                  <div 
                    style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.95rem' }}
                    dangerouslySetInnerHTML={{ __html: (successData.output.conteudo || "").replace(/\n/g, '<br/>') }}
                  />
                </div>
                
                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                  <button className="btn-secondary" onClick={() => setSuccessData(null)}>Novo Diagnóstico</button>
                </div>
              </div>
            )}
            
            
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
