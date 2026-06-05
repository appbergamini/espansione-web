import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { tokenValido } from '../../../lib/tokens/respondenteToken';
import { AIRouter } from '../../../lib/ai/router';

// Entrevista guiada por IA — Slice 1.
// Dado o token de um respondente, monta a lista ordenada de perguntas que a
// entrevista deve cobrir. A fonte primária é o ROTEIRO já gerado pela esteira:
//   - clientes      → Agente 3 (Roteiros VE — Entrevistas Cliente)
//   - sócios/colab  → Agente 1 (Roteiros VI — Entrevistas Internas)
// Se o roteiro ainda não existe (ou a extração falha), cai num conjunto
// genérico de perguntas abertas do método, marcando `source: 'fallback'`.

const AGENT_NUM_BY_PAPEL = {
  clientes: 3,
  socios: 1,
  colaboradores: 1,
};

// Perguntas-base abertas (método Ana Couto) usadas quando não há roteiro.
const FALLBACK_QUESTIONS = {
  clientes: [
    'Como você conheceu a marca e o que te fez decidir pela primeira vez?',
    'Como é a sua experiência hoje? Tem algum momento que ficou marcado, bom ou ruim?',
    'O que você considera os pontos mais fortes da marca?',
    'E onde ela peca? O que te incomoda ou poderia ser melhor?',
    'Se compara com alternativas que você conhece, o que te faz ficar?',
    'Se a marca fosse uma pessoa, como você a descreveria?',
    'Imagine a marca ideal pra você nessa categoria: como ela seria?',
    'Você já indicou a marca pra alguém? Em que situação?',
  ],
  socios: [
    'Conte a origem do negócio: o que te moveu a começar e o que ainda te move hoje.',
    'Na sua visão, o que a marca É de verdade — para além do que ela comunica?',
    'Onde você sente que existe uma distância entre o que a empresa diz e o que ela entrega?',
    'Qual é a maior tensão interna que vocês vivem hoje?',
    'Qual a ambição para os próximos anos e o que ainda falta para chegar lá?',
    'Como você descreveria a cultura vivida no dia a dia?',
    'O que não pode mudar de jeito nenhum na marca?',
  ],
  colaboradores: [
    'Como é o seu dia a dia aqui e o que mais te dá orgulho no trabalho?',
    'A cultura que a empresa fala bate com a que você vive na prática?',
    'O que funciona muito bem por aqui e deveria ser preservado?',
    'O que mais te frustra ou trava no dia a dia?',
    'Se você pudesse mudar uma coisa na empresa, qual seria?',
    'Como você descreveria a marca para um amigo de fora?',
  ],
};

function parsePerguntas(rawText) {
  if (!rawText) return null;
  // Remove cercas de código e tenta extrair o array/objeto JSON.
  let t = String(rawText).trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  const start = t.indexOf('{');
  const startArr = t.indexOf('[');
  const from = startArr !== -1 && (startArr < start || start === -1) ? startArr : start;
  if (from > 0) t = t.slice(from);
  try {
    const parsed = JSON.parse(t);
    const arr = Array.isArray(parsed) ? parsed : parsed.perguntas;
    if (!Array.isArray(arr)) return null;
    return arr
      .map((p) => (typeof p === 'string'
        ? { pergunta: p.trim(), hipotese: '' }
        : { pergunta: String(p.pergunta || '').trim(), hipotese: String(p.hipotese || '').trim() }))
      .filter((p) => p.pergunta.length > 0);
  } catch {
    return null;
  }
}

async function extrairPerguntasDoRoteiro({ conteudo, papel, nome }) {
  const escopo = papel === 'clientes'
    ? `Foque na seção do roteiro referente ao entrevistado "${nome}" (ex.: "### 3.x ${nome}"). Se não houver seção específica, use as perguntas gerais do roteiro.`
    : 'Use os temas, tensões e hipóteses do roteiro como base das perguntas.';

  const system = [
    'Você prepara uma entrevista qualitativa de marca (método Ana Couto).',
    'Recebe um ROTEIRO interno (denso, com temas, tensões e hipóteses) e deve convertê-lo em PERGUNTAS prontas para fazer diretamente ao entrevistado.',
    'Regras das perguntas:',
    '- Abertas, conversacionais, em pt-BR, uma ideia por pergunta.',
    '- Sem jargão de consultoria; soam como uma conversa, não um questionário.',
    '- Entre 8 e 14 perguntas, na ordem em que faria a conversa.',
    '- Cada pergunta carrega a hipótese/tensão que ela investiga (uso interno).',
    'Responda APENAS com JSON válido, sem texto fora dele, no formato:',
    '{ "perguntas": [ { "pergunta": "...", "hipotese": "..." } ] }',
  ].join('\n');

  const user = [
    escopo,
    '',
    '=== ROTEIRO ===',
    conteudo,
  ].join('\n');

  const { text } = await AIRouter.callModel(system, [{ role: 'user', content: user }], {
    modelKey: 'gemini-flash',
    temperature: 0.2,
    maxTokens: 4000,
  });
  return parsePerguntas(text);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  if (!supabaseAdmin) {
    return res.status(500).json({ success: false, error: 'Supabase admin indisponível' });
  }

  const token = (req.body?.token || '').toString().trim();
  if (!token) return res.status(400).json({ success: false, error: 'token obrigatório' });

  try {
    const db = supabaseAdmin;
    const { data: resp, error } = await db
      .from('respondentes')
      .select('id, projeto_id, nome, papel, token_expira_em')
      .eq('token', token)
      .maybeSingle();
    if (error) throw error;
    if (!resp) return res.status(404).json({ success: false, error: 'Token inválido' });
    if (!tokenValido(resp.token_expira_em)) {
      return res.status(410).json({ success: false, error: 'Link expirado' });
    }

    const agentNum = AGENT_NUM_BY_PAPEL[resp.papel];
    if (!agentNum) {
      return res.status(400).json({ success: false, error: `Papel sem entrevista: ${resp.papel}` });
    }

    // Busca o roteiro mais recente do agente correspondente.
    const { data: roteiroRows } = await db
      .from('outputs')
      .select('conteudo')
      .eq('projeto_id', resp.projeto_id)
      .eq('agent_num', agentNum)
      .order('created_at', { ascending: false })
      .limit(1);

    const conteudo = roteiroRows && roteiroRows[0]?.conteudo;

    let perguntas = null;
    let source = 'fallback';
    if (conteudo && conteudo.trim().length > 0) {
      try {
        perguntas = await extrairPerguntasDoRoteiro({ conteudo, papel: resp.papel, nome: resp.nome });
        if (perguntas && perguntas.length > 0) source = 'roteiro';
      } catch (e) {
        console.error('[entrevista/questions] extração falhou, usando fallback:', e.message);
      }
    }

    if (!perguntas || perguntas.length === 0) {
      perguntas = (FALLBACK_QUESTIONS[resp.papel] || []).map((q) => ({ pergunta: q, hipotese: '' }));
      source = 'fallback';
    }

    return res.status(200).json({
      success: true,
      source,
      respondente: { nome: resp.nome, papel: resp.papel },
      perguntas,
    });
  } catch (err) {
    console.error('[entrevista/questions] erro:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
