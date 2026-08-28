import { ArrowRight, MoveRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { behaviorById, competencyById } from "@/data/methodology";
import { MACROAREA_LABEL } from "@/data/types";
import { usePrototype } from "@/prototype/context";
import { competencyResultById } from "@/services/assessment/methodologyEngine";
import { ResultEmptyState } from "@/components/result-empty-state";
import { directionPhrase } from "@/lib/direction";

export default function Prioridades() {
  const { latestAssessment } = usePrototype();

  if (!latestAssessment) return <ResultEmptyState />;

  const realResults = competencyResultById(latestAssessment.competencyResults);
  const focusIds = latestAssessment.focusCompetencyIds;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 md:py-16">
      <div className="mb-12">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-navy-800">
          Prioridades de desenvolvimento
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-navy-950 sm:text-4xl">
          Compreender as prioridades
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
          As competências abaixo reúnem o que o próximo nível exige de você neste
          momento — e os comportamentos que mais influenciam cada prioridade.
        </p>
      </div>

      <div className="space-y-16">
        {focusIds.map((id, i) => {
          const comp = competencyById.get(id)!;
          const result = realResults.get(id)!;
          const keyBehaviorIds = result.keyBehaviors.map((kb) => kb.behaviorId);
          const movements = result.keyBehaviors;
          const state = result.state;

          return (
            <section key={id} className="print-block">
              <div className="mb-6 flex items-start gap-5">
                <span className="font-display text-5xl font-semibold leading-none text-navy-800/20 sm:text-6xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{MACROAREA_LABEL[comp.category]}</Badge>
                    <StatusBadge state={state} />
                  </div>
                  <h2 className="font-display text-2xl font-semibold leading-snug tracking-tight text-navy-950 sm:text-3xl">
                    {comp.displayName}
                  </h2>
                  <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
                    {comp.description}
                  </p>
                </div>
              </div>

              <div className="space-y-8 pl-0 sm:pl-[72px]">
                <section>
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-navy-800">
                    Comportamentos que mais influenciam esta prioridade
                  </h3>
                  <ul className="space-y-2.5 rounded-2xl border border-white/70 bg-gradient-soft p-5">
                    {keyBehaviorIds.map((bid) => {
                      const b = behaviorById.get(bid);
                      if (!b) return null;
                      return (
                        <li key={bid} className="flex items-center gap-2 text-sm text-foreground">
                          <span className="h-2 w-2 shrink-0 rounded-full bg-navy-800" />
                          {b.displayName}
                        </li>
                      );
                    })}
                  </ul>
                </section>

                <section className="flex items-start gap-3 rounded-2xl border border-white/70 bg-gradient-soft p-5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-800 text-white">
                    <MoveRight className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-navy-800">
                      Direção de desenvolvimento
                    </h3>
                    {movements.length > 0 ? (
                      <ul className="space-y-2 text-[15px] leading-relaxed text-foreground">
                        {movements.map((m) => {
                          const b = behaviorById.get(m.behaviorId);
                          if (!b) return null;
                          return (
                            <li key={m.behaviorId} className="flex items-start gap-2">
                              <span className="h-2 w-2 shrink-0 rounded-full bg-navy-800/60" />
                              <span>
                                <span className="font-medium">{b.displayName}:</span>{" "}
                                {directionPhrase(b, m.movement)}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-[15px] leading-relaxed text-muted-foreground italic">
                        Em preparação — será calculado após a conclusão do Assessment.
                      </p>
                    )}
                  </div>
                </section>
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-14 flex flex-col items-center gap-4 rounded-2xl border border-white/70 bg-gradient-soft p-8 text-center">
        <h3 className="font-display text-xl font-semibold text-navy-950">
          Agora, transforme em ação
        </h3>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Monte o seu plano de desenvolvimento com os comportamentos-chave e a direção
          de desenvolvimento.
        </p>
        <Button asChild size="lg" className="h-12 rounded-full px-7 text-base shadow-brand">
          <Link to="/plano">
            Ver Plano de Desenvolvimento
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
