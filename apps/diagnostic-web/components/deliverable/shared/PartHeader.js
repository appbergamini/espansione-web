// components/deliverable/shared/PartHeader.js
//
// Bloco D · TASK 4.4 — cabeçalho de abertura de cada Parte do
// entregável. É uma "pseudocapa" interna: número grande em baixo
// contraste + título + subtítulo descritivo. Sempre quebra de
// página antes (.page-break-before).

export default function PartHeader({ numero, titulo, subtitulo }) {
  return (
    <section
      className="part-header page-break-before"
      aria-label={`Parte ${numero} — ${titulo}`}
    >
      <div className="part-header-num">{numero}</div>
      <h2 className="part-header-titulo">{titulo}</h2>
      {subtitulo && <p className="part-header-subtitulo">{subtitulo}</p>}
    </section>
  );
}
