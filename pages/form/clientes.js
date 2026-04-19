import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Logo from '../../components/Logo';

const IMPORTANCIA = ['Essencial (não vivo sem)', 'Importante (uso com frequência)', 'Ocasional (uso apenas quando necessário)'];
const FATORES_ESCOLHA = [
  { id: 'preco', label: 'Preço / Custo-benefício' },
  { id: 'qualidade', label: 'Qualidade técnica / Resultado' },
  { id: 'atendimento', label: 'Atendimento / Experiência do cliente' },
  { id: 'recomendacao', label: 'Recomendação de terceiros / Autoridade' },
  { id: 'localizacao', label: 'Localização / Facilidade de acesso' },
];
const CANAIS = [
  'Instagram / Redes Sociais',
  'WhatsApp',
  'Site oficial',
  'Google (Busca ou Mapas)',
  'Indicação de amigos/conhecidos',
  'Espaço físico / Presencial',
];
const ATENDIMENTO_QUESITOS = [
  { id: 'cordialidade', label: 'Cordialidade e Empatia' },
  { id: 'conhecimento', label: 'Conhecimento Técnico / do Produto' },
  { id: 'tempo_resposta', label: 'Tempo de Resposta / Agilidade' },
  { id: 'clareza', label: 'Clareza nas Informações' },
  { id: 'confianca', label: 'Confiança Transmitida' },
];
const PRECO_VALOR = [
  'Preço justo pelo alto valor entregue',
  'Preço elevado, mas vale o investimento',
  'Preço abaixo do que a entrega vale',
  'Preço alto para a entrega atual',
];
const RECOMENDARIA = ['Com certeza!', 'Talvez.', 'Não recomendaria.'];
const ENTREVISTA_EXTRA = ['Sim, pode entrar em contato.', 'No momento não, prefiro apenas responder o formulário.'];

function Radio({ name, value, checked, onChange, label }) {
  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', padding: '0.35rem 0', fontSize: '0.95rem' }}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} required style={{ marginTop: '0.25rem' }} />
      <span>{label}</span>
    </label>
  );
}

