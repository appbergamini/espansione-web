import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Logo from '../../components/Logo';

const TEMPO_EMPRESA = ['Menos de 1 ano', '1 a 3 anos', '3 a 7 anos', '7 a 15 anos', 'Mais de 15 anos'];
const SEGMENTO = ['Serviço', 'Comércio varejista', 'Comércio atacadista', 'Indústria', 'Outro'];
const FATURAMENTO = ['Até R$ 120 mil', 'De R$ 120 mil a R$ 500 mil', 'De R$ 500 mil a R$ 2 milhões', 'De R$ 2 a 6 milhões', 'De R$ 6 a 12 milhões', 'Mais de R$ 12 milhões'];
const COLABORADORES = ['Apenas eu', '2 a 10', '11 a 50', '51 a 100', 'Mais de 100'];
const ESTAGIO = [
  { v: 'Estruturação', d: 'ainda montando as bases' },
  { v: 'Crescimento', d: 'expandindo operação e receita' },
  { v: 'Reposicionamento', d: 'redefinindo direção ou identidade' },
  { v: 'Consolidação', d: 'maturidade e escala' },
  { v: 'Sucessão', d: 'transição de liderança ou sociedade' },
  { v: 'Virada', d: 'correção de rota diante de crise ou ruptura' },
];

const RADAR_DIMS = ['Propósito', 'Cultura', 'Liderança', 'Clima', 'Comunicação Interna', 'Experiência do Colaborador'];

const DIAG360 = [
  { g: 'Estratégia', items: [
    'Temos visão de futuro clara e compartilhada pela liderança.',
    'Missão, valores e diferenciais estão definidos e disseminados na equipe.',
    'Existe rotina formal de revisão de resultados e de decisões estratégicas.',
    'O que é planejado é colocado em prática e gera os resultados esperados.',
  ]},
  { g: 'Comercial', items: [
    'A equipe comercial tem metas claras, processo definido e acompanhamento recorrente.',
    'Existe funil de vendas estruturado e visibilidade das etapas da venda.',
    'Há processos de pós-venda, retenção ou relacionamento estruturados.',
    'A voz do cliente gera aprendizado e melhorias concretas na operação.',
  ]},
  { g: 'Marketing', items: [
    'Existe planejamento de marketing com públicos, canais e prioridades definidos.',
    'As mensagens e conteúdos da empresa respondem a dores reais do cliente.',
    'A marca se apresenta de forma consistente nos diferentes pontos de contato.',
    'Resultados de canais e campanhas são medidos e usados para ajuste.',
  ]},
  { g: 'Operação', items: [
    'Os processos críticos de entrega funcionam com consistência.',
    'A promessa comunicada pela marca encontra capacidade real de execução.',
    'Há visibilidade dos principais gargalos que afetam a experiência do cliente.',
    'As áreas colaboram entre si para sustentar a entrega da proposta de valor.',
  ]},
  { g: 'Pessoas', items: [
    'Papéis, responsabilidades e expectativas estão claros para todos.',
    'As lideranças dão direção, feedback e exemplo coerente com a cultura desejada.',
    'Os valores da empresa são vividos e reconhecidos no dia a dia.',
    'O ambiente favorece colaboração, pertencimento e responsabilização.',
  ]},
  { g: 'Gestão/Finanças', items: [
    'Os indicadores-chave do negócio são acompanhados de forma consistente.',
    'Existe visibilidade sobre orçamento, rentabilidade, caixa e eficiência econômica.',
    'As decisões são tomadas com base em dados, não apenas em percepção.',
    'Responsáveis, prazos e planos de ação ficam claros após as decisões.',
  ]},
];

const DIAG360_COLORS = {
  'Estratégia': '#60a5fa',
  'Comercial': '#a78bfa',
  'Marketing': '#f59e0b',
  'Operação': '#10b981',
  'Pessoas': '#f472b6',
  'Gestão/Finanças': '#38bdf8',
};

const DIAG_SCALE = [
  { v: 1, label: 'Nunca' },
  { v: 2, label: 'Poucas vezes' },
  { v: 3, label: 'Muitas vezes' },
  { v: 4, label: 'Sempre' },
];

