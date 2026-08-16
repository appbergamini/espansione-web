import { sessaoPorToken } from '../../../../lib/competencias/repo.js';
import { garantir, liberado } from '../../../../lib/comportamental/repo.js';
import { estadoDaSessao } from '../../../../lib/comportamental/sessao.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ erro: 'Method Not Allowed' });
  try {
    const sessao = await sessaoPorToken(String(req.query.token || ''));
    if (!sessao) return res.status(404).json({ erro: 'Não encontrado.' });

    // Ordem imposta: bloqueado até o teste concluir, com o motivo em uma linha.
    if (!liberado(sessao)) {
      return res.status(423).json({
        bloqueado: true,
        motivo: 'O Mapeamento Comportamental abre depois que você concluir o teste. Fazer na ordem inversa muda o jeito como você se avalia.',
      });
    }

    const registro = await garantir(sessao.id);
    const estado = estadoDaSessao({ respostas: registro.respostas || {} });
    return res.status(200).json({
      fase: estado.fase, tela: estado.tela, progresso: estado.progresso, transicao: estado.transicao || null,
    });
  } catch (e) {
    console.error('[comportamental] estado:', e);
    return res.status(500).json({ erro: 'Não foi possível carregar.' });
  }
}
