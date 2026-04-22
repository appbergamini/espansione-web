// lib/pdf/generatePdfFromPage.js
//
// Bloco D · TASK 4.3 — helper de geração de PDF usando Playwright +
// @sparticuz/chromium. Estratégia: um Chromium headless abre a URL
// interna que já renderiza o conteúdo editorial (/adm/[id]/outputs/
// [stage]?print=true), aguarda o render completo (incluindo Recharts
// SVGs e fontes), e exporta para PDF.
//
// Detecta ambiente automaticamente:
//   - Vercel / AWS Lambda → usa chromium slim de @sparticuz/chromium
//   - Local (dev)        → usa o Chromium local instalado via
//                          `npx playwright install chromium`
//
// Plano B documentado (caso o slim chromium apresente problemas):
// trocar esta função por uma chamada HTTP ao Browserless.io, que expõe
// o mesmo contrato (receber URL, retornar Buffer PDF). Ver notas no
// fim do arquivo.

import chromium from '@sparticuz/chromium';
import { chromium as playwrightChromium } from 'playwright-core';

const DEFAULT_TIMEOUT_MS = 45_000;
const DEFAULT_MARGINS = {
  top: '20mm', right: '18mm', bottom: '20mm', left: '18mm',
};

/**
 * @typedef {Object} GeneratePdfOptions
 * @property {string} url                URL absoluta da página a converter.
 * @property {string} [formato='A4']     Formato do papel.
 * @property {{ top, right, bottom, left }} [margens]
 * @property {number} [timeoutMs=45000]  Timeout total.
 * @property {string} [waitForSelector='.output-editorial']
 *   Seletor que confirma que a página montou. Default casa com o
 *   wrapper do OutputRenderer.
 */

/**
 * @param {GeneratePdfOptions} opts
 * @returns {Promise<Buffer>}
 */
export async function generatePdfFromPage({
  url,
  formato = 'A4',
  margens = DEFAULT_MARGINS,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  waitForSelector = '.output-editorial',
}) {
  if (!url) throw new Error('[generatePdfFromPage] url obrigatória');

  const isServerless =
    process.env.VERCEL === '1' ||
    !!process.env.AWS_LAMBDA_FUNCTION_NAME;

  let browser = null;

  try {
    if (isServerless) {
      browser = await playwrightChromium.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true,
      });
    } else {
      // Ambiente local. Requer `npx playwright install chromium` ao menos
      // uma vez para baixar o binário. Se o dev estiver sem isso, a
      // chamada falha com mensagem do próprio Playwright — basta rodar
      // o install. Não forçamos download aqui.
      browser = await playwrightChromium.launch({ headless: true });
    }

    const context = await browser.newContext({
      viewport: { width: 1200, height: 1600 },
      deviceScaleFactor: 2,
    });

    const page = await context.newPage();

    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: Math.max(5000, timeoutMs - 5000),
    });

    // Aguarda o wrapper do OutputRenderer — confirma que o React
    // montou e os componentes estão em árvore. Sem isso, podemos
    // exportar antes do hydrate.
    if (waitForSelector) {
      await page
        .waitForSelector(waitForSelector, { timeout: 10_000 })
        .catch(() => {
          // Se não encontrar, seguimos — a página pode ser de erro ou
          // um output sem marker; ainda assim queremos exportar o que
          // renderizou.
        });
    }

    // Recharts renderiza em duas passadas (layout + animação).
    // 1.2s extra cobre isso sem pesar no timeout total.
    await page.waitForTimeout(1200);

    // Ativa regras @media print para remover chrome no próprio CSS.
    await page.emulateMedia({ media: 'print' });

    const pdf = await page.pdf({
      format: formato,
      margin: margens,
      printBackground: true,       // mantém cor dos cards editoriais
      preferCSSPageSize: true,
    });

    return pdf;
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

// ─── Notas ─────────────────────────────────────────────────────────
// Plano B (Browserless.io SaaS): se @sparticuz/chromium apresentar
// OOM / cold start inviável em produção, a função vira:
//
//   const res = await fetch(process.env.BROWSERLESS_URL, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ url, options: { format: formato, margin: margens, printBackground: true } }),
//   });
//   return Buffer.from(await res.arrayBuffer());
//
// Contrato externo permanece o mesmo — consumidores (API route) não
// mudam.
