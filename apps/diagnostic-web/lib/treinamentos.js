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
// ⚠️ Títulos/ordem editáveis — ajuste à vontade (ou renomeie no Bunny).
// Conteúdo detectado: perfil comportamental (Mapeamento Comportamental).
export const TREINAMENTOS = [
  {
    modulo: 'Mapeamento Comportamental',
    aulas: [
      { id: 'aula-1', titulo: 'Conhecendo como cada perfil funciona', duracao: '4:34', videoId: '44ebed51-51f9-469d-b9f5-9f69f2f60461', descricao: 'Como o seu perfil e o das pessoas com quem você se relaciona impactam os resultados.' },
      { id: 'aula-2', titulo: 'Aula 2', duracao: '10:00', videoId: 'b1aeba20-d6d3-4f8f-97da-d3bb381d65ce', descricao: '' },
      // vídeo original (e8b20fad) foi removido da biblioteca Bunny em 22/07;
      // sem videoId a aula aparece como "em breve" até subir o substituto.
      { id: 'aula-3', titulo: 'Aula 3', duracao: '', videoId: '', descricao: '' },
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
