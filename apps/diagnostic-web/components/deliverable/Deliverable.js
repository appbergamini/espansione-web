// components/deliverable/Deliverable.js
//
// Bloco D · TASK 4.4 — componente raiz do entregável consolidado.
//
// ARQUITETURA ATUAL (A1 — Opção "a"): rota única renderiza todas as
// 7 partes numa única página HTML. Export PDF via Playwright/page.pdf()
// em um único render (TASK 4.3 reutilizada via rota
// /api/outputs/[projetoId]/deliverable/pdf). Simples, funciona para
// entregáveis de 30-60 páginas.
//
// CAMINHO DE UPGRADE PARA (B) — se em produção começar a dar problema
// de memória (>2GB pico) ou timeout (>50s por export), migrar para
// arquitetura modular:
//
//   1. Criar rotas por parte: /adm/[id]/deliverable/parte/[numero]
//   2. Endpoint PDF gera 8 PDFs separados (capa + 7 partes) em série
//   3. Usar pdf-lib para merge final preservando numeração
//   4. Cada Parte[N].js já está modular — só mover cada um pra sua rota
//   5. CSS @page de numeração continua igual
//
// Indicadores de quando migrar:
//   - Logs de `[deliverable-pdf] generation` consistentemente > 45s
//   - Erros de OOM no Vercel Functions
//   - Entregáveis crescendo > 80 páginas em média
//
// Instalação de pdf-lib quando migrar: `npm install pdf-lib`.

import DeliverableCover from './shared/DeliverableCover';
import DeliverableToc from './shared/DeliverableToc';
import DeliverableHeader from './shared/DeliverableHeader';
import Parte0Abertura from './parts/Parte0Abertura';
import Parte1Diagnostico from './parts/Parte1Diagnostico';
import Parte2Direcao from './parts/Parte2Direcao';
import Parte3Plataforma from './parts/Parte3Plataforma';
import Parte4Expressao from './parts/Parte4Expressao';
import Parte5Vivencia from './parts/Parte5Vivencia';
import Parte6Ativacao from './parts/Parte6Ativacao';
import Parte7Encerramento from './parts/Parte7Encerramento';

export default function Deliverable({
  projeto,
  outputsByAgent,
  maturidade360,
  metadadosEscuta,
  vizDataPorAgent,
  temEvp,
  socioFundadorNome,
  isPrintMode,
}) {
  const dataGeracao = new Date().toISOString();

  const sharedProps = {
    projeto,
    outputsByAgent,
    maturidade360,
    metadadosEscuta,
    vizDataPorAgent,
    temEvp,
    socioFundadorNome,
    dataGeracao,
  };

  return (
    <div
      className="deliverable-root"
      style={{
        backgroundColor: 'var(--viz-card-bg)',
        color: 'var(--viz-card-text)',
      }}
    >
      {!isPrintMode && <DeliverableHeader projeto={projeto} />}

      <DeliverableCover projeto={projeto} dataGeracao={dataGeracao} />
      <DeliverableToc temEvp={temEvp} />

      <div className="deliverable-body">
        <Parte0Abertura {...sharedProps} />
        <Parte1Diagnostico {...sharedProps} />
        <Parte2Direcao {...sharedProps} />
        <Parte3Plataforma {...sharedProps} />
        <Parte4Expressao {...sharedProps} />
        <Parte5Vivencia {...sharedProps} />
        <Parte6Ativacao {...sharedProps} />
        <Parte7Encerramento {...sharedProps} />
      </div>
    </div>
  );
}
