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

  // No domínio do funil, "/" serve a home institucional (public/home/) e a
  // LP do Mapa vive em /lp (+ alias /crescimento). Precisa de `beforeFiles`
  // porque "/" casa com pages/index.js — em afterFiles nunca dispararia. Nos
  // demais hosts (*.vercel.app, painel), "/" segue abrindo o app (→ /adm).
  async rewrites() {
    const FUNIL_HOSTS = ['crescimentointegrado.com.br', 'www.crescimentointegrado.com.br'];
    return {
      beforeFiles: FUNIL_HOSTS.map((host) => ({
        source: '/',
        has: [{ type: 'host', value: host }],
        destination: '/home/index.html',
      })),
      afterFiles: [
        // URL limpa da home institucional.
        { source: '/home', destination: '/home/index.html' },
        // LP do Mapa (URL principal + alias histórico WhatsApp/links).
        { source: '/lp', destination: '/crescimento/index.html' },
        { source: '/crescimento', destination: '/crescimento/index.html' },

        // ── Zona do Teste de Competências (multi-zone) ──────────────
        // Este app continua dono do domínio e roteador de borda; o teste
        // vive em apps/competencias-web, com deploy próprio.
        //
        // A zona declara basePath '/teste', então rotas E assets já saem
        // sob /teste e o destino inclui o prefixo. Duas regras bastam — o
        // rewrite extra de assets deixou de ser necessário no Next 15+.
        //
        // Gated por TESTE_ORIGIN: sem a variável, isto é uma lista vazia e
        // nada muda. Ligar a zona é setar a env, não editar código.
        //
        // afterFiles (e não beforeFiles) de propósito: /teste não colide
        // com nenhuma página nem arquivo público deste app, então não há
        // motivo para passar na frente do roteamento normal.
        ...(process.env.TESTE_ORIGIN
          ? [
              { source: '/teste', destination: `${process.env.TESTE_ORIGIN}/teste` },
              { source: '/teste/:path+', destination: `${process.env.TESTE_ORIGIN}/teste/:path+` },
            ]
          : []),
      ],
    };
  },

  // SEO — só o domínio do funil deve aparecer no Google. Nos demais hosts
  // (*.vercel.app, previews, painel) o mesmo deploy responde com o mesmo
  // conteúdo; sem isso o Google indexaria a versão duplicada.
  async headers() {
    return [
      {
        source: '/:path*',
        missing: [
          { type: 'host', value: 'crescimentointegrado.com.br' },
        ],
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ];
  },
};

export default nextConfig;
