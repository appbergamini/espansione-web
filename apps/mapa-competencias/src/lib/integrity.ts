/**
 * Integridade do resultado: nenhuma página deve fabricar posição/estado/score
 * para completar um resultado real. Se um valor obrigatório estiver ausente,
 * registra um aviso de integridade em desenvolvimento e usa um fallback neutro.
 */
export function orWarn<T>(value: T | undefined, what: string, fallback: T): T {
  if (value === undefined && typeof import.meta !== "undefined" && import.meta.env?.DEV) {
    console.warn(`[Integridade] ${what} ausente no resultado atual.`);
  }
  return value ?? fallback;
}
