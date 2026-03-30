import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function ProjetoDetalhes() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <>
      <Head>
        <title>Espansione | Detalhes do Projeto</title>
      </Head>
      <div className="page-container">
        <main className="container" style={{ maxWidth: '800px' }}>
          <div className="glass-card animate-fade-in">
            <Link href="/consultor">
              <span style={{ color: 'var(--accent-blue)', cursor: 'pointer', display: 'inline-block', marginBottom: '1rem', fontSize: '0.9rem' }}>
                &larr; Voltar ao Painel Gerencial
              </span>
            </Link>
            <h1 style={{ marginBottom: '0.5rem' }}>Detalhes do Projeto</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
              ID: <code style={{ color: 'var(--accent-blue)', background: 'rgba(56, 189, 248, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>{id}</code>
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Esta é uma página de detalhes provisória para o projeto selecionado.
              Em breve, esta tela exibirá todo o Intake, diagnósticos, agentes ativos, formulários de pesquisa de clima gerados e relatórios consolidados.
            </p>
            
            <div style={{ marginTop: '2.5rem', padding: '1.5rem', border: '1px solid var(--glass-border)', borderRadius: '12px' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Links Compartilháveis (Pesquisas)</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                Copie e envie estes links para os gestores ou colaboradores referentes a este projeto. O ID já está incluso automaticamente!
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ padding: '1.25rem', background: 'var(--bg-tertiary)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Pesquisa de Clima (Colaboradores)</strong>
                    <code style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>/form/colaboradores?projeto={id}</code>
                  </div>
                  <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} 
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/form/colaboradores?projeto=${id}`);
                            alert('Link copiado!');
                          }}>
                    Copiar Link
                  </button>
                </div>
                
                <div style={{ padding: '1.25rem', background: 'var(--bg-tertiary)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Exercício de Propósito (Liderança)</strong>
                    <code style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>/form/proposito?projeto={id}</code>
                  </div>
                  <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} 
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/form/proposito?projeto=${id}`);
                            alert('Link copiado!');
                          }}>
                    Copiar Link
                  </button>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2rem', padding: '2rem', background: 'var(--bg-tertiary)', borderRadius: '12px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)' }}>Mais estatísticas e relatórios desse projeto em desenvolvimento...</p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
