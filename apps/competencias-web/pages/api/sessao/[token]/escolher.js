import {
  sessaoPorToken, respostasDaSessao, gravarEscolha,
} from '../../../../lib/competencias/repo.js';
import { estadoDaSessao } from '../../../../lib/competencias/sessao.js';
import { selecionarAprofundamento, pontuarEscolhaForcada } from '../../../../lib/competencias/score.js';
import { ETAPA2_DISPONIVEL } from '../../../../lib/competencias/catalog.js';

/**
 * Escolha do respondente entre as competências empatadas no corte.
 * É o que substitui o desempate arbitrário: o corte automático só se repete
 * em ~72% num teste-reteste, e mais blocos não resolvem isso.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Method Not Allowed' });
  try {
    const sessao = await sessaoPorToken(String(req.query.token || ''));
    if (!sessao) return res.status(404).json({ erro: 'Teste não encontrado.' });

    const escolhas = Array.isArray(req.body?.escolhas) ? req.body.escolhas : [];
    const respostas = await respostasDaSessao(sessao.id);
    const { scores, porCapacidade, integridade } = pontuarEscolhaForcada(respostas);
    if (!integridade.completo) return res.status(409).json({ erro: 'Ainda faltam respostas da primeira etapa.' });

    const parcial = selecionarAprofundamento(scores, porCapacidade);
    if (parcial.criterio !== 'por_escolha') {
      return res.status(409).json({ erro: 'Este teste não tem empate a resolver.' });
    }

    const validas = [...new Set(escolhas.filter((c) => parcial.escolher.includes(c)))];
    if (validas.length !== parcial.faltam) {
      return res.status(400).json({
        erro: parcial.faltam === 1 ? 'Escolha uma competência.' : `Escolha ${parcial.faltam} competências.`,
      });
    }

    await gravarEscolha(sessao.id, validas);

    const estado = estadoDaSessao({
      respostas, escolhas: validas, seed: sessao.ordem_seed, etapa2Habilitada: ETAPA2_DISPONIVEL,
    });
    return res.status(200).json({ fase: estado.fase, tela: estado.tela, progresso: estado.progresso });
  } catch (e) {
    console.error('[competencias] escolher:', e);
    return res.status(500).json({ erro: 'Não foi possível registrar a escolha.' });
  }
}
