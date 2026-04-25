// FIX.21 — gera narrativas executivas para o Relatório Comportamental
// CONSOLIDADO (do time inteiro). Espelha o padrão do narrativeGenerator
// individual: gemini-3-flash-preview, tom executivo, 3-4 parágrafos por
// seção citando dados específicos, sem inventar campos que não vieram.
//
// Chamado pelo client-side downloadDiscReport em pages/adm/[id].js antes
// de renderizar o jsPDF — UI mostra estado "gerando análise…" enquanto
// aguarda. Se este endpoint falhar, o frontend cai em fallback
// determinístico e segue gerando o PDF.

import { getServerUser } from '../../../lib/getServerUser';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { user } = await getServerUser(req, res);
  if (!user) return res.status(401).json({ success: false, error: 'Não autenticado' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ success: false, error: 'GEMINI_API_KEY ausente' });
  }

  try {
    const {
      projeto_nome,
      n_respondentes,
      disc_natural,    // { D, I, S, C } médias 0-100
      disc_adaptado,   // null OU { D, I, S, C }
      competencias_top, // [{ nome, media }, ...] top 5
      competencias_gap, // [{ nome, media }, ...] bottom 5
      perfis_distribuicao,  // [[label, count], ...]
      estilos_distribuicao, // [[estilo, count], ...] OU null
      jung_distribuicao,    // [[tipo, count], ...] OU null
      individuos_resumo,    // [{ nome, perfil, disc_dominante, jung }, ...]
    } = req.body || {};

    if (!Array.isArray(individuos_resumo) || individuos_resumo.length === 0) {
      return res.status(400).json({ success: false, error: 'individuos_resumo obrigatório' });
    }

    const fmtDisc = (d) =>
      d ? `D=${d.D ?? '—'} I=${d.I ?? '—'} S=${d.S ?? '—'} C=${d.C ?? '—'}` : 'não medido por este instrumento';
    const fmtList = (arr) =>
      Array.isArray(arr) && arr.length > 0
        ? arr.map(([k, v]) => `${k}=${v}`).join(', ')
        : 'não medido';
    const fmtComp = (arr) =>
      Array.isArray(arr) && arr.length > 0
        ? arr.map(c => `${c.nome}(${c.media.toFixed(1)})`).join(', ')
        : '—';

    const individuosLinha = individuos_resumo
      .map(i => `${i.nome} [${i.perfil}, dom=${i.disc_dominante || '—'}${i.jung ? ', ' + i.jung : ''}]`)
      .join('; ');

    const prompt = `Você é um especialista sênior em mapeamento comportamental (DISC, Jung/MBTI, 16 competências) lendo o RELATÓRIO CONSOLIDADO do time inteiro de uma organização. Gere análise executiva para os sócios/lideranças.

DADOS DO TIME
- Projeto: ${projeto_nome || '—'}
- Respondentes: ${n_respondentes}
- DISC Natural agregado (médias): ${fmtDisc(disc_natural)}
- DISC Adaptado agregado: ${fmtDisc(disc_adaptado)}
- Top 5 competências (forças do time): ${fmtComp(competencias_top)}
- Bottom 5 competências (gaps do time): ${fmtComp(competencias_gap)}
- Distribuição de perfis DISC: ${fmtList(perfis_distribuicao)}
- Distribuição de estilos de liderança: ${fmtList(estilos_distribuicao)}
- Distribuição Jung/MBTI: ${fmtList(jung_distribuicao)}
- Indivíduos: ${individuosLinha}

DIRETRIZES
- Tom executivo, técnico, direto. Sem clichês de coaching ("acreditar no potencial", "abrace o desafio").
- 3 a 4 parágrafos por seção (exceto "recomendacoes", que é lista).
- Cite SEMPRE dados específicos: scores numéricos, nomes de competências do top/gap, perfis dominantes, estilos dominantes, contagem de pessoas por perfil. Nunca generalize.
- Cruze DISC + Jung + competências + estilos quando fizer sentido (ex.: "predominância de C alto + ISTJ + alta Concentração reforça padrão analítico-estruturado, com risco de conservadorismo em decisão").
- Quando um campo aparece como "não medido", NÃO invente nem narre sobre ele — apenas omita ou registre brevemente que o instrumento não capturou.
- Pense no time como SISTEMA: como os perfis se complementam ou conflitam, onde estão os pontos cegos coletivos, qual a tensão dominante.
- Em "recomendacoes": 4 ações concretas e personalizadas baseadas nos GAPS reais e na composição do time. Não genéricas.

Retorne EXCLUSIVAMENTE este JSON (sem markdown, sem comentário):
{"panorama":"3-4 parágrafos sobre o perfil coletivo do time","forcas":"3-4 parágrafos sobre as forças coletivas, citando top competências","desenvolvimento":"3-4 parágrafos sobre os gaps coletivos, citando bottom competências","dinamicas":"3-4 parágrafos sobre como os perfis interagem entre si, alinhamentos, tensões e pontos cegos","recomendacoes":"4 recomendações numeradas (1. ... 2. ... 3. ... 4. ...) para a liderança do time"}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.6,
            responseMimeType: 'application/json',
            maxOutputTokens: 8192,
          },
        }),
      },
    );

    const data = await response.json();
    if (!response.ok) {
      console.error('[TEAM-NARRATIVES] Gemini erro:', data);
      return res.status(502).json({ success: false, error: 'Falha na chamada ao Gemini' });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    let narratives;
    try {
      narratives = JSON.parse(text);
    } catch (e) {
      console.error('[TEAM-NARRATIVES] JSON inválido:', text.slice(0, 500));
      return res.status(502).json({ success: false, error: 'Resposta do Gemini não foi JSON válido' });
    }

    return res.status(200).json({ success: true, narratives });
  } catch (err) {
    console.error('[TEAM-NARRATIVES] erro inesperado:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
