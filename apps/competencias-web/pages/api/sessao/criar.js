import { criarSessao } from '../../../lib/competencias/repo.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Method Not Allowed' });
  try {
    const { email, projetoId, pagamentoId, origem } = req.body || {};
    const sessao = await criarSessao({ email, projetoId, pagamentoId, origem });
    return res.status(200).json({ token: sessao.token, status: sessao.status });
  } catch (e) {
    console.error('[competencias] criar sessão:', e);
    return res.status(500).json({ erro: 'Não foi possível abrir o teste. Tente de novo em instantes.' });
  }
}
