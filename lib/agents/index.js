import { Agent_00_Intake } from './Agent_00_Intake';
import { Agent_01_VisaoInterna } from './Agent_01_VisaoInterna';
import { Agent_02_VisaoExterna } from './Agent_02_VisaoExterna';
import { Agent_03_VisaoMercado } from './Agent_03_VisaoMercado';
import { Agent_04_Valores } from './Agent_04_Valores';
import { Agent_05_Diretrizes } from './Agent_05_Diretrizes';
import { Agent_06_Plataforma } from './Agent_06_Plataforma';
import { Agent_07_Verbal } from './Agent_07_Verbal';
import { Agent_08_Visual } from './Agent_08_Visual';
import { Agent_09_CX } from './Agent_09_CX';
import { Agent_10_Comunicacao } from './Agent_10_Comunicacao';

// Apenas exportando todos os agentes de um único lugar.
// Agentes 1 a 10 seriam mapeados aqui conforme a migração completa avançar.

export const AGENTS_MAP = {
  0: Agent_00_Intake,
  1: Agent_01_VisaoInterna,
  2: Agent_02_VisaoExterna,
  3: Agent_03_VisaoMercado,
  4: Agent_04_Valores,
  5: Agent_05_Diretrizes,
  6: Agent_06_Plataforma,
  7: Agent_07_Verbal,
  8: Agent_08_Visual,
  9: Agent_09_CX,
  10: Agent_10_Comunicacao
};
