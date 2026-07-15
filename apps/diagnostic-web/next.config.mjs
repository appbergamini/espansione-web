import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: path.resolve(__dirname, '../..'),
  },

  // Bloco D · TASK 4.3 — Playwright + @sparticuz/chromium são binários
  // grandes (Chromium slim ~50MB). Declarar como externals evita que
  // o bundler do Next tente incluí-los no output da função serverless.
  serverExternalPackages: ['@sparticuz/chromium', 'playwright-core'],
  transpilePackages: ['@espansione/agents', '@espansione/brand-memory', '@espansione/types'],

  // FIX — Turbopack (Next 16) estava bundlando @sparticuz/chromium mesmo
  // com serverExternalPackages, relocando e perdendo a pasta `bin/` que
  // contém o binário comprimido do Chromium slim. Erro no runtime:
  //   `The input directory "/var/task/node_modules/@sparticuz/chromium/bin"
  //    does not exist`
  //
  // `outputFileTracingIncludes` força Vercel file tracing a copiar a pasta
  // inteira do pacote para o output da função, mesmo que Turbopack não
  // tenha "visto" os arquivos binários via import estático.
  //
  // Caminho do glob é relativo ao root do monorepo/projeto; route pattern
  // usa format Next (ver docs/api-reference/next-config-js/output).
  outputFileTracingIncludes: {
    '/api/outputs/**': [
      './node_modules/@sparticuz/chromium/**/*',
    ],
  },

  // Landing page estática do Mapa do Crescimento Integrado.
  // O HTML self-contained vive em public/crescimento/index.html.
  async rewrites() {
    // Domínio próprio do funil: a home ("/") serve a LP em vez da index do
    // app. Precisa de `beforeFiles` porque "/" casa com pages/index.js — em
    // afterFiles o rewrite nunca dispararia. Nos demais domínios
    // (*.vercel.app, painel), "/" continua abrindo o app normalmente.
    const FUNIL_HOSTS = ['crescimentointegrado.com.br', 'www.crescimentointegrado.com.br'];
    return {
      beforeFiles: FUNIL_HOSTS.map((host) => ({
        source: '/',
        has: [{ type: 'host', value: host }],
        destination: '/crescimento/index.html',
      })),
      // URL limpa /crescimento -> HTML self-contained em public/.
      afterFiles: [
        { source: '/crescimento', destination: '/crescimento/index.html' },
      ],
    };
  },
};

export default nextConfig;
