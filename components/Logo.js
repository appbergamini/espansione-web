import Link from 'next/link';

/**
 * Logo Espansione — usa a imagem PNG original da marca
 * Fonte:     Rebrand Dis Bold (carregada via @font-face em globals.css)
 * Cores:     Azul #00326D | Vermelho #Da3144 (definidas no brand book)
 */
export default function Logo({ showTagline = false, size = 'md', center = false }) {
  // Alturas da imagem do logo por tamanho
  const heights = {
    sm: 32,
    md: 54,
    lg: 90,
  };
  const height = heights[size] || heights.md;

  return (
    <Link href="/" style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: center ? 'center' : 'flex-start',
        cursor: 'pointer',
        gap: '0.3rem',
      }}>
        {/* Imagem PNG original do logo da Espansione */}
        <img
          src="/brand/logo.png"
          alt="Espansione"
          style={{ height: `${height}px`, width: 'auto' }}
        />

        {/* Tagline (opcional) usando a fonte Cabin do brand book */}
        {showTagline && (
          <span style={{
            fontFamily: "'Cabin', sans-serif",
            fontWeight: 600,
            fontSize: size === 'lg' ? '0.85rem' : '0.65rem',
            color: '#004198',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            lineHeight: 1,
          }}>
            Construindo marcas, conectando propósitos
          </span>
        )}
      </div>
    </Link>
  );
}
