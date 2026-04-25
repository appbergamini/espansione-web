// FIX.34 — Bloco visual de tipografia. Renderizado a partir de
// `tipografia` fenced JSON dentro do <conteudo> do Agente 11.
//
// Estrutura esperada:
// [
//   {
//     "papel": "Título",
//     "familia": "Söhne Buch",
//     "fallback": "Inter, system-ui",
//     "peso": "500-700",
//     "tamanho_referencia": "32px / 1.15",
//     "amostra_tagline": "A escolha de quem sabe escolher"   // opcional — recomendado
//   },
//   {
//     "papel": "Corpo",
//     "familia": "Söhne Buch",
//     "amostra_texto": "Parágrafo curto que demonstra o tratamento tipográfico no corpo de texto."
//   }
// ]
//
// Importante: a fonte declarada pode não estar instalada no navegador.
// Por isso a amostra usa `${familia}, ${fallback}` e mostra o NOME da
// família em metadados — quando a fonte real não estiver disponível,
// o fallback (sans-serif/serif/system-ui) é renderizado.

export default function Tipografia({ tipografia, taglineFallback }) {
  const lista = Array.isArray(tipografia) ? tipografia : [];
  if (lista.length === 0) {
    return (
      <div style={{ padding: '0.75rem 1rem', border: '1px dashed var(--viz-card-border)', borderRadius: 8, fontStyle: 'italic', color: 'var(--viz-card-text-muted)', fontSize: '0.85rem' }}>
        Tipografia não informada.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '0.5rem 0' }}>
      {lista.map((t, i) => (
        <FamiliaBlock key={i} item={t} taglineFallback={taglineFallback} />
      ))}
    </div>
  );
}

function FamiliaBlock({ item, taglineFallback }) {
  const familia = (item.familia || '').trim();
  const fallback = (item.fallback || 'system-ui, sans-serif').trim();
  const fontStack = familia ? `'${familia}', ${fallback}` : fallback;
  const peso = item.peso || null;
  const tamanho = item.tamanho_referencia || null;

  // Pra título prioriza a tagline (vem do output ou fallback do props)
  const ehTitulo = /título|titulo|head|display/i.test(item.papel || '');
  const amostra = ehTitulo
    ? (item.amostra_tagline || taglineFallback || 'A marca encontra sua voz.')
    : (item.amostra_texto || 'Texto-âncora que demonstra o tratamento da marca em corpo de texto, com legibilidade e ritmo de leitura coerentes com o caráter editorial pretendido.');

  return (
    <div style={{
      border: '1px solid var(--viz-card-border)',
      borderRadius: 10,
      padding: '1rem 1.1rem 1.1rem',
      background: 'var(--viz-card-bg)',
      minWidth: 0,
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.55rem' }}>
        <div>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--viz-card-text-muted)' }}>
            {item.papel || 'Tipografia'}
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--viz-card-text)', marginTop: '0.15rem' }}>
            {familia || '—'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', fontSize: '0.7rem', color: 'var(--viz-card-text-muted)' }}>
          {peso && <span style={tagPill}>peso {peso}</span>}
          {tamanho && <span style={tagPill}>{tamanho}</span>}
          {fallback && <span style={tagPill}>fallback: {fallback}</span>}
        </div>
      </div>

      <div
        style={{
          fontFamily: fontStack,
          fontSize: ehTitulo ? '2rem' : '1rem',
          fontWeight: ehTitulo ? 600 : 400,
          lineHeight: ehTitulo ? 1.15 : 1.55,
          letterSpacing: ehTitulo ? '-0.01em' : 0,
          color: 'var(--viz-card-text)',
          paddingTop: '0.4rem',
          borderTop: '1px solid var(--viz-card-border)',
          // FIX.35 — quebra de linha em frases longas evita overflow do box.
          wordBreak: 'break-word',
          overflowWrap: 'anywhere',
          maxWidth: '100%',
        }}
      >
        {amostra}
      </div>
    </div>
  );
}

const tagPill = {
  border: '1px solid var(--viz-card-border)',
  borderRadius: 4,
  padding: '0.1rem 0.45rem',
};
