// components/output/OutputHeader.js
//
// Bloco D · TASK 4.2 — cabeçalho da página de output.
// Mostra breadcrumb, nome do agente, data de geração, indicador de
// confiança com cor e botão placeholder de "Baixar PDF" (TASK 4.3).

import Link from 'next/link';

const CONFIANCA_COR = {
  alta:  'var(--viz-success)',
  media: 'var(--viz-warning)',
  baixa: 'var(--viz-critical)',
};

function chaveConfianca(valor) {
  if (!valor) return 'media';
  const norm = String(valor)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
  return norm in CONFIANCA_COR ? norm : 'media';
}

function formatarData(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch {
    return '';
  }
}

export default function OutputHeader({ projeto, output, agentNum, nomeExibicao }) {
  const confiancaRaw = output?.confianca || 'Média';
  const cor = CONFIANCA_COR[chaveConfianca(confiancaRaw)];
  const titulo = nomeExibicao || `Agente ${agentNum}`;
  const empresa =
    projeto?.empresa?.nome ||
    projeto?.empresa_nome ||
    projeto?.nome ||
    'Projeto';

  return (
    <header
      className="flex justify-between items-start gap-4 pb-4"
      style={{ borderBottom: '1px solid var(--glass-border)' }}
    >
      <div>
        <nav className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
          <Link href="/adm" className="hover:underline">Painel</Link>
          {' / '}
          <Link href={`/adm/${projeto?.id || ''}`} className="hover:underline">
            {empresa}
          </Link>
          {' / '}
          <span>Outputs</span>
        </nav>
        <h1
          className="text-2xl font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          {titulo}
        </h1>
        <p
          className="text-sm mt-1"
          style={{ color: 'var(--text-secondary)' }}
        >
          {output?.created_at && <>Gerado em {formatarData(output.created_at)}</>}
          {output?.created_at && ' · '}
          <span style={{ color: cor, fontWeight: 600 }}>
            Confiança: {confiancaRaw}
          </span>
        </p>
      </div>

      <div className="flex gap-2">
        <a
          href={`/api/outputs/${projeto?.id || ''}/${agentNum}/pdf`}
          download
          className="px-4 py-2 rounded text-sm font-medium inline-flex items-center gap-2"
          style={{
            backgroundColor: 'var(--brand-blue)',
            color: '#FFF',
            border: '1px solid var(--brand-blue)',
            textDecoration: 'none',
            fontWeight: 600,
          }}
          title="Baixar este output em PDF"
        >
          📄 Baixar PDF
        </a>
      </div>
    </header>
  );
}
