import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Logo from '../../components/Logo';

export default function IntakeForm() {
  const router = useRouter();
  const { projeto, versao } = router.query;
  const isCompleta = versao === 'completa';
  
  const [respostas, setRespostas] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRespostas(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projetoId: projeto,
          versao,
          campos: respostas
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
      } else {
        setErrorMsg(data.error || 'Erro ao submeter formulário.');
      }
    } catch(err) {
      setErrorMsg('Falha de conexão com o servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!router.isReady) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando formulário...</div>;
  }

  if (!projeto) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--brand-red)', marginBottom: '1rem' }}>Link Inválido</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Falta o código do projeto na URL.</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Diagnóstico Espansione | {isCompleta ? 'Completo' : 'Resumido'}</title>
      </Head>
      <div className="page-container" style={{ paddingTop: '2rem', minHeight: '100vh', paddingBottom: '4rem' }}>
        <main className="container" style={{ maxWidth: '800px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <Logo size="md" showTagline={false} center={true} />
          </div>

          {!success && (
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h1 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '2rem' }}>
                Questionário Inicial
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                {isCompleta ? 'Projeto de Branding (Etapa 1) - ~20 minutos' : 'Questionário Inicial (Versão Resumida) - ~10 minutos'}
              </p>
            </div>
          )}

          <div className="glass-card animate-fade-in" style={{ padding: '2.5rem' }}>
            {success ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <h2 style={{ color: 'var(--success)', marginBottom: '1rem' }}>Muito obrigado pelas respostas!</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6' }}>
                  Suas informações foram salvas com sucesso e já estão sendo processadas pela nossa Inteligência Artificial.<br/>A equipe de estratégia entrará em contato com os resultados.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {errorMsg && (
                  <div style={{ background: 'var(--error)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', color: '#fff', textAlign: 'center' }}>
                    {errorMsg}
                  </div>
                )}
                
                {/* BLOCO A */}
                <div style={{ marginBottom: '3rem' }}>
                  <h2 style={{ color: 'var(--accent-blue)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                    {isCompleta ? 'Bloco A — ' : ''}A Empresa e sua Marca
                  </h2>
                  
                  <div className="form-group">
                    <label>O que vocês vendem e para quem?</label>
                    <textarea className="form-input" name="a1_o_que_vendem" rows="3" onChange={handleInputChange} required></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label>Quanto tempo tem sua empresa?</label>
                    <select className="form-input" name="a2_tempo_mercado" onChange={handleInputChange} required defaultValue="">
                      <option value="" disabled>Selecione...</option>
                      <option value="Menos de 1 ano">Menos de 1 ano</option>
                      <option value="1 a 3 anos">1 a 3 anos</option>
                      <option value="3 a 7 anos">3 a 7 anos</option>
                      <option value="7 a 15 anos">7 a 15 anos</option>
                      <option value="Mais de 15 anos">Mais de 15 anos</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Se sua marca fosse uma pessoa, como você descreveria a personalidade dela?</label>
                    <textarea className="form-input" name="a3_personalidade" rows="2" onChange={handleInputChange} required></textarea>
                  </div>

                  <div className="form-group">
                    <label>Quais 3 palavras você GOSTARIA que as pessoas usassem para descrever sua empresa?</label>
                    <input className="form-input" style={{ marginBottom: '0.5rem' }} name="a4_gostaria_1" placeholder="Palavra 1" onChange={handleInputChange} required />
                    <input className="form-input" style={{ marginBottom: '0.5rem' }} name="a4_gostaria_2" placeholder="Palavra 2" onChange={handleInputChange} required />
                    <input className="form-input" name="a4_gostaria_3" placeholder="Palavra 3" onChange={handleInputChange} required />
                  </div>

                  <div className="form-group">
                    <label>Quais 3 palavras você acha que as pessoas REALMENTE usam para descrever sua empresa?</label>
                    <input className="form-input" style={{ marginBottom: '0.5rem' }} name="a5_usam_1" placeholder="Palavra 1" onChange={handleInputChange} required />
                    <input className="form-input" style={{ marginBottom: '0.5rem' }} name="a5_usam_2" placeholder="Palavra 2" onChange={handleInputChange} required />
                    <input className="form-input" name="a5_usam_3" placeholder="Palavra 3" onChange={handleInputChange} required />
                  </div>

                  <div className="form-group">
                    <label>O que diferencia sua empresa dos concorrentes?</label>
                    <textarea className="form-input" name="a6_diferencial" rows="3" onChange={handleInputChange} required></textarea>
                  </div>

                  {isCompleta && (
                    <>
                      <div className="form-group">
                        <label>Como a empresa está organizada hoje? Quantos colaboradores, sócios, e qual o seu papel na empresa?</label>
                        <textarea className="form-input" name="a7_organizacao" rows="3" onChange={handleInputChange} required></textarea>
                      </div>
                      <div className="form-group">
                        <label>Existe alguma marca (de qualquer segmento) que você admira? Qual e por quê?</label>
                        <textarea className="form-input" name="a8_marca_admirada" rows="2" onChange={handleInputChange} required></textarea>
                      </div>
                    </>
                  )}
                </div>

                {/* BLOCO B (Apenas Completa) */}
                {isCompleta && (
                  <div style={{ marginBottom: '3rem' }}>
                    <h2 style={{ color: 'var(--accent-purple)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>Bloco B — Marca Empregadora e Cultura</h2>

                    <div className="form-group">
                      <label>Na sua percepção, como é o clima interno da sua empresa?</label>
                      <textarea className="form-input" name="b1_clima" rows="2" onChange={handleInputChange} required></textarea>
                    </div>
                    
                    <div className="form-group">
                      <label>Quais os maiores desafios de comunicação interna que você identifica?</label>
                      <textarea className="form-input" name="b2_desafios_comunicacao" rows="2" onChange={handleInputChange} required></textarea>
                    </div>
                    
                    <div className="form-group">
                      <label>Quais seus maiores desafios em relação a liderança e gestão de pessoas?</label>
                      <textarea className="form-input" name="b3_desafios_lideranca" rows="2" onChange={handleInputChange} required></textarea>
                    </div>
                    
                    <div className="form-group">
                      <label>Me conte sobre sua proposta de valor ao colaborador. O que você oferece e por que acredita que é relevante?</label>
                      <textarea className="form-input" name="b4_evp" rows="3" onChange={handleInputChange} required></textarea>
                    </div>
                    
                    <div className="form-group">
                      <label>Na sua visão, quais são os valores inegociáveis da sua empresa?</label>
                      <textarea className="form-input" name="b5_valores" rows="2" onChange={handleInputChange} required></textarea>
                    </div>

                    <div className="form-group" style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <label style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'block' }}>Radar de Marca Empregadora (Avalie de 0 a 10):</label>
                      {[
                        { id: 'radar_proposito', label: 'Propósito Inspirador' },
                        { id: 'radar_cultura', label: 'Cultura Organizacional Viva' },
                        { id: 'radar_lideranca', label: 'Liderança Humanizada' },
                        { id: 'radar_clima', label: 'Clima Organizacional Saudável' },
                        { id: 'radar_comunicacao', label: 'Comunicação Interna Transparente' },
                        { id: 'radar_desenvolvimento', label: 'Desenvolvimento e Aprendizado' },
                        { id: 'radar_reconhecimento', label: 'Reconhecimento e Valorização' },
                        { id: 'radar_diversidade', label: 'Diversidade e Inclusão' },
                        { id: 'radar_visao', label: 'Visão e Alinhamento Estratégico' },
                        { id: 'radar_experiencia', label: 'Experiência do Colaborador' },
                        { id: 'radar_reputacao', label: 'Reputação e Imagem da Marca' }
                      ].map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <span style={{ fontSize: '0.95rem' }}>{item.label}</span>
                          <input type="number" min="0" max="10" placeholder="0-10" className="form-input" name={item.id} style={{ width: '80px', textAlign: 'center', padding: '0.5rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }} onChange={handleInputChange} required />
                        </div>
                      ))}
                    </div>

                    <div className="form-group">
                      <label>Qual dessas áreas do radar você considera mais importante para chegar na sua visão de futuro e por quê?</label>
                      <textarea className="form-input" name="b7_area_importante" rows="2" onChange={handleInputChange} required></textarea>
                    </div>
                  </div>
                )}

                {/* BLOCO C */}
                <div style={{ marginBottom: '3rem' }}>
                  <h2 style={{ color: 'var(--accent-green)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                    {isCompleta ? 'Bloco C — ' : 'Bloco Final — '}Visão, Propósito e Futuro
                  </h2>

                  <div className="form-group">
                    <label>Conte um pouco sobre sua visão para esta marca: qual foi a motivação para criá-la, o que ela significa na vida das pessoas e como quer que ela seja percebida?</label>
                    <textarea className="form-input" name="c1_visao" rows="4" onChange={handleInputChange} required></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label>Onde você quer que sua empresa esteja em 5 anos?</label>
                    <textarea className="form-input" name="c2_5_anos" rows="3" onChange={handleInputChange} required></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label>Na sua visão, qual o propósito da sua organização? Qual o papel ela tem ou quer ter no mundo?</label>
                    <textarea className="form-input" name="c3_proposito" rows="3" onChange={handleInputChange} required></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label>Se pudesse mudar uma coisa na sua marca amanhã, o que seria?</label>
                    <textarea className="form-input" name="c4_mudar_algo" rows="2" onChange={handleInputChange} required></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label>Quais são seus maiores objetivos e desafios hoje enquanto empresário e líder?</label>
                    <textarea className="form-input" name="c5_objetivos_lider" rows="3" onChange={handleInputChange} required></textarea>
                  </div>

                  {isCompleta && (
                    <>
                      <div className="form-group">
                        <label style={{ color: 'var(--text-primary)', marginBottom: '1rem', display: 'block' }}>Aponte 3 impulsionadores, 3 detratores e 3 aceleradores da sua organização:</label>
                        
                        <div style={{ marginBottom: '1.5rem' }}>
                          <strong style={{ color: 'var(--success)', display: 'block', marginBottom: '0.5rem' }}>⬆️ IMPULSIONADORES (Forças e Vantagens)</strong>
                          <input className="form-input" style={{ marginBottom: '0.5rem' }} name="c6_impulsionador_1" placeholder="Impulsionador 1" onChange={handleInputChange} required />
                          <input className="form-input" style={{ marginBottom: '0.5rem' }} name="c6_impulsionador_2" placeholder="Impulsionador 2" onChange={handleInputChange} required />
                          <input className="form-input" name="c6_impulsionador_3" placeholder="Impulsionador 3" onChange={handleInputChange} required />
                        </div>
                        
                        <div style={{ marginBottom: '1.5rem' }}>
                          <strong style={{ color: 'var(--brand-red)', display: 'block', marginBottom: '0.5rem' }}>⬇️ DETRATORES (Fragilidades e Dores)</strong>
                          <input className="form-input" style={{ marginBottom: '0.5rem' }} name="c6_detrator_1" placeholder="Detrator 1" onChange={handleInputChange} required />
                          <input className="form-input" style={{ marginBottom: '0.5rem' }} name="c6_detrator_2" placeholder="Detrator 2" onChange={handleInputChange} required />
                          <input className="form-input" name="c6_detrator_3" placeholder="Detrator 3" onChange={handleInputChange} required />
                        </div>
                        
                        <div>
                          <strong style={{ color: 'var(--accent-blue)', display: 'block', marginBottom: '0.5rem' }}>🚀 ACELERADORES (Oportunidades de Crescimento)</strong>
                          <input className="form-input" style={{ marginBottom: '0.5rem' }} name="c6_acelerador_1" placeholder="Acelerador 1" onChange={handleInputChange} required />
                          <input className="form-input" style={{ marginBottom: '0.5rem' }} name="c6_acelerador_2" placeholder="Acelerador 2" onChange={handleInputChange} required />
                          <input className="form-input" name="c6_acelerador_3" placeholder="Acelerador 3" onChange={handleInputChange} required />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>O que é necessário para chegar até lá? Com quem podemos aprender?</label>
                        <textarea className="form-input" name="c7_como_chegar" rows="3" onChange={handleInputChange} required></textarea>
                      </div>
                    </>
                  )}
                </div>

                <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                  <button className="btn-primary" type="submit" disabled={submitting} style={{ padding: '1rem 3rem', fontSize: '1.2rem', width: '100%' }}>
                    {submitting ? 'Salvando Respostas...' : 'Finalizar Questionário'}
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
