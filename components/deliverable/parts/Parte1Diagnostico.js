// components/deliverable/parts/Parte1Diagnostico.js
//
// Parte 1 — Diagnóstico. Quatro subpartes:
//   1.1 Visão interna   → Parte B (devolutiva) do Agente 2
//                         Parte A permanece nos outputs individuais
//   1.2 Visão externa   → conteúdo do Agente 4
//   1.3 Leitura de mercado → curadoria editorial extraída do Agente 6
//   1.4 Cultura × Direção  → seção 1.4 do Agente 6

import PartHeader from '../shared/PartHeader';
import OutputRenderer from '../../output/OutputRenderer';
import {
  extrairParteB,
  extrairCulturaVsDirecao,
  extrairCuradoriaMercado,
} from '../../../lib/deliverable/extractFromOutput';

export default function Parte1Diagnostico({ outputsByAgent, vizDataPorAgent }) {
  const agente2 = outputsByAgent?.[2];
  const agente4 = outputsByAgent?.[4];
  const agente6 = outputsByAgent?.[6];

  // Para a Parte 1.1 usamos a devolutiva (Parte B) quando o Agente 2 v2
  // marcou separador; caso contrário, caímos para o resumo executivo +
  // conclusões do Agente 2. As visualizações aparecem via markers do
  // próprio output (que residem na Parte A) — então se preferirmos as
  // visualizações, passamos o conteúdo inteiro.
  const parte1_1 = (agente2 && (extrairParteB(agente2.conteudo) || agente2.conteudo)) || null;
  const parte1_2 = agente4?.conteudo || null;
  const parte1_3 = extrairCuradoriaMercado(agente6);
  const parte1_4 = extrairCulturaVsDirecao(agente6);

  const temAlgo = parte1_1 || parte1_2 || parte1_3 || parte1_4;

  return (
    <section className="part part-1">
      <PartHeader
        numero="1"
        titulo="Diagnóstico"
        subtitulo="O retrato honesto de onde começamos."
      />

      {parte1_1 && (
        <div className="subpart subpart-1-1">
          <h3 className="subpart-title">1.1 Visão interna</h3>
          <OutputRenderer
            conteudo={parte1_1}
            vizData={vizDataPorAgent?.[2] || {}}
            compactMode
          />
        </div>
      )}

      {parte1_2 && (
        <div className="subpart subpart-1-2 page-break-before">
          <h3 className="subpart-title">1.2 Visão externa</h3>
          <OutputRenderer
            conteudo={parte1_2}
            vizData={vizDataPorAgent?.[4] || {}}
            compactMode
          />
        </div>
      )}

      {parte1_3 && (
        <div className="subpart subpart-1-3 page-break-before">
          <h3 className="subpart-title">1.3 Leitura de mercado</h3>
          <OutputRenderer
            conteudo={parte1_3}
            vizData={vizDataPorAgent?.[6] || {}}
            compactMode
          />
        </div>
      )}

      {parte1_4 && (
        <div className="subpart subpart-1-4 page-break-before">
          <h3 className="subpart-title">1.4 Cultura × Direção Estratégica</h3>
          <OutputRenderer
            conteudo={parte1_4}
            vizData={vizDataPorAgent?.[6] || {}}
            compactMode
          />
        </div>
      )}

      {!temAlgo && (
        <div className="empty-part-fallback">
          Dados do diagnóstico ainda não disponíveis para este projeto.
        </div>
      )}
    </section>
  );
}
