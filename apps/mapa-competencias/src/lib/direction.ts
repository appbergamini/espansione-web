import type { Behavior, DevelopmentMovement } from "@/data/types";

/**
 * Direção de desenvolvimento em linguagem humana.
 * Nunca expor códigos internos (A/B, EXPAND, MODULATE) ao cliente.
 * Usa os labels humanos das duas direções do comportamento.
 */
export function directionPhrase(behavior: Behavior, movement: DevelopmentMovement): string {
  switch (movement) {
    case "EXPAND_A":
      return `Ampliar acesso a: ${behavior.directionALabel}`;
    case "EXPAND_B":
      return `Ampliar acesso a: ${behavior.directionBLabel}`;
    case "MODULATE_A":
      return `Usar ${behavior.directionALabel} com mais flexibilidade`;
    case "MODULATE_B":
      return `Usar ${behavior.directionBLabel} com mais flexibilidade`;
    case "MAINTAIN_FLEXIBILITY":
      return "Preservar flexibilidade entre as duas formas de agir";
  }
}
