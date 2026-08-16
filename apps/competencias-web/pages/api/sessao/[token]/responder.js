import {
  sessaoPorToken, respostasDaSessao, gravarResposta, fecharEtapaTeste,
} from '../../../../lib/competencias/repo.js';
import { estadoDaSessao, validarResposta } from '../../../../lib/competencias/sessao.js';
import { consolidar } from '../../../../lib/competencias/score.js';
import { ETAPA2_DISPONIVEL } from '../../../../lib/competencias/catalog.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Method Not Allowed' });
  try {
    const sessao = await sessaoPorToken(String(req.query.token || ''));
    if (!sessao) return res.status(404).json({ erro: 'Teste não encontrado.' });

    const { itemId, payload } = req.body || {};
    const v = validarResposta(itemId, payload, { seed: sessao.ordem_seed });
    if (!v.ok) return res.status(400).json({ erro: v.motivo });

    // Salvamento item a item: dá para sair e voltar sem perder nada, e dá
    // para corrigir uma resposta anterior (upsert sobrescreve).
    await gravarResposta(sessao.id, {
      itemId, etapa: v.etapa, payload: v.payload, ordemExibida: v.ordemExibida || null,
    });

    const respostas = await respostasDaSessao(sessao.id);
    const estado = estadoDaSessao({
      respostas, seed: sessao.ordem_seed, etapa2Habilitada: ETAPA2_DISPONIVEL,
    });

    if (estado.fase === 'concluido') {
      const consolidado = consolidar(respostas);
      if (!consolidado.integridade.somaZero) {
        console.error('[competencias] integridade falhou', sessao.id, consolidado.integridade);
      }
      // Reprocessa mesmo se já estava concluído: corrigir uma resposta
      // anterior tem de refletir nos scores gravados.
      await fecharEtapaTeste(sessao.id, {
        consolidado, selecao: estado.selecao, niveis: estado.niveis,
      });
    }

    return res.status(200).json({
      fase: estado.fase,
      tela: estado.tela,
      progresso: estado.progresso,
      navegacao: estado.navegacao || null,
    });
  } catch (e) {
    console.error('[competencias] responder:', e);
    return res.status(500).json({ erro: 'Não foi possível salvar a resposta. Tente de novo.' });
  }
}
