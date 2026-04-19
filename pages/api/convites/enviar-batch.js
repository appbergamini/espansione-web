import { getServerUser } from '../../../lib/getServerUser';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { sendFormInvite } from '../../../lib/emails/sendFormInvite';

const PATH_BY_PAPEL = {
  socios: '/form/socios',
  colaboradores: '/form/colaboradores',
  clientes: '/form/clientes',
};

const TIPO_BY_PAPEL = {
  socios: 'intake_socios',
  colaboradores: 'intake_colaboradores',
  clientes: 'intake_clientes',
};

function applyPlaceholders(text, vars) {
  if (!text) return '';
  return String(text)
    .replace(/\{\{\s*nome\s*\}\}/gi, vars.nome || '')
    .replace(/\{\{\s*papel\s*\}\}/gi, vars.papel || '')
    .replace(/\{\{\s*link\s*\}\}/gi, vars.link || '')
    .replace(/\{\{\s*projeto\s*\}\}/gi, vars.projeto || '');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  const { user } = await getServerUser(req, res);
  if (!user) return res.status(401).json({ success: false, error: 'Não autenticado' });

  const { projetoId, papel, somentePendentes = true } = req.body || {};
  if (!projetoId || !papel) return res.status(400).json({ success: false, error: 'projetoId e papel obrigatórios' });
  if (!PATH_BY_PAPEL[papel]) return res.status(400).json({ success: false, error: 'papel inválido' });

  const db = supabaseAdmin;
  const [{ data: profile }, { data: projeto }] = await Promise.all([
    db.from('profiles').select('empresa_id, role').eq('id', user.id).single(),
    db.from('projetos').select('empresa_id, responsavel_email, cliente, nome').eq('id', projetoId).single(),
  ]);
  if (!projeto) return res.status(404).json({ success: false, error: 'Projeto não encontrado' });
  const isMaster = profile?.role === 'master';
  const sameEmpresa = profile?.empresa_id === projeto.empresa_id;
  const isResponsavel = projeto.responsavel_email && projeto.responsavel_email === user.email;
  if (!isMaster && !sameEmpresa && !isResponsavel) {
    return res.status(403).json({ success: false, error: 'Acesso negado' });
  }

  let query = db.from('respondentes').select('*').eq('projeto_id', projetoId).eq('papel', papel);
  if (somentePendentes) query = query.eq('status_convite', 'pendente');
  const { data: respondentes, error: listErr } = await query;
  if (listErr) return res.status(500).json({ success: false, error: listErr.message });

  if (!respondentes || respondentes.length === 0) {
    return res.status(200).json({ success: true, enviados: 0, message: 'Nenhum respondente pendente para este papel' });
  }

  const { data: tpl } = await db
    .from('email_templates')
    .select('*')
    .eq('projeto_id', projetoId)
    .eq('papel', papel)
    .maybeSingle();

  const origin = req.headers.origin || process.env.NEXT_PUBLIC_SITE_URL || '';
  const projetoNome = projeto.cliente || projeto.nome || '';
  const tipo = TIPO_BY_PAPEL[papel];

  const results = [];
  for (const r of respondentes) {
    const link = r.token
      ? `${origin}${PATH_BY_PAPEL[papel]}?t=${r.token}`
      : `${origin}${PATH_BY_PAPEL[papel]}?projeto=${projetoId}`;
    const vars = { nome: r.nome, papel, link, projeto: projetoNome };
    const customSubject = applyPlaceholders(tpl?.assunto, vars);
    const customBody = applyPlaceholders(tpl?.corpo, vars);

    // Sócios recebem um link adicional pro teste de Posicionamento Estratégico
    const extraLinks = [];
    if (papel === 'socios' && r.token) {
      extraLinks.push({
        intro: 'Junto, enviamos o Teste de Posicionamento Estratégico — 27 afirmações rápidas que identificam o posicionamento dominante da empresa (Excelência Operacional / Intimidade com Cliente / Liderança em Produto).',
        cta: 'Fazer teste de posicionamento',
        href: `${origin}/form/posicionamento?t=${r.token}`,
      });
    }

    try {
      await sendFormInvite({
        to: r.email,
        nome: r.nome,
        link,
        tipo,
        projetoNome,
        subjectOverride: customSubject || undefined,
        bodyOverride: customBody || undefined,
        extraLinks,
      });
      await db
        .from('respondentes')
        .update({ status_convite: 'enviado', convidado_em: new Date().toISOString() })
        .eq('id', r.id);
      results.push({ email: r.email, ok: true });
    } catch (err) {
      results.push({ email: r.email, ok: false, error: err.message });
    }
  }

  return res.status(200).json({
    success: true,
    enviados: results.filter(x => x.ok).length,
    falhas: results.filter(x => !x.ok).length,
    detalhes: results,
  });
}
