import type { Behavior } from "@/data/types";
import { cn } from "@/lib/utils";

interface BipolarBarProps {
  behavior: Behavior;
  /** posição atual no eixo comportamental (0 = direção A · 100 = direção B) */
  score: number;
  /** exibe o valor numérico (default true); false mostra "Sua posição atual" */
  showScore?: boolean;
  /** exibe nota metodológica de que nenhuma direção é "melhor" */
  showNote?: boolean;
  /** destaca que o número é posição no eixo, não desempenho */
  showPositionNote?: boolean;
  className?: string;
}

/**
 * Gráfico horizontal de eixo comportamental: Direção A — linha com marcador
 * central neutro — posição atual — Direção B, com posição 0–100.
 * Nenhuma direção é apresentada como "melhor"; o centro não é o ideal.
 */
export function BipolarBar({
  behavior,
  score,
  showScore = true,
  showNote = false,
  showPositionNote = false,
  className,
}: BipolarBarProps) {
  const { directionALabel, directionBLabel } = behavior;
  const centered = score >= 35 && score <= 65;

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold text-navy-950">{behavior.displayName}</span>
        {showScore ? (
          <span
            className={cn(
              "shrink-0 rounded-md px-2 py-0.5 text-xs font-bold tabular-nums",
              centered ? "bg-status-observacao-bg text-status-observacao" : "bg-secondary text-navy-900"
            )}
            title="Posição no eixo — não representa desempenho ou qualidade"
          >
            {Math.round(score)} / 100
          </span>
        ) : (
          <span className="shrink-0 text-[11px] font-medium text-muted-foreground">
            Sua posição atual
          </span>
        )}
      </div>

      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
        <span className="max-w-[120px] text-right text-[11px] font-medium leading-tight text-muted-foreground md:max-w-[150px] md:text-xs">
          {directionALabel}
        </span>

        <div className="relative h-2.5 rounded-full bg-secondary">
          {/* marcador central neutro — não é ideal */}
          <div className="absolute left-1/2 top-1/2 h-4 w-px -translate-x-1/2 -translate-y-1/2 border-l border-dashed border-muted-foreground/40" />
          {/* posição atual da pessoa */}
          <div
            className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-navy-800 shadow-card"
            style={{ left: `${score}%` }}
            aria-label={`Posição atual: ${score} de 100`}
          />
        </div>

        <span className="max-w-[120px] text-left text-[11px] font-medium leading-tight text-muted-foreground md:max-w-[150px] md:text-xs">
          {directionBLabel}
        </span>
      </div>

      {showPositionNote && (
        <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground/80">
          Este ponto indica sua posição atual no eixo. Não representa desempenho ou qualidade.
        </p>
      )}
      {showNote && (
        <p className="mt-1.5 text-[11px] italic leading-snug text-muted-foreground/80">
          Nenhuma direção é melhor que a outra — cada uma é um recurso adequado ao
          contexto e ao resultado esperado.
        </p>
      )}
    </div>
  );
}
