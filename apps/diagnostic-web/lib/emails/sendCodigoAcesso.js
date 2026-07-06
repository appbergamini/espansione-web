import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Código de acesso (OTP) da área do cliente, enviado por e-mail nosso (Resend).
export async function sendCodigoAcesso({ to, codigo }) {
  if (!resend) throw new Error('RESEND_API_KEY não configurada');
  const from = process.env.RESEND_FROM_EMAIL || 'Espansione <onboarding@resend.dev>';
  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: 'Seu código de acesso — Espansione',
    html: `
      <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;color:#334155">
        <div style="text-align:center;padding:24px 0"><h1 style="color:#004198;margin:0;font-size:22px">Espansione</h1></div>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:32px;text-align:center">
          <p style="font-size:15px;margin:0 0 8px">Seu código de acesso à área do cliente:</p>
          <p style="font-size:34px;font-weight:800;letter-spacing:6px;color:#004198;margin:16px 0">${codigo}</p>
          <p style="font-size:12px;color:#94a3b8;margin:8px 0 0">Digite este código na página. Ele expira em 1 hora.</p>
          <p style="font-size:12px;color:#94a3b8;margin:6px 0 0">Se você não solicitou, ignore este e-mail.</p>
        </div>
        <div style="text-align:center;padding:20px 0;font-size:11px;color:#94a3b8"><p>Espansione © 2026</p></div>
      </div>`,
  });
  if (error) { console.error('[codigo acesso] Resend:', error); throw error; }
  return data;
}
