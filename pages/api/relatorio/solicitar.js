import { generateNarratives } from '../../../lib/relatorio/narrativeGenerator';
import { generatePdfBuffer } from '../../../lib/relatorio/pdfGenerator';
import { sendReportEmail } from '../../../lib/relatorio/emailSender';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { projetoId, email, nome, scores } = req.body;

  if (!email || !scores) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  // Responde imediatamente
  res.status(200).json({ success: true, message: `Relatório será enviado para ${email}` });

  // Processa em background
  try {
    console.log(`[RELATORIO] Gerando para ${nome} <${email}> (perfil: ${scores.profile})`);

    const narratives = await generateNarratives(nome, scores);
    const pdfBuffer = await generatePdfBuffer({ nome, email, scores, narratives });
    await sendReportEmail({ to: email, nome, profile: scores.profile, pdfBuffer });

    console.log(`[RELATORIO] Enviado com sucesso para ${email}`);
  } catch (err) {
    console.error('[RELATORIO] Erro:', err.message || err);
  }
}
