// components/output/OutputSidebar.js
//
// Bloco D · TASK 4.2 — sidebar da página de output.
// Dois blocos:
//   1. Navegação entre outputs do mesmo projeto (Agente 1, 2, …, 13)
//   2. TOC das seções (##, ###) do Markdown atual, com scroll âncora
//
// Layout: sticky à esquerda, ~280px, scroll interno se lista longa.

import Link from 'next/link';

export default function OutputSidebar({
  outputs = [],
  currentAgentNum,
  projetoId,
  conteudo,
}) {
  const headings = extrairHeadings(conteudo);

  return (
    <aside
      className="w-72 flex-shrink-0 sticky top-6 self-start max-h-[calc(100vh-6rem)] overflow-y-auto pr-2"
      style={{ color: 'var(--text-primary)' }}
    >
      <nav className="mb-8">
        <h3
          className="text-xs uppercase tracking-wider font-semibold mb-3"
          style={{ color: 'var(--text-secondary)' }}
        >
          Outputs do projeto
        </h3>
        {outputs.length === 0 ? (
          <p className="text-xs italic" style={{ color: 'var(--text-secondary)' }}>
            Nenhum output gerado ainda.
          </p>
        ) : (
          <ul className="space-y-1">
            {outputs.map(out => {
              const ativo = out.agent_num === currentAgentNum;
              return (
                <li key={out.id}>
                  <Link
                    href={`/adm/${projetoId}/outputs/${out.agent_num}`}
                    className="block px-3 py-2 rounded text-sm transition-colors"
                    style={{
                      backgroundColor: ativo
                        ? 'rgba(107, 163, 255, 0.08)'
                        : 'transparent',
                      color: ativo
                        ? 'var(--brand-blue-light)'
                        : 'var(--text-secondary)',
                      fontWeight: ativo ? 600 : 400,
                      borderLeft: ativo
                        ? '3px solid var(--brand-blue-light)'
                        : '3px solid transparent',
                    }}
                  >
                    {out.nome_exibicao || `Agente ${out.agent_num}`}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      {headings.length > 0 && (
        <nav>
          <h3
            className="text-xs uppercase tracking-wider font-semibold mb-3"
            style={{ color: 'var(--text-secondary)' }}
          >
            Nesta página
          </h3>
          <ul className="space-y-1 text-sm">
            {headings.map((h, idx) => (
              <li
                key={idx}
                className={h.nivel === 3 ? 'pl-4' : ''}
                style={{ color: 'var(--text-secondary)' }}
              >
                <a
                  href={`#${h.slug}`}
                  className="block py-1 hover:opacity-100 transition-opacity"
                  style={{ opacity: 0.7 }}
                >
                  {h.texto}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </aside>
  );
}

/**
 * Extrai cabeçalhos ## e ### do Markdown (ignora # e h4+).
 * Retorna { nivel, texto, slug } para cada.
 */
function extrairHeadings(conteudo) {
  if (!conteudo || typeof conteudo !== 'string') return [];

  const regex = /^(##+)\s+(.+)$/gm;
  const headings = [];
  let match;

  while ((match = regex.exec(conteudo)) !== null) {
    const nivel = match[1].length;
    if (nivel > 3) continue;

    const texto = match[2].trim().replace(/<!--.*?-->/g, '').trim();
    if (!texto) continue;

    headings.push({
      nivel,
      texto,
      slug: texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
    });
  }

  return headings;
}
