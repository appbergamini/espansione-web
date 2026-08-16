// Garante que os tokens não divirjam do que está no ar em mapaTheme.js.
// Se este teste falhar, a marca saiu de sincronia entre os dois apps.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CORES, cssVars } from '../src/index.js';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const MAPA_THEME = path.resolve(AQUI, '../../../apps/diagnostic-web/components/mapa/mapaTheme.js');

test('tokens batem com o CORES de mapaTheme.js', { skip: !existsSync(MAPA_THEME) && 'mapaTheme.js não encontrado' }, () => {
  const src = readFileSync(MAPA_THEME, 'utf8');
  const bloco = src.match(/export const CORES = \{([\s\S]*?)\};/);
  assert.ok(bloco, 'bloco `export const CORES` não encontrado em mapaTheme.js');

  const noAr = {};
  for (const linha of bloco[1].split('\n')) {
    const m = linha.match(/^\s*(\w+):\s*'([^']+)'/);
    if (m) noAr[m[1]] = m[2];
  }

  assert.ok(Object.keys(noAr).length >= 10, 'parse do CORES trouxe poucas chaves — regex precisa ser revista');
  for (const [chave, valor] of Object.entries(noAr)) {
    assert.equal(CORES[chave], valor, `token "${chave}" divergiu do que está em produção`);
  }
});

test('cssVars gera custom properties em kebab-case', () => {
  const css = cssVars();
  assert.match(css, /--esp-navy: #001A3B;/);
  assert.match(css, /--esp-red-hover: #E13345;/);
  assert.match(css, /--esp-text-sec: #5B6B7F;/);
});
