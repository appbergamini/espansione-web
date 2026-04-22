/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Bloco D · TASK 4.3 — Playwright + @sparticuz/chromium são binários
  // grandes (Chromium slim ~50MB). Declarar como externals evita que
  // o bundler do Next tente incluí-los no output da função serverless.
  serverExternalPackages: ['@sparticuz/chromium', 'playwright-core'],

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
};

export default nextConfig;
