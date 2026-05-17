import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Logo from '../../components/Logo';

// 27 questões baseadas no teste PWR Gestão — mapeia 3 disciplinas de valor
// (Treacy & Wiersema): Excelência Operacional, Intimidade com Cliente,
// Liderança em Produto.

const QUESTOES = [
  { n: 1, cat: 'EO', peso: 1.5, titulo: 'Preço é um fator primordial no meu segmento de atuação?', min: 'As variações de preços entre concorrentes são grandes e o preço não é fator preponderante na decisão de compra do cliente.', max: 'Variações mínimas de preços fazem perder pedidos.' },
  { n: 2, cat: 'IC', peso: 1.5, titulo: 'Conhecer o meu cliente para lhe oferecer exatamente o que ele precisa é fundamental no meu segmento?', min: 'O entendimento e mapeamento dos públicos-alvo são genéricos, superficiais e não científicos.', max: 'Pesquisas de análise de perfis, comportamento e satisfação de clientes são constantes.' },
  { n: 3, cat: 'LP', peso: 2, titulo: 'Lançar produtos/serviços novos constantemente é um dos maiores diferenciais que uma empresa pode ter no meu segmento?', min: 'Poucas mudanças nos produtos são suficientes para gerar nova curva de continuidade de produtos.', max: 'O ciclo de vida de produtos é muito curto; o cliente rapidamente substitui a compra e precisa constantemente de melhorias e novidades.' },
  { n: 4, cat: 'EO', peso: 1, titulo: 'Meus produtos/serviços deveriam ser oferecidos de forma padronizada, seguindo um modelo preconcebido?', min: 'A padronização é um desafio: não há procedimentos documentados e há variação do produto/serviço.', max: 'A execução e processamento do produto/serviço é toda estudada, formalizada em manuais, padronizada e auditada.' },
  { n: 5, cat: 'LP', peso: 1.5, titulo: 'Procuro sempre oferecer o melhor produto do mercado e me diferenciar dos meus concorrentes por meio da inovação?', min: 'Não há muitos problemas em fornecer produto/serviço com qualidade similar à dos meus concorrentes.', max: 'Preço não é fator primordial para o negócio — singularidade, diferenciação e alto valor agregado são as principais estratégias.' },
  { n: 6, cat: 'IC', peso: 1, titulo: 'Primeiramente entendo o que meu cliente quer para depois construir meu produto/serviço — o cliente é quase um coprodutor?', min: 'As necessidades não são analisadas cliente a cliente e não há relação próxima com o indivíduo.', max: 'A definição dos requisitos, aspectos e características do produto/serviço é feita em conjunto com o cliente.' },
  { n: 7, cat: 'EO', peso: 1, titulo: 'Minha equipe de vendas/atendimento é treinada para realizar um script padronizado, atendendo várias pessoas em um mesmo dia?', min: 'A venda/atendimento é específica para cada cliente; não há abordagem pré-definida e padronizada.', max: 'Todos os passos da venda/atendimento são mapeados, documentados e auditados.' },
  { n: 8, cat: 'LP', peso: 1, titulo: 'Meu produto é muito inovador — minha equipe de vendas é treinada para vender um produto único no mercado?', min: 'A equipe de vendas não precisa entender as características específicas do produto/serviço, nem dos concorrentes.', max: 'A equipe precisa estar atenta constantemente a novidades, lançamentos, inovações e características técnicas.' },
  { n: 9, cat: 'IC', peso: 1, titulo: 'Necessito de pessoas bem qualificadas na minha equipe comercial para entender a necessidade do cliente e gerar relação pessoal?', min: 'O grau de instrução da equipe de vendas pode ser baixo e não precisa de competências comportamentais elevadas.', max: 'As pessoas precisam entender de perfis comportamentais, fazer perguntas certas e ter boas habilidades comportamentais.' },
  { n: 10, cat: 'EO', peso: 1.5, titulo: 'O produto/serviço que ofereço possui grande demanda? Vários tipos diferentes de pessoas o demandam?', min: 'O produto/serviço é específico para um perfil de cliente, dificilmente um mesmo cliente compra exatamente o mesmo produto.', max: 'O produto/serviço tem capacidade de atender a qualquer tipo de pessoa e o consumo é recorrente.' },
  { n: 11, cat: 'IC', peso: 1.5, titulo: 'Meus produtos/serviços atendem determinado tipo de cliente — entrego uma solução específica e pontual para ele?', min: 'As soluções são genéricas, independente do tipo de cliente.', max: 'Cada cliente possui sua demanda analisada e seu produto/serviço é desenvolvido para atender necessidade específica.' },
  { n: 12, cat: 'LP', peso: 1.5, titulo: 'É imprescindível que meu cliente compreenda o diferencial do meu produto/serviço em relação ao mercado?', min: 'O cliente não percebe o diferencial, seria indiferente para ele e não pagaria mais pelo produto/serviço.', max: 'O cliente busca diferenciação e características específicas entre fornecedores dos produtos/serviços.' },
  { n: 13, cat: 'EO', peso: 1, titulo: 'Meu cliente gosta de saber que meu preço é competitivo com o mercado?', min: 'Cliente não costuma fazer cotações, comparar preços e mantém certo nível de fidelidade.', max: 'Cliente utiliza constantemente como argumento de barganha a comparação com preços dos concorrentes.' },
  { n: 14, cat: 'LP', peso: 1, titulo: 'Meu cliente gosta de saber que tem o melhor produto/serviço do mercado?', min: 'É indiferente para a maioria dos clientes saber se o produto está entre os melhores — a marca não é importante.', max: 'O cliente expressa o produto como fator de status — não se preocupa com o preço pago, mas sim com possuir o melhor do mercado.' },
  { n: 15, cat: 'IC', peso: 2, titulo: 'Meu cliente gosta de saber que tem produto/serviço feito exatamente para ele, da forma que ele precisa?', min: 'É indiferente para o cliente a informação de que o produto é único.', max: 'Cliente costuma agradecer, envaidecer-se e ficar satisfeito ao saber que poucas pessoas possuem o mesmo produto/serviço.' },
  { n: 16, cat: 'EO', peso: 2, titulo: 'Para mim, é mais importante no meu segmento controlar custos?', min: 'As margens são altas; variações nos custos não impactam consideravelmente os preços nem fazem perder pedidos para a concorrência.', max: 'Custos são rigorosamente controlados — existe metodologia de apuração e energia interna investida na redução de custos.' },
  { n: 17, cat: 'LP', peso: 1, titulo: 'Para mim, é mais importante no meu segmento ter o melhor produto/serviço?', min: 'A importância de ter o melhor produto no mercado não compensa o investimento de tempo, energia e dinheiro.', max: 'Com uma marca forte, constante inovação e alta qualidade, é possível ter preço premium no mercado.' },
  { n: 18, cat: 'IC', peso: 1.5, titulo: 'Entender profundamente meu cliente é mais importante que ter o melhor produto ou o menor preço?', min: 'O cliente se importa mais com o produto em si ou com o preço do que com o atendimento personalizado.', max: 'A proximidade e o entendimento profundo do cliente são os principais diferenciais do negócio.' },
  { n: 19, cat: 'EO', peso: 1, titulo: 'O negócio depende de grandes volumes para ter boa rentabilidade?', min: 'Baixos volumes com alto ticket médio são perfeitamente viáveis.', max: 'O negócio só funciona bem com grande escala; margem unitária é baixa.' },
  { n: 20, cat: 'LP', peso: 1, titulo: 'A diferenciação do meu produto é mais forte que a eficiência operacional ou o relacionamento?', min: 'O diferencial do produto em si não é o mais importante.', max: 'O que segura o cliente é o produto diferenciado — acima de tudo.' },
  { n: 21, cat: 'IC', peso: 1, titulo: 'Eu gostaria de ter um portfólio de soluções amplo o suficiente para todos os problemas do meu cliente?', min: 'Quanto menos produtos, sendo estes seriados com pouca variação, melhor para mim.', max: 'É fundamental ter um leque maior de opções pré-formatadas para atender diferentes necessidades dos clientes.' },
  { n: 22, cat: 'EO', peso: 1.5, titulo: 'Tenho muita dificuldade quando o cliente pede para modificar algo no meu produto/serviço para atendê-lo?', min: 'Fornecimento do produto/serviço é flexível — alterações são relativamente fáceis de fazer e não exigem burocracia.', max: 'Exige mudança de procedimentos; diferentes áreas precisam estar envolvidas e é necessária análise prévia de viabilidade.' },
  { n: 23, cat: 'IC', peso: 1, titulo: 'Fazer uma expansão do negócio para nova região/cidade é grande desafio, por não conhecer o público local?', min: 'O produto/serviço é vendável em novos locais sem muitas dificuldades, independente da região ou cultura local.', max: 'As relações com clientes são próximas, às vezes pessoais. Conhecer cultura e hábito de uma nova região é fator de sucesso para expansão.' },
  { n: 24, cat: 'LP', peso: 1, titulo: 'Não ser conhecido como pioneiro no meu mercado é grande problema para mim?', min: 'A questão de pioneirismo é indiferente para cliente, acionistas e mercado.', max: 'Vanguarda, tradição e reconhecimento pelo histórico de produto/serviço diferenciado seriam diferencial de mercado.' },
  { n: 25, cat: 'EO', peso: 1, titulo: 'Pessoas com disponibilidade e alta capacidade de trabalhar somente cumprindo processos é o que preciso para ter sucesso?', min: 'As pessoas precisam ser criativas, têm dificuldade de utilizar controles e gostam de horários flexíveis.', max: 'Pessoas são regidas por regras e padrões pré-estabelecidos, possuem facilidade com atividades repetitivas e são flexíveis aos horários da empresa.' },
  { n: 26, cat: 'LP', peso: 1.5, titulo: 'Preciso ter gente inovadora, estudiosa e criativa dentro do meu quadro de pessoas?', min: 'Não há necessidade de ter pessoas criativas — desenvolvimento e melhoria de produtos/serviços podem ser centralizados em poucos.', max: 'Pessoas que estudam, fazem cursos, têm ideias e são criativas são fundamentais para sobrevivência do negócio.' },
  { n: 27, cat: 'IC', peso: 1, titulo: 'Pessoas bem relacionadas que entendam o mercado em que atuo são fatores preponderantes para mim?', min: 'A capacidade de geração de negócios por meio de indicações não é relevante.', max: 'O principal caminho de geração de novos negócios é por meio de indicação — quanto mais influente o cliente, mais importante ele é.' },
];

