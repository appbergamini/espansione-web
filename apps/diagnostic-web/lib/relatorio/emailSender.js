import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendReportEmail({ to, nome, profile, pdfBuffer }) {
  if (!resend) {
    console.warn('[EMAIL] RESEND_API_KEY não configurada — e-mail não enviado');
    return;
  }

  const firstName = nome?.split(' ')[0] || 'Participante';
  const fileName = `Espansione_Perfil_${nome.replace(/\s+/g, '_')}.pdf`;

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'Espansione <relatorios@espansione.com.br>',
    to,
    subject: `Seu Relatório de Perfil Comportamental — ${profile}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; color: #334155;">
        <div style="text-align: center; padding: 32px 0 24px;">
          <h1 style="font-size: 24px; font-weight: 800; color: #004198; margin: 0;">Espansione</h1>
        </div>

        <div style="background: #f8fafc; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0;">
          <p style="font-size: 16px; margin: 0 0 8px;">Ola, <strong>${firstName}</strong>!</p>
          <p style="font-size: 14px; color: #64748b; line-height: 1.6; margin: 0 0 20px;">
            Seu mapeamento comportamental foi concluido com sucesso. Seu perfil DISC e <strong style="color: #004198; font-size: 18px;">${profile}</strong>.
          </p>

          <div style="background: #004198; color: white; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 20px;">
            <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 4px; opacity: 0.7;">Seu perfil</p>
            <p style="font-size: 36px; font-weight: 900; letter-spacing: 4px; margin: 0;">${profile}</p>
          </div>

          <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin: 0;">
            O relatorio completo esta em anexo neste e-mail (PDF). Nele voce encontrara:
          </p>
          <ul style="font-size: 13px; color: #64748b; line-height: 1.8; padding-left: 20px; margin: 8px 0 0;">
            <li>Analise detalhada do perfil DISC (Natural e Adaptado)</li>
            <li>16 competencias mapeadas</li>
            <li>Estilo de lideranca</li>
            <li>Dicas praticas de desenvolvimento</li>
          </ul>
        </div>

        <div style="text-align: center; padding: 24px 0; font-size: 11px; color: #94a3b8;">
          <p>Espansione © 2026 — Mapeamento Comportamental</p>
          <p>Este e-mail foi enviado automaticamente. Nao responda.</p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: fileName,
        content: pdfBuffer.toString('base64'),
        contentType: 'application/pdf',
      },
    ],
  });

  if (error) {
    console.error('[EMAIL] Erro Resend:', error);
    throw error;
  }

  console.log('[EMAIL] Enviado:', data?.id);
  return data;
}
