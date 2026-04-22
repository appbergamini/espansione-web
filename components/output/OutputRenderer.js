// components/output/OutputRenderer.js
//
// Bloco D · TASK 4.2 — renderiza o conteúdo de um output de agente
// em tipografia editorial, substituindo markers <!-- VIZ:xxx --> pelos
// componentes React de visualização da TASK 4.1.
//
// Arquitetura:
//   1. parseVizMarkers(conteudo) → lista de markers com posições
//   2. dividirEmBlocos(conteudo) → alterna { tipo:'texto' | 'viz' }
//   3. Cada bloco "texto" vai para <ReactMarkdown> (prose editorial)
//   4. Cada bloco "viz" busca dados em vizData[chave] e renderiza o
//      componente correspondente — com fallback silencioso de
//      "indisponível" quando os dados não existirem.
//
// Convenções do projeto confirmadas na investigação:
//   - Pages Router (pages/adm/[id].js)
//   - outputs.agent_num é o stage (inteiro, não string)
//   - Estilização híbrida: Tailwind p/ layout, inline CSS vars p/ cores
//   - VizCard é o wrapper editorial padrão (TASK 4.1)

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  RadarDISC,
  BarrasJung,
  HeatmapCompetencias,
  BadgeEstiloLideranca,
} from '../visualizations/cis';
import { RadarMaturidade360 } from '../visualizations/maturidade';
import {
  parseVizMarkers,
  vizMarkerKey,
} from '../../lib/output/parseVizMarkers';

export default function OutputRenderer({
  conteudo,
  resumoExecutivo,
  conclusoes,
  vizData = {},
}) {
  const blocos = dividirEmBlocos(conteudo);

  return (
    <article className="output-editorial">
      {resumoExecutivo && (
        <section
          className="mb-10 p-6 rounded-xl"
          style={{
            backgroundColor: 'var(--viz-card-bg)',
            border: '1px solid var(--viz-card-border)',
            boxShadow: 'var(--viz-card-shadow)',
          }}
        >
          <h2
            className="text-xs uppercase tracking-wider font-semibold mb-3"
            style={{ color: 'var(--viz-card-text-muted)' }}
          >
            Resumo executivo
          </h2>
          <div
            className="output-prose"
            style={{ color: 'var(--viz-card-text)' }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {resumoExecutivo}
            </ReactMarkdown>
          </div>
        </section>
      )}

      <div className="output-body space-y-6">
        {blocos.map((bloco, idx) => (
          <BlocoRenderer key={idx} bloco={bloco} vizData={vizData} />
        ))}
      </div>

      {conclusoes && (
        <section
          className="mt-12 p-6 rounded-xl"
          style={{
            backgroundColor: 'var(--viz-card-bg)',
            borderLeft: '4px solid var(--accent-blue)',
            borderTop: '1px solid var(--viz-card-border)',
            borderRight: '1px solid var(--viz-card-border)',
            borderBottom: '1px solid var(--viz-card-border)',
            boxShadow: 'var(--viz-card-shadow)',
          }}
        >
          <h2
            className="text-xs uppercase tracking-wider font-semibold mb-3"
            style={{ color: 'var(--viz-card-text-muted)' }}
          >
            Conclusões
          </h2>
          <div
            className="output-prose"
            style={{ color: 'var(--viz-card-text)' }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {conclusoes}
            </ReactMarkdown>
          </div>
        </section>
      )}
    </article>
  );
}

/**
 * Divide o Markdown em uma sequência de blocos alternando
 * { tipo: 'texto', conteudo } e { tipo: 'viz', marker }.
 * Markers contíguos ficam em blocos sequenciais (sem texto entre eles).
 */
function dividirEmBlocos(conteudo) {
  if (!conteudo || typeof conteudo !== 'string') return [];

  const markers = parseVizMarkers(conteudo);
  if (markers.length === 0) {
    return [{ tipo: 'texto', conteudo }];
  }

  const blocos = [];
  let cursor = 0;

  for (const marker of markers) {
    if (marker.posicaoInicio > cursor) {
      const texto = conteudo.slice(cursor, marker.posicaoInicio).trim();
      if (texto) blocos.push({ tipo: 'texto', conteudo: texto });
    }
    blocos.push({ tipo: 'viz', marker });
    cursor = marker.posicaoFim;
  }

  if (cursor < conteudo.length) {
    const tail = conteudo.slice(cursor).trim();
    if (tail) blocos.push({ tipo: 'texto', conteudo: tail });
  }

  return blocos;
}

function BlocoRenderer({ bloco, vizData }) {
  if (bloco.tipo === 'texto') {
    return (
      <div
        className="output-prose"
        style={{ color: 'var(--viz-card-text)' }}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {bloco.conteudo}
        </ReactMarkdown>
      </div>
    );
  }

  if (bloco.tipo === 'viz') {
    return <VizBloco marker={bloco.marker} vizData={vizData} />;
  }

  return null;
}

function VizBloco({ marker, vizData }) {
  const chave = vizMarkerKey(marker);
  const dados = vizData?.[chave];

  if (!dados) {
    return (
      <div
        className="my-8 p-4 rounded-lg text-center text-sm"
        style={{
          backgroundColor: 'var(--viz-card-bg)',
          color: 'var(--viz-card-text-muted)',
          border: '1px dashed var(--viz-card-border)',
          fontStyle: 'italic',
        }}
      >
        Visualização indisponível: dados insuficientes.
        <span className="block text-xs mt-1 opacity-60">[{marker.raw}]</span>
      </div>
    );
  }

  switch (marker.tipo) {
    case 'radar_disc_socio':
    case 'radar_disc_time':
      return (
        <div className="my-8">
          <RadarDISC
            dados={dados}
            contexto={dados.contexto}
            confiabilidade={dados.confiabilidade}
          />
        </div>
      );

    case 'barras_jung_time':
      return (
        <div className="my-8">
          <BarrasJung dados={dados} />
        </div>
      );

    case 'heatmap_competencias_time':
      return (
        <div className="my-8">
          <HeatmapCompetencias dados={dados} />
        </div>
      );

    case 'badge_estilo_lideranca':
      return (
        <div className="my-8">
          <BadgeEstiloLideranca dados={dados} />
        </div>
      );

    case 'radar_maturidade_360':
      return (
        <div className="my-8">
          <RadarMaturidade360 dados={dados} mostrar_divergencia />
        </div>
      );

    default:
      return null;
  }
}