function ScaleRow({ name, value, onChange, min, max, minLabel, maxLabel }) {
  const options = [];
  for (let i = min; i <= max; i++) options.push(i);
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.2rem', flexWrap: 'wrap' }}>
        {options.map(n => (
          <label key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
            <input type="radio" name={name} value={n} checked={String(value) === String(n)} onChange={onChange} required />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{n}</span>
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

export default function FormClientes() {
  const router = useRouter();
  const { projeto, t: token } = router.query;

  const [r, setR] = useState({});
  const [canaisSel, setCanaisSel] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [tokenData, setTokenData] = useState(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenError, setTokenError] = useState('');

  const set = (name, value) => setR(prev => ({ ...prev, [name]: value }));
  const onChange = (e) => set(e.target.name, e.target.value);

  useEffect(() => {
    if (!router.isReady || !token) return;
    setTokenLoading(true);
    fetch(`/api/respondentes/by-token?token=${encodeURIComponent(token)}`)
      .then(res => res.json())
      .then(json => {
        if (!json.success) { setTokenError(json.error || 'Link inválido'); return; }
        setTokenData(json.respondente);
        setR(prev => ({ ...prev, nome_completo: json.respondente.nome }));
      })
      .catch(err => setTokenError(err.message))
      .finally(() => setTokenLoading(false));
  }, [router.isReady, token]);

  const toggleCanal = (canal) => {
    setCanaisSel(prev => prev.includes(canal) ? prev.filter(c => c !== canal) : [...prev, canal]);
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
          projetoId: tokenData?.projeto_id || projeto,
          tipo: 'intake_clientes',
          token: token || undefined,
          respostas: { ...r, canais: canaisSel, respondente: tokenData?.nome || r.nome_completo || 'Cliente' },
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

  const marcaNome = tokenData?.projeto_nome || '';
  const sectionColor = (c) => ({ color: c, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1.25rem', marginTop: '2.5rem' });

  return (
    <>
      <Head><title>Pesquisa de Percepção | Espansione</title></Head>
      <div className="page-container" style={{ paddingTop: '2rem', minHeight: '100vh', paddingBottom: '4rem' }}>
        <main className="container" style={{ maxWidth: '820px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <Logo size="md" center />
          </div>

          {!success ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ color: 'var(--text-primary)', fontSize: '1.8rem', marginBottom: '0.4rem' }}>Pesquisa de Percepção{marcaNome ? ` — ${marcaNome}` : ''}</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Sua voz nos ajuda a evoluir</p>
              </div>

              <div className="glass-card" style={{ padding: '1.5rem 2rem', marginBottom: '2rem', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Agradecemos por dedicar alguns minutos para nos ajudar a evoluir. Suas respostas são fundamentais para construirmos uma experiência cada vez melhor e um posicionamento mais assertivo.<br />
                  ⏱ Tempo estimado: <strong>8 a 12 minutos</strong>.
                </p>
              </div>

              <div className="glass-card" style={{ padding: '2rem' }}>
                <form onSubmit={handleSubmit}>
                  {errorMsg && <div style={{ background: 'var(--error)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', color: '#fff' }}>{errorMsg}</div>}

                  <h2 style={sectionColor('var(--accent-blue)')}>1. Perfil e Contexto</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '-1rem', marginBottom: '1rem' }}>Entendendo quem você é e sua relação com o segmento.</p>

                  {tokenData ? (
                    <div className="form-group" style={{ background: 'rgba(96,165,250,0.08)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(96,165,250,0.2)' }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Respondendo como</div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{tokenData.nome}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{tokenData.email}</div>
                    </div>
                  ) : (
                    <div className="form-group">
                      <label>Nome completo</label>
                      <input className="form-input" name="nome_completo" onChange={onChange} required />
                    </div>
                  )}

                  <div className="form-group">
                    <label>Idade</label>
                    <input className="form-input" name="idade" type="number" min="0" max="120" onChange={onChange} required />
                  </div>
                  <div className="form-group">
                    <label>Profissão</label>
                    <input className="form-input" name="profissao" onChange={onChange} required />
                  </div>
                  <div className="form-group">
                    <label>Cidade / Estado</label>
                    <input className="form-input" name="cidade_estado" placeholder="Ex: São Paulo / SP" onChange={onChange} required />
                  </div>
                  <div className="form-group">
                    <label>Qual a importância desse produto/serviço no seu dia a dia?</label>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {IMPORTANCIA.map(i => <Radio key={i} name="importancia" value={i} checked={r.importancia === i} onChange={onChange} label={i} />)}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Qual o seu principal objetivo ou "dor" que você busca resolver ao procurar por esse produto/serviço?</label>
                    <textarea className="form-input" name="dor_principal" rows="3" onChange={onChange} required />
                  </div>

                  <h2 style={sectionColor('var(--accent-purple)')}>2. Comportamento e Escolha</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '-1rem', marginBottom: '1rem' }}>Entendendo como você decide onde investir seu dinheiro.</p>

                  <div className="form-group">
                    <label>Ao escolher uma marca neste segmento, o que é mais importante para você? <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>(Ordene de 1 a 5, sendo 1 o mais importante)</span></label>
                    {FATORES_ESCOLHA.map(f => (
                      <div key={f.id} style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.9rem' }}>{f.label}</span>
                        <select className="form-input" style={{ margin: 0, padding: '0.4rem' }} name={`escolha_${f.id}`} value={r[`escolha_${f.id}`] || ''} onChange={onChange} required>
                          <option value="" disabled>Posição</option>
                          {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>

                  <div className="form-group">
                    <label>Outras pessoas influenciaram a sua decisão de escolher{marcaNome ? ` a ${marcaNome}` : ' a marca'}? <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>(ex: amigos, influenciadores, familiares)</span></label>
                    <textarea className="form-input" name="influenciadores" rows="2" onChange={onChange} required />
                  </div>
                  <div className="form-group">
                    <label>Antes de fechar conosco, você teve algum receio ou dúvida? O que quase te impediu?</label>
                    <textarea className="form-input" name="receios" rows="3" onChange={onChange} required />
                  </div>
                  <div className="form-group">
                    <label>Quais outras marcas (de qualquer segmento) você admira e costuma consumir na sua rotina?</label>
                    <textarea className="form-input" name="marcas_admiradas" rows="2" onChange={onChange} required />
                  </div>

                  <h2 style={sectionColor('#10b981')}>3. Jornada e Atendimento</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '-1rem', marginBottom: '1rem' }}>Avaliando os pontos de contato e a interação humana.</p>

                  <div className="form-group">
                    <label>Por quais destes canais você já interagiu{marcaNome ? ` com a ${marcaNome}` : ''}? <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>(marque todos que se aplicam)</span></label>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {CANAIS.map(c => (
                        <label key={c} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.35rem 0', fontSize: '0.95rem' }}>
                          <input type="checkbox" checked={canaisSel.includes(c)} onChange={() => toggleCanal(c)} />
                          <span>{c}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Em uma escala de 0 a 10, como você avalia o nosso atendimento nos seguintes quesitos?</label>
                    {ATENDIMENTO_QUESITOS.map(q => (
                      <div key={q.id} style={{ marginBottom: '0.8rem' }}>
                        <div style={{ fontSize: '0.9rem', marginBottom: '0.3rem' }}>{q.label}</div>
                        <ScaleRow name={`atend_${q.id}`} value={r[`atend_${q.id}`]} onChange={onChange} min={0} max={10} minLabel="0 = péssimo" maxLabel="10 = excelente" />
                      </div>
                    ))}
                  </div>

                  <div className="form-group">
                    <label>Você se lembra de alguma comunicação (post, anúncio, vídeo) da marca? Se sim, o que mais te chamou a atenção nela?</label>
                    <textarea className="form-input" name="comunicacao_lembrada" rows="3" onChange={onChange} required />
                  </div>

                  <h2 style={sectionColor('#f59e0b')}>4. Experiência e Valor Real</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '-1rem', marginBottom: '1rem' }}>Entendendo o impacto real na sua vida.</p>

                  <div className="form-group">
                    <label>Em uma escala de 1 a 10, o quanto você está satisfeito(a) com os resultados obtidos?</label>
                    <ScaleRow name="satisfacao" value={r.satisfacao} onChange={onChange} min={1} max={10} minLabel="1 = nada satisfeito" maxLabel="10 = totalmente satisfeito" />
                  </div>
                  <div className="form-group">
                    <label>Como{marcaNome ? ` a ${marcaNome}` : ' a marca'} impactou a sua rotina ou a forma como você se sente?</label>
                    <textarea className="form-input" name="impacto_rotina" rows="3" onChange={onChange} required />
                  </div>
                  <div className="form-group">
                    <label>Qual é o maior diferencial{marcaNome ? ` da ${marcaNome}` : ''} em relação às outras opções que você conhece?</label>
                    <textarea className="form-input" name="diferencial" rows="3" onChange={onChange} required />
                  </div>
                  <div className="form-group">
                    <label>Sobre o valor investido, como você percebe o preço em relação ao benefício entregue?</label>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {PRECO_VALOR.map(p => <Radio key={p} name="preco_valor" value={p} checked={r.preco_valor === p} onChange={onChange} label={p} />)}
                    </div>
                  </div>

                  <h2 style={sectionColor('#f472b6')}>5. Personalidade da Marca</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '-1rem', marginBottom: '1rem' }}>Identidade simbólica e emocional.</p>

                  <div className="form-group">
                    <label>Se{marcaNome ? ` a ${marcaNome}` : ' a marca'} fosse uma pessoa, como você a descreveria? <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>(ex: séria, acolhedora, sofisticada, prática, etc.)</span></label>
                    <textarea className="form-input" name="personalidade" rows="3" onChange={onChange} required />
                  </div>
                  <div className="form-group">
                    <label>Como você apresentaria{marcaNome ? ` a ${marcaNome}` : ' a marca'} para um amigo em poucas palavras?</label>
                    <textarea className="form-input" name="apresentacao_amigo" rows="2" onChange={onChange} required />
                  </div>
                  <div className="form-group">
                    <label>Defina{marcaNome ? ` a ${marcaNome}` : ' a marca'} em apenas uma palavra</label>
                    <input className="form-input" name="uma_palavra" onChange={onChange} required />
                  </div>

                  <h2 style={sectionColor('var(--accent-blue)')}>6. Futuro e Fechamento</h2>

                  <div className="form-group">
                    <label>Existe algo que você gostaria de encontrar conosco e que ainda não oferecemos?</label>
                    <textarea className="form-input" name="desejo_futuro" rows="3" onChange={onChange} />
                  </div>
                  <div className="form-group">
                    <label>Você recomendaria{marcaNome ? ` a ${marcaNome}` : ' a marca'} para alguém?</label>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {RECOMENDARIA.map(rc => <Radio key={rc} name="recomendaria" value={rc} checked={r.recomendaria === rc} onChange={onChange} label={rc} />)}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Gostaria de participar de uma breve entrevista (15 min) para nos ajudar a aprofundar estes pontos?</label>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {ENTREVISTA_EXTRA.map(e => <Radio key={e} name="entrevista_extra" value={e} checked={r.entrevista_extra === e} onChange={onChange} label={e} />)}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Número de WhatsApp para contato <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>(opcional)</span></label>
                    <input className="form-input" name="whatsapp" placeholder="(00) 00000-0000" onChange={onChange} />
                  </div>

                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '1.5rem' }}>
                    Seus dados serão utilizados exclusivamente para fins de melhoria interna{marcaNome ? ` de ${marcaNome}` : ''} e não serão partilhados com terceiros.
                  </p>

                  <div style={{ textAlign: 'center', marginTop: '2rem' }}>
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
              <h2 style={{ color: 'var(--success)', marginBottom: '1rem' }}>Obrigado pela sua participação!</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Sua opinião foi registrada com sucesso e vai alimentar a construção estratégica da marca.
              </p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
