import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Logo from '../../components/Logo';

export default function FormSocios() {
  const router = useRouter();
  const { projeto } = router.query;

  const [respostas, setRespostas] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const onChange = (e) => {
    const { name, value } = e.target;
    setRespostas(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/formularios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projetoId: projeto,
          tipo: 'intake_socios',
          respostas: { ...respostas, respondente: respostas.nome_respondente || 'Sócio anônimo' },
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

  if (!router.isReady) return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando...</div>;
  if (!projeto) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--brand-red)' }}>Link Inválido</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Falta o código do projeto na URL.</p>
      </div>
    );
  }

  return (
    <>
      <Head><title>Formulário Sócios | Espansione</title></Head>
      <div className="page-container" style={{ paddingTop: '2rem', minHeight: '100vh', paddingBottom: '4rem' }}>
        <main className="container" style={{ maxWidth: '800px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <Logo size="md" center />
          </div>

          {!success && (
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h1 style={{ color: 'var(--text-primary)', fontSize: '2rem', marginBottom: '0.5rem' }}>Formulário Sócios</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Visão de liderança e estratégia — ~15 min</p>
            </div>
          )}

          <div className="glass-card" style={{ padding: '2.5rem' }}>
            {success ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <h2 style={{ color: 'var(--success)' }}>Respostas registradas. Obrigado!</h2>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {errorMsg && <div style={{ background: 'var(--error)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', color: '#fff' }}>{errorMsg}</div>}

                <div className="form-group">
                  <label>Seu nome</label>
                  <input className="form-input" name="nome_respondente" onChange={onChange} required />
                </div>
                <div className="form-group">
                  <label>Seu papel na empresa</label>
                  <input className="form-input" name="papel" placeholder="Ex: Sócio-fundador, CEO, Diretor comercial" onChange={onChange} required />
                </div>

                <h2 style={{ color: 'var(--accent-blue)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem', marginTop: '2rem' }}>A Empresa e a Marca</h2>
                <div className="form-group">
                  <label>O que vocês vendem e para quem?</label>
                  <textarea className="form-input" name="a_o_que_vende" rows="3" onChange={onChange} required />
                </div>
                <div className="form-group">
                  <label>Quanto tempo tem a empresa?</label>
                  <select className="form-input" name="a_tempo_mercado" onChange={onChange} required defaultValue="">
                    <option value="" disabled>Selecione...</option>
                    <option value="Menos de 1 ano">Menos de 1 ano</option>
                    <option value="1 a 3 anos">1 a 3 anos</option>
                    <option value="3 a 7 anos">3 a 7 anos</option>
                    <option value="7 a 15 anos">7 a 15 anos</option>
                    <option value="Mais de 15 anos">Mais de 15 anos</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Se a marca fosse uma pessoa, como você descreveria a personalidade dela?</label>
                  <textarea className="form-input" name="a_personalidade" rows="2" onChange={onChange} required />
                </div>
                <div className="form-group">
                  <label>3 palavras que você GOSTARIA que descrevessem a empresa</label>
                  <input className="form-input" style={{ marginBottom: '0.5rem' }} name="a_desejadas_1" placeholder="Palavra 1" onChange={onChange} required />
                  <input className="form-input" style={{ marginBottom: '0.5rem' }} name="a_desejadas_2" placeholder="Palavra 2" onChange={onChange} required />
                  <input className="form-input" name="a_desejadas_3" placeholder="Palavra 3" onChange={onChange} required />
                </div>
                <div className="form-group">
                  <label>3 palavras que você acha que REALMENTE descrevem a empresa hoje</label>
                  <input className="form-input" style={{ marginBottom: '0.5rem' }} name="a_reais_1" placeholder="Palavra 1" onChange={onChange} required />
                  <input className="form-input" style={{ marginBottom: '0.5rem' }} name="a_reais_2" placeholder="Palavra 2" onChange={onChange} required />
                  <input className="form-input" name="a_reais_3" placeholder="Palavra 3" onChange={onChange} required />
                </div>
                <div className="form-group">
                  <label>O que diferencia a empresa dos concorrentes?</label>
                  <textarea className="form-input" name="a_diferencial" rows="3" onChange={onChange} required />
                </div>
                <div className="form-group">
                  <label>Existe alguma marca (qualquer segmento) que você admira? Qual e por quê?</label>
                  <textarea className="form-input" name="a_marca_admirada" rows="2" onChange={onChange} required />
                </div>

                <h2 style={{ color: 'var(--accent-purple)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem', marginTop: '2rem' }}>Liderança e Cultura</h2>
                <div className="form-group">
                  <label>Como a empresa está organizada hoje? Quantos colaboradores, sócios, seu papel</label>
                  <textarea className="form-input" name="b_organizacao" rows="3" onChange={onChange} required />
                </div>
                <div className="form-group">
                  <label>Como você percebe o clima interno?</label>
                  <textarea className="form-input" name="b_clima" rows="2" onChange={onChange} required />
                </div>
                <div className="form-group">
                  <label>Maiores desafios de liderança e gestão de pessoas hoje</label>
                  <textarea className="form-input" name="b_desafios_lideranca" rows="3" onChange={onChange} required />
                </div>
                <div className="form-group">
                  <label>Proposta de valor ao colaborador — o que você oferece e por que é relevante?</label>
                  <textarea className="form-input" name="b_evp" rows="3" onChange={onChange} required />
                </div>
                <div className="form-group">
                  <label>Valores inegociáveis da empresa</label>
                  <textarea className="form-input" name="b_valores" rows="2" onChange={onChange} required />
                </div>

                <h2 style={{ color: 'var(--success)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem', marginTop: '2rem' }}>Visão e Futuro</h2>
                <div className="form-group">
                  <label>Motivação de criação da marca — por que ela existe, o que significa na vida das pessoas</label>
                  <textarea className="form-input" name="c_motivacao_criacao" rows="4" onChange={onChange} required />
                </div>
                <div className="form-group">
                  <label>Propósito declarado da organização — qual papel ela tem/quer ter no mundo?</label>
                  <textarea className="form-input" name="c_proposito_declarado" rows="3" onChange={onChange} required />
                </div>
                <div className="form-group">
                  <label>Onde você quer que a empresa esteja em 5 anos?</label>
                  <textarea className="form-input" name="c_5_anos" rows="3" onChange={onChange} required />
                </div>
                <div className="form-group">
                  <label>O que é necessário pra chegar lá?</label>
                  <textarea className="form-input" name="c_necessario" rows="3" onChange={onChange} required />
                </div>
                <div className="form-group">
                  <label>Se pudesse mudar uma coisa na marca amanhã, o que seria?</label>
                  <textarea className="form-input" name="c_mudar_amanha" rows="2" onChange={onChange} required />
                </div>

                <div className="form-group">
                  <label>3 IMPULSIONADORES (forças e vantagens)</label>
                  <input className="form-input" style={{ marginBottom: '0.5rem' }} name="c_impulsionador_1" placeholder="Impulsionador 1" onChange={onChange} required />
                  <input className="form-input" style={{ marginBottom: '0.5rem' }} name="c_impulsionador_2" placeholder="Impulsionador 2" onChange={onChange} required />
                  <input className="form-input" name="c_impulsionador_3" placeholder="Impulsionador 3" onChange={onChange} required />
                </div>
                <div className="form-group">
                  <label>3 DETRATORES (fragilidades e dores)</label>
                  <input className="form-input" style={{ marginBottom: '0.5rem' }} name="c_detrator_1" placeholder="Detrator 1" onChange={onChange} required />
                  <input className="form-input" style={{ marginBottom: '0.5rem' }} name="c_detrator_2" placeholder="Detrator 2" onChange={onChange} required />
                  <input className="form-input" name="c_detrator_3" placeholder="Detrator 3" onChange={onChange} required />
                </div>
                <div className="form-group">
                  <label>3 ACELERADORES (oportunidades de crescimento)</label>
                  <input className="form-input" style={{ marginBottom: '0.5rem' }} name="c_acelerador_1" placeholder="Acelerador 1" onChange={onChange} required />
                  <input className="form-input" style={{ marginBottom: '0.5rem' }} name="c_acelerador_2" placeholder="Acelerador 2" onChange={onChange} required />
                  <input className="form-input" name="c_acelerador_3" placeholder="Acelerador 3" onChange={onChange} required />
                </div>

                <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                  <button className="btn-primary" type="submit" disabled={submitting} style={{ padding: '1rem 3rem', fontSize: '1.1rem', width: '100%' }}>
                    {submitting ? 'Enviando...' : 'Finalizar'}
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
