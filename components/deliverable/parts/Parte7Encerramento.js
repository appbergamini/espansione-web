// components/deliverable/parts/Parte7Encerramento.js
//
// Parte 7 — Encerramento. Convite para a próxima fase (recupera o
// bloco final do Sumário Executivo do Agente 15 quando disponível,
// ou usa texto padrão) + créditos da equipe Espansione.

import PartHeader from '../shared/PartHeader';

export default function Parte7Encerramento({ projeto, socioFundadorNome, dataGeracao }) {
  const destinatario = socioFundadorNome || 'ao time fundador';
  const dataFmt = formatarDataExtenso(dataGeracao);

  return (
    <section className="part part-7">
      <PartHeader
        numero="7"
        titulo="Encerramento"
        subtitulo="O documento abriu uma conversa — esta é a próxima cadeira."
      />

      <div className="subpart encerramento-convite page-break-inside-avoid">
        <h3 className="subpart-title">Convite para a próxima fase</h3>
        <p>
          Este documento não é um fim — é o início de uma construção. Os três
          direcionamentos propostos no Sumário Executivo abrem, cada um, um
          trabalho distinto: desdobramento visual, ativação interna, ou
          implementação do roadmap.
        </p>
        <p>
          A próxima fase é escolher, com {destinatario}, qual desses movimentos
          começa primeiro — e em que cadência a marca vai entrar em movimento.
          Os direcionamentos abaixo são convite, não prescrição.
        </p>
      </div>

      <div className="subpart creditos page-break-inside-avoid">
        <h3 className="subpart-title">Créditos</h3>
        <div className="creditos-grid">
          <div>
            <div className="creditos-label">Consultoria</div>
            <div className="creditos-valor">Vanessa Bergamini</div>
            <div className="creditos-sub">Estrategista-chefe · Espansione</div>
          </div>
          <div>
            <div className="creditos-label">Método</div>
            <div className="creditos-valor">Ana Couto · Branding Aplicado</div>
          </div>
          <div>
            <div className="creditos-label">Cliente</div>
            <div className="creditos-valor">{projeto?.cliente || '—'}</div>
            {projeto?.responsavel_nome && (
              <div className="creditos-sub">Responsável: {projeto.responsavel_nome}</div>
            )}
          </div>
          <div>
            <div className="creditos-label">Data</div>
            <div className="creditos-valor">{dataFmt}</div>
          </div>
        </div>
      </div>

      <div className="subpart rodape-documento">
        <p className="rodape-documento-txt">
          Documento editorial confidencial. Uso restrito ao cliente e à equipe
          Espansione. Reprodução total ou parcial requer autorização prévia.
        </p>
      </div>
    </section>
  );
}

function formatarDataExtenso(iso) {
  try {
    const d = iso ? new Date(iso) : new Date();
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}
