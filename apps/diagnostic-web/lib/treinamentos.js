// =====================================================================
// Trilha de treinamentos (vídeos Bunny Stream) da área do cliente.
// Preencha:
//  - NEXT_PUBLIC_BUNNY_LIBRARY_ID (env) — o Library ID da sua biblioteca Bunny.
//  - o campo `videoId` de cada aula com o GUID do vídeo no Bunny Stream.
// O player é o embed padrão: https://iframe.mediadelivery.net/embed/{lib}/{videoId}
// =====================================================================

export const BUNNY_LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID || '';

// Editar à vontade — títulos, descrições, ordem e os videoId (GUID do Bunny).
// videoId vazio = aula "em breve" (aparece bloqueada até você preencher).
export const TREINAMENTOS = [
  {
    modulo: 'Boas-vindas',
    aulas: [
      { id: 'intro', titulo: 'Bem-vindo ao Mapa de Identidade Estratégica', duracao: '', videoId: '', descricao: 'Como funciona o programa e o que você vai construir.' },
    ],
  },
  {
    modulo: 'Preparando o diagnóstico',
    aulas: [
      { id: 'como-responder', titulo: 'Como conduzir os 3 públicos', duracao: '', videoId: '', descricao: 'Sócios, equipe e clientes — como coletar respostas de qualidade.' },
      { id: 'lendo-o-mapa', titulo: 'Lendo o relatório de triangulação', duracao: '', videoId: '', descricao: 'O que os gaps entre os olhares revelam sobre a sua marca.' },
    ],
  },
  {
    modulo: 'Da estratégia à execução',
    aulas: [
      { id: 'plano', titulo: 'Transformando o mapa em plano', duracao: '', videoId: '', descricao: 'Priorizando o caminho que destrava o crescimento.' },
    ],
  },
];

// lista achatada de aulas (com módulo), útil pro player/estado
export function aulas() {
  const out = [];
  for (const m of TREINAMENTOS) for (const a of m.aulas) out.push({ ...a, modulo: m.modulo });
  return out;
}

export function embedUrl(videoId) {
  if (!BUNNY_LIBRARY_ID || !videoId) return null;
  return `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}?autoplay=false&preload=true`;
}
