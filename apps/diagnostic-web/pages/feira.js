import Head from 'next/head';
import { useState } from 'react';
import Logo from '../components/Logo';

function mascaraWhatsapp(valor) {
  const digits = valor.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function Feira() {
  const [form, setForm] = useState({ nome: '', email: '', whatsapp: '' });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  async function avancar(event) {
    event.preventDefault();
    setLoading(true);
    setErro('');
    try {
      const response = await fetch('/api/feira/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok || !data.success || !data.paymentUrl) throw new Error(data.error || 'Não foi possível abrir o pagamento.');
      window.location.assign(data.paymentUrl);
    } catch (error) {
      setErro(error.message || 'Não foi possível continuar. Tente novamente.');
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Espansione · Oferta da Feira</title>
        <meta name="description" content="Cadastre seus dados e avance para o pagamento da oferta especial da Espansione." />
        <meta name="robots" content="noindex" />
      </Head>
      <main className="feira-page">
        <div className="feira-orb feira-orb-a" />
        <div className="feira-orb feira-orb-b" />
        <section className="feira-card">
          <div className="feira-brand"><Logo size="sm" center /></div>
          <p className="feira-eyebrow">OFERTA ESPECIAL DA FEIRA</p>
          <h1>Vamos continuar essa conversa?</h1>
          <p className="feira-intro">Deixe seus dados para identificarmos sua compra e seguirmos com você.</p>

          <form onSubmit={avancar} className="feira-form">
            <label htmlFor="nome">Nome</label>
            <input id="nome" name="nome" autoComplete="name" required placeholder="Como podemos te chamar?" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />

            <label htmlFor="email">E-mail</label>
            <input id="email" name="email" type="email" autoComplete="email" required placeholder="voce@empresa.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />

            <label htmlFor="whatsapp">WhatsApp</label>
            <input id="whatsapp" name="whatsapp" type="tel" inputMode="numeric" autoComplete="tel" required placeholder="(11) 99999-9999" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: mascaraWhatsapp(e.target.value) })} />

            {erro && <p className="feira-error" role="alert">{erro}</p>}
            <button type="submit" disabled={loading}>{loading ? 'Abrindo pagamento…' : 'Avançar para o pagamento →'}</button>
          </form>

          <p className="feira-security">Seus dados são usados somente para identificar sua compra e nosso atendimento.</p>
        </section>
      </main>
    </>
  );
}
