import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Logo from '../../components/Logo';

const PILARES = [
  { id: 'radar_proposito', label: 'Propósito inspirador' },
  { id: 'radar_cultura', label: 'Cultura organizacional viva' },
  { id: 'radar_lideranca', label: 'Liderança humanizada' },
  { id: 'radar_clima', label: 'Clima organizacional saudável' },
  { id: 'radar_comunicacao', label: 'Comunicação interna transparente' },
  { id: 'radar_desenvolvimento', label: 'Desenvolvimento e aprendizado' },
  { id: 'radar_reconhecimento', label: 'Reconhecimento e valorização' },
  { id: 'radar_diversidade', label: 'Diversidade e inclusão' },
  { id: 'radar_visao', label: 'Visão e alinhamento estratégico' },
  { id: 'radar_experiencia', label: 'Experiência do colaborador' },
  { id: 'radar_reputacao', label: 'Reputação e imagem da marca' },
];

export default function FormColaboradores() {
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
          tipo: 'intake_colaboradores',
          respostas: { ...respostas, respondente: respostas.nome_respondente || 'Colaborador anônimo' },
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
      </div>
    );
  }

  return (
    <>
      <Head><title>Formulário Colaboradores | Espansione</title></Head>
      <div className="page-container" style={{ paddingTop: '2rem', minHeight: '100vh', paddingBottom: '4rem' }}>
        <main className="container" style={{ maxWidth: '800px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <Logo size="md" center />
          </div>

          {!success && (
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h1 style={{ color: 'var(--text-primary)', fontSize: '2rem', marginBottom: '0.5rem' }}>Sua visão da empresa</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Anônimo por padrão — suas respostas ajudam a empresa a evoluir (~10 min)</p>
            </div>
          )}

          <div className="glass-card" style={{ padding: '2.5rem' }}>
            {success ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <h2 style={{ color: 'var(--success)' }}>Obrigado! Suas respostas foram registradas.</h2>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {errorMsg && <div style={{ background: 'var(--error)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', color: '#fff' }}>{errorMsg}</div>}

                <div className="form-group">
                  <label>Seu nome (opcional)</label>
                  <input className="form-input" name="nome_respondente" onChange={onChange} />
                </div>
                <div className="form-group">
                  <label>Seu cargo/função</label>
                  <input className="form-input" name="cargo" onChange={onChange} required />
                </div>
                <div className="form-group">
                  <label>Tempo de casa</label>
                  <select className="form-input" name="tempo_casa" onChange={onChange} required defaultValue="">
                    <option value="" disabled>Selecione...</option>
                    <option>Menos de 1 ano</option>
                    <option>1 a 3 anos</option>
                    <option>3 a 7 anos</option>
                    <option>Mais de 7 anos</option>
                  </select>
                </div>

                <h2 style={{ color: 'var(--accent-purple)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem', marginTop: '2rem' }}>Percepção da marca</h2>
                <div className="form-group">
                  <label>3 palavras que você usaria pra descrever a empresa HOJE</label>
                  <input className="form-input" style={{ marginBottom: '0.5rem' }} name="palavras_hoje_1" placeholder="Palavra 1" onChange={onChange} required />
                  <input className="form-input" style={{ marginBottom: '0.5rem' }} name="palavras_hoje_2" placeholder="Palavra 2" onChange={onChange} required />
                  <input className="form-input" name="palavras_hoje_3" placeholder="Palavra 3" onChange={onChange} required />
                </div>
                <div className="form-group">
                  <label>3 palavras que você GOSTARIA que descrevessem a empresa</label>
                  <input className="form-input" style={{ marginBottom: '0.5rem' }} name="palavras_desejadas_1" placeholder="Palavra 1" onChange={onChange} required />
                  <input className="form-input" style={{ marginBottom: '0.5rem' }} name="palavras_desejadas_2" placeholder="Palavra 2" onChange={onChange} required />
                  <input className="form-input" name="palavras_desejadas_3" placeholder="Palavra 3" onChange={onChange} required />
                </div>
                <div className="form-group">
                  <label>O que a empresa faz MUITO bem, na sua opinião?</label>
                  <textarea className="form-input" name="pontos_fortes" rows="3" onChange={onChange} required />
                </div>
                <div className="form-group">
                  <label>O que ela precisa melhorar?</label>
                  <textarea className="form-input" name="pontos_fracos" rows="3" onChange={onChange} required />
                </div>

                <h2 style={{ color: 'var(--accent-blue)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem', marginTop: '2rem' }}>Radar da Marca Empregadora (0–10)</h2>
                <div className="form-group" style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '8px' }}>
                  {PILARES.map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem', paddingBottom: '0.9rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: '0.95rem' }}>{p.label}</span>
                      <input type="number" min="0" max="10" className="form-input" name={p.id} style={{ width: '80px', textAlign: 'center', padding: '0.5rem' }} onChange={onChange} required />
                    </div>
                  ))}
                </div>

                <h2 style={{ color: 'var(--success)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem', marginTop: '2rem' }}>Clima e recomendação</h2>
                <div className="form-group">
                  <label>De 0 a 10, o quanto você recomendaria trabalhar aqui para um amigo?</label>
                  <input type="number" min="0" max="10" className="form-input" name="enps" style={{ width: '120px' }} onChange={onChange} required />
                </div>
                <div className="form-group">
                  <label>Por que essa nota?</label>
                  <textarea className="form-input" name="enps_motivo" rows="3" onChange={onChange} required />
                </div>
                <div className="form-group">
                  <label>O que mais te motiva no dia a dia da empresa?</label>
                  <textarea className="form-input" name="motivacao" rows="2" onChange={onChange} required />
                </div>
                <div className="form-group">
                  <label>O que mais te desmotiva ou te frustra?</label>
                  <textarea className="form-input" name="desmotivacao" rows="2" onChange={onChange} required />
                </div>
                <div className="form-group">
                  <label>Se pudesse mudar uma coisa na empresa amanhã, o que seria?</label>
                  <textarea className="form-input" name="mudaria" rows="2" onChange={onChange} required />
                </div>

                <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                  <button className="btn-primary" type="submit" disabled={submitting} style={{ padding: '1rem 3rem', fontSize: '1.1rem', width: '100%' }}>
                    {submitting ? 'Enviando...' : 'Enviar respostas'}
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
