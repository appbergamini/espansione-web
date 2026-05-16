import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import VizCard from '../VizCard';
import { VIZ_TOKENS } from '../tokens';

/**
 * RadarMaturidade360 — radar hexagonal de 6 pilares (Estratégia, Finanças,
 * Comercial, Marketing, Pessoas, Operação) com scores 0-100.
 *
 * @typedef {Object} PilarMaturidade
 * @property {number} score
 * @property {number} percentual
 * @property {string} prioridade
 * @property {string|null} [divergencia_entre_socios]
 *
 * @typedef {Object} RadarMaturidade360Dados
 * @property {{ estrategia: PilarMaturidade, financas: PilarMaturidade, comercial: PilarMaturidade, marketing: PilarMaturidade, pessoas: PilarMaturidade, operacao: PilarMaturidade }} pilares
 * @property {{ score: number, percentual: number }} total
 * @property {number} [socios_respondentes]
 *
 * @typedef {Object} RadarMaturidade360Props
 * @property {RadarMaturidade360Dados} dados
 * @property {string} [titulo]                  Default: "Maturidade organizacional (360°)"
 * @property {boolean} [mostrar_divergencia]    Default: true
 */

const PILARES = [
  { chave: 'estrategia', nome: 'Estratégia' },
  { chave: 'financas',   nome: 'Finanças' },
  { chave: 'comercial',  nome: 'Comercial' },
  { chave: 'marketing',  nome: 'Marketing' },
  { chave: 'pessoas',    nome: 'Pessoas' },
  { chave: 'operacao',   nome: 'Operação' },
];

export default function RadarMaturidade360({
  dados,
  titulo = 'Maturidade organizacional (360°)',
  mostrar_divergencia = true,
}) {
  if (!dados || !dados.pilares) {
    return (
      <VizCard titulo={titulo}>
        <EstadoVazio mensagem="Diagnóstico 360° não disponível" />
      </VizCard>
    );
  }

  const pontos = PILARES.map(p => {
    const pilar = dados.pilares[p.chave] || {};
    return {
      eixo: p.nome,
      chave: p.chave,
      valor: typeof pilar.percentual === 'number' ? pilar.percentual : 0,
      prioridade: pilar.prioridade,
      divergencia: pilar.divergencia_entre_socios,
    };
  });

  const pilaresDivergentes = pontos.filter(p => p.divergencia === 'alta').map(p => p.eixo);

  // Mais forte / mais fraco para legendas
  const pilaresComValor = pontos.filter(p => typeof dados.pilares[p.chave]?.percentual === 'number');
  const pilarMaisForte = pilaresComValor.reduce((a, b) => (b.valor > a.valor ? b : a), pilaresComValor[0] || null);
  const pilarMaisFraco = pilaresComValor.reduce((a, b) => (b.valor < a.valor ? b : a), pilaresComValor[0] || null);

  const subtitulo = dados.socios_respondentes
    ? `Média de ${dados.socios_respondentes} sócio${dados.socios_respondentes > 1 ? 's' : ''} respondente${dados.socios_respondentes > 1 ? 's' : ''}`
    : undefined;

  return (
    <VizCard titulo={titulo} subtitulo={subtitulo}>
      {mostrar_divergencia && pilaresDivergentes.length > 0 && (
        <div
          style={{
            marginBottom: 12,
            padding: '0.6rem 0.8rem',
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 6,
            ...VIZ_TOKENS.typography.note,
            color: VIZ_TOKENS.card.text,
            fontSize: 12,
            fontStyle: 'normal',
          }}
        >
          ⚠ Divergência significativa entre sócios em: <strong>{pilaresDivergentes.join(', ')}</strong>. Vale conversa estratégica.
        </div>
      )}

      <div style={{ width: '100%', height: VIZ_TOKENS.dimensions.radarSize + 40 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={pontos}>
            <PolarGrid stroke={VIZ_TOKENS.card.border} strokeDasharray="2 3" />
            <PolarAngleAxis
              dataKey="eixo"
              tick={props => <TickAxis {...props} pontos={pontos} />}
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
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Legendas pilar mais forte / mais fraco */}
      {pilarMaisForte && pilarMaisFraco && pilarMaisForte !== pilarMaisFraco && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
          <div
            style={{
              padding: '0.65rem 0.85rem',
              borderRadius: 6,
              background: 'color-mix(in srgb, var(--viz-success) 10%, #FEFEFE)',
              borderLeft: `3px solid ${VIZ_TOKENS.colors.success}`,
            }}
          >
            <div style={{ ...VIZ_TOKENS.typography.label, fontSize: 11, color: VIZ_TOKENS.colors.success, fontStyle: 'normal' }}>
              Pilar mais forte
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: VIZ_TOKENS.card.text, marginTop: 2 }}>
              {pilarMaisForte.eixo} · {pilarMaisForte.valor}%
            </div>
          </div>
          <div
            style={{
              padding: '0.65rem 0.85rem',
              borderRadius: 6,
              background: 'color-mix(in srgb, var(--viz-critical) 10%, #FEFEFE)',
              borderLeft: `3px solid ${VIZ_TOKENS.colors.critical}`,
            }}
          >
            <div style={{ ...VIZ_TOKENS.typography.label, fontSize: 11, color: VIZ_TOKENS.colors.critical, fontStyle: 'normal' }}>
              Pilar mais fraco
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: VIZ_TOKENS.card.text, marginTop: 2 }}>
              {pilarMaisFraco.eixo} · {pilarMaisFraco.valor}%
            </div>
          </div>
        </div>
      )}

      {typeof dados.total?.percentual === 'number' && (
        <p style={{ ...VIZ_TOKENS.typography.note, marginTop: 12, textAlign: 'center', fontStyle: 'normal', fontSize: 12 }}>
          Maturidade geral média: <strong>{dados.total.percentual}%</strong>
        </p>
      )}
    </VizCard>
  );
}

// Label customizado no eixo: mostra nome + percentual + ícone se divergência alta
function TickAxis({ x, y, textAnchor, payload, pontos }) {
  const ponto = pontos.find(p => p.eixo === payload.value);
  if (!ponto) return null;
  const hasDiv = ponto.divergencia === 'alta';
  const valor = typeof ponto.valor === 'number' ? ponto.valor : 0;

  return (
    <g>
      <text
        x={x}
        y={y}
        textAnchor={textAnchor}
        fill={VIZ_TOKENS.card.text}
        fontSize={12}
        fontWeight={600}
      >
        <tspan x={x} dy={0}>{payload.value}{hasDiv ? ' ⚠' : ''}</tspan>
        <tspan x={x} dy={14} fontSize={10} fontWeight={400} fill={VIZ_TOKENS.card.textMuted}>
          {valor}%
        </tspan>
      </text>
    </g>
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
