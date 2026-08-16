import { sessaoPorToken, respostasDaSessao } from '../../../../lib/competencias/repo.js';
import { estadoDaSessao } from '../../../../lib/competencias/sessao.js';
import { ETAPA2_DISPONIVEL } from '../../../../lib/competencias/catalog.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ erro: 'Method Not Allowed' });
  try {
    const sessao = await sessaoPorToken(String(req.query.token || ''));
    if (!sessao) return res.status(404).json({ erro: 'Teste não encontrado.' });

    const respostas = await respostasDaSessao(sessao.id);

    const estado = estadoDaSessao({
      respostas,
      seed: sessao.ordem_seed,
      // `tela` permite rever uma pergunta já respondida (botão Voltar).
      telaAtual: req.query.tela ? String(req.query.tela) : null,
      etapa2Habilitada: ETAPA2_DISPONIVEL,
    });

    // O cliente recebe a TELA, nunca os scores. Resultado parcial vira o
    // produto na cabeça de quem responde, e o segundo instrumento não é feito.
    return res.status(200).json({
      fase: estado.fase,
      tela: estado.tela,
      progresso: estado.progresso,
      navegacao: estado.navegacao || null,
      status: sessao.status,
    });
  } catch (e) {
    console.error('[competencias] estado da sessão:', e);
    return res.status(500).json({ erro: 'Não foi possível carregar o teste.' });
  }
}
