// FIX.24 — GET / PATCH / DELETE de um bloco de curadoria.
// PATCH aceita whitelist: status, incluir_no_relatorio, edited_*,
// notas_internas, notas_cliente, categoria, ai_confianca.
// Toda edição grava uma versão em analysis_block_versions com snapshot.

import { getServerUser } from '../../../../lib/getServerUser';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

const EDITABLE_FIELDS = [
  'status',
  'incluir_no_relatorio',
  'edited_titulo',
  'edited_evidencia',
  'edited_interpretacao',
  'edited_recomendacao',
  'notas_internas',
  'notas_cliente',
  'categoria',
];

const STATUS_VALIDOS = new Set([
  'pendente_revisao', 'aprovado', 'editado', 'excluido',
  'somente_bastidor', 'levar_discussao', 'reanalise_solicitada', 'validado_cliente',
]);

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ success: false, error: 'id obrigatório' });

  const { user } = await getServerUser(req, res);
  if (!user) return res.status(401).json({ success: false, error: 'Não autenticado' });

  const db = supabaseAdmin;
  const { data: profile } = await db
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['master', 'admin'].includes(profile.role)) {
    return res.status(403).json({ success: false, error: 'Apenas master/admin' });
  }

  if (req.method === 'GET') {
    const { data: block, error } = await db
      .from('analysis_blocks')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !block) return res.status(404).json({ success: false, error: 'Bloco não encontrado' });

    const { data: versoes } = await db
      .from('analysis_block_versions')
      .select('*')
      .eq('block_id', id)
      .order('created_at', { ascending: true });
    const { data: comentarios } = await db
      .from('analysis_block_comments')
      .select('*')
      .eq('block_id', id)
      .order('created_at', { ascending: true });

    return res.status(200).json({ success: true, block, versoes: versoes || [], comentarios: comentarios || [] });
  }

  if (req.method === 'PATCH') {
    const update = {};
    for (const k of EDITABLE_FIELDS) {
      if (k in (req.body || {})) update[k] = req.body[k];
    }
    if (Object.keys(update).length === 0) {
      return res.status(400).json({ success: false, error: 'Nenhum campo válido para atualizar' });
    }
    if ('status' in update && !STATUS_VALIDOS.has(update.status)) {
      return res.status(400).json({ success: false, error: 'status inválido' });
    }

    const { data: anterior } = await db
      .from('analysis_blocks')
      .select('*')
      .eq('id', id)
      .single();
    if (!anterior) return res.status(404).json({ success: false, error: 'Bloco não encontrado' });

    // Se o consultor mexeu em qualquer campo edited_*, marca reviewed_*
    const tocouEdicao = ['edited_titulo','edited_evidencia','edited_interpretacao','edited_recomendacao']
      .some(k => k in update);
    if (tocouEdicao) {
      update.reviewed_at = new Date().toISOString();
      update.reviewed_by = user.id;
      // Auto-flag de status "editado" se ainda estava pendente
      if (anterior.status === 'pendente_revisao' && !('status' in update)) {
        update.status = 'editado';
      }
    }

    // Aprovação automática inclui no relatório (a menos que body sobrescreva)
    if (update.status === 'aprovado' && !('incluir_no_relatorio' in update)) {
      update.incluir_no_relatorio = true;
    }
    if ((update.status === 'excluido' || update.status === 'somente_bastidor') && !('incluir_no_relatorio' in update)) {
      update.incluir_no_relatorio = false;
    }

    const { data: novo, error } = await db
      .from('analysis_blocks')
      .update(update)
      .eq('id', id)
      .select('*')
      .single();
    if (error) return res.status(500).json({ success: false, error: error.message });

    // Versão snapshot quando consultor edita conteúdo
    if (tocouEdicao) {
      await db.from('analysis_block_versions').insert({
        block_id: id,
        tipo: 'edicao_consultor',
        snapshot_json: novo,
        created_by: user.id,
      });
    }

    return res.status(200).json({ success: true, block: novo });
  }

  if (req.method === 'DELETE') {
    // Hard delete (cascata em versions + comments via FK)
    const { error } = await db
      .from('analysis_blocks')
      .delete()
      .eq('id', id);
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
