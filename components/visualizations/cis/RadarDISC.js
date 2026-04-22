import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import VizCard from '../VizCard';
import { VIZ_TOKENS } from '../tokens';

/**
 * RadarDISC — radar de 4 eixos (D/I/S/C) com gradiente azul.
 *
 * @typedef {Object} RadarDISCDados
 * @property {number|null} D
 * @property {number|null} I
 * @property {number|null} S
 * @property {number|null} C
 * @property {'D'|'I'|'S'|'C'|null} [dominante]
 *
 * @typedef {Object} RadarDISCProps
 * @property {RadarDISCDados} dados
 * @property {string} [contexto]         Ex.: "Sócio João Silva" ou "Time coletivo"
 * @property {'completa'|'parcial'} [confiabilidade]
 * @property {string} [titulo]           Default: "Perfil DISC"
 */
export default function RadarDISC({ dados, contexto, confiabilidade, titulo = 'Perfil DISC' }) {
  const temDados = dados && ['D', 'I', 'S', 'C'].some(k => typeof dados[k] === 'number');

  if (!temDados) {
    return (
      <VizCard titulo={titulo} subtitulo={contexto}>
        <EstadoVazio mensagem="Dados comportamentais não disponíveis" />
      </VizCard>
    );
  }

  const data = ['D', 'I', 'S', 'C'].map(eixo => ({
    eixo,
    valor: typeof dados[eixo] === 'number' ? dados[eixo] : 0,
    _real: dados[eixo],
    fullMark: 100,
  }));

  return (
    <VizCard titulo={titulo} subtitulo={contexto} confiabilidade={confiabilidade}>
      <div style={{ width: '100%', height: VIZ_TOKENS.dimensions.radarSize }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="72%" data={data}>
            <PolarGrid stroke={VIZ_TOKENS.card.border} strokeDasharray="2 3" />
            <PolarAngleAxis
              dataKey="eixo"
              tick={{ fill: VIZ_TOKENS.card.text, fontSize: 14, fontWeight: 700 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tickCount={5}
              tick={{ fill: VIZ_TOKENS.card.textMuted, fontSize: 10 }}
              axisLine={false}
            />
            <Radar
              dataKey="valor"
              stroke={VIZ_TOKENS.colors.primary}
              fill={VIZ_TOKENS.colors.primary}
              fillOpacity={0.35}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Rótulos estruturados com valor abaixo do radar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 12 }}>
        {['D', 'I', 'S', 'C'].map(eixo => {
          const v = dados[eixo];
          const ehDominante = dados.dominante === eixo;
          return (
            <div
              key={eixo}
              style={{
                padding: '0.5rem',
                borderRadius: 6,
                textAlign: 'center',
                backgroundColor: ehDominante ? 'rgba(0, 50, 109, 0.08)' : 'transparent',
                border: ehDominante ? `1px solid ${VIZ_TOKENS.colors.primary}` : '1px solid transparent',
              }}
            >
              <div style={{ ...VIZ_TOKENS.typography.label, marginBottom: 2 }}>
                {ehDominante ? `${eixo} · dominante` : eixo}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: ehDominante ? VIZ_TOKENS.colors.primary : VIZ_TOKENS.card.text }}>
                {typeof v === 'number' ? `${v}%` : '—'}
              </div>
            </div>
          );
        })}
      </div>
    </VizCard>
  );
}

function EstadoVazio({ mensagem }) {
  return (
    <div
      style={{
        height: VIZ_TOKENS.dimensions.radarSize,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: VIZ_TOKENS.card.textMuted,
        ...VIZ_TOKENS.typography.note,
        textAlign: 'center',
        padding: 16,
      }}
    >
      {mensagem}
    </div>
  );
}
