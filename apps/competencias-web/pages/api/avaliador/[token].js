import { supabaseAdmin } from '../../../lib/supabaseAdmin.js';
import { sessaoPorToken, respostasDaSessao, scoresDaSessao } from '../../../lib/competencias/repo.js';
import { pilaresDaSessao } from '../../../lib/comportamental/repo.js';
import { indiceAjuste, avaliarTodas, rotaDaTrilha } from '../../../lib/competencias/faixas.js';
import { indiceCoerencia, LEITURA_COERENCIA } from '../../../lib/competencias/indices.js';
import { nomeDe } from '../../../lib/competencias/catalog.js';
import { ROTULO_PILAR } from '@espansione/cis';

/**
 * Painel do avaliador. Aqui — e SÓ aqui — aparecem os dois índices e os
 * números por trás do relatório. Nada disto vai para o respondente.
 *
 * Protegido por AVALIADOR_TOKEN no header. É proteção de porta, não de
 * usuário: quem opera isto hoje é a própria Espansione.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ erro: 'Method Not Allowed' });

  const esperado = process.env.AVALIADOR_TOKEN;
  if (!esperado) return res.status(503).json({ erro: 'AVALIADOR_TOKEN não configurado nesta zona.' });
  if (req.headers['x-avaliador-token'] !== esperado) return res.status(401).json({ erro: 'Não autorizado.' });

  try {
    const sessao = await sessaoPorToken(String(req.query.token || ''));
    if (!sessao) return res.status(404).json({ erro: 'Não encontrado.' });

    const [respostas, scoresLinhas, pilares] = await Promise.all([
      respostasDaSessao(sessao.id),
      scoresDaSessao(sessao.id),
      pilaresDaSessao(sessao.id),
    ]);

    const scores = Object.fromEntries(scoresLinhas.map((s) => [s.competencia_key, s.score_bruto]));
    const coerencia = indiceCoerencia(respostas, scores);

    let ajuste = null;
    let faixas = null;
    if (pilares) {
      ajuste = indiceAjuste(pilares, sessao.delta_valor);
      faixas = avaliarTodas(pilares, sessao.delta_valor).map((a) => ({
        competencia: a.competencia,
        nome: nomeDe(a.competencia),
        confianca: a.confianca,
        rota: rotaDaTrilha(a).rota,
        pilares: Object.fromEntries(Object.entries(a.porPilar).map(([p, v]) => [
          ROTULO_PILAR[p], { valor: v.valor, faixa: `${v.faixa.minimo}–${v.faixa.maximo}`, posicao: v.posicao, distancia: v.distancia, sinalizado: v.sinalizado },
        ])),
      }));
    }

    // persiste os índices para o histórico (upsert: recalcular não duplica)
    if (supabaseAdmin && ajuste) {
      await supabaseAdmin.from('comp_indice_ajuste').upsert([{
        assessment_id: sessao.id, valor: ajuste.valor, dentro: ajuste.dentro, total: ajuste.total, leitura: ajuste.leitura,
      }], { onConflict: 'assessment_id' });
    }
    if (supabaseAdmin && coerencia) {
      await supabaseAdmin.from('comp_indice_coerencia').upsert([{
        assessment_id: sessao.id,
        evidencia_media: coerencia.evidenciaMedia,
        declaracao_media: coerencia.declaracaoMedia,
        valor: coerencia.valor,
        leitura: coerencia.leitura,
      }], { onConflict: 'assessment_id' });
    }

    return res.status(200).json({
      sessao: {
        id: sessao.id, email: sessao.email, status: sessao.status, origem: sessao.origem,
        criterioCorte: sessao.criterio_corte,
        versoes: { catalogo: sessao.catalogo_versao, faixas: sessao.faixas_versao, delta: sessao.delta_versao, deltaValor: sessao.delta_valor },
        iniciadoEm: sessao.iniciado_em, concluidoEm: sessao.concluido_em,
      },
      competencias: scoresLinhas.map((s) => ({ ...s, nome: nomeDe(s.competencia_key) })),
      indices: {
        ajuste,
        coerencia: coerencia ? { ...coerencia, explicacao: LEITURA_COERENCIA[coerencia.leitura] } : null,
        // Ressalva que precisa viajar com o número, não ficar só na doc.
        ressalva: 'O Índice de Coerência compara medida relativa (ipsativa) com contagem absoluta. Sinal fraco, para levar à sessão de leitura — nunca gatilho automático.',
      },
      faixas,
      comportamentalConcluido: Boolean(pilares),
    });
  } catch (e) {
    console.error('[avaliador] sessão:', e);
    return res.status(500).json({ erro: 'Não foi possível carregar.' });
  }
}
