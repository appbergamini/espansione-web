// components/deliverable/parts/Parte3Plataforma.js
//
// Parte 3 — Plataforma. Duas vozes:
//   3.1 Plataforma editorial → Agente 9 sem a seção Manifesto
//   3.2 Manifesto           → bloco destacado, tipografia serif,
//                              margens largas, centralizado
//
// O Manifesto é extraído do Agente 9 e renderizado à parte com
// tratamento editorial especial (classe .manifesto-section no CSS).

import PartHeader from '../shared/PartHeader';
import OutputRenderer from '../../output/OutputRenderer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  extrairManifesto,
  removerSecao,
} from '../../../lib/deliverable/extractFromOutput';

export default function Parte3Plataforma({ outputsByAgent, vizDataPorAgent }) {
  const agente9 = outputsByAgent?.[9];

  // Plataforma SEM manifesto (manifesto vira bloco próprio 3.2).
  // Tenta remover ambas as capitalizações comuns para não deixar a
  // seção duplicada.
  let plataformaSemManifesto = agente9?.conteudo || null;
  if (plataformaSemManifesto) {
    plataformaSemManifesto = removerSecao(plataformaSemManifesto, '## MANIFESTO');
    plataformaSemManifesto = removerSecao(plataformaSemManifesto, '## Manifesto');
  }

  const manifesto = extrairManifesto(agente9);

  return (
    <section className="part part-3">
      <PartHeader
        numero="3"
        titulo="Plataforma de Marca"
        subtitulo="A promessa — escrita em método proprietário Ana Couto."
      />

      {plataformaSemManifesto && (
        <div className="subpart">
          <h3 className="subpart-title">Plataforma editorial</h3>
          <OutputRenderer
            conteudo={plataformaSemManifesto}
            vizData={vizDataPorAgent?.[9] || {}}
            compactMode
          />
        </div>
      )}

      {manifesto && (
        <div className="subpart manifesto-wrapper page-break-before">
          <div className="manifesto-section">
            <div className="manifesto-label">Manifesto</div>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {limparManifestoHeader(manifesto)}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {!plataformaSemManifesto && !manifesto && (
        <div className="empty-part-fallback">
          A Plataforma ainda não foi consolidada — aguardando o Agente 9.
        </div>
      )}
    </section>
  );
}

/**
 * Remove a primeira linha "## MANIFESTO" / "## Manifesto" se o
 * extrator tiver mantido o cabeçalho — usamos label próprio.
 */
function limparManifestoHeader(md) {
  if (!md) return md;
  return md.replace(/^##\s+MANIFESTO\s*/i, '').replace(/^##\s+Manifesto\s*/i, '').trim();
}
