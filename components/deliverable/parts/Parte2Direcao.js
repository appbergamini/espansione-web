// components/deliverable/parts/Parte2Direcao.js
//
// Parte 2 — Direção. Posicionamento T&W (Agente 6 Seção 2) +
// Valores/Atributos (Agente 7) + Diretrizes (Agente 8).

import PartHeader from '../shared/PartHeader';
import OutputRenderer from '../../output/OutputRenderer';
import { extrairPosicionamentoTw } from '../../../lib/deliverable/extractFromOutput';

export default function Parte2Direcao({ outputsByAgent, vizDataPorAgent }) {
  const agente6 = outputsByAgent?.[6];
  const agente7 = outputsByAgent?.[7];
  const agente8 = outputsByAgent?.[8];

  const posicionamento = extrairPosicionamentoTw(agente6);
  const valores        = agente7?.conteudo || null;
  const diretrizes     = agente8?.conteudo || null;

  const temAlgo = posicionamento || valores || diretrizes;

  return (
    <section className="part part-2">
      <PartHeader
        numero="2"
        titulo="Direção"
        subtitulo="O vetor estratégico escolhido — para onde a marca se move."
      />

      {posicionamento && (
        <div className="subpart">
          <h3 className="subpart-title">Posicionamento competitivo declarado (T&amp;W)</h3>
          <OutputRenderer
            conteudo={posicionamento}
            vizData={vizDataPorAgent?.[6] || {}}
            compactMode
          />
        </div>
      )}

      {valores && (
        <div className="subpart page-break-before">
          <h3 className="subpart-title">Valores e atributos</h3>
          <OutputRenderer
            conteudo={valores}
            vizData={vizDataPorAgent?.[7] || {}}
            compactMode
          />
        </div>
      )}

      {diretrizes && (
        <div className="subpart page-break-before">
          <h3 className="subpart-title">Diretrizes estratégicas</h3>
          <OutputRenderer
            conteudo={diretrizes}
            vizData={vizDataPorAgent?.[8] || {}}
            compactMode
          />
        </div>
      )}

      {!temAlgo && (
        <div className="empty-part-fallback">
          A Direção ainda não foi consolidada — aguardando outputs dos Agentes 6, 7 e 8.
        </div>
      )}
    </section>
  );
}
