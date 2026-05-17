// pages/dev/visualizations-catalog.js
//
// Galeria de cenários dos 5 componentes de visualização (Bloco D · TASK 4.1).
// Substituto do Storybook (plano B aprovado). Protegida por getServerSideProps
// que retorna 404 em produção — só renderiza em NODE_ENV === 'development'.
//
// Uso: abrir http://localhost:3000/dev/visualizations-catalog em npm run dev.

import Head from 'next/head';
import {
  RadarDISC, BarrasJung, HeatmapCompetencias, BadgeEstiloLideranca,
} from '../../components/visualizations/cis';
import { RadarMaturidade360 } from '../../components/visualizations/maturidade';

export async function getServerSideProps() {
  if (process.env.NODE_ENV !== 'development') {
    return { notFound: true };
  }
  return { props: {} };
}

// ─── Dados-exemplo para cada cenário ───────────────────────────────────────

const CENARIOS = {
  RadarDISC: [
    {
      titulo: 'Completo — D dominante',
      props: {
        dados: { D: 45, I: 20, S: 25, C: 10, dominante: 'D' },
        contexto: 'Sócio A · Fundador',
      },
    },
    {
      titulo: 'Completo — dominante secundário próximo (D/I)',
      props: {
        dados: { D: 40, I: 38, S: 12, C: 10, dominante: 'D' },
        contexto: 'Sócio B',
      },
    },
    {
      titulo: 'Amostra parcial',
      props: {
        dados: { D: 30, I: 30, S: 25, C: 15, dominante: 'D' },
        contexto: 'Time coletivo',
        confiabilidade: 'parcial',
      },
    },
    {
      titulo: 'Dados ausentes (sócio não fez DISC)',
      props: {
        dados: { D: null, I: null, S: null, C: null, dominante: null },
        contexto: 'Sócio C',
      },
    },
    {
      titulo: 'Time coletivo equilibrado',
      props: {
        dados: { D: 25, I: 25, S: 25, C: 25, dominante: null },
        contexto: 'Time de 12 colaboradores',
      },
    },
  ],

  BarrasJung: [
    {
      titulo: 'Time ISTJ dominante',
      props: {
        dados: { E: 3, I: 8, S: 8, N: 3, T: 9, F: 2, J: 10, P: 1, total: 11 },
      },
    },
    {
      titulo: 'Time misto',
      props: {
        dados: { E: 6, I: 5, S: 7, N: 4, T: 5, F: 6, J: 6, P: 5, total: 11 },
      },
    },
    {
      titulo: 'Amostra pequena (3 pessoas)',
      props: {
        dados: { E: 1, I: 2, S: 2, N: 1, T: 2, F: 1, J: 2, P: 1, total: 3 },
        confiabilidade: 'parcial',
      },
    },
    {
      titulo: 'Sem dados',
      props: { dados: { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0, total: 0 } },
    },
  ],

  HeatmapCompetencias: [
    {
      titulo: 'Time forte em execução',
      props: {
        dados: {
          ousadia: 75, comando: 72, objetividade: 85, assertividade: 68,
          empatia: 45, paciencia: 40, persistencia: 80, planejamento: 82,
          persuasao: 55, extroversao: 50, entusiasmo: 48, sociabilidade: 52,
          organizacao: 88, detalhismo: 80, prudencia: 75, concentracao: 78,
        },
      },
    },
    {
      titulo: 'Time forte em relacionamento',
      props: {
        dados: {
          ousadia: 40, comando: 35, objetividade: 55, assertividade: 42,
          empatia: 85, paciencia: 78, persistencia: 65, planejamento: 50,
          persuasao: 80, extroversao: 82, entusiasmo: 85, sociabilidade: 88,
          organizacao: 58, detalhismo: 48, prudencia: 55, concentracao: 52,
        },
      },
    },
    {
      titulo: 'Time com lacunas críticas',
      props: {
        dados: {
          ousadia: 32, comando: 28, objetividade: 38, assertividade: 30,
          empatia: 62, paciencia: 65, persistencia: 50, planejamento: 35,
          persuasao: 45, extroversao: 55, entusiasmo: 58, sociabilidade: 60,
          organizacao: 36, detalhismo: 40, prudencia: 38, concentracao: 42,
        },
        confiabilidade: 'parcial',
      },
    },
    {
      titulo: 'Dados parciais (N/D em várias)',
      props: {
        dados: {
          ousadia: 72, comando: 68, objetividade: null, assertividade: 60,
          empatia: null, paciencia: 55, persistencia: null, planejamento: 70,
          persuasao: null, extroversao: 48, entusiasmo: null, sociabilidade: 52,
          organizacao: 80, detalhismo: null, prudencia: 62, concentracao: null,
        },
      },
    },
  ],

  BadgeEstiloLideranca: [
    {
      titulo: 'Executor dominante (3 de 5 líderes)',
      props: {
        dados: {
          dominante: 'Executor',
          distribuicao: { Executor: 3, Motivador: 1, Metodico: 1, Sistematico: 0 },
          total_lideres: 5,
        },
      },
    },
    {
      titulo: 'Liderança dividida (empate Motivador/Sistemático)',
      props: {
        dados: {
          dominante: 'Motivador',
          distribuicao: { Executor: 0, Motivador: 2, Metodico: 0, Sistematico: 2 },
          total_lideres: 4,
        },
      },
    },
    {
      titulo: 'Apenas 1 líder mapeado',
      props: {
        dados: {
          dominante: 'Metodico',
          distribuicao: { Executor: 0, Motivador: 0, Metodico: 1, Sistematico: 0 },
          total_lideres: 1,
        },
      },
    },
    {
      titulo: 'Dados ausentes',
      props: {
        dados: {
          dominante: null,
          distribuicao: { Executor: 0, Motivador: 0, Metodico: 0, Sistematico: 0 },
          total_lideres: 0,
        },
      },
    },
  ],

  RadarMaturidade360: [
    {
      titulo: 'Maturidade equilibrada (60–75%)',
      props: {
        dados: {
          pilares: {
            estrategia: { score: 22, percentual: 69, prioridade: 'Media' },
            financas:   { score: 23, percentual: 72, prioridade: 'Media' },
            comercial:  { score: 21, percentual: 66, prioridade: 'Media' },
            marketing:  { score: 19, percentual: 59, prioridade: 'Media' },
            pessoas:    { score: 22, percentual: 69, prioridade: 'Media' },
            operacao:   { score: 24, percentual: 75, prioridade: 'Baixa' },
          },
          total: { score: 131, percentual: 68 },
          socios_respondentes: 2,
        },
      },
    },
    {
      titulo: 'Maturidade desbalanceada (Comercial alto, Operação baixo)',
      props: {
        dados: {
          pilares: {
            estrategia: { score: 20, percentual: 62, prioridade: 'Media' },
            financas:   { score: 18, percentual: 56, prioridade: 'Media' },
            comercial:  { score: 27, percentual: 85, prioridade: 'Baixa' },
            marketing:  { score: 19, percentual: 59, prioridade: 'Media' },
            pessoas:    { score: 16, percentual: 50, prioridade: 'Media' },
            operacao:   { score: 10, percentual: 30, prioridade: 'Alta' },
          },
          total: { score: 110, percentual: 57 },
          socios_respondentes: 3,
        },
      },
    },
    {
      titulo: 'Divergência entre sócios em múltiplos pilares',
      props: {
        dados: {
          pilares: {
            estrategia: { score: 19, percentual: 59, prioridade: 'Media',  divergencia_entre_socios: 'alta' },
            financas:   { score: 20, percentual: 62, prioridade: 'Media',  divergencia_entre_socios: 'baixa' },
            comercial:  { score: 22, percentual: 69, prioridade: 'Media',  divergencia_entre_socios: 'alta' },
            marketing:  { score: 15, percentual: 47, prioridade: 'Alta',   divergencia_entre_socios: 'media' },
            pessoas:    { score: 18, percentual: 56, prioridade: 'Media',  divergencia_entre_socios: 'baixa' },
            operacao:   { score: 13, percentual: 41, prioridade: 'Alta',   divergencia_entre_socios: 'alta' },
          },
          total: { score: 107, percentual: 56 },
          socios_respondentes: 2,
        },
      },
    },
    {
      titulo: 'Maturidade crítica geral (todos < 50%)',
      props: {
        dados: {
          pilares: {
            estrategia: { score: 12, percentual: 37, prioridade: 'Alta' },
            financas:   { score: 11, percentual: 34, prioridade: 'Alta' },
            comercial:  { score: 14, percentual: 44, prioridade: 'Alta' },
            marketing:  { score: 9,  percentual: 28, prioridade: 'Alta' },
            pessoas:    { score: 13, percentual: 41, prioridade: 'Alta' },
            operacao:   { score: 10, percentual: 31, prioridade: 'Alta' },
          },
          total: { score: 69, percentual: 36 },
          socios_respondentes: 1,
        },
      },
    },
  ],
};

