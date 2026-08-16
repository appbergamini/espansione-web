import { supabaseAdmin } from '../../../lib/supabaseAdmin.js';
import { BLOCOS, ANCORAS, N_BLOCOS, nomeDe } from '../../../lib/competencias/catalog.js';

/**
 * Instrumentação de calibração. Sem isto, o ponto que a SPEC aponta como o
 * mais provável de exigir ajuste — o equilíbrio de desejabilidade dentro
 * dos blocos — não tem como ser medido, e não se resolve por julgamento.
 *
 * A métrica-chefe NÃO é a conversão do teste: é o percentual que conclui OS
 * DOIS instrumentos. Quem não completa não recebe relatório, e quem não
 * recebe relatório não compra o próximo passo.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ erro: 'Method Not Allowed' });

  const esperado = process.env.AVALIADOR_TOKEN;
  if (!esperado) return res.status(503).json({ erro: 'AVALIADOR_TOKEN não configurado nesta zona.' });
  if (req.headers['x-avaliador-token'] !== esperado) return res.status(401).json({ erro: 'Não autorizado.' });
  if (!supabaseAdmin) return res.status(500).json({ erro: 'Indisponível.' });

  try {
    const [{ data: sessoes }, { data: respostas }, { data: comport }] = await Promise.all([
      supabaseAdmin.from('comp_assessments').select('id, status, origem, iniciado_em, concluido_em, criterio_corte'),
      supabaseAdmin.from('comp_answers').select('assessment_id, etapa, item_id, payload, respondido_em'),
      supabaseAdmin.from('comp_comportamental').select('assessment_id, status'),
    ]);

    const total = sessoes?.length || 0;
    const testeConcluido = (sessoes || []).filter((s) => s.status === 'done');
    const comportConcluido = new Set((comport || []).filter((c) => c.status === 'done').map((c) => c.assessment_id));
    const ambos = testeConcluido.filter((s) => comportConcluido.has(s.id));

    // ── desejabilidade: quantas vezes cada afirmação foi marcada MAIS ──
    // Com 4 opções, o esperado é 25%. Muito acima disso = afirmação inflada,
    // que precisa ser reescrita ou trocada de bloco.
    const porBloco = {};
    for (const b of BLOCOS) {
      porBloco[b.id] = { bloco: b.id, respostas: 0, opcoes: b.opcoes.map((o) => ({
        competencia: o.competencia, afirmacao: o.afirmacao, mais: 0, menos: 0, pctMais: null, pctMenos: null,
      })) };
    }
    for (const r of (respostas || []).filter((x) => x.etapa === 1 && porBloco[x.item_id])) {
      const alvo = porBloco[r.item_id];
      alvo.respostas++;
      const mais = alvo.opcoes.find((o) => o.competencia === r.payload?.mais);
      const menos = alvo.opcoes.find((o) => o.competencia === r.payload?.menos);
      if (mais) mais.mais++;
      if (menos) menos.menos++;
    }
    const desequilibrados = [];
    for (const b of Object.values(porBloco)) {
      if (!b.respostas) continue;
      for (const o of b.opcoes) {
        o.pctMais = Math.round((o.mais / b.respostas) * 100);
        o.pctMenos = Math.round((o.menos / b.respostas) * 100);
        // 25% é o esperado; acima de 40% com amostra mínima já é sinal.
        if (b.respostas >= 30 && (o.pctMais >= 40 || o.pctMenos >= 40)) {
          desequilibrados.push({ bloco: b.bloco, afirmacao: o.afirmacao, pctMais: o.pctMais, pctMenos: o.pctMenos });
        }
      }
    }

    // ── distribuição de nível nos ancorados: as opções estão ordenadas? ──
    const niveis = { 1: 0, 2: 0, 3: 0, 4: 0 };
    for (const r of (respostas || []).filter((x) => x.etapa === 2)) {
      const n = r.payload?.nivel;
      if (niveis[n] !== undefined) niveis[n]++;
    }

    // ── distribuição das âncoras ──
    const ancoras = ANCORAS.map((a) => {
      const vals = (respostas || []).filter((r) => r.item_id === a.id).map((r) => r.payload?.valor).filter(Number.isInteger);
      return {
        id: a.id,
        pergunta: a.pergunta,
        n: vals.length,
        media: vals.length ? Number((vals.reduce((x, y) => x + y, 0) / vals.length).toFixed(2)) : null,
      };
    });

    // ── tempo por etapa ──
    const tempos = { etapa1: [], etapa2: [], etapa3: [] };
    const porSessao = {};
    for (const r of respostas || []) {
      (porSessao[r.assessment_id] ||= []).push(r);
    }
    for (const lista of Object.values(porSessao)) {
      for (const etapa of [1, 2, 3]) {
        const t = lista.filter((r) => r.etapa === etapa).map((r) => new Date(r.respondido_em).getTime()).sort((a, b) => a - b);
        if (t.length >= 2) tempos[`etapa${etapa}`].push((t[t.length - 1] - t[0]) / 60000);
      }
    }
    const mediana = (arr) => {
      if (!arr.length) return null;
      const s = [...arr].sort((a, b) => a - b);
      return Number(s[Math.floor(s.length / 2)].toFixed(1));
    };

    // ── abandono por tela ──
    const alcance = {};
    for (const lista of Object.values(porSessao)) {
      for (const r of lista) alcance[r.item_id] = (alcance[r.item_id] || 0) + 1;
    }

    return res.status(200).json({
      amostra: {
        sessoes: total,
        testeConcluido: testeConcluido.length,
        // MÉTRICA-CHEFE
        ambosInstrumentos: ambos.length,
        pctAmbos: total ? Math.round((ambos.length / total) * 100) : 0,
        gratuitas: (sessoes || []).filter((s) => s.origem === 'gratuito').length,
      },
      corte: {
        porScore: testeConcluido.filter((s) => s.criterio_corte === 'por_score').length,
        porEscolha: testeConcluido.filter((s) => s.criterio_corte === 'por_escolha').length,
      },
      desejabilidade: {
        esperadoPorOpcao: 25,
        blocos: Object.values(porBloco),
        desequilibrados,
        amostraSuficiente: Math.min(...Object.values(porBloco).map((b) => b.respostas)) >= 150,
        nota: 'Equilíbrio de desejabilidade não se resolve por julgamento — só por dado. Conte com 150 a 200 respondentes.',
      },
      niveisAncorados: niveis,
      ancoras,
      tempoMedianoMin: {
        etapa1: mediana(tempos.etapa1),
        etapa2: mediana(tempos.etapa2),
        etapa3: mediana(tempos.etapa3),
        nota: 'Se a etapa 1 passar de ~5 min, os blocos estão difíceis demais.',
      },
      abandonoPorTela: BLOCOS.map((b) => ({ tela: b.id, alcancaram: alcance[b.id] || 0 })),
      blocosNoDesenho: N_BLOCOS,
    });
  } catch (e) {
    console.error('[avaliador] calibração:', e);
    return res.status(500).json({ erro: 'Não foi possível calcular.' });
  }
}
