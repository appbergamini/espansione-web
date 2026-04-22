// components/deliverable/parts/Parte5Vivencia.js
//
// Parte 5 — Vivência. Duas subpartes:
//   5.1 Experiência (Agente 12) — sempre
//   5.2 EVP — Marca Empregadora (Agente 14) — condicional, só se
//       o projeto contratou escopo de marca empregadora (temEvp).

import PartHeader from '../shared/PartHeader';
import OutputRenderer from '../../output/OutputRenderer';

export default function Parte5Vivencia({ outputsByAgent, vizDataPorAgent, temEvp }) {
  const experiencia = outputsByAgent?.[12]?.conteudo || null;
  const evp         = temEvp ? (outputsByAgent?.[14]?.conteudo || null) : null;

  const temAlgo = experiencia || evp;

  return (
    <section className="part part-5">
      <PartHeader
        numero="5"
        titulo="Vivência"
        subtitulo="O que o cliente experimenta por fora, o que o colaborador vive por dentro."
      />

      {experiencia && (
        <div className="subpart">
          <h3 className="subpart-title">5.1 Experiência</h3>
          <OutputRenderer
            conteudo={experiencia}
            vizData={vizDataPorAgent?.[12] || {}}
            compactMode
          />
        </div>
      )}

      {evp && (
        <div className="subpart page-break-before">
          <h3 className="subpart-title">5.2 Plataforma de Marca Empregadora (EVP)</h3>
          <OutputRenderer
            conteudo={evp}
            vizData={vizDataPorAgent?.[14] || {}}
            compactMode
          />
        </div>
      )}

      {!temAlgo && (
        <div className="empty-part-fallback">
          A Vivência ainda não foi consolidada — aguardando Agentes 12 {temEvp && 'e 14'}.
        </div>
      )}
    </section>
  );
}
