import { ShieldCheck, Eye, AlertTriangle, type LucideIcon } from "lucide-react";
import type { CompetencyState } from "@/data/types";
import { STATE_LABEL } from "@/data/types";
import { cn } from "@/lib/utils";

const STATE_META: Record<CompetencyState, { icon: LucideIcon; className: string }> = {
  base: {
    icon: ShieldCheck,
    className: "bg-status-base-bg text-status-base border-status-base/25",
  },
  observacao: {
    icon: Eye,
    className: "bg-status-observacao-bg text-status-observacao border-status-observacao/30",
  },
  prioridade: {
    icon: AlertTriangle,
    className: "bg-status-prioridade-bg text-status-prioridade border-status-prioridade/25",
  },
};

export function StatusBadge({ state, className }: { state: CompetencyState; className?: string }) {
  const meta = STATE_META[state];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        meta.className,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {STATE_LABEL[state]}
    </span>
  );
}
