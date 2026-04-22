// components/deliverable/shared/DeliverableToc.js
//
// Bloco D · TASK 4.4 — índice do entregável. Sempre em página cheia,
// numerado 0..7. Subpartes explicitadas em cada parte. Parte 5.2
// (EVP) só aparece se o projeto tem escopo EVP.

const ESTRUTURA_BASE = [
  {
    n: '0',
    titulo: 'Abertura',
    sub: ['Carta de abertura', 'Sumário executivo', 'Como lemos sua empresa'],
  },
  {
    n: '1',
    titulo: 'Diagnóstico',
    sub: [
      '1.1 Visão interna',
      '1.2 Visão externa',
      '1.3 Leitura de mercado',
      '1.4 Cultura × Direção estratégica',
    ],
  },
  {
    n: '2',
    titulo: 'Direção',
    sub: ['Posicionamento T&W declarado', 'Valores e atributos', 'Diretrizes estratégicas'],
  },
  {
    n: '3',
    titulo: 'Plataforma de Marca',
    sub: ['Plataforma editorial', 'Manifesto'],
  },
  {
    n: '4',
    titulo: 'Expressão',
    sub: ['Identidade verbal (UVV)', 'One page visual'],
  },
  {
    n: '5',
    titulo: 'Vivência',
    sub: ['5.1 Experiência', '5.2 EVP — Marca Empregadora'],
  },
  {
    n: '6',
    titulo: 'Ativação',
    sub: ['Plano de comunicação', 'Roadmap consolidado', 'KPIs'],
  },
  {
    n: '7',
    titulo: 'Encerramento',
    sub: ['Convite para a próxima fase', 'Créditos'],
  },
];

export default function DeliverableToc({ temEvp = true }) {
  const estrutura = ESTRUTURA_BASE.map(p => {
    if (p.n !== '5') return p;
    return temEvp
      ? p
      : { ...p, sub: p.sub.filter(s => !s.startsWith('5.2')) };
  });

  return (
    <section
      className="deliverable-toc page-break-after"
      aria-label="Índice do entregável"
    >
      <h2 className="toc-title">Índice</h2>
      <ol className="toc-list">
        {estrutura.map(p => (
          <li key={p.n} className="toc-item">
            <div className="toc-line">
              <span className="toc-num">{p.n}</span>
              <span className="toc-title-txt">{p.titulo}</span>
            </div>
            {p.sub?.length > 0 && (
              <ul className="toc-sublist">
                {p.sub.map((s, i) => (
                  <li key={i} className="toc-sub">{s}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