function Radio({ name, value, checked, onChange, label, subtext }) {
  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', padding: '0.35rem 0', fontSize: '0.95rem' }}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} required style={{ marginTop: '0.25rem' }} />
      <span><strong>{label}</strong>{subtext && <span style={{ color: 'var(--text-secondary)' }}> — {subtext}</span>}</span>
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

export default function FormSocios() {
  const router = useRouter();
  const { projeto, t: token } = router.query;
  const [r, setR] = useState({});
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
        setR(prev => ({ ...prev, nome_respondente: json.respondente.nome }));
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
          tipo: 'intake_socios',
          token: token || undefined,
          respostas: { ...r, respondente: tokenData?.nome || r.nome_respondente || 'Sócio' },
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

  const sectionColor = (c) => ({ color: c, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1.25rem', marginTop: '2.5rem' });

  return (
    <>
      <Head><title>Diagnóstico Inicial | Espansione</title></Head>
      <div className="page-container" style={{ paddingTop: '2rem', minHeight: '100vh', paddingBottom: '4rem' }}>
        <main className="container" style={{ maxWidth: '860px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <Logo size="md" center />
          </div>

          {!success ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ color: 'var(--text-primary)', fontSize: '1.8rem', marginBottom: '0.4rem' }}>Diagnóstico Inicial</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Branding &amp; Negócios — Visão do Empresário</p>
              </div>

              <div className="glass-card" style={{ padding: '1.5rem 2rem', marginBottom: '2rem', background: 'rgba(96,165,250,0.05)', border: '1px solid rgba(96,165,250,0.2)' }}>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  ⏱ Preenchimento estimado: <strong>40 a 60 minutos</strong>.<br />
                  📌 Responda com honestidade, seja específico e registre tensões entre o que a empresa diz e o que pratica.<br />
                  🧭 Este diagnóstico alimentará toda a construção estratégica da marca nas etapas seguintes.
                </p>
              </div>

              <div className="glass-card" style={{ padding: '2rem' }}>
                <form onSubmit={handleSubmit}>
                  {errorMsg && <div style={{ background: 'var(--error)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', color: '#fff' }}>{errorMsg}</div>}

                  {/* Identificação */}
                  <h2 style={sectionColor('var(--text-primary)')}>Identificação</h2>
                  {tokenData ? (
                    <div className="form-group" style={{ background: 'rgba(96,165,250,0.08)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(96,165,250,0.2)' }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Respondendo como</div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{tokenData.nome}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{tokenData.email}</div>
                    </div>
                  ) : (
                    <div className="form-group"><label>Seu nome</label><input className="form-input" name="nome_respondente" onChange={onChange} required /></div>
                  )}
                  <div className="form-group"><label>Cargo / Função</label><input className="form-input" name="cargo" onChange={onChange} required /></div>
                  <div className="form-group"><label>Nome fantasia / razão social</label><input className="form-input" name="nome_empresa" onChange={onChange} required /></div>
                  <div className="form-group"><label>Ano de fundação</label><input className="form-input" name="ano_fundacao" onChange={onChange} required /></div>
                  <div className="form-group"><label>Site / Instagram</label><input className="form-input" name="site_instagram" onChange={onChange} /></div>
                  <div className="form-group"><label>Cidade-base</label><input className="form-input" name="cidade" onChange={onChange} required /></div>

                  {/* PARTE 1 */}
                  <h2 style={sectionColor('var(--accent-blue)')}>Parte 1 — Negócio e Momento</h2>

                  <div className="form-group">
                    <label>1. Tempo de empresa</label>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {TEMPO_EMPRESA.map(t => <Radio key={t} name="tempo_empresa" value={t} checked={r.tempo_empresa === t} onChange={onChange} label={t} />)}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>2. Segmento de atuação</label>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {SEGMENTO.map(s => <Radio key={s} name="segmento" value={s} checked={r.segmento === s} onChange={onChange} label={s} />)}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>3. Faturamento anual atual</label>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {FATURAMENTO.map(f => <Radio key={f} name="faturamento" value={f} checked={r.faturamento === f} onChange={onChange} label={f} />)}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>4. Número de colaboradores</label>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {COLABORADORES.map(c => <Radio key={c} name="num_colaboradores" value={c} checked={r.num_colaboradores === c} onChange={onChange} label={c} />)}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>5. Estágio atual do negócio</label>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {ESTAGIO.map(e => <Radio key={e.v} name="estagio" value={e.v} checked={r.estagio === e.v} onChange={onChange} label={e.v} subtext={e.d} />)}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>6. O que vocês vendem e para quem? <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>(oferta, canal, ticket médio, perfil do cliente)</span></label>
                    <textarea className="form-input" name="p1_oferta" rows="4" onChange={onChange} required />
                  </div>

                  <div className="form-group">
                    <label>7. Quais decisões mais importantes a empresa precisa tomar nos próximos 12 meses?</label>
                    <textarea className="form-input" name="p1_decisoes_12m" rows="4" onChange={onChange} required />
                  </div>

                  {/* PARTE 2 */}
                  <h2 style={sectionColor('var(--accent-purple)')}>Parte 2 — Essência e Marca</h2>

                  <div className="form-group">
                    <label>1. Como a empresa nasceu? Que problema ou necessidade vocês queriam resolver?</label>
                    <textarea className="form-input" name="p2_nascimento" rows="4" onChange={onChange} required />
                  </div>
                  <div className="form-group">
                    <label>2. Que impacto a empresa pretende causar? Que causa é inegociável?</label>
                    <textarea className="form-input" name="p2_impacto" rows="4" onChange={onChange} required />
                  </div>
                  <div className="form-group">
                    <label>3. Se a empresa deixasse de existir amanhã, o que morreria com ela — algo maior além da operação?</label>
                    <textarea className="form-input" name="p2_o_que_morreria" rows="3" onChange={onChange} required />
                  </div>

                  <div className="form-group">
                    <label>4. Os 3 valores inegociáveis da empresa (e o que cada um significa na prática):</label>
                    {[1, 2, 3].map(i => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <input className="form-input" style={{ margin: 0 }} name={`p2_valor_${i}_nome`} placeholder={`Valor ${i}`} onChange={onChange} required />
                        <input className="form-input" style={{ margin: 0 }} name={`p2_valor_${i}_significado`} placeholder="O que significa na prática" onChange={onChange} required />
                      </div>
                    ))}
                  </div>

                  <div className="form-group">
                    <label>5. Se a marca fosse uma pessoa, como você descreveria a personalidade dela?</label>
                    <textarea className="form-input" name="p2_personalidade" rows="3" onChange={onChange} required />
                  </div>

                  <div className="form-group">
                    <label>6a. 3 palavras que você GOSTARIA que as pessoas usassem (ambição)</label>
                    {[1, 2, 3].map(i => (
                      <input key={i} className="form-input" style={{ marginBottom: '0.4rem' }} name={`p2_palavra_desejada_${i}`} placeholder={`Palavra desejada ${i}`} onChange={onChange} required />
                    ))}
                  </div>
                  <div className="form-group">
                    <label>6b. 3 palavras que as pessoas REALMENTE usam hoje (percepção atual)</label>
                    {[1, 2, 3].map(i => (
                      <input key={i} className="form-input" style={{ marginBottom: '0.4rem' }} name={`p2_palavra_real_${i}`} placeholder={`Palavra real ${i}`} onChange={onChange} required />
                    ))}
                  </div>

                  <div className="form-group">
                    <label>7. Sua marca tem uma FRASE DE PROPÓSITO declarada e comunicada? Se sim, qual?</label>
                    <textarea className="form-input" name="p2_frase_proposito" rows="2" onChange={onChange} />
                  </div>

                  {/* PARTE 3 */}
                  <h2 style={sectionColor('#10b981')}>Parte 3 — Cliente, Oferta e Mercado</h2>

                  <div className="form-group">
                    <label>1. Qual é a principal TRANSFORMAÇÃO que o cliente compra ao contratar vocês?</label>
                    <textarea className="form-input" name="p3_transformacao" rows="3" onChange={onChange} required />
                  </div>
                  <div className="form-group">
                    <label>2. O que realmente diferencia a empresa dos concorrentes? <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>(diferenciais defendáveis, não slogans)</span></label>
                    <textarea className="form-input" name="p3_diferencial" rows="3" onChange={onChange} required />
                  </div>

                  <div className="form-group">
                    <label>3. Em quais situações vocês costumam VENCER uma concorrência?</label>
                    <textarea className="form-input" name="p3_quando_vencemos" rows="3" onChange={onChange} required />
                  </div>
                  <div className="form-group">
                    <label>3b. Em quais costumam PERDER?</label>
                    <textarea className="form-input" name="p3_quando_perdemos" rows="3" onChange={onChange} required />
                  </div>

                  <div className="form-group">
                    <label>4. Quais são as objeções mais frequentes do cliente no processo de compra?</label>
                    <textarea className="form-input" name="p3_objecoes" rows="3" onChange={onChange} required />
                  </div>

                  <div className="form-group">
                    <label>5. Quem são seus principais concorrentes? (diretos e indiretos)</label>
                    <textarea className="form-input" name="p3_concorrentes" rows="3" onChange={onChange} required />
                  </div>

                  <div className="form-group">
                    <label>6a. O que os concorrentes fazem BEM?</label>
                    <textarea className="form-input" name="p3_concorrentes_bem" rows="3" onChange={onChange} required />
                  </div>
                  <div className="form-group">
                    <label>6b. O que fazem MAL?</label>
                    <textarea className="form-input" name="p3_concorrentes_mal" rows="3" onChange={onChange} required />
                  </div>

                  <div className="form-group">
                    <label>7. Alguma marca (qualquer segmento) que você admira? Qual e por quê?</label>
                    <textarea className="form-input" name="p3_marca_admirada" rows="3" onChange={onChange} required />
                  </div>

                  {/* PARTE 4 */}
                  <h2 style={sectionColor('#f472b6')}>Parte 4 — Cultura e Marca Empregadora</h2>

                  <div className="form-group">
                    <label>1. Como é o clima interno da empresa hoje?</label>
                    <textarea className="form-input" name="p4_clima" rows="3" onChange={onChange} required />
                  </div>
                  <div className="form-group">
                    <label>2. Maiores desafios de liderança e comunicação interna hoje</label>
                    <textarea className="form-input" name="p4_desafios_lideranca" rows="3" onChange={onChange} required />
                  </div>
                  <div className="form-group">
                    <label>3. Proposta de valor ao colaborador hoje — o que a empresa oferece e por que é relevante?</label>
                    <textarea className="form-input" name="p4_evp" rows="3" onChange={onChange} required />
                  </div>
                  <div className="form-group">
                    <label>4. O que hoje, na cultura atual, ATRAPALHA a marca que queremos construir?</label>
                    <textarea className="form-input" name="p4_atrapalha" rows="3" onChange={onChange} required />
                  </div>

                  <div className="form-group">
                    <label>Radar de Marca Empregadora <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>(0 = inexistente, 10 = referência de excelência)</span></label>
                    {RADAR_DIMS.map(d => (
                      <div key={d} style={{ marginBottom: '0.5rem' }}>
                        <div style={{ fontSize: '0.9rem', marginBottom: '0.3rem' }}>{d}</div>
                        <ScaleRow name={`p4_radar_${d.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z_]/g, '')}`} value={r[`p4_radar_${d.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z_]/g, '')}`]} onChange={onChange} min={0} max={10} minLabel="0 = inexistente" maxLabel="10 = excelência" />
                      </div>
                    ))}
                  </div>

                  <div className="form-group">
                    <label>5. Qual dimensão do radar é a MAIS CRÍTICA para fortalecer nos próximos 12 meses? Por quê?</label>
                    <textarea className="form-input" name="p4_dimensao_critica" rows="3" onChange={onChange} required />
                  </div>

                  {/* PARTE 5 */}
                  <h2 style={sectionColor('#f59e0b')}>Parte 5 — Futuro e Prioridades</h2>

                  <div className="form-group">
                    <label>1a. Onde você quer a empresa em 3 anos? <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>(faturamento, estrutura, presença, reputação)</span></label>
                    <textarea className="form-input" name="p5_3_anos" rows="3" onChange={onChange} required />
                  </div>
                  <div className="form-group">
                    <label>1b. E em 5 anos?</label>
                    <textarea className="form-input" name="p5_5_anos" rows="3" onChange={onChange} required />
                  </div>
                  <div className="form-group">
                    <label>2. Se pudesse mudar UMA coisa na marca amanhã, o que seria?</label>
                    <textarea className="form-input" name="p5_mudaria" rows="2" onChange={onChange} required />
                  </div>

                  <div className="form-group">
                    <label>3a. 3 IMPULSIONADORES (forças e vantagens)</label>
                    {[1, 2, 3].map(i => (
                      <input key={i} className="form-input" style={{ marginBottom: '0.4rem' }} name={`p5_impulsionador_${i}`} placeholder={`Impulsionador ${i}`} onChange={onChange} required />
                    ))}
                  </div>
                  <div className="form-group">
                    <label>3b. 3 DETRATORES (fragilidades e dores)</label>
                    {[1, 2, 3].map(i => (
                      <input key={i} className="form-input" style={{ marginBottom: '0.4rem' }} name={`p5_detrator_${i}`} placeholder={`Detrator ${i}`} onChange={onChange} required />
                    ))}
                  </div>
                  <div className="form-group">
                    <label>3c. 3 ACELERADORES (oportunidades de crescimento)</label>
                    {[1, 2, 3].map(i => (
                      <input key={i} className="form-input" style={{ marginBottom: '0.4rem' }} name={`p5_acelerador_${i}`} placeholder={`Acelerador ${i}`} onChange={onChange} required />
                    ))}
                  </div>

                  <div className="form-group">
                    <label>4a. Hoje, enquanto líder: meu MAIOR OBJETIVO é...</label>
                    <textarea className="form-input" name="p5_maior_objetivo" rows="2" onChange={onChange} required />
                  </div>
                  <div className="form-group">
                    <label>4b. Meu MAIOR DESAFIO é...</label>
                    <textarea className="form-input" name="p5_maior_desafio" rows="2" onChange={onChange} required />
                  </div>
                  <div className="form-group">
                    <label>5. Quais metas de negócio a marca e a comunicação precisam sustentar nos próximos 12 meses?</label>
                    <textarea className="form-input" name="p5_metas_12m" rows="3" onChange={onChange} required />
                  </div>

                  {/* PARTE 6 */}
                  <h2 style={sectionColor('#38bdf8')}>Parte 6 — Diagnóstico 360° do Negócio</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Escala: <strong>1 Nunca</strong> · <strong>2 Poucas vezes</strong> · <strong>3 Muitas vezes</strong> · <strong>4 Sempre</strong>
                  </p>

                  {DIAG360.map((bloco, bi) => (
                    <div key={bloco.g} style={{ marginBottom: '2rem', border: `1px solid ${DIAG360_COLORS[bloco.g]}33`, borderRadius: '10px', padding: '1.25rem 1.5rem' }}>
                      <h3 style={{ color: DIAG360_COLORS[bloco.g], margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700 }}>{bloco.g}</h3>
                      {bloco.items.map((q, i) => {
                        const idx = bi * 4 + i + 1;
                        const name = `p6_q${idx}`;
                        const isLast = i === bloco.items.length - 1;
                        return (
                          <div key={idx} style={{ marginBottom: isLast ? 0 : '1.5rem', paddingBottom: isLast ? 0 : '1.25rem', borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.04)' }}>
                            <div style={{ fontSize: '0.92rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>{idx}. {q}</div>
                            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                              {DIAG_SCALE.map(s => (
                                <label key={s.v} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer', padding: '0.2rem 0' }}>
                                  <input type="radio" name={name} value={s.v} checked={String(r[name]) === String(s.v)} onChange={onChange} required />
                                  <span>{s.v} — {s.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}

                  <div className="form-group">
                    <label>1. Qual pilar você considera o mais URGENTE de ser fortalecido nos próximos 6 meses? Por quê?</label>
                    <textarea className="form-input" name="p6_pilar_urgente" rows="3" onChange={onChange} required />
                  </div>

                  <div className="form-group">
                    <label>Observações finais <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>(qualquer contexto ou tensão importante não contemplado acima)</span></label>
                    <textarea className="form-input" name="observacoes_finais" rows="4" onChange={onChange} />
                  </div>

                  <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                    <button type="submit" className="btn-primary" disabled={submitting} style={{ padding: '1rem 3rem', fontSize: '1.1rem', width: '100%' }}>
                      {submitting ? 'Enviando...' : 'Finalizar Diagnóstico'}
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <h2 style={{ color: 'var(--success)', marginBottom: '1rem' }}>Diagnóstico enviado!</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Obrigado pelo tempo e pela honestidade. Este diagnóstico é a base de todo o processo estratégico de branding e reestruturação que se inicia agora.
              </p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
