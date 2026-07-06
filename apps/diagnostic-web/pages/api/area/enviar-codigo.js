// POST /api/area/enviar-codigo  { email }
// Gera um código OTP (server-side) e envia por e-mail nosso (Resend), sem
// depender do template de e-mail do Supabase. O cliente valida com verifyOtp.
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { sendCodigoAcesso } from '../../../lib/emails/sendCodigoAcesso';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  if (!supabaseAdmin) return res.status(500).json({ success: false, error: 'Supabase indisponível' });

  const email = (req.body?.email || '').toString().trim().toLowerCase();
  if (!/.+@.+\..+/.test(email)) return res.status(400).json({ success: false, error: 'E-mail inválido' });

  // garante o usuário (ignora "já existe")
  await supabaseAdmin.auth.admin.createUser({ email, email_confirm: true });

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({ type: 'magiclink', email });
  if (error) return res.status(500).json({ success: false, error: error.message });
  const codigo = data?.properties?.email_otp;
  if (!codigo) return res.status(500).json({ success: false, error: 'Falha ao gerar o código' });

  try {
    await sendCodigoAcesso({ to: email, codigo });
  } catch (e) {
    console.error('[area/enviar-codigo] envio', e?.message);
    return res.status(500).json({ success: false, error: 'Não foi possível enviar o e-mail. Verifique o Resend.' });
  }
  return res.status(200).json({ success: true });
}
