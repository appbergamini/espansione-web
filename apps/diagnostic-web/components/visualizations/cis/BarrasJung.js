import VizCard from '../VizCard';
import { VIZ_TOKENS } from '../tokens';

/**
 * BarrasJung — 4 barras bipolares (E/I, S/N, T/F, J/P) em CSS puro.
 *
 * @typedef {Object} JungDados
 * @property {number} E @property {number} I
 * @property {number} S @property {number} N
 * @property {number} T @property {number} F
 * @property {number} J @property {number} P
 * @property {number} total
 *
 * @typedef {Object} BarrasJungProps
 * @property {JungDados} dados
 * @property {string} [titulo]               Default: "Perfis Jung do Time"
 * @property {'completa'|'parcial'} [confiabilidade]
 */
export default function BarrasJung({ dados, titulo = 'Perfis Jung do time', confiabilidade }) {
  const temDados = dados && typeof dados.total === 'number' && dados.total > 0;

  if (!temDados) {
    return (
      <VizCard titulo={titulo}>
        <EstadoVazio mensagem="Dados Jung agregados não disponíveis" />
      </VizCard>
    );
  }

  const pares = [
    { esq: 'E', dir: 'I', labelEsq: 'Extroversão',     labelDir: 'Introversão' },
    { esq: 'S', dir: 'N', labelEsq: 'Sensação',         labelDir: 'Intuição' },
    { esq: 'T', dir: 'F', labelEsq: 'Pensamento',       labelDir: 'Sentimento' },
    { esq: 'J', dir: 'P', labelEsq: 'Julgamento',       labelDir: 'Percepção' },
  ];

  return (
    <VizCard titulo={titulo} confiabilidade={confiabilidade}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {pares.map(par => (
          <LinhaPar key={`${par.esq}${par.dir}`} par={par} dados={dados} />
        ))}
      </div>

      <p style={{ ...VIZ_TOKENS.typography.note, marginTop: 16 }}>
        Distribuição Jung do time (N={dados.total}). Indica como a coletividade processa informação e decide.
      </p>
    </VizCard>
  );
}

function LinhaPar({ par, dados }) {
  const valEsq = dados[par.esq] || 0;
  const valDir = dados[par.dir] || 0;
  const total = dados.total;
  const pctEsq = Math.round((valEsq / total) * 100);
  const pctDir = Math.round((valDir / total) * 100);
  const esqDominante = valEsq >= valDir;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr 130px', gap: 12, alignItems: 'center' }}>
      {/* Label esquerda */}
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 13, fontWeight: esqDominante ? 700 : 500, color: VIZ_TOKENS.card.text }}>
          {par.labelEsq}
        </div>
        <div style={{ ...VIZ_TOKENS.typography.label, fontSize: 11 }}>
          {valEsq} ({pctEsq}%)
        </div>
      </div>

      {/* Barra bipolar */}
      <div
        style={{
          display: 'flex',
          height: VIZ_TOKENS.dimensions.barJungHeight,
          backgroundColor: '#F3F4F6',
          borderRadius: 999,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pctEsq}%`,
            backgroundColor: esqDominante ? VIZ_TOKENS.colors.primary : VIZ_TOKENS.card.textMuted,
            opacity: esqDominante ? 1 : 0.4,
          }}
        />
        <div
          style={{
            width: `${pctDir}%`,
            backgroundColor: !esqDominante ? VIZ_TOKENS.colors.primary : VIZ_TOKENS.card.textMuted,
            opacity: !esqDominante ? 1 : 0.4,
          }}
        />
      </div>

      {/* Label direita */}
      <div style={{ textAlign: 'left' }}>
        <div style={{ fontSize: 13, fontWeight: !esqDominante ? 700 : 500, color: VIZ_TOKENS.card.text }}>
          {par.labelDir}
        </div>
        <div style={{ ...VIZ_TOKENS.typography.label, fontSize: 11 }}>
          {valDir} ({pctDir}%)
        </div>
      </div>
    </div>
  );
}

function EstadoVazio({ mensagem }) {
  return (
    <div
      style={{
        padding: '2rem 1rem',
        textAlign: 'center',
        color: VIZ_TOKENS.card.textMuted,
        ...VIZ_TOKENS.typography.note,
      }}
    >
      {mensagem}
    </div>
  );
}
