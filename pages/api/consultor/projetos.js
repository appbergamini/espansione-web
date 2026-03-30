import { db } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const projetos = await db.getAllProjects();
    return res.status(200).json({ success: true, projetos });
  } catch (error) {
    console.error("ERRO fetch projetos:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
