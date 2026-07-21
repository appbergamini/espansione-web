import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Extrai um e-mail do campo livre de contato do cadastro (CAD-MM-006 aceita
// "e-mail ou WhatsApp"); retorna null quando o contato não é um e-mail.
export function extrairEmail(contato) {
  const m = String(contato || '').match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
  return m ? m[0].toLowerCase() : null;
}

// Link do relatório do Mapa do Crescimento Integrado Essencial, enviado ao
// concluir o check-up. Paleta do funil (navy #001A3B + vermelho #C72638).
export async function sendRelatorioEssencial({ to, nome, empresa, reportUrl }) {
  if (!resend) throw new Error('RESEND_API_KEY não configurada');
  const from = process.env.RESEND_FROM_EMAIL || 'Espansione <onboarding@resend.dev>';
  const primeiroNome = String(nome || '').trim().split(/\s+/)[0] || '';
  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: 'Seu Mapa do Crescimento Integrado Essencial está pronto',
    html: `
      <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:0 auto;color:#334155">
        <div style="background:#001A3B;border-radius:12px 12px 0 0;padding:28px 32px;text-align:center">
          <p style="color:#fff;font-size:20px;font-weight:700;margin:0">Espansione</p>
          <p style="color:#9FB3C8;font-size:12px;letter-spacing:.12em;text-transform:uppercase;margin:6px 0 0">Mapa do Crescimento Integrado Essencial</p>
        </div>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:32px">
          <p style="font-size:15px;margin:0 0 10px">${primeiroNome ? `Olá, ${primeiroNome}!` : 'Olá!'}</p>
          <p style="font-size:15px;line-height:1.6;margin:0 0 20px">
            O check-up${empresa ? ` da <b>${empresa}</b>` : ''} foi concluído e o seu relatório completo
            já está disponível — com a leitura dos 4 pilares (Marca, Negócios, Comunicação e Pessoas)
            e os pontos prioritários para aprofundar.
          </p>
          <div style="text-align:center;margin:24px 0">
            <a href="${reportUrl}" style="display:inline-block;background:#C72638;color:#fff;font-weight:600;font-size:15px;padding:13px 28px;border-radius:10px;text-decoration:none">Ver meu relatório</a>
          </div>
          <p style="font-size:12px;color:#94a3b8;line-height:1.6;margin:16px 0 0">
            O link é pessoal — guarde este e-mail para acessar o relatório quando quiser.
            Na própria página você pode salvá-lo em PDF.
          </p>
        </div>
        <div style="text-align:center;padding:20px 0;font-size:11px;color:#94a3b8"><p>Espansione © 2026</p></div>
      </div>`,
  });
  if (error) { console.error('[relatorio essencial] Resend:', error); throw error; }
  return data;
}
