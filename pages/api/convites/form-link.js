import { getServerUser } from '../../../lib/getServerUser';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { sendFormInvite } from '../../../lib/emails/sendFormInvite';

const PATH_BY_TIPO = {
  intake_socios: '/form/socios',
  intake_colaboradores: '/form/colaboradores',
  intake_clientes: '/form/clientes',
  mapeamento_cis: '/mapeamento.html',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { user } = await getServerUser(req, res);
  if (!user) return res.status(401).json({ success: false, error: 'Não autenticado' });

  const { projetoId, tipo, email, nome } = req.body || {};
  if (!projetoId || !tipo || !email) {
    return res.status(400).json({ success: false, error: 'projetoId, tipo e email são obrigatórios' });
  }

  const path = PATH_BY_TIPO[tipo];
  if (!path) {
    return res.status(400).json({ success: false, error: 'tipo inválido' });
  }

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
    return res.status(403).json({ success: false, error: 'Acesso negado a este projeto' });
  }

  const origin = req.headers.origin || process.env.NEXT_PUBLIC_SITE_URL || '';
  const projetoNome = projeto.cliente || projeto.nome || '';
  let token = null;

  // Mapeamento CIS: busca token do participante pelo email
  if (tipo === 'mapeamento_cis') {
    const { data: p } = await db
      .from('cis_participantes')
      .select('token, nome')
      .eq('projeto_id', projetoId)
      .eq('email', String(email).trim().toLowerCase())
      .maybeSingle();
    if (!p) return res.status(404).json({ success: false, error: 'Participante DISC não encontrado. Cadastre o email antes.' });
    token = p.token;
  } else {
    // Forms: busca token em respondentes pelo email+papel
    const papel = tipo.replace('intake_', '');
    const { data: r } = await db
      .from('respondentes')
      .select('token')
      .eq('projeto_id', projetoId)
      .eq('email', String(email).trim().toLowerCase())
      .eq('papel', papel)
      .maybeSingle();
    if (r?.token) token = r.token;
  }

  const link = token
    ? `${origin}${path}?t=${token}`
    : `${origin}${path}?projeto=${projetoId}`;

  try {
    const result = await sendFormInvite({ to: email, nome, link, tipo, projetoNome });
    return res.status(200).json({ success: true, id: result?.id });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
