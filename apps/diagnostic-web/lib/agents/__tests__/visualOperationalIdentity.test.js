import test from 'node:test';
import assert from 'node:assert/strict';
import { Agent_11_Visual } from '../Agent_11_Visual.js';
import { extractVisualOperationalSliceFromAgent11Output } from '../../visual-identity/operational.js';

test('Agente 11 orienta export de visual_identity operacional', () => {
  const prompt = Agent_11_Visual.getSystemPrompt();

  assert.match(prompt, /operational_guidelines/);
  assert.match(prompt, /Sistema Visual Operacional|Agência IA/);
  assert.match(prompt, /prompt_guidelines/);
});

test('extrai operational_guidelines do brand_memory_export_json', () => {
  const slice = extractVisualOperationalSliceFromAgent11Output({
    agent_num: 11,
    brand_memory_export_json: {
      visual_identity: {
        operational_guidelines: {
          visual_principles: ['Luxo silencioso'],
          maintain: ['Rigor'],
          lose: ['Genérico'],
          gain: ['Frames proprietários'],
          color_direction: { primary: ['Azul'], avoid: ['Neon'] },
          typography_direction: { recommended_style: 'Serif editorial' },
          image_style: { photography: ['Editorial'], avoid: ['Banco genérico'] },
          layout_behavior: { composition: ['Grid editorial'] },
          dos: ['Usar respiro'],
          donts: ['Não poluir'],
          visual_risks: ['Parecer genérico'],
          prompt_guidelines: ['Gerar imagem sem texto'],
        },
      },
    },
  });

  assert.equal(slice.visual_principles[0], 'Luxo silencioso');
  assert.equal(slice.donts[0], 'Não poluir');
  assert.equal(slice.prompt_guidelines[0], 'Gerar imagem sem texto');
});

test('fallback deriva Sistema Visual Operacional de visual_identity legado', () => {
  const slice = extractVisualOperationalSliceFromAgent11Output({
    agent_num: 11,
    conteudo: `<brand_memory_export>${JSON.stringify({
      visual_identity: {
        manter_perder_ganhar: {
          manter: ['Rigor'],
          perder: ['Genérico'],
          ganhar: ['Contraste'],
        },
        color_palette: {
          principal: [{ nome: 'Azul', hex: '#001122', papel: 'primary' }],
          complementar: [],
        },
        typography: {
          titulos: { estilo: 'Serif', transmite: 'Autoridade' },
          corpo: { estilo: 'Sans', transmite: 'Clareza' },
          logica_contraste: 'Editorial e técnico',
        },
        fotografia: {
          estilo: 'Editorial',
          temas: ['Liderança'],
          proibido: 'Banco genérico',
        },
        comportamento_visual: 'Sóbrio',
      },
    })}</brand_memory_export>`,
  });

  assert.equal(slice.visual_risks[0], 'Visual identity operacional incompleta.');
  assert.equal(slice.dos.includes('Rigor'), true);
  assert.equal(slice.donts.includes('Genérico'), true);
});
