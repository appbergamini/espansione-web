import { db } from '../../../lib/db';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ exists: false, error: 'Email não fornecido.' });
    }

    const emailTratado = email.trim().toLowerCase();
    const resultado = await db.getCIS(emailTratado);

    if (!resultado) {
      return res.status(200).json({ exists: false });
    }

    // Retornar os dados formatados
    res.status(200).json({ 
      exists: true, 
      profileLabel: resultado.perfil_label,
      disc: resultado.scores_json?.disc || {},
      discAdapted: resultado.scores_json?.discA || {},
      leadership: resultado.scores_json?.leadership || {},
      competencies: resultado.scores_json?.competencies || {},
      learnPrefs: resultado.learn_prefs_json || {}
    });

  } catch (error) {
    console.error('Erro na API /cis/consultar:', error);
    res.status(500).json({ exists: false, error: error.message || 'Erro interno do servidor' });
  }
}
