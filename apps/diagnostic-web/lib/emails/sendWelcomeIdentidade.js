import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const NOME_PUBLICO = {
  socios: 'Sócios e Diretores',
  colaboradores: 'Colaboradores e Líderes',
  clientes: 'Clientes e Fornecedores',
};

// E-mail de boas-vindas + instruções, disparado após a compra do Mapa do Crescimento Integrado v2.
export async function sendWelcomeIdentidade({ to, nome, baseUrl, links = [], setupUrl }) {
  if (!resend) throw new Error('RESEND_API_KEY não configurada');
  const from = process.env.RESEND_FROM_EMAIL || 'Espansione <onboarding@resend.dev>';
  const firstName = (nome || '').split(' ')[0] || '';
  const abs = (l) => `${baseUrl}${l}`;
  const areaUrl = `${baseUrl}/area`;

  const linksHtml = links.map((l) => `
    <div style="margin:10px 0;padding:14px 16px;background:#fff;border:1px solid #e2e8f0;border-radius:8px">
      <div style="font-weight:600;font-size:14px;color:#0a1122">${NOME_PUBLICO[l.publico] || l.publico}</div>
      <a href="${abs(l.link)}" style="font-size:12px;color:#004198;word-break:break-all">${abs(l.link)}</a>
    </div>`).join('');

  const socios = links.find((l) => l.publico === 'socios');

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: 'Bem-vindo ao Mapa do Crescimento Integrado v2 🎉',
    html: `
      <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;color:#334155">
        <div style="text-align:center;padding:28px 0"><h1 style="color:#004198;margin:0;font-size:24px">Espansione</h1></div>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:32px">
          <p style="font-size:16px;margin:0 0 8px">Olá${firstName ? `, <strong>${firstName}</strong>` : ''}! 🎉</p>
          <p style="font-size:14px;line-height:1.6;color:#475569;margin:0 0 20px">
            Sua compra do <strong>Mapa do Crescimento Integrado v2</strong> foi confirmada. Ele cruza
            <strong>três olhares</strong> sobre a sua empresa — Sócios, Equipe e Clientes — e gera um relatório de triangulação.
          </p>

          <p style="font-size:13px;font-weight:700;color:#0a1122;margin:0 0 4px">1. Comece respondendo como sócio</p>
          ${socios ? `<div style="text-align:center;margin:12px 0 20px">
            <a href="${abs(socios.link)}" style="display:inline-block;background:#004198;color:#fff;text-decoration:none;padding:13px 26px;border-radius:8px;font-weight:600;font-size:14px">Responder como Sócio →</a>
          </div>` : ''}

          <p style="font-size:13px;font-weight:700;color:#0a1122;margin:16px 0 4px">2. Compartilhe os links com cada público</p>
          ${linksHtml}

          <p style="font-size:13px;font-weight:700;color:#0a1122;margin:22px 0 4px">3. Acompanhe tudo e assista aos treinamentos</p>
          <p style="font-size:13px;line-height:1.6;color:#475569;margin:0 0 12px">
            Na sua <strong>área do cliente</strong> você acompanha o diagnóstico e assiste aos vídeos de treinamento.
            Acesse com <strong>este mesmo e-mail</strong> (${to}) — enviamos um código de acesso na hora.
          </p>
          <div style="text-align:center;margin:8px 0">
            <a href="${areaUrl}" style="display:inline-block;background:#0a1122;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:13px">Abrir a área do cliente →</a>
          </div>

          ${setupUrl ? `<p style="font-size:11px;color:#94a3b8;margin:20px 0 0;word-break:break-all">Página da sua compra: ${setupUrl}</p>` : ''}
        </div>
        <div style="text-align:center;padding:22px 0;font-size:11px;color:#94a3b8"><p>Espansione © 2026</p></div>
      </div>`,
  });

  if (error) { console.error('[welcome identidade] Resend:', error); throw error; }
  return data;
}
