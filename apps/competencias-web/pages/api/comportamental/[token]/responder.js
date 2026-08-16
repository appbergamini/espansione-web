import { sessaoPorToken } from '../../../../lib/competencias/repo.js';
import { garantir, gravarResposta, fechar, liberado } from '../../../../lib/comportamental/repo.js';
import { estadoDaSessao, validarResposta, estaCompleto } from '../../../../lib/comportamental/sessao.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Method Not Allowed' });
  try {
    const sessao = await sessaoPorToken(String(req.query.token || ''));
    if (!sessao) return res.status(404).json({ erro: 'Não encontrado.' });
    if (!liberado(sessao)) return res.status(423).json({ erro: 'Conclua o teste antes.' });

    const registro = await garantir(sessao.id);
    if (registro.status === 'done') return res.status(409).json({ erro: 'Já concluído.' });

    const { itemId, payload } = req.body || {};
    const v = validarResposta(itemId, payload);
    if (!v.ok) return res.status(400).json({ erro: v.motivo });

    const atualizado = await gravarResposta(sessao.id, itemId, v.payload);
    const respostas = atualizado.respostas || {};

    if (estaCompleto(respostas)) {
      // Fecha e congela os 4 pilares. Nenhum resultado volta para a tela.
      await fechar(sessao.id, respostas);
    }

    const estado = estadoDaSessao({ respostas });
    return res.status(200).json({
      fase: estado.fase, tela: estado.tela, progresso: estado.progresso, transicao: estado.transicao || null,
    });
  } catch (e) {
    console.error('[comportamental] responder:', e);
    return res.status(500).json({ erro: 'Não foi possível salvar a resposta. Tente de novo.' });
  }
}