function calcularScores(respostas) {
  const soma = { EO: 0, IC: 0, LP: 0 };
  for (const q of QUESTOES) {
    const nota = Number(respostas[`q${q.n}`] || 0);
    soma[q.cat] += nota * q.peso;
  }
  // máximo por categoria = 11.5 × 4 = 46
  return {
    excelencia_operacional: +(soma.EO / 46).toFixed(3),
    intimidade_cliente: +(soma.IC / 46).toFixed(3),
    lideranca_produto: +(soma.LP / 46).toFixed(3),
    somas_brutas: soma,
  };
}

function interpretar(scores) {
  const ordem = Object.entries({
    EO: scores.excelencia_operacional,
    IC: scores.intimidade_cliente,
    LP: scores.lideranca_produto,
  }).sort((a, b) => b[1] - a[1]);
  const label = { EO: 'Excelência Operacional', IC: 'Intimidade com Cliente', LP: 'Liderança em Produto' };
  return {
    dominante: label[ordem[0][0]],
    score_dominante: ordem[0][1],
    secundaria: label[ordem[1][0]],
    score_secundaria: ordem[1][1],
    fraco: label[ordem[2][0]],
  };
}

export default function FormPosicionamento() {
  const router = useRouter();
  const { projeto, t: token } = router.query;
  const [respostas, setRespostas] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [tokenData, setTokenData] = useState(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenError, setTokenError] = useState('');

  useEffect(() => {
    if (!router.isReady || !token) return;
    setTokenLoading(true);
    fetch(`/api/respondentes/by-token?token=${encodeURIComponent(token)}`)
      .then(res => res.json())
      .then(json => {
        if (!json.success) { setTokenError(json.error || 'Link inválido'); return; }
        setTokenData(json.respondente);
      })
      .catch(err => setTokenError(err.message))
      .finally(() => setTokenLoading(false));
  }, [router.isReady, token]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setRespostas(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      const scores = calcularScores(respostas);
      const interp = interpretar(scores);
      const res = await fetch('/api/formularios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projetoId: tokenData?.projeto_id || projeto,
          tipo: 'posicionamento_estrategico',
          token: token || undefined,
          respostas: {
            ...respostas,
            scores,
            interpretacao: interp,
            respondente: tokenData?.nome || 'Sócio',
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Erro ao enviar');
      setSuccess({ scores, interp });
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
        <p style={{ color: 'var(--text-secondary)' }}>{tokenError}</p>
      </div>
    );
  }

  return (
    <>
      <Head><title>Posicionamento Estratégico | Espansione</title></Head>
      <div className="page-container" style={{ paddingTop: '2rem', minHeight: '100vh', paddingBottom: '4rem' }}>
        <main className="container" style={{ maxWidth: '860px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <Logo size="md" center />
          </div>

          {success ? (
            <div className="glass-card" style={{ padding: '2.5rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <h2 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>Teste enviado!</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Seu posicionamento estratégico dominante é:</p>
              </div>
              <div style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.3)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>POSICIONAMENTO DOMINANTE</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-blue)' }}>{success.interp.dominante}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Score: {success.interp.score_dominante.toFixed(2)} · Secundário: {success.interp.secundaria} ({success.interp.score_secundaria.toFixed(2)})</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                {[
                  { label: 'Excelência Operacional', v: success.scores.excelencia_operacional, color: '#f59e0b' },
                  { label: 'Intimidade com Cliente', v: success.scores.intimidade_cliente, color: '#10b981' },
                  { label: 'Liderança em Produto', v: success.scores.lideranca_produto, color: '#60a5fa' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.label}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color, marginTop: '0.25rem' }}>{s.v.toFixed(2)}</div>
                  </div>
                ))}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '1.5rem', lineHeight: 1.6, textAlign: 'center' }}>
                Obrigado! Suas respostas foram registradas e vão alimentar o diagnóstico estratégico da empresa.
              </p>
            </div>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ color: 'var(--text-primary)', fontSize: '1.8rem', marginBottom: '0.4rem' }}>Teste de Posicionamento Estratégico</h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {tokenData?.nome ? `Respondendo como ${tokenData.nome}` : 'Avalie o nível de alinhamento estratégico da sua organização'}
                </p>
              </div>

              <div className="glass-card" style={{ padding: '1.5rem 2rem', marginBottom: '2rem', background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.2)' }}>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  ⏱ <strong>10 a 15 minutos</strong>. 27 afirmações. Para cada, marque de <strong>1 (Mínima)</strong> a <strong>4 (Máxima)</strong> o quanto a afirmação se aproxima da realidade da empresa. O teste identifica o <strong>Posicionamento Estratégico</strong> dominante entre: Excelência Operacional, Intimidade com Cliente ou Liderança em Produto.
                </p>
              </div>

              <div className="glass-card" style={{ padding: '2rem' }}>
                <form onSubmit={handleSubmit}>
                  {errorMsg && <div style={{ background: 'var(--error)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', color: '#fff' }}>{errorMsg}</div>}

                  {QUESTOES.map(q => (
                    <div key={q.n} style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>QUESTÃO {q.n}</div>
                      <div style={{ fontSize: '1rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>{q.titulo}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', background: 'rgba(239,68,68,0.06)', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.15)' }}>
                          <strong style={{ color: '#ef4444' }}>Mínima (1):</strong> {q.min}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', background: 'rgba(16,185,129,0.06)', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(16,185,129,0.15)' }}>
                          <strong style={{ color: '#10b981' }}>Máxima (4):</strong> {q.max}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        {[1, 2, 3, 4].map(n => (
                          <label key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', padding: '0.5rem 1rem', background: respostas[`q${q.n}`] === String(n) ? 'rgba(96,165,250,0.15)' : 'rgba(255,255,255,0.02)', border: `1px solid ${respostas[`q${q.n}`] === String(n) ? 'var(--accent-blue)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '8px', minWidth: '60px' }}>
                            <input type="radio" name={`q${q.n}`} value={n} checked={respostas[`q${q.n}`] === String(n)} onChange={onChange} required style={{ marginBottom: '0.3rem' }} />
                            <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{n}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <button type="submit" className="btn-primary" disabled={submitting} style={{ padding: '1rem 3rem', fontSize: '1.1rem', width: '100%' }}>
                      {submitting ? 'Calculando...' : 'Finalizar teste'}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
