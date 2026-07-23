import Head from 'next/head';
import Link from 'next/link';
import Logo from '../../components/Logo';

export default function ObrigadoFeira() {
  return (
    <>
      <Head><title>Pagamento em análise · Espansione</title><meta name="robots" content="noindex" /></Head>
      <main className="feira-page">
        <section className="feira-card feira-thanks">
          <div className="feira-brand"><Logo size="sm" center /></div>
          <p className="feira-eyebrow">PAGAMENTO RECEBIDO</p>
          <h1>Obrigada por escolher a Espansione.</h1>
          <p className="feira-intro">Assim que o pagamento for confirmado, nosso time seguirá com você pelo WhatsApp ou e-mail informado.</p>
          <Link href="/feira" className="feira-secondary">Voltar à página inicial</Link>
        </section>
      </main>
    </>
  );
}
