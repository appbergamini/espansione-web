import { db } from '../../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: 'ID do projeto não informado' });
  }

  if (req.method === 'DELETE') {
    try {
      const projeto = await db.getProject(id);
      if (!projeto) {
        return res.status(404).json({ success: false, error: 'Projeto não encontrado' });
      }

      // O cascade no schema apaga outputs, intake, formulários, checkpoints, cis_participantes e logs automaticamente
      const { error } = await (await import('../../../lib/supabaseClient')).supabase
        .from('projetos')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);

      return res.status(200).json({ success: true, message: 'Projeto excluído com sucesso' });
    } catch (err) {
      console.error('[API DELETE projeto]', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
