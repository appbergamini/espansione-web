// POST /api/identidade-v2/hub — admin (master/admin)
// Body: { projeto_id, produto? }  produto: 'maturidade_free' (default) | 'identidade_pago'
// Cria/recupera a avaliação v2 do projeto, gera os tokens de link por público
// (sócios sempre; colaboradores/clientes quando pago) e devolve os links + status.

import crypto from 'crypto';
import { getServerUser } from '../../../lib/getServerUser';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

const tk = () => crypto.randomBytes(24).toString('hex');
const COLS = 'id, projeto_id, produto, status, socios_token, colaboradores_token, clientes_token, result_json';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  if (!supabaseAdmin) return res.status(500).json({ success: false, error: 'Supabase indisponível' });

  const { user } = await getServerUser(req, res);
  if (!user) return res.status(401).json({ success: false, error: 'Não autenticado' });

  const db = supabaseAdmin;
  const { data: profile } = await db.from('profiles').select('role,empresa_id').eq('id', user.id).single();
  if (!profile || !['master', 'admin'].includes(profile.role)) {
    return res.status(403).json({ success: false, error: 'Apenas master/admin' });
  }

  const { projeto_id, produto = 'maturidade_free' } = req.body || {};
  if (!projeto_id) return res.status(400).json({ success: false, error: 'projeto_id obrigatório' });
  if (!['maturidade_free', 'identidade_pago'].includes(produto)) {
    return res.status(400).json({ success: false, error: 'produto inválido' });
  }

  const { data: proj } = await db.from('projetos').select('id, empresa_id, cliente').eq('id', projeto_id).single();
  if (!proj) return res.status(404).json({ success: false, error: 'Projeto não encontrado' });
  if (profile.role === 'admin' && proj.empresa_id !== profile.empresa_id) {
    return res.status(403).json({ success: false, error: 'Projeto de outra empresa' });
  }

  try {
    // get-or-create (1 assessment por projeto; o mais recente)
    let { data: a } = await db
      .from('id_v2_assessments')
      .select(COLS)
      .eq('projeto_id', projeto_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!a) {
      const ins = { projeto_id, produto, status: 'not_started', socios_token: tk() };
      if (produto === 'identidade_pago') { ins.colaboradores_token = tk(); ins.clientes_token = tk(); }
      const { data: nova, error } = await db.from('id_v2_assessments').insert([ins]).select(COLS).single();
      if (error) throw error;
      a = nova;
    } else {
      const patch = {};
      if (produto === 'identidade_pago' && a.produto !== 'identidade_pago') patch.produto = 'identidade_pago';
      const prodFinal = patch.produto || a.produto;
      if (!a.socios_token) patch.socios_token = tk();
      if (prodFinal === 'identidade_pago') {
        if (!a.colaboradores_token) patch.colaboradores_token = tk();
        if (!a.clientes_token) patch.clientes_token = tk();
      }
      if (Object.keys(patch).length) {
        await db.from('id_v2_assessments').update(patch).eq('id', a.id);
        Object.assign(a, patch);
      }
    }

    // contagem de respondentes por público
    const { data: resp } = await db.from('id_v2_respondents').select('publico, status').eq('assessment_id', a.id);
    const cont = {};
    for (const r of resp || []) {
      cont[r.publico] = cont[r.publico] || { total: 0, completos: 0 };
      cont[r.publico].total++;
      if (r.status === 'completed') cont[r.publico].completos++;
    }

    const links = [];
    const add = (publico, token) => {
      if (!token) return;
      links.push({
        publico,
        link: `/form/identidade-v2/${publico}?token=${token}`,
        respondentes: cont[publico]?.total || 0,
        concluidos: cont[publico]?.completos || 0,
      });
    };
    add('socios', a.socios_token);
    if (a.produto === 'identidade_pago') {
      add('colaboradores', a.colaboradores_token);
      add('clientes', a.clientes_token);
    }

    return res.status(200).json({
      success: true,
      assessment: { id: a.id, produto: a.produto, status: a.status },
      cliente: proj.cliente || '',
      links,
      result_json: a.result_json || null,
    });
  } catch (e) {
    console.error('[identidade-v2/hub]', e);
    return res.status(500).json({ success: false, error: e.message || 'Erro' });
  }
}
