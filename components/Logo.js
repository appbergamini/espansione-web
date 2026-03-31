import Link from 'next/link';

/**
 * Logo Espansione — Brand Book v1
 * Fonte:     Rebrand Dis Bold (fallback: Nunito 900)
 * Cores:     Azul #00326D | Vermelho #Da3144
 * Tagline:   Cabin uppercase
 */
export default function Logo({ showTagline = false, size = 'md', center = false }) {
  const cfg = {
    sm: { symbol: 36,  text: '1.2rem',  tagline: '0.55rem', gap: 4  },
    md: { symbol: 56,  text: '1.85rem', tagline: '0.7rem',  gap: 6  },
    lg: { symbol: 88,  text: '2.9rem',  tagline: '1rem',    gap: 10 },
  };
  const c = cfg[size] || cfg.md;

  return (
    <Link href="/" style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: center ? 'center' : 'flex-start',
        cursor: 'pointer',
        gap: `${c.gap}px`,
      }}>

        {/* ── Símbolo "e" em espiral – idêntico ao brand book ── */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          width={c.symbol}
          height={c.symbol}
          aria-hidden="true"
        >
          {/*
            O símbolo é um "e" cursivo que se enrola sobre si mesmo,
            formando um caracol (swirl). A forma começa na abertura
            à direita e se fecha em espiral para o centro.
          */}
          <path
            fill="#Da3144"
            d="
              M 82,38
              C 78,18 60,8 44,10
              C 20,13 6,32 8,54
              C 10,76 30,92 54,90
              C 66,89 76,83 82,74
              L 74,68
              C 69,75 61,80 52,81
              C 34,83 18,71 16,54
              C 14,37 26,22 44,19
              C 58,17 72,24 77,36
              C 79,41 78,47 74,51
              C 70,55 63,56 56,53
              C 46,49 42,40 45,32
              C 47,27 53,25 59,27
              C 63,29 65,34 63,38
              L 71,40
              C 72,32 67,23 59,20
              C 48,16 37,23 33,34
              C 29,46 34,60 46,66
              C 55,70 66,68 74,62
              C 80,57 83,49 82,42
              Z
            "
          />
        </svg>

        {/* ── Texto "espansione" ── */}
        <span style={{
          fontFamily: "'Rebrand Dis', 'Cabin', sans-serif",
          fontWeight: 700,
          fontSize: c.text,
          color: '#00326D',
          letterSpacing: '-0.01em',
          lineHeight: 1,
          marginTop: `-${c.gap * 0.5}px`,
        }}>
          espansione
        </span>

        {/* ── Tagline (opcional) ── */}
        {showTagline && (
          <span style={{
            fontFamily: '"Cabin", sans-serif',
            fontWeight: 600,
            fontSize: c.tagline,
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
