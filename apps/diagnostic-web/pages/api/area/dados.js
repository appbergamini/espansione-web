// GET /api/area/dados — área do cliente (autenticado por e-mail/magic link).
// Acha as compras do cliente pelo e-mail e devolve o estado do diagnóstico +
// se ele tem acesso (compra paga). Os treinamentos (config) o front importa.

import { getServerUser } from '../../../lib/getServerUser';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

const PAGO = /paid|received|paid_unverified/i;

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' });
  if (!supabaseAdmin) return res.status(500).json({ success: false, error: 'Supabase indisponível' });

  const { user } = await getServerUser(req, res);
  if (!user?.email) return res.status(401).json({ success: false, error: 'Não autenticado' });
  const email = user.email.toLowerCase();
  const db = supabaseAdmin;

  // compras do cliente (por e-mail no cliente_json)
  const { data: pags } = await db
    .from('pagamentos')
    .select('id, status, projeto_id, cliente, created_at')
    .order('created_at', { ascending: false })
    .limit(500);
  const minhas = (pags || []).filter((p) => {
    const e = (p.cliente?.email || p.cliente?.mail || '').toString().toLowerCase();
    return e && e === email;
  });
  const pagas = minhas.filter((p) => PAGO.test(p.status || ''));
  const temAcesso = pagas.length > 0;
  const projetoIds = [...new Set(pagas.map((p) => p.projeto_id).filter(Boolean))];

  // diagnósticos (assessments identidade_final desses projetos)
  const diagnosticos = [];
  if (projetoIds.length) {
    const { data: assessments } = await db
      .from('id_v2_assessments')
      .select('id, projeto_id, status, socios_token, colaboradores_token, clientes_token')
      .in('projeto_id', projetoIds)
      .eq('produto', 'identidade_final');
    const projMap = {};
    const { data: projs } = await db.from('projetos').select('id, cliente').in('id', projetoIds);
    for (const p of projs || []) projMap[p.id] = p.cliente;

    for (const a of assessments || []) {
      const { data: reps } = await db.from('id_v2_respondents').select('publico, status').eq('assessment_id', a.id);
      const cont = { socios: 0, colaboradores: 0, clientes: 0 };
      const feitos = { socios: 0, colaboradores: 0, clientes: 0 };
      for (const r of reps || []) {
        if (cont[r.publico] === undefined) continue;
        cont[r.publico]++;
        if (r.status === 'completed') feitos[r.publico]++;
      }
      diagnosticos.push({
        assessment_id: a.id,
        cliente: projMap[a.projeto_id] || '',
        status: a.status,
        report_token: a.socios_token,
        relatorio_pronto: a.status === 'completed',
        publicos: [
          { key: 'socios', nome: 'Sócios e Diretores', respondentes: cont.socios, concluidos: feitos.socios, link: `/form/identidade-final/socios?token=${a.socios_token}` },
          { key: 'colaboradores', nome: 'Colaboradores e Líderes', respondentes: cont.colaboradores, concluidos: feitos.colaboradores, link: `/form/identidade-final/colaboradores?token=${a.colaboradores_token}` },
          { key: 'clientes', nome: 'Clientes e Fornecedores', respondentes: cont.clientes, concluidos: feitos.clientes, link: `/form/identidade-final/clientes?token=${a.clientes_token}` },
        ],
      });
    }
  }

  return res.status(200).json({ success: true, email, temAcesso, diagnosticos });
}
