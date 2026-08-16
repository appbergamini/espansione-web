import { sessaoPorToken, respostasDaSessao } from '../../../lib/competencias/repo.js';
import { pilaresDaSessao } from '../../../lib/comportamental/repo.js';
import { estadoDaSessao } from '../../../lib/competencias/sessao.js';
import { consolidar } from '../../../lib/competencias/score.js';
import { gerarRelatorio, varrerRelatorio } from '../../../lib/competencias/relatorio.js';
import { ETAPA2_DISPONIVEL, ANCORADOS_EM_RASCUNHO } from '../../../lib/competencias/catalog.js';
import { garantirNarrativa, aplicarNarrativa } from '../../../lib/narrativa/index.js';

/**
 * O relatório integrado. Só existe com OS DOIS instrumentos concluídos —
 * é a regra que sustenta o produto: resultado parcial vira o produto na
 * cabeça de quem responde, e o segundo instrumento nunca é feito.
 *
 * O motor decide, a IA escreve. Se a IA não puder escrever — chave
 * ausente, API fora, texto reprovado na varredura — o motor também
 * escreve, e o cliente recebe o relatório assim mesmo. Não existe
 * caminho neste arquivo em que uma falha de IA vire tela de erro.
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

    // Cacheada por sessão: o relatório é um documento, e um documento que
    // muda de texto entre duas aberturas deixa de sê-lo.
    const narrativa = await garantirNarrativa(sessao.id, relatorio, { esperar: true });
    let final = aplicarNarrativa(relatorio, narrativa);

    // QA obrigatório: chave de tradução crua, termo proibido, número
    // exposto. Vale para o texto do motor e para o da IA — com a IA
    // escrevendo, isto deixou de ser conferência e virou a guarda.
    let varredura = varrerRelatorio(final);
    if (!varredura.limpo && final.temNarrativa) {
      // A IA sujou. Descarta o texto dela e serve o do motor: pobre é
      // melhor que impróprio, e infinitamente melhor que tela de erro.
      console.error('[relatorio] varredura reprovou a narrativa', sessao.id, varredura.achados);
      final = aplicarNarrativa(relatorio, null);
      varredura = varrerRelatorio(final);
    }
    if (!varredura.limpo) {
      // Agora é o motor que está sujo — bug de verdade, não de redação.
      console.error('[relatorio] varredura sujou no motor', sessao.id, varredura.achados);
      return res.status(500).json({ erro: 'O seu relatório precisa de uma revisão antes de sair. A gente já foi avisado.' });
    }

    return res.status(200).json({
      abertura: final.abertura,
      blocos: final.blocos,
      fechamento: final.fechamento,
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
