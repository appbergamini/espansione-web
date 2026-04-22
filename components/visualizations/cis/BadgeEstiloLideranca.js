import VizCard from '../VizCard';
import { VIZ_TOKENS } from '../tokens';

/**
 * BadgeEstiloLideranca — card central com inicial do estilo dominante +
 * distribuição dos 4 estilos abaixo (Executor/Motivador/Metodico/Sistematico).
 *
 * @typedef {Object} BadgeEstiloLiderancaDados
 * @property {'Executor'|'Motivador'|'Metodico'|'Sistematico'|'Executivo'|null} dominante
 * @property {Object} distribuicao
 * @property {number} distribuicao.Executor
 * @property {number} distribuicao.Motivador
 * @property {number} distribuicao.Metodico
 * @property {number} distribuicao.Sistematico
 * @property {number} total_lideres
 *
 * @typedef {Object} BadgeEstiloLiderancaProps
 * @property {BadgeEstiloLiderancaDados} dados
 * @property {string} [titulo]              Default: "Estilo de liderança"
 */

const ESTILO_META = {
  Executor:    { inicial: 'E',  descricao: 'Foco em entrega e velocidade' },
  Executivo:   { inicial: 'E',  descricao: 'Foco em entrega e velocidade' },
  Motivador:   { inicial: 'M',  descricao: 'Foco em engajamento e visão' },
  Metodico:    { inicial: 'Me', descricao: 'Foco em consistência e confiança' },
  Sistematico: { inicial: 'S',  descricao: 'Foco em precisão e padrões' },
};

const ORDEM_ESTILOS = ['Executor', 'Motivador', 'Metodico', 'Sistematico'];

export default function BadgeEstiloLideranca({ dados, titulo = 'Estilo de liderança' }) {
  if (!dados || !dados.dominante) {
    return (
      <VizCard titulo={titulo}>
        <EstadoVazio mensagem="Estilo de liderança não disponível" />
      </VizCard>
    );
  }

  // Normaliza Executivo (no banco real) para exibir como Executor consistentemente
  const dominanteChave = dados.dominante === 'Executivo' ? 'Executor' : dados.dominante;
  const meta = ESTILO_META[dominanteChave] || ESTILO_META.Executor;

  return (
    <VizCard titulo={titulo}>
      {/* Badge central */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          padding: '1.25rem',
          backgroundColor: 'rgba(0, 50, 109, 0.04)',
          border: `2px solid rgba(0, 50, 109, 0.18)`,
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 76, height: 76, borderRadius: '50%',
            backgroundColor: 'rgba(0, 50, 109, 0.1)',
            border: `2px solid ${VIZ_TOKENS.colors.primary}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 30, fontWeight: 700, color: VIZ_TOKENS.colors.primary }}>
            {meta.inicial}
          </span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: VIZ_TOKENS.card.text }}>
            {dominanteChave}
          </div>
          <div style={{ ...VIZ_TOKENS.typography.label, fontSize: 12, marginTop: 2 }}>
            Estilo dominante
          </div>
        </div>
        <div
          style={{
            ...VIZ_TOKENS.typography.note,
            color: VIZ_TOKENS.card.textMuted,
            textAlign: 'center',
            maxWidth: 260,
            fontStyle: 'normal',
            fontSize: 12,
          }}
        >
          {meta.descricao}
        </div>
      </div>

      {/* Mini-stats distribuição */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {ORDEM_ESTILOS.map(estilo => {
          const ehDominante = estilo === dominanteChave;
          const qtd = dados.distribuicao?.[estilo] ?? 0;
          return (
            <div
              key={estilo}
              style={{
                textAlign: 'center',
                padding: '0.6rem 0.4rem',
                borderRadius: 6,
                backgroundColor: ehDominante ? 'rgba(0, 50, 109, 0.08)' : '#F9FAFB',
                border: `1px solid ${ehDominante ? VIZ_TOKENS.colors.primary : VIZ_TOKENS.card.border}`,
              }}
            >
              <div style={{ ...VIZ_TOKENS.typography.label, fontSize: 10, marginBottom: 3 }}>
                {estilo}
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: ehDominante ? VIZ_TOKENS.colors.primary : VIZ_TOKENS.card.text,
                }}
              >
                {qtd}
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ ...VIZ_TOKENS.typography.note, marginTop: 12, textAlign: 'center' }}>
        Estilo de liderança predominante entre sócios e líderes de área (N={dados.total_lideres || 0}).
      </p>
    </VizCard>
  );
}

function EstadoVazio({ mensagem }) {
  return (
    <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: VIZ_TOKENS.card.textMuted, ...VIZ_TOKENS.typography.note }}>
      {mensagem}
    </div>
  );
}
