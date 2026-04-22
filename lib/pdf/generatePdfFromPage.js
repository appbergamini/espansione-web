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
// DIAGNÓSTICO (temp): logs agressivos em cada etapa para identificar
// onde crasha no serverless quando stdout vem vazio. Remover depois
// de estabilizar.

import chromium from '@sparticuz/chromium';
import { chromium as playwrightChromium } from 'playwright-core';

const DEFAULT_TIMEOUT_MS = 45_000;
const DEFAULT_MARGINS = {
  top: '20mm', right: '18mm', bottom: '20mm', left: '18mm',
};

// Log helper que sobrevive a buffering — força flush via process.stderr
function log(...args) {
  const line = '[pdf] ' + args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ');
  try { process.stderr.write(line + '\n'); } catch {}
  try { console.error(line); } catch {}
}

export async function generatePdfFromPage({
  url,
  formato = 'A4',
  margens = DEFAULT_MARGINS,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  waitForSelector = '.output-editorial',
}) {
  log('enter', { url: url?.slice(0, 120), hasUrl: !!url });
  if (!url) throw new Error('[generatePdfFromPage] url obrigatória');

  const isServerless =
    process.env.VERCEL === '1' ||
    !!process.env.AWS_LAMBDA_FUNCTION_NAME;

  log('env', {
    VERCEL: process.env.VERCEL,
    AWS_LAMBDA_FUNCTION_NAME: !!process.env.AWS_LAMBDA_FUNCTION_NAME,
    VERCEL_URL: process.env.VERCEL_URL,
    VERCEL_REGION: process.env.VERCEL_REGION,
    isServerless,
  });

  let browser = null;
  let executablePath = null;

  try {
    if (isServerless) {
      log('resolve-executablePath:start');
      try {
        executablePath = await chromium.executablePath();
        log('resolve-executablePath:ok', { executablePath, type: typeof executablePath });
      } catch (e) {
        log('resolve-executablePath:FAIL', { message: e?.message, stack: e?.stack?.slice(0, 400) });
        throw e;
      }

      log('launch:start', {
        argsCount: chromium.args?.length,
        firstArgs: chromium.args?.slice(0, 3),
      });
      try {
        browser = await playwrightChromium.launch({
          args: chromium.args,
          executablePath,
          headless: true,
        });
        // browser.version() é síncrono em playwright-core
        let browserVersion = 'unknown';
        try { browserVersion = browser.version(); } catch {}
        log('launch:ok', { version: browserVersion });
      } catch (e) {
        log('launch:FAIL', { message: e?.message, stack: e?.stack?.slice(0, 800) });
        throw e;
      }
    } else {
      log('launch-local:start');
      browser = await playwrightChromium.launch({ headless: true });
      log('launch-local:ok');
    }

    log('context:start');
    const context = await browser.newContext({
      viewport: { width: 1200, height: 1600 },
      deviceScaleFactor: 2,
    });
    log('context:ok');

    const page = await context.newPage();
    log('page:created');

    log('goto:start', { timeout: Math.max(5000, timeoutMs - 5000) });
    try {
      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: Math.max(5000, timeoutMs - 5000),
      });
      log('goto:ok');
    } catch (e) {
      log('goto:FAIL', { message: e?.message });
      throw e;
    }

    if (waitForSelector) {
      log('waitForSelector:start', { selector: waitForSelector });
      await page
        .waitForSelector(waitForSelector, { timeout: 10_000 })
        .then(() => log('waitForSelector:ok'))
        .catch((e) => log('waitForSelector:skip', { message: e?.message }));
    }

    // FIX.11 — antes o helper aguardava 1200ms fixo, que era frágil: o
    // Recharts usa ResizeObserver + RAF e em Chromium headless pode
    // levar 2-3 frames extras antes do SVG existir. Resultado: charts
    // vazios no PDF enquanto o texto aparecia. Agora:
    //   1. fontes carregadas (document.fonts.ready);
    //   2. todos os .recharts-surface presentes e com largura > 0;
    //   3. um settle curto (500ms) para garantir o último paint.
    log('fonts:wait');
    await page.evaluate(() => (document.fonts?.ready ? document.fonts.ready : Promise.resolve()))
      .then(() => log('fonts:ok'))
      .catch((e) => log('fonts:skip', { message: e?.message }));

    log('recharts-surfaces:wait');
    try {
      const rechartsInfo = await page.evaluate(async ({ timeoutMs }) => {
        const deadline = Date.now() + timeoutMs;
        const esperado = document.querySelectorAll('[data-viz-card], .my-8 .recharts-responsive-container').length;
        // Se a página não tem markers VIZ (ex.: output puramente textual),
        // esperado==0 e passamos direto.
        while (Date.now() < deadline) {
          const surfaces = document.querySelectorAll('.recharts-surface');
          const todasOk = surfaces.length > 0 &&
            Array.from(surfaces).every(s => s.getBoundingClientRect().width > 0);
          if (surfaces.length === 0 && esperado === 0) {
            return { surfaces: 0, esperado: 0, skipped: true };
          }
          if (todasOk) return { surfaces: surfaces.length, esperado, ok: true };
          await new Promise(r => requestAnimationFrame(r));
        }
        const surfaces = document.querySelectorAll('.recharts-surface');
        return {
          surfaces: surfaces.length,
          esperado,
          ok: false,
          widths: Array.from(surfaces).map(s => Math.round(s.getBoundingClientRect().width)),
        };
      }, { timeoutMs: 10_000 });
      log('recharts-surfaces:done', rechartsInfo);
    } catch (e) {
      log('recharts-surfaces:FAIL', { message: e?.message });
    }

    // Settle final — garante o último paint cycle das animações do Recharts
    await page.waitForTimeout(500);

    log('emulateMedia:print');
    await page.emulateMedia({ media: 'print' });

    log('pdf:start');
    const pdf = await page.pdf({
      format: formato,
      margin: margens,
      printBackground: true,
      preferCSSPageSize: true,
    });
    log('pdf:ok', { bytes: pdf.length });

    return pdf;
  } catch (err) {
    log('HELPER_THROW', { name: err?.name, message: err?.message, stack: err?.stack?.slice(0, 1200) });
    throw err;
  } finally {
    if (browser) {
      log('close:start');
      await browser.close().catch(() => {});
      log('close:ok');
    }
  }
}
