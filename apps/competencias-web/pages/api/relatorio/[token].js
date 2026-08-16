import { sessaoPorToken, respostasDaSessao } from '../../../lib/competencias/repo.js';
import { pilaresDaSessao } from '../../../lib/comportamental/repo.js';
import { estadoDaSessao } from '../../../lib/competencias/sessao.js';
import { consolidar } from '../../../lib/competencias/score.js';
import { gerarRelatorio, varrerRelatorio } from '../../../lib/competencias/relatorio.js';
import { ETAPA2_DISPONIVEL, ANCORADOS_EM_RASCUNHO } from '../../../lib/competencias/catalog.js';

/**
 * O relatório integrado. Só existe com OS DOIS instrumentos concluídos —
 * é a regra que sustenta o produto: resultado parcial vira o produto na
 * cabeça de quem responde, e o segundo instrumento nunca é feito.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ erro: 'Method Not Allowed' });
  try {
    const sessao = await sessaoPorToken(String(req.query.token || ''));
    if (!sessao) return res.status(404).json({ erro: 'Não encontrado.' });

    if (sessao.status !== 'done') {
      return res.status(409).json({
        pendente: 'teste',
        motivo: 'O seu relatório é gerado quando os dois estiverem completos. Falta terminar o teste.',
      });
    }

    const pilares = await pilaresDaSessao(sessao.id);
    if (!pilares) {
      return res.status(409).json({
        pendente: 'comportamental',
        motivo: 'Falta o Mapeamento Comportamental. É ele que explica o porquê dos seus resultados.',
      });
    }

    const respostas = await respostasDaSessao(sessao.id);
    const consolidado = consolidar(respostas);
    const estado = estadoDaSessao({ respostas, seed: sessao.ordem_seed, etapa2Habilitada: ETAPA2_DISPONIVEL });

    const relatorio = gerarRelatorio({
      consolidado,
      pilares,
      niveis: estado.niveis || {},
      aprofundadas: estado.selecao?.selecionadas || [],
      delta: sessao.delta_valor,
    });

    // QA obrigatório: chave de tradução crua, termo proibido, número exposto.
    // Instrumentos concorrentes já vazaram chave crua em relatório de cliente
    // — erro barato de evitar, caro de explicar numa devolutiva.
    const varredura = varrerRelatorio(relatorio);
    if (!varredura.limpo) {
      console.error('[relatorio] varredura sujou', sessao.id, varredura.achados);
      return res.status(500).json({ erro: 'O seu relatório precisa de uma revisão antes de sair. A gente já foi avisado.' });
    }

    return res.status(200).json({
      blocos: relatorio.blocos,
      // Enquanto os itens ancorados forem rascunho não calibrado, o nível
      // não é para ser lido como número validado.
      nivelCalibrado: ANCORADOS_EM_RASCUNHO === 0,
      geradoEm: new Date().toISOString(),
    });
  } catch (e) {
    console.error('[relatorio] gerar:', e);
    return res.status(500).json({ erro: 'Não foi possível montar o seu relatório.' });
  }
}
