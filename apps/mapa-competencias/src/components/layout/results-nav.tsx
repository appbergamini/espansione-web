import {
  LayoutDashboard,
  Target,
  Scale,
  Grid3X3,
  ListChecks,
  Map,
  type LucideIcon,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const ITEMS: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/competencias", label: "Competências", icon: Target },
  { to: "/comportamental", label: "Comportamental", icon: Scale },
  { to: "/matriz", label: "Matriz", icon: Grid3X3 },
  { to: "/prioridades", label: "Prioridades", icon: ListChecks },
  { to: "/plano", label: "Plano", icon: Map },
];

/** Sub-navegação das telas de resultado (5–10). */
export function ResultsNav({ className }: { className?: string }) {
  return (
    <nav
      className={cn(
        "no-print flex items-center gap-1 overflow-x-auto border-b bg-white/70 px-4 backdrop-blur md:justify-center md:px-6",
        className
      )}
      aria-label="Seções de resultado"
    >
      {ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              "flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 text-sm font-medium transition-colors",
              isActive
                ? "border-navy-800 text-navy-900"
                : "border-transparent text-muted-foreground hover:text-navy-900"
            )
          }
        >
          <Icon className="h-4 w-4" />
          <span className="whitespace-nowrap">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
