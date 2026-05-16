// components/deliverable/parts/Parte0Abertura.js
//
// Parte 0 — Abertura. Três sub-blocos:
//   0.1 Carta de abertura (Agente 15, extrairCartaAbertura)
//   0.2 Sumário executivo (Agente 15, extrairSumarioExecutivo)
//   0.3 Como lemos sua empresa (metadados da escuta)
//
// Se o Agente 15 não rodou (Parte 0.1/0.2 ausentes), exibe fallback
// que diz ao leitor que esses dois blocos serão adicionados após
// a curadoria editorial final.

import PartHeader from '../shared/PartHeader';
import OutputRenderer from '../../output/OutputRenderer';
import ComoLemosSuaEmpresa from '../shared/ComoLemosSuaEmpresa';
import {
  extrairCartaAbertura,
  extrairSumarioExecutivo,
} from '../../../lib/deliverable/extractFromOutput';

export default function Parte0Abertura({ outputsByAgent, metadadosEscuta }) {
  const agente15 = outputsByAgent?.[15];
  const carta    = extrairCartaAbertura(agente15);
  const sumario  = extrairSumarioExecutivo(agente15);

  return (
    <section className="part part-0">
      <PartHeader
        numero="0"
        titulo="Abertura"
        subtitulo="Uma nota pessoal antes do documento começar."
      />

      {/* 0.1 Carta de abertura */}
      <div className="subpart subpart-0-1 manifesto-section">
        <h3 className="subpart-title">Carta de abertura</h3>
        {carta ? (
          <OutputRenderer conteudo={carta} compactMode />
        ) : (
          <FallbackCurador
            texto="A carta de abertura é adicionada no final do processo, pela consultora responsável. Até lá, este espaço fica reservado para a Vanessa deixar o gesto pessoal que abre o documento."
          />
        )}
      </div>

      {/* 0.2 Sumário executivo */}
      <div className="subpart subpart-0-2 page-break-before">
        <h3 className="subpart-title">Sumário executivo</h3>
        {sumario ? (
          <OutputRenderer conteudo={sumario} compactMode />
        ) : (
          <FallbackCurador
            texto="O sumário executivo consolida, em uma página, o desafio central + três achados + três direcionamentos + o convite para a próxima fase. Será escrito após a curadoria editorial final."
          />
        )}
      </div>

      {/* 0.3 Como lemos sua empresa */}
      <div className="subpart subpart-0-3 page-break-before">
        <ComoLemosSuaEmpresa metadadosEscuta={metadadosEscuta} />
      </div>
    </section>
  );
}

function FallbackCurador({ texto }) {
  return (
    <div className="empty-part-fallback">
      <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
        Curadoria editorial pendente
      </div>
      <div>{texto}</div>
    </div>
  );
}
