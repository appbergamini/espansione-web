import Link from 'next/link';

export default function Logo({ showTagline = false, size = 'md', center = false }) {
  // Size classes
  const sizes = {
    sm: { e: '2rem', text: '1.25rem', tagline: '0.65rem', mb: '-5px' },
    md: { e: '3rem', text: '1.75rem', tagline: '0.8rem', mb: '-8px' },
    lg: { e: '4.5rem', text: '2.5rem', tagline: '1rem', mb: '-12px' }
  };
  
  const current = sizes[size] || sizes.md;

  return (
    <Link href="/" style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        fontFamily: 'var(--font-logo)',
        gap: '0.2rem'
      }}>
        {/* The Espansione Swirl Icon */}
        <div style={{
          width: current.e,
          height: current.e,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: size === 'lg' ? '-0.5rem' : '-0.2rem'
        }}>
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', fill: 'var(--brand-red)' }}>
            <path d="M50 10C27.9 10 10 27.9 10 50s17.9 40 40 40 40-17.9 40-40c0-11-4.5-21-11.7-28.3L66.6 33.4C71.3 38.1 74 44.5 74 51.3c0 13.9-11.3 25.2-25.2 25.2S23.6 65.2 23.6 51.3c0-13.9 11.3-25.2 25.2-25.2 4.1 0 7.9 1 11.2 2.7l6.8-10.4C61.4 15.1 53.6 13.4 45.4 13.4 25.9 13.4 10 29.3 10 48.8s15.9 35.4 35.4 35.4 35.4-15.9 35.4-35.4c0-10.9-4.9-20.7-12.7-27.2l8.5-4.2C85.5 25.5 90 37.2 90 50c0 22.1-17.9 40-40 40S10 72.1 10 50 27.9 10 50 10z" style={{ display: 'none' }} />
            {/* A more accurate swirl path approximating the image */}
            <path d="M50,15 C69.33,15 85,30.67 85,50 C85,69.33 69.33,85 50,85 C30.67,85 15,69.33 15,50 C15,36.5 22.6,24.8 33.8,19 L38,26 C30.5,30 25,38 25,48 C25,62.8 34.2,74.7 46,78 L46,65 C39.5,62 35,55.5 35,48 C35,36.4 44.4,27 56,27 C64.3,27 71.4,31.8 74.8,38.8 L82,32 C76,21.8 65,15 52.5,15 L50,15 Z" />
          </svg>
        </div>
        
        {/* The espansione text */}
        <span style={{
          color: 'var(--brand-blue)',
          fontSize: current.text,
          fontWeight: 800,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          fontFamily: 'var(--font-logo)'
        }}>
          espansione
        </span>

        {/* Tagline optional */}
        {showTagline && (
          <span style={{
            color: 'var(--brand-white)',
            fontSize: current.tagline,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginTop: '0.5rem',
            fontFamily: 'var(--font-heading)'
          }}>
            Construindo marcas, conectando propósitos
          </span>
        )}
      </div>
    </Link>
  );
}
