import { VIZ_TOKENS } from './tokens';

/**
 * Card editorial "ilha clara" — wrapper padrão dos 5 componentes de visualização.
 * Fundo off-white, radius 12, padding 24, sombra sutil, border tênue.
 * Exibe título + conteúdo + (opcional) nota de confiabilidade no rodapé.
 *
 * @typedef {Object} VizCardProps
 * @property {string}   [titulo]                Título do card
 * @property {string}   [subtitulo]             Subtítulo/contexto (ex.: "Sócio João Silva", "Time coletivo")
 * @property {'completa'|'parcial'} [confiabilidade]  Se 'parcial', mostra aviso amarelo no rodapé
 * @property {React.ReactNode} children         Conteúdo principal (o gráfico)
 */
export default function VizCard({ titulo, subtitulo, confiabilidade, children }) {
  return (
    <div
      style={{
        backgroundColor: VIZ_TOKENS.card.bg,
        color: VIZ_TOKENS.card.text,
        border: `1px solid ${VIZ_TOKENS.card.border}`,
        borderRadius: VIZ_TOKENS.card.radius,
        padding: VIZ_TOKENS.card.padding,
        boxShadow: VIZ_TOKENS.card.shadow,
      }}
    >
      {(titulo || subtitulo) && (
        <header style={{ marginBottom: '1rem' }}>
          {titulo && (
            <h3 style={{ ...VIZ_TOKENS.typography.title, margin: 0, color: VIZ_TOKENS.card.text }}>
              {titulo}
            </h3>
          )}
          {subtitulo && (
            <p style={{ ...VIZ_TOKENS.typography.label, margin: '0.15rem 0 0 0' }}>
              {subtitulo}
            </p>
          )}
        </header>
      )}

      <div>{children}</div>

      {confiabilidade === 'parcial' && (
        <p
          style={{
            marginTop: '1rem',
            padding: '0.55rem 0.75rem',
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 6,
            ...VIZ_TOKENS.typography.note,
            color: VIZ_TOKENS.card.text,
          }}
        >
          ⚠ Leitura baseada em amostra parcial do time. Interpretar com atenção à representatividade.
        </p>
      )}
    </div>
  );
}
