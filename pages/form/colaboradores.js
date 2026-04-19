import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Logo from '../../components/Logo';

const AREAS = [
  'Administrativo / Financeiro',
  'Comercial / Vendas',
  'Marketing / Comunicação',
  'Operação / Produção / Entrega',
  'Atendimento / Relacionamento',
  'Tecnologia / Produto',
  'Pessoas / Gestão / Liderança',
  'Outro',
];

const TEMPO_CASA = [
  'Menos de 6 meses',
  '6 a 12 meses',
  '1 a 3 anos',
  '3 a 5 anos',
  'Mais de 5 anos',
];

function Radio({ name, value, checked, onChange, label }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.4rem 0', fontSize: '0.95rem' }}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} required />
      <span>{label}</span>
    </label>
  );
}

function ScaleRow({ name, value, onChange, min, max, minLabel, maxLabel }) {
  const options = [];
  for (let i = min; i <= max; i++) options.push(i);
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.25rem', flexWrap: 'wrap' }}>
        {options.map(n => (
          <label key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
            <input type="radio" name={name} value={n} checked={String(value) === String(n)} onChange={onChange} required />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{n}</span>
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

export default function FormColaboradores() {
  const router = useRouter();
  const { projeto } = router.query;
  const [respostas, setRespostas] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const set = (name, value) => setRespostas(prev => ({ ...prev, [name]: value }));
  const onChange = (e) => set(e.target.name, e.target.value);

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
          respostas: { ...respostas, respondente: 'Colaborador anônimo' },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Erro ao enviar');
      setSuccess(true);
      window.scrollTo(0, 0);
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
      <Head><title>Pesquisa Interna | Espansione</title></Head>
      <div className="page-container" style={{ paddingTop: '2rem', minHeight: '100vh', paddingBottom: '4rem' }}>
        <main className="container" style={{ maxWidth: '820px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <Logo size="md" center />
          </div>

          {!success ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ color: 'var(--text-primary)', fontSize: '1.8rem', marginBottom: '0.4rem' }}>Pesquisa Interna</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Sua voz na construção da nossa marca e cultura</p>
              </div>

              <div className="glass-card" style={{ padding: '1.5rem 2rem', marginBottom: '2rem', background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.2)' }}>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  ⏱ Leva cerca de <strong>6 a 8 minutos</strong>.<br />
                  🔒 <strong>Pesquisa anônima e confidencial.</strong> As respostas serão analisadas de forma coletiva.<br />
                  💬 Responda com sinceridade — quanto mais real e honesta for a sua visão, mais preciso o diagnóstico.
                </p>
              </div>

              <div className="glass-card" style={{ padding: '2rem' }}>
                <form onSubmit={handleSubmit}>
                  {errorMsg && <div style={{ background: 'var(--error)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', color: '#fff' }}>{errorMsg}</div>}

                  <h2 style={{ color: 'var(--accent-purple)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>Perfil do respondente</h2>
                  <div className="form-group">
                    <label>A. Área / frente de atuação</label>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {AREAS.map(a => <Radio key={a} name="area" value={a} checked={respostas.area === a} onChange={onChange} label={a} />)}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>B. Tempo de casa</label>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {TEMPO_CASA.map(t => <Radio key={t} name="tempo_casa" value={t} checked={respostas.tempo_casa === t} onChange={onChange} label={t} />)}
                    </div>
                  </div>

                  <h2 style={{ color: 'var(--accent-blue)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1.25rem', marginTop: '2.5rem' }}>Bloco 1 — Marca e Propósito</h2>

                  <div className="form-group">
                    <label>1. Quando você pensa na empresa, quais são as 3 PRIMEIRAS palavras que vêm à sua mente?</label>
                    <input className="form-input" style={{ marginBottom: '0.5rem' }} name="palavra_1" placeholder="Palavra 1" onChange={onChange} required />
                    <input className="form-input" style={{ marginBottom: '0.5rem' }} name="palavra_2" placeholder="Palavra 2" onChange={onChange} required />
                    <input className="form-input" name="palavra_3" placeholder="Palavra 3" onChange={onChange} required />
                  </div>

                  <div className="form-group">
                    <label>2. Você acredita que nossa empresa tem uma imagem forte no mercado?</label>
                    <ScaleRow name="imagem_forte" value={respostas.imagem_forte} onChange={onChange} min={1} max={5} minLabel="1 = Muito fraca" maxLabel="5 = Muito forte" />
                  </div>

                  <div className="form-group">
                    <label>3. Na sua visão, o que mais DIFERENCIA nossa empresa das outras?</label>
                    <textarea className="form-input" name="diferencial" rows="3" onChange={onChange} required />
                  </div>

                  <h2 style={{ color: 'var(--accent-purple)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1.25rem', marginTop: '2.5rem' }}>Bloco 2 — Cultura e Experiência</h2>

                  <div className="form-group">
                    <label>4. Em uma ÚNICA palavra, como você descreveria nossa cultura hoje?</label>
                    <input className="form-input" name="cultura_uma_palavra" onChange={onChange} required />
                  </div>

                  <div className="form-group">
                    <label>5. Na prática, os valores da empresa são vividos no dia a dia?</label>
                    <ScaleRow name="valores_vividos" value={respostas.valores_vividos} onChange={onChange} min={1} max={5} minLabel="1 = Nunca" maxLabel="5 = Sempre" />
                  </div>

                  <div className="form-group">
                    <label>6. Minha opinião é ouvida e considerada.</label>
                    <ScaleRow name="opiniao_ouvida" value={respostas.opiniao_ouvida} onChange={onChange} min={1} max={5} minLabel="1 = Nunca" maxLabel="5 = Sempre" />
                  </div>

                  <div className="form-group">
                    <label>7. O que mais FORTALECE nossa cultura hoje?</label>
                    <textarea className="form-input" name="fortalece_cultura" rows="3" onChange={onChange} required />
                  </div>
                  <div className="form-group">
                    <label>7b. O que mais ENFRAQUECE nossa cultura hoje?</label>
                    <textarea className="form-input" name="enfraquece_cultura" rows="3" onChange={onChange} required />
                  </div>

                  <h2 style={{ color: 'var(--accent-blue)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1.25rem', marginTop: '2.5rem' }}>Bloco 3 — Liderança</h2>

                  <div className="form-group">
                    <label>8. De 0 a 10, que nota você daria à sua LIDERANÇA IMEDIATA?</label>
                    <ScaleRow name="nota_lideranca" value={respostas.nota_lideranca} onChange={onChange} min={0} max={10} minLabel="0 = Nada satisfatória" maxLabel="10 = Excelente" />
                  </div>
                  <div className="form-group">
                    <label>9. Pontos FORTES da sua liderança imediata</label>
                    <textarea className="form-input" name="lideranca_fortes" rows="3" onChange={onChange} required />
                  </div>
                  <div className="form-group">
                    <label>9b. O que poderia MELHORAR na sua liderança imediata?</label>
                    <textarea className="form-input" name="lideranca_melhorar" rows="3" onChange={onChange} required />
                  </div>

                  <h2 style={{ color: 'var(--success)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1.25rem', marginTop: '2.5rem' }}>Bloco 4 — Futuro e Recomendação</h2>

                  <div className="form-group">
                    <label>10. De 0 a 10, o quanto você RECOMENDARIA nossa empresa como um bom lugar para trabalhar? (eNPS)</label>
                    <ScaleRow name="enps" value={respostas.enps} onChange={onChange} min={0} max={10} minLabel="0 = De jeito nenhum" maxLabel="10 = Com certeza" />
                  </div>

                  <div className="form-group">
                    <label>11. Qual é a principal BARREIRA que dificulta sua entrega ou seu trabalho no dia a dia?</label>
                    <textarea className="form-input" name="barreira" rows="3" onChange={onChange} required />
                  </div>

                  <div className="form-group">
                    <label>12. Se você pudesse MELHORAR UMA COISA na empresa nos próximos 6 meses, o que priorizaria?</label>
                    <textarea className="form-input" name="prioridade_6meses" rows="3" onChange={onChange} required />
                  </div>

                  <h2 style={{ color: 'var(--accent-purple)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1.25rem', marginTop: '2.5rem' }}>Propósito e motivação</h2>

                  <div className="form-group">
                    <label>13. Você conhece o propósito e os valores da empresa?</label>
                    <textarea className="form-input" name="conhece_proposito" rows="2" onChange={onChange} required />
                  </div>
                  <div className="form-group">
                    <label>14. Você sente que seu trabalho está conectado com o propósito e os valores da empresa?</label>
                    <textarea className="form-input" name="conexao_proposito" rows="2" onChange={onChange} required />
                  </div>
                  <div className="form-group">
                    <label>15. O que mais te MOTIVA na empresa?</label>
                    <textarea className="form-input" name="motivacao" rows="2" onChange={onChange} required />
                  </div>
                  <div className="form-group">
                    <label>16. O que mais te DESMOTIVA na empresa?</label>
                    <textarea className="form-input" name="desmotivacao" rows="2" onChange={onChange} required />
                  </div>
                  <div className="form-group">
                    <label>17. Por que você escolheu trabalhar aqui?</label>
                    <textarea className="form-input" name="motivo_escolha" rows="2" onChange={onChange} required />
                  </div>
                  <div className="form-group">
                    <label>18. O que poderia te levar a sair da empresa?</label>
                    <textarea className="form-input" name="motivo_saida" rows="2" onChange={onChange} required />
                  </div>

                  <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                    <button type="submit" className="btn-primary" disabled={submitting} style={{ padding: '1rem 3rem', fontSize: '1.1rem', width: '100%' }}>
                      {submitting ? 'Enviando...' : 'Enviar respostas'}
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <h2 style={{ color: 'var(--success)', marginBottom: '1rem' }}>Obrigado pela sua contribuição!</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Sua voz é essencial para construirmos juntos uma empresa mais coerente, humana e forte.<br />
                As respostas serão analisadas de forma coletiva e usadas para orientar ações reais nas próximas etapas do projeto.
              </p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
