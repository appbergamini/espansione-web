// Verifica que a fiação da zona resolve no servidor: os dois pacotes
// compartilhados, o basePath e a versão do instrumento.
// Responde em /teste/api/health (o basePath é aplicado às rotas de API também).
import { PILARES, TOTAL_BRUTO, BLOCOS_RANKING, PARES_FORCADOS } from '@espansione/cis';
import { CORES } from '@espansione/brand';

export default function handler(req, res) {
  res.status(200).json({
    zona: 'competencias',
    basePath: '/teste',
    pacotes: {
      cis: {
        pilares: PILARES.length,
        blocosRanking: BLOCOS_RANKING.length,
        paresForcados: PARES_FORCADOS.length,
        totalBruto: TOTAL_BRUTO,
      },
      brand: { navy: CORES.navy, red: CORES.red },
    },
  });
}
