import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Logo from '../../components/Logo';

export default function FormClientes() {
  const router = useRouter();
  const { projeto, t: token } = router.query;

  const [respostas, setRespostas] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [tokenData, setTokenData] = useState(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenError, setTokenError] = useState('');

  const onChange = (e) => {
    const { name, value } = e.target;
    setRespostas(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (!router.isReady || !token) return;
    setTokenLoading(true);
    fetch(`/api/respondentes/by-token?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(json => {
        if (!json.success) { setTokenError(json.error || 'Link inválido'); return; }
        setTokenData(json.respondente);
        setRespostas(prev => ({ ...prev, nome_respondente: json.respondente.nome }));
      })
      .catch(err => setTokenError(err.message))
      .finally(() => setTokenLoading(false));
  }, [router.isReady, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/formularios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projetoId: tokenData?.projeto_id || projeto,
          tipo: 'intake_clientes',
          token: token || undefined,
          respostas: { ...respostas, respondente: tokenData?.nome || respostas.nome_respondente || 'Cliente' },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Erro ao enviar');
      setSuccess(true);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!router.isReady || tokenLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando...</div>;
  if (tokenError) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--brand-red)' }}>Link Inválido</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{tokenError}</p>
      </div>
    );
  }
  if (!projeto && !tokenData) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--brand-red)' }}>Link Inválido</h2>
      </div>
    );
  }

  return (
    <>
      <Head><title>Sua opinião | Espansione</title></Head>
      <div className="page-container" style={{ paddingTop: '2rem', minHeight: '100vh', paddingBottom: '4rem' }}>
        <main className="container" style={{ maxWidth: '800px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <Logo size="md" center />
          </div>

          {!success && (
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h1 style={{ color: 'var(--text-primary)', fontSize: '2rem', marginBottom: '0.5rem' }}>Sua experiência como cliente</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Sua opinião vai moldar o próximo capítulo dessa marca — ~8 min</p>
            </div>
          )}

          <div className="glass-card" style={{ padding: '2.5rem' }}>
            {success ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <h2 style={{ color: 'var(--success)' }}>Obrigado! Sua opinião foi registrada.</h2>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {errorMsg && <div style={{ background: 'var(--error)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', color: '#fff' }}>{errorMsg}</div>}

                {tokenData ? (
                  <div className="form-group" style={{ background: 'rgba(96,165,250,0.08)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(96,165,250,0.2)' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Respondendo como</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{tokenData.nome}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{tokenData.email}</div>
                  </div>
                ) : (
                  <div className="form-group">
                    <label>Seu nome</label>
                    <input className="form-input" name="nome_respondente" onChange={onChange} required />
                  </div>
                )}
                <div className="form-group">
                  <label>Há quanto tempo você é cliente?</label>
                  <select className="form-input" name="tempo_cliente" onChange={onChange} required defaultValue="">
                    <option value="" disabled>Selecione...</option>
                    <option>Menos de 6 meses</option>
                    <option>6 meses a 2 anos</option>
                    <option>2 a 5 anos</option>
                    <option>Mais de 5 anos</option>
                  </select>
                </div>

                <h2 style={{ color: 'var(--accent-blue)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem', marginTop: '2rem' }}>Descoberta e expectativa</h2>
                <div className="form-group">
                  <label>Como você conheceu a empresa?</label>
                  <textarea className="form-input" name="descoberta" rows="2" onChange={onChange} required />
                </div>
                <div className="form-group">
                  <label>O que te fez escolher essa empresa em vez de outra?</label>
                  <textarea className="form-input" name="razao_escolha" rows="3" onChange={onChange} required />
                </div>
                <div className="form-group">
                  <label>Qual era sua expectativa inicial?</label>
                  <textarea className="form-input" name="expectativa" rows="2" onChange={onChange} required />
                </div>

                <h2 style={{ color: 'var(--accent-purple)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem', marginTop: '2rem' }}>Experiência</h2>
                <div className="form-group">
                  <label>3 palavras que descrevem essa empresa na sua percepção</label>
                  <input className="form-input" style={{ marginBottom: '0.5rem' }} name="palavras_1" placeholder="Palavra 1" onChange={onChange} required />
                  <input className="form-input" style={{ marginBottom: '0.5rem' }} name="palavras_2" placeholder="Palavra 2" onChange={onChange} required />
                  <input className="form-input" name="palavras_3" placeholder="Palavra 3" onChange={onChange} required />
                </div>
                <div className="form-group">
                  <label>O que a empresa faz MELHOR que os concorrentes?</label>
                  <textarea className="form-input" name="pontos_fortes" rows="3" onChange={onChange} required />
                </div>
                <div className="form-group">
                  <label>O que mais te incomoda ou poderia melhorar?</label>
                  <textarea className="form-input" name="pontos_fracos" rows="3" onChange={onChange} required />
                </div>
                <div className="form-group">
                  <label>Teve algum momento marcante (positivo ou negativo) nessa relação?</label>
                  <textarea className="form-input" name="momento_marcante" rows="3" onChange={onChange} required />
                </div>

                <h2 style={{ color: 'var(--success)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem', marginTop: '2rem' }}>Valor percebido</h2>
                <div className="form-group">
                  <label>O que você realmente está comprando/recebendo? (além do produto/serviço em si)</label>
                  <textarea className="form-input" name="valor_real" rows="3" onChange={onChange} required />
                </div>
                <div className="form-group">
                  <label>Se a empresa fosse uma pessoa, como você descreveria a personalidade dela?</label>
                  <textarea className="form-input" name="personalidade" rows="2" onChange={onChange} required />
                </div>
                <div className="form-group">
                  <label>De 0 a 10, o quanto você recomendaria para um amigo?</label>
                  <input type="number" min="0" max="10" className="form-input" name="nps" style={{ width: '120px' }} onChange={onChange} required />
                </div>
                <div className="form-group">
                  <label>Por que essa nota?</label>
                  <textarea className="form-input" name="nps_motivo" rows="3" onChange={onChange} required />
                </div>
                <div className="form-group">
                  <label>Quais concorrentes você considera (ou já considerou)?</label>
                  <textarea className="form-input" name="concorrentes" rows="2" onChange={onChange} required />
                </div>

                <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                  <button className="btn-primary" type="submit" disabled={submitting} style={{ padding: '1rem 3rem', fontSize: '1.1rem', width: '100%' }}>
                    {submitting ? 'Enviando...' : 'Enviar'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
