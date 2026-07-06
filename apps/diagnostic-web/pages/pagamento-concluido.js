import Head from 'next/head';
import { useRouter } from 'next/router';
import Logo from '../components/Logo';

// Página de retorno do checkout InfinitePay (redirect_url). Recebe por query:
// receipt_url, order_nsu, slug, capture_method, transaction_nsu.
export default function PagamentoConcluido() {
  const router = useRouter();
  const { receipt_url: receiptUrl } = router.query;

  return (
    <>
      <Head>
        <title>Pagamento recebido · Espansione</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={sx.page}>
        <div style={{ marginBottom: '1.6rem' }}><Logo size="md" center /></div>
        <div className="glass-card" style={sx.card}>
          <div style={sx.accent} />
          <div style={sx.check}>✓</div>
          <h1 style={sx.h1}>Pagamento recebido</h1>
          <p style={sx.txt}>
            Obrigado! Recebemos a confirmação da sua compra do <b>Mapa de Identidade Estratégica</b>.
            Em breve a nossa equipe entra em contato para dar sequência ao seu diagnóstico.
          </p>
          <div style={sx.btns}>
            {receiptUrl && (
              <a href={String(receiptUrl)} target="_blank" rel="noreferrer" className="btn-primary" style={{ textDecoration: 'none' }}>
                Ver comprovante
              </a>
            )}
            <a href="/mapa" style={sx.ghost}>Fazer o check-up gratuito</a>
          </div>
        </div>
      </div>
    </>
  );
}

const sx = {
  page: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1rem' },
  card: { maxWidth: 520, width: '100%', padding: '2.2rem', position: 'relative', overflow: 'hidden', textAlign: 'center' },
  accent: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #22c55e, rgba(34,197,94,0.08))' },
  check: { width: 60, height: 60, margin: '0 auto 1rem', borderRadius: '50%', background: 'rgba(34,197,94,0.15)', color: '#86efac', fontSize: '1.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  h1: { marginTop: 0, fontSize: '1.6rem' },
  txt: { color: 'var(--text-secondary, #9aa)', lineHeight: 1.6 },
  btns: { display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.4rem' },
  ghost: { border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, color: 'var(--text-secondary, #9aa)', padding: '0.7rem 1.1rem', textDecoration: 'none', fontSize: '0.9rem' },
};
