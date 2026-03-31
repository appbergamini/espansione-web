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
        alignItems: center ? 'center' : 'flex-start',
        cursor: 'pointer',
        fontFamily: 'var(--font-logo)'
      }}>
        {/* The "e" swirl */}
        <span style={{
          color: 'var(--brand-red)',
          fontSize: current.e,
          fontWeight: 800,
          lineHeight: 1,
          fontStyle: 'italic',
          letterSpacing: '-0.05em',
          marginBottom: current.mb,
          transform: 'scaleX(1.15) rotate(-5deg)',
          display: 'inline-block'
        }}>
          e
        </span>
        
        {/* The espansione text */}
        <span style={{
          color: 'var(--brand-blue)',
          fontSize: current.text,
          fontWeight: 800,
          letterSpacing: '0.02em',
          lineHeight: 1
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
