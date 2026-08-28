import { ArrowRight, Bell, CheckCircle2, ExternalLink, Hourglass } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Training, TrainingState } from "@/data/types";

interface TrainingCtaProps {
  training: Training;
  state: TrainingState;
  /** "light" (fundo claro) ou "dark" (banner azul da marca) */
  variant?: "light" | "dark";
  className?: string;
}

/**
 * CTA de treinamento preparado para conversão comercial.
 * Estados: comingSoon · available · purchased.
 * Integração Greenn (checkout/área de membros) virá via API/webhook; enquanto
 * as URLs estiverem vazias, os botões ficam desabilitados (sem URLs fictícias).
 */
export function TrainingCta({ training, state, variant = "light", className }: TrainingCtaProps) {
  const dark = variant === "dark";

  const buttonBase = cn(
    "inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors",
    dark ? "bg-white text-navy-900 hover:bg-blue-light" : "bg-navy-800 text-white hover:bg-navy-900"
  );

  const disabledButton = cn(
    buttonBase,
    "cursor-not-allowed opacity-50 hover:bg-transparent"
  );

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {state === "comingSoon" && (
        <>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
              dark
                ? "border-white/30 bg-white/10 text-white"
                : "border-status-observacao/30 bg-status-observacao-bg text-status-observacao"
            )}
          >
            <Hourglass className="h-3.5 w-3.5" />
            Trilha em desenvolvimento
          </span>
          <button
            type="button"
            title="Você será avisado quando a trilha abrir (aviso configurado na integração)."
            className={buttonBase}
          >
            <Bell className="h-4 w-4" />
            Quero ser avisado quando abrir
          </button>
        </>
      )}

      {state === "available" && (
        <a
          href={training.greennCheckoutUrl || undefined}
          aria-disabled={!training.greennCheckoutUrl}
          className={training.greennCheckoutUrl ? buttonBase : cn(disabledButton, "pointer-events-none")}
          title={
            training.greennCheckoutUrl
              ? "Finalizar compra"
              : "Checkout será habilitado na integração com a Greenn."
          }
        >
          Conhecer esta trilha
          <ArrowRight className="h-4 w-4" />
        </a>
      )}

      {state === "purchased" && (
        <>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
              dark
                ? "border-white/30 bg-white/10 text-white"
                : "border-navy-800/20 bg-secondary text-navy-900"
            )}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Trilha adquirida
          </span>
          <a
            href={training.greennAccessUrl || undefined}
            aria-disabled={!training.greennAccessUrl}
            className={training.greennAccessUrl ? buttonBase : cn(disabledButton, "pointer-events-none")}
            title={
              training.greennAccessUrl
                ? "Abrir área de membros"
                : "Acesso será habilitado na integração com a Greenn."
            }
          >
            Acessar minha trilha
            <ExternalLink className="h-4 w-4" />
          </a>
        </>
      )}
    </div>
  );
}
