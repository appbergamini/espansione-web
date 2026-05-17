// components/deliverable/shared/DeliverableHeader.js
//
// Bloco D · TASK 4.4 — cabeçalho SCREEN-ONLY do entregável final.
// Fica acima do documento quando visualizado no painel (não aparece
// no PDF porque `.screen-only` é escondido em @media print).
//
// Mostra breadcrumb pro projeto + ações (Baixar PDF consolidado).

import Link from 'next/link';

export default function DeliverableHeader({ projeto }) {
  return (
    <header
      className="screen-only deliverable-screen-header"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 1.5rem',
        borderBottom: '1px solid var(--glass-border)',
        marginBottom: '2rem',
        background: 'var(--bg-primary)',
      }}
    >
      <nav style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        <Link href="/adm" style={{ color: 'var(--accent-blue)' }}>Painel</Link>
        {' / '}
        <Link
          href={`/adm/${projeto?.id || ''}`}
          style={{ color: 'var(--accent-blue)' }}
        >
          {projeto?.cliente || 'Projeto'}
        </Link>
        {' / '}
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
          Entregável final
        </span>
      </nav>

      <a
        href={`/api/outputs/${projeto?.id || ''}/deliverable/pdf`}
        download
        className="px-4 py-2 rounded text-sm font-semibold"
        style={{
          backgroundColor: 'var(--brand-blue)',
          color: '#FFF',
          border: '1px solid var(--brand-blue)',
          textDecoration: 'none',
        }}
        title="Baixar o entregável consolidado em PDF"
      >
        📘 Baixar PDF consolidado
      </a>
    </header>
  );
}
