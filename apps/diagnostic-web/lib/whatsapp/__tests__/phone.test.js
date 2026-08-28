import assert from 'node:assert/strict';
import test from 'node:test';
import { extrairTelefone, whatsappValido } from '../phone.js';

test('normaliza WhatsApp brasileiro com DDD', () => {
  assert.equal(extrairTelefone('(11) 98765-4321'), '+5511987654321');
  assert.equal(extrairTelefone('11 3456-7890'), '+551134567890');
});

test('aceita número internacional explícito', () => {
  assert.equal(extrairTelefone('+351 912 345 678'), '+351912345678');
});

test('rejeita e-mail, texto e número sem DDD', () => {
  assert.equal(whatsappValido('pessoa@empresa.com'), false);
  assert.equal(whatsappValido('meu WhatsApp'), false);
  assert.equal(whatsappValido('98765-4321'), false);
});
