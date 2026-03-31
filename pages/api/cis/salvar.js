import { db } from '../../../lib/db';

export default async function handler(req, res) {
  // CORS Handling for external webapps just in case
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { userData, scores, rawRankings, learnPrefs, projetoId } = req.body;

    if (!userData || !userData.email) {
      return res.status(400).json({ error: 'Faltam dados do usuário (email é obrigatório).' });
    }

    const emailTratado = userData.email.trim().toLowerCase();

    await db.saveCIS(
      projetoId || null,
      emailTratado,
      userData.name || 'Desconhecido',
      userData.gender || '',
      scores?.profileLabel || '',
      scores || {},
      rawRankings || {},
      learnPrefs || {}
    );

    res.status(200).json({ 
      success: true, 
      message: 'Assessment salvo com sucesso.', 
      email: emailTratado 
    });
  } catch (error) {
    console.error('Erro na API /cis/salvar:', error);
    res.status(500).json({ error: error.message || 'Erro interno do servidor' });
  }
}
