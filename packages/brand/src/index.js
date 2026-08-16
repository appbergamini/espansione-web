// =====================================================================
// @espansione/brand — tokens da marca, cópia única.
//
// Origem: apps/diagnostic-web/components/mapa/mapaTheme.js (CORES), que é
// o que já está no ar em crescimentointegrado.com.br. O funil atravessa
// dois apps a partir do momento em que o Teste de Competências entra, e a
// fronteira entre eles é justamente onde o cliente paga — divergir de cor
// ou de fonte ali custa conversão.
//
// Poppins é carregada por cada app (o funil usa Google Fonts); aqui fica
// só a stack, para que ninguém invente uma diferente.
// =====================================================================

export const CORES = {
  navy: '#001A3B',
  navy2: '#013063',
  red: '#C72638',
  redHover: '#E13345',
  redSoft: 'rgba(199,38,56,0.08)',
  redBorder: 'rgba(199,38,56,0.28)',
  card: '#FFFFFF',
  text: '#0C2340',
  textSec: '#5B6B7F',
  border: '#E2E8F0',
  track: '#E9EEF5',
};

export const FONTE = {
  display: "'Poppins', system-ui, sans-serif",
  corpo: "'Poppins', system-ui, sans-serif",
  googleFontsHref: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap',
};

// Fundo padrão das telas do funil: azul com o mesmo gradiente da /mapa.
export const FUNDO_FUNIL = `radial-gradient(1200px 600px at 50% -10%, ${CORES.navy2}, ${CORES.navy} 60%)`;

export const RAIO = { botao: '12px', input: '10px', card: '16px' };

// Mesmas cores, como custom properties, para quem prefere CSS a inline style.
export function cssVars(prefix = '--esp') {
  return Object.entries(CORES)
    .map(([k, v]) => `${prefix}-${k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}: ${v};`)
    .join('\n  ');
}
