import test from 'node:test';
import assert from 'node:assert/strict';
import { Agent_06_VisaoGeral } from '../Agent_06_VisaoGeral.js';
import { extractStrategicTensionsFromAgent6Output } from '../../strategic-tensions/extract.js';

test('Agente 6 orienta export de strategic_tensions', () => {
  const prompt = Agent_06_VisaoGeral.getSystemPrompt();

  assert.match(prompt, /strategic_tensions/);
  assert.match(prompt, /Pontos de Escolha Estratégica/);
});

test('extrai strategic_tensions do brand_memory_export_json', () => {
  const slice = extractStrategicTensionsFromAgent6Output({
    agent_num: 6,
    brand_memory_export_json: {
      strategic_tensions: {
        summary: 'Resumo',
        tensions: [
          {
            title: 'Boutique ou escala',
            theme: 'Modelo',
            tension_summary: 'VI e VE divergem.',
            strategic_choice_needed: 'Escolher promessa.',
            risk_if_ignored: 'Campanha desalinhada.',
            status: 'open',
          },
        ],
      },
    },
  });

  assert.equal(slice.tensions.length, 1);
  assert.equal(slice.unresolved_count, 1);
});

test('output legado sem strategic_tensions nao quebra', () => {
  const slice = extractStrategicTensionsFromAgent6Output({
    agent_num: 6,
    conteudo: '<brand_memory_export>{"schema_version":"2.0","agent_id":6}</brand_memory_export>',
  });

  assert.deepEqual(slice.tensions, []);
});
