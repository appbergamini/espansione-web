import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { generateNarratives } from '../../../lib/relatorio/narrativeGenerator';
import { generatePdfBuffer } from '../../../lib/relatorio/pdfGenerator';
import { sendReportEmail } from '../../../lib/relatorio/emailSender';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { projetoId, email, nome, scores } = req.body;
  if (!projetoId || !email || !scores) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  const emailTratado = String(email).trim().toLowerCase();

  try {
    const { data: participante, error: partErr } = await supabaseAdmin
      .from('cis_participantes')
      .select('id')
      .eq('projeto_id', projetoId)
      .eq('email', emailTratado)
      .limit(1)
      .single();
    if (partErr && partErr.code !== 'PGRST116') throw partErr;
    if (!participante) {
      return res.status(403).json({ error: 'E-mail não autorizado para este projeto.' });
    }
  } catch (err) {
    console.error('[RELATORIO/SOLICITAR] Erro de validação:', err);
    return res.status(500).json({ error: err.message });
  }

  res.status(200).json({ success: true, message: `Relatório será enviado para ${emailTratado}` });

  try {
    console.log(`[RELATORIO] Gerando para ${nome} <${emailTratado}> (perfil: ${scores.profile})`);
    const narratives = await generateNarratives(nome, scores);
    const pdfBuffer = await generatePdfBuffer({ nome, email: emailTratado, scores, narratives });
    await sendReportEmail({ to: emailTratado, nome, profile: scores.profile, pdfBuffer });
    console.log(`[RELATORIO] Enviado com sucesso para ${emailTratado}`);
  } catch (err) {
    console.error('[RELATORIO] Erro:', err.message || err);
  }
}
