// components/deliverable/parts/Parte6Ativacao.js
//
// Parte 6 — Ativação. Três sub-blocos, todos derivados do Agente 13:
//   6.1 Plano de Comunicação — conteúdo do Agente 13 sem Roadmap/KPIs
//   6.2 Roadmap consolidado — bloco extraído
//   6.3 KPIs — bloco extraído

import PartHeader from '../shared/PartHeader';
import OutputRenderer from '../../output/OutputRenderer';
import {
  extrairRoadmap,
  extrairKpis,
  removerSecao,
} from '../../../lib/deliverable/extractFromOutput';

export default function Parte6Ativacao({ outputsByAgent, vizDataPorAgent }) {
  const agente13 = outputsByAgent?.[13];

  // Plano de comunicação sem Roadmap e KPIs (vão em seções próprias).
  let plano = agente13?.conteudo || null;
  if (plano) {
    plano = removerSecao(plano, '## ROADMAP CONSOLIDADO DE ATIVAÇÃO');
    plano = removerSecao(plano, '## ROADMAP');
    plano = removerSecao(plano, '## Roadmap');
    plano = removerSecao(plano, '## KPIs DE BRANDING E COMUNICAÇÃO');
    plano = removerSecao(plano, '## KPIs');
    plano = removerSecao(plano, '## Indicadores');
  }

  const roadmap = extrairRoadmap(agente13);
  const kpis    = extrairKpis(agente13);

  const temAlgo = plano || roadmap || kpis;

  return (
    <section className="part part-6">
      <PartHeader
        numero="6"
        titulo="Ativação"
        subtitulo="O que fazer primeiro, com que cadência, medindo o quê."
      />

      {plano && (
        <div className="subpart">
          <h3 className="subpart-title">Plano de comunicação</h3>
          <OutputRenderer
            conteudo={plano}
            vizData={vizDataPorAgent?.[13] || {}}
            compactMode
          />
        </div>
      )}

      {roadmap && (
        <div className="subpart page-break-before">
          <h3 className="subpart-title">Roadmap consolidado</h3>
          <OutputRenderer conteudo={roadmap} compactMode />
        </div>
      )}

      {kpis && (
        <div className="subpart page-break-before">
          <h3 className="subpart-title">KPIs de branding e comunicação</h3>
          <OutputRenderer conteudo={kpis} compactMode />
        </div>
      )}

      {!temAlgo && (
        <div className="empty-part-fallback">
          A Ativação ainda não foi consolidada — aguardando o Agente 13.
        </div>
      )}
    </section>
  );
}
