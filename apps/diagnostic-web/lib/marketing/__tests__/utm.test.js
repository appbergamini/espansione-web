import assert from 'node:assert/strict';
import test from 'node:test';
import { sanitizarUtms } from '../utm.js';

test('mantém as cinco UTMs conhecidas', () => {
  assert.deepEqual(sanitizarUtms({
    utm_source: 'google',
    utm_medium: 'cpc',
    utm_campaign: 'mapa-agosto',
    utm_content: 'video-a',
    utm_term: 'crescimento integrado',
  }), {
    utm_source: 'google',
    utm_medium: 'cpc',
    utm_campaign: 'mapa-agosto',
    utm_content: 'video-a',
    utm_term: 'crescimento integrado',
  });
});

test('normaliza arrays, espaços e ignora parâmetros desconhecidos', () => {
  assert.deepEqual(sanitizarUtms({
    utm_source: [' instagram ', 'ignorado'],
    utm_medium: '',
    gclid: 'nao-persistir',
  }), { utm_source: 'instagram' });
});

test('limita cada valor a 200 caracteres', () => {
  assert.equal(sanitizarUtms({ utm_campaign: 'a'.repeat(250) }).utm_campaign.length, 200);
});
