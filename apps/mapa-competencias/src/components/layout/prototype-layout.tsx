import { Link, Outlet, useLocation } from "react-router-dom";
import { BrandHeader } from "@/components/brand";
import { ResultsNav } from "@/components/layout/results-nav";
import { cn } from "@/lib/utils";

const RESULTS_ROUTES = [
  "/dashboard",
  "/competencias",
  "/comportamental",
  "/matriz",
  "/prioridades",
  "/plano",
];

const FLOW_STEPS = [
  { path: "/contexto", label: "Contexto" },
  { path: "/assessment", label: "Assessment" },
  { path: "/dashboard", label: "Resultado" },
];

export function PrototypeLayout() {
  const { pathname } = useLocation();
  const isResults = RESULTS_ROUTES.includes(pathname);
  const activeStep = FLOW_STEPS.findIndex((s) => pathname.startsWith(s.path));

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="no-print sticky top-0 z-40 border-b bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center">
            <BrandHeader />
          </Link>

          {!isResults && activeStep >= 0 && (
            <ol className="hidden items-center gap-6 sm:flex" aria-label="Progresso do fluxo">
              {FLOW_STEPS.map((step, i) => {
                const done = i < activeStep;
                const current = i === activeStep;
                return (
                  <li key={step.path} className="flex items-center gap-2">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        done && "bg-navy-800",
                        current && "bg-blue-light ring-4 ring-blue-light/25",
                        !done && !current && "bg-muted"
                      )}
                    />
                    <span
                      className={cn(
                        "text-xs font-medium",
                        current ? "text-navy-900" : done ? "text-navy-800/80" : "text-muted-foreground"
                      )}
                    >
                      {step.label}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}

          {!isResults && activeStep >= 0 && (
            <div className="flex items-center gap-1 sm:hidden">
              {FLOW_STEPS.map((step, i) => {
                const done = i < activeStep;
                const current = i === activeStep;
                return (
                  <span
                    key={step.path}
                    className={cn(
                      "h-1.5 w-6 rounded-full",
                      done && "bg-navy-800",
                      current && "bg-blue-light",
                      !done && !current && "bg-muted"
                    )}
                  />
                );
              })}
            </div>
          )}
        </div>

        {isResults && <ResultsNav />}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="no-print border-t bg-gradient-soft">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span className="font-medium text-navy-900">
            Espansione — Crescimento Integrado
          </span>
          <span>Mapa de Competências para o Próximo Nível · Protótipo de demonstração com dados fictícios.</span>
        </div>
      </footer>
    </div>
  );
}
