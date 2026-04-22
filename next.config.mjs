/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Bloco D · TASK 4.3 — Playwright + @sparticuz/chromium são binários
  // grandes (Chromium slim ~50MB). Declarar como externals evita que
  // o bundler do Next tente incluí-los no output da função serverless,
  // o que estouraria o limite de tamanho do Vercel.
  serverExternalPackages: ['@sparticuz/chromium', 'playwright-core'],
};

export default nextConfig;
