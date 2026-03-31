import { db } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { projeto_id, email } = req.body;

    if (!projeto_id || !email) {
      return res.status(400).json({ success: false, error: 'projeto_id e email são obrigatórios' });
    }

    const participante = await db.verifyCisAcesso(projeto_id, email);

    if (!participante) {
      return res.status(403).json({ success: false, autorizado: false, error: "E-mail não está na lista de autorizados para este projeto." });
    }

    if (!participante.liberado) {
      return res.status(403).json({ success: false, autorizado: false, error: "Este acesso encontra-se bloqueado." });
    }

    if (participante.respondido) {
      return res.status(403).json({ success: false, autorizado: false, error: "Você já respondeu ao mapeamento." });
    }

    return res.status(200).json({ success: true, autorizado: true, participante });
  } catch (err) {
    console.error("[API CIS Verificacao] Erro:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
