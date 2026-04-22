import VizCard from '../VizCard';
import { VIZ_TOKENS, classificarScore, cssVarPorClassificacao } from '../tokens';

/**
 * HeatmapCompetencias — grid 4×4 com as 16 competências do CIS.
 * Ordem temática: Ação e Liderança · Relacionamento e Paciência · Influência e Energia · Método e Foco.
 *
 * @typedef {Object} HeatmapCompetenciasProps
 * @property {Record<string, number|null>} dados  mapa das 16 competências (snake_case)
 * @property {string} [titulo]                    Default: "Competências do time"
 * @property {'completa'|'parcial'} [confiabilidade]
 */

const GRID_ORDER = [
  'ousadia', 'comando', 'objetividade', 'assertividade',
  'empatia', 'paciencia', 'persistencia', 'planejamento',
  'persuasao', 'extroversao', 'entusiasmo', 'sociabilidade',
  'organizacao', 'detalhismo', 'prudencia', 'concentracao',
];

const LABELS = {
  ousadia: 'Ousadia', comando: 'Comando', objetividade: 'Objetividade', assertividade: 'Assertividade',
  empatia: 'Empatia', paciencia: 'Paciência', persistencia: 'Persistência', planejamento: 'Planejamento',
  persuasao: 'Persuasão', extroversao: 'Extroversão', entusiasmo: 'Entusiasmo', sociabilidade: 'Sociabilidade',
  organizacao: 'Organização', detalhismo: 'Detalhismo', prudencia: 'Prudência', concentracao: 'Concentração',
};

export default function HeatmapCompetencias({ dados, titulo = 'Competências do time', confiabilidade }) {
  const temDados = dados && GRID_ORDER.some(k => typeof dados[k] === 'number');

  if (!temDados) {
    return (
      <VizCard titulo={titulo}>
        <EstadoVazio mensagem="Dados de competências não disponíveis" />
      </VizCard>
    );
  }

  return (
    <VizCard titulo={titulo} confiabilidade={confiabilidade}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 8,
        }}
      >
        {GRID_ORDER.map(key => {
          const score = dados[key];
          const classe = classificarScore(score);
          const cssVar = cssVarPorClassificacao(classe);
          // color-mix dá a cor da classe misturada com transparent 70% de opacidade do tom
          const bg = score === null || score === undefined
            ? '#F3F4F6'
            : `color-mix(in srgb, var(${cssVar}) 20%, #FEFEFE)`;
          const textColor = VIZ_TOKENS.card.text;
          const accentColor = score === null ? VIZ_TOKENS.card.textMuted : `var(${cssVar})`;

          return (
            <div
              key={key}
              style={{
                backgroundColor: bg,
                borderRadius: 8,
                padding: '0.75rem 0.6rem',
                minHeight: VIZ_TOKENS.dimensions.heatmapCellMinHeight,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${VIZ_TOKENS.card.border}`,
                borderLeft: `3px solid ${accentColor}`,
              }}
            >
              <div
                style={{
                  ...VIZ_TOKENS.typography.label,
                  fontSize: 11,
                  color: textColor,
                  marginBottom: 4,
                  textAlign: 'center',
                  lineHeight: 1.2,
                }}
              >
                {LABELS[key]}
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: textColor,
                }}
              >
                {typeof score === 'number' ? score : 'N/D'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          marginTop: 16,
          flexWrap: 'wrap',
          ...VIZ_TOKENS.typography.note,
          color: VIZ_TOKENS.card.text,
          fontStyle: 'normal',
        }}
      >
        <LegendaItem cor={VIZ_TOKENS.colors.success}  label="≥ 70 · Sustenta" />
        <LegendaItem cor={VIZ_TOKENS.colors.warning}  label="40–69 · Em desenvolvimento" />
        <LegendaItem cor={VIZ_TOKENS.colors.critical} label="< 40 · Frágil" />
      </div>
    </VizCard>
  );
}

function LegendaItem({ cor, label }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: cor }} />
      {label}
    </span>
  );
}

function EstadoVazio({ mensagem }) {
  return (
    <div style={{ padding: '2rem 1rem', textAlign: 'center', color: VIZ_TOKENS.card.textMuted, ...VIZ_TOKENS.typography.note }}>
      {mensagem}
    </div>
  );
}
