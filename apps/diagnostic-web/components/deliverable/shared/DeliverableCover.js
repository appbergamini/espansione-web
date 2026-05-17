// components/deliverable/shared/DeliverableCover.js
//
// Bloco D · TASK 4.4 — capa em página cheia do entregável final.
// Ocupa uma página A4 inteira quando impressa. Quebra de página
// garantida depois (classe .page-break-after).

export default function DeliverableCover({ projeto, dataGeracao }) {
  const nomeEmpresa = projeto?.cliente || 'Projeto';
  const dataFmt = formatarDataExtenso(dataGeracao);

  return (
    <section
      className="deliverable-cover page-break-after"
      aria-label="Capa do entregável final"
    >
      <div className="cover-eyebrow">Estrutura de Marca &amp; Direcionamento Estratégico</div>

      <div className="cover-title-block">
        <h1 className="cover-title">{nomeEmpresa}</h1>
        <div className="cover-sub">
          Um trabalho editorial de Espansione · Método Ana Couto
        </div>
      </div>

      <div className="cover-footer">
        <div>{dataFmt}</div>
        <div>Documento editorial confidencial</div>
      </div>
    </section>
  );
}

function formatarDataExtenso(iso) {
  try {
    const d = iso ? new Date(iso) : new Date();
    return d.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    }).replace(/^\w/, c => c.toUpperCase());
  } catch {
    return '';
  }
}