// ─── Render ────────────────────────────────────────────────────────────────

export default function VisualizationsCatalog() {
  return (
    <>
      <Head>
        <title>Dev · Visualizations Catalog</title>
      </Head>
      <main style={{ maxWidth: 1120, margin: '0 auto', padding: '2rem 1.5rem', color: 'var(--text-primary)' }}>
        <header style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
          <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '1.6rem' }}>Visualizations Catalog</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.92rem', fontStyle: 'italic' }}>
            Bloco D · TASK 4.1 — 5 componentes de visualização do CIS + Maturidade 360°. Cenários equivalentes aos stories do Storybook.
            Página protegida — só aparece em <code>NODE_ENV === 'development'</code>.
          </p>
        </header>

        <Secao
          titulo="RadarDISC"
          descricao="Radar de 4 eixos (D/I/S/C) com destaque do dominante."
          componente={RadarDISC}
          cenarios={CENARIOS.RadarDISC}
        />

        <Secao
          titulo="BarrasJung"
          descricao="4 barras bipolares para distribuição Jung do time (CSS puro, sem Recharts)."
          componente={BarrasJung}
          cenarios={CENARIOS.BarrasJung}
        />

        <Secao
          titulo="HeatmapCompetencias"
          descricao="Grid 4×4 com as 16 competências do CIS. Borda-esquerda colorida por classe (sustenta/desenvolvimento/frágil)."
          componente={HeatmapCompetencias}
          cenarios={CENARIOS.HeatmapCompetencias}
        />

        <Secao
          titulo="BadgeEstiloLideranca"
          descricao="Card central com inicial do estilo dominante + distribuição dos 4 estilos."
          componente={BadgeEstiloLideranca}
          cenarios={CENARIOS.BadgeEstiloLideranca}
        />

        <Secao
          titulo="RadarMaturidade360"
          descricao="Radar hexagonal dos 6 pilares do 360° com alerta de divergência entre sócios."
          componente={RadarMaturidade360}
          cenarios={CENARIOS.RadarMaturidade360}
        />
      </main>
    </>
  );
}

function Secao({ titulo, descricao, componente: Comp, cenarios }) {
  return (
    <section style={{ marginBottom: '3rem' }}>
      <h2 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{titulo}</h2>
      {descricao && <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0 0 1.25rem 0' }}>{descricao}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.25rem' }}>
        {cenarios.map((c, i) => (
          <div key={i}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 6, fontStyle: 'italic' }}>
              {c.titulo}
            </div>
            <Comp {...c.props} />
          </div>
        ))}
      </div>
    </section>
  );
}
