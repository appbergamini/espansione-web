import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FORM_LABELS = {
  intake_socios: 'Formulário Sócios',
  intake_colaboradores: 'Formulário Colaboradores',
  intake_clientes: 'Formulário de Cliente',
  mapeamento_cis: 'Mapeamento Comportamental (DISC)',
};

const FORM_COPY = {
  intake_socios: {
    subject: 'Diagnóstico estratégico — sua visão como sócio',
    intro: 'Você foi convidado a participar do diagnóstico estratégico da empresa.',
    cta: 'Responder como sócio',
  },
  intake_colaboradores: {
    subject: 'Sua visão sobre a empresa — pesquisa anônima',
    intro: 'Você foi convidado a compartilhar sua percepção sobre a empresa. Suas respostas são anônimas por padrão.',
    cta: 'Compartilhar minha visão',
  },
  intake_clientes: {
    subject: 'Sua experiência como cliente — queremos ouvir você',
    intro: 'Você foi convidado a compartilhar sua experiência como cliente dessa empresa.',
    cta: 'Contar minha experiência',
  },
  mapeamento_cis: {
    subject: 'Mapeamento Comportamental — DISC',
    intro: 'Você foi convidado a fazer o mapeamento comportamental (DISC).',
    cta: 'Iniciar o mapeamento',
  },
};

export async function sendFormInvite({ to, nome, link, tipo, projetoNome, subjectOverride, bodyOverride, extraLinks }) {
  if (!resend) {
    throw new Error('RESEND_API_KEY não configurada');
  }

  const copy = FORM_COPY[tipo] || FORM_COPY.intake_socios;
  const label = FORM_LABELS[tipo] || 'Formulário';
  const firstName = nome?.split(' ')[0] || '';

  const from = process.env.RESEND_FROM_EMAIL || 'Espansione <onboarding@resend.dev>';
  const subject = subjectOverride || copy.subject;

  const bodyHtml = bodyOverride
    ? String(bodyOverride).replace(/\n/g, '<br>')
    : `
        <p style="font-size: 16px; margin: 0 0 8px;">Olá${firstName ? `, <strong>${firstName}</strong>` : ''}!</p>
        <p style="font-size: 14px; color: #64748b; line-height: 1.6; margin: 0 0 20px;">${copy.intro}${projetoNome ? ` — Projeto: <strong>${projetoNome}</strong>` : ''}.</p>
        <p style="font-size: 14px; color: #64748b; line-height: 1.6; margin: 0 0 24px;">
          O ${label.toLowerCase()} leva cerca de 10–15 minutos. Suas respostas são guardadas com segurança.
        </p>
      `;

  const extraLinksHtml = Array.isArray(extraLinks) && extraLinks.length > 0
    ? extraLinks.map(e => `
        <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0 0 12px;">
            ${e.intro || ''}
          </p>
          <div style="text-align: center;">
            <a href="${e.href}" style="display: inline-block; background: #0a1122; color: white; text-decoration: none; padding: 12px 22px; border-radius: 8px; font-weight: 600; font-size: 13px;">${e.cta || 'Acessar'}</a>
          </div>
          <p style="font-size: 11px; color: #94a3b8; line-height: 1.5; margin: 10px 0 0; word-break: break-all; text-align: center;">
            ${e.href}
          </p>
        </div>
      `).join('')
    : '';

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; color: #334155;">
        <div style="text-align: center; padding: 32px 0 24px;">
          <h1 style="font-size: 24px; font-weight: 800; color: #004198; margin: 0;">Espansione</h1>
        </div>
        <div style="background: #f8fafc; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0;">
          ${bodyHtml}
          <div style="text-align: center; margin: 24px 0;">
            <a href="${link}" style="display: inline-block; background: #004198; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">${copy.cta}</a>
          </div>
          <p style="font-size: 12px; color: #94a3b8; line-height: 1.6; margin: 16px 0 0; word-break: break-all;">
            Se o botão não funcionar, copie e cole no navegador:<br>${link}
          </p>
          ${extraLinksHtml}
        </div>
        <div style="text-align: center; padding: 24px 0; font-size: 11px; color: #94a3b8;">
          <p>Espansione © 2026</p>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error('[EMAIL INVITE] Erro Resend:', error);
    throw error;
  }

  return data;
}
