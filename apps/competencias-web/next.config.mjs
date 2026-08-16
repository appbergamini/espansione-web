import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Zona do Teste de Competências.
 *
 * Este app é uma ZONA do domínio crescimentointegrado.com.br, não o dono
 * dele. Quem roteia o domínio continua sendo o diagnostic-web, via rewrites
 * no next.config.mjs dele. Ver docs/plano-app-competencias-2026-08-16.md §3.3.
 *
 * `basePath: '/teste'` em vez do `assetPrefix` que o guia de multi-zones
 * sugere: com basePath, as rotas E os assets já saem sob /teste, os links
 * internos são prefixados automaticamente, e o roteador precisa de duas
 * regras em vez de três. O guia usa assetPrefix porque assume que a zona
 * não quer basePath — aqui queremos.
 *
 * Navegação para fora da zona (ex.: /area, /mapa) usa <a>, nunca <Link>:
 * prefetch atravessando zona não funciona.
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  basePath: '/teste',
  turbopack: {
    root: path.resolve(__dirname, '../..'),
  },
  transpilePackages: ['@espansione/cis', '@espansione/brand'],

  // Só o domínio do funil deve ser indexado. Nos demais hosts (a URL própria
  // desta zona, previews) o mesmo deploy responde com o mesmo conteúdo.
  async headers() {
    return [
      {
        source: '/:path*',
        missing: [{ type: 'host', value: 'crescimentointegrado.com.br' }],
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

export default nextConfig;
