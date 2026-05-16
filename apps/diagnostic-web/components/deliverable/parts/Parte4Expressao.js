// components/deliverable/parts/Parte4Expressao.js
//
// Parte 4 — Expressão. Identidade verbal (Agente 10, UVV) +
// One page visual (Agente 11).

import PartHeader from '../shared/PartHeader';
import OutputRenderer from '../../output/OutputRenderer';

export default function Parte4Expressao({ outputsByAgent, vizDataPorAgent }) {
  const verbal = outputsByAgent?.[10]?.conteudo || null;
  const visual = outputsByAgent?.[11]?.conteudo || null;

  const temAlgo = verbal || visual;

  return (
    <section className="part part-4">
      <PartHeader
        numero="4"
        titulo="Expressão"
        subtitulo="Como a marca fala — em palavras e em forma."
      />

      {verbal && (
        <div className="subpart">
          <h3 className="subpart-title">Identidade verbal (UVV)</h3>
          <OutputRenderer
            conteudo={verbal}
            vizData={vizDataPorAgent?.[10] || {}}
            compactMode
          />
        </div>
      )}

      {visual && (
        <div className="subpart page-break-before">
          <h3 className="subpart-title">One page visual</h3>
          <OutputRenderer
            conteudo={visual}
            vizData={vizDataPorAgent?.[11] || {}}
            compactMode
          />
        </div>
      )}

      {!temAlgo && (
        <div className="empty-part-fallback">
          A Expressão ainda não foi consolidada — aguardando Agentes 10 e 11.
        </div>
      )}
    </section>
  );
}
