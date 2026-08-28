import { useState } from "react";
import { Compass, Settings2, Users, ChevronRight, Info, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CompetencySheet } from "@/components/competency-sheet";
import { ResultEmptyState } from "@/components/result-empty-state";
import { StatusBadge } from "@/components/status-badge";
import { MACROAREA_ORDER, activeCompetencies } from "@/data/methodology";
import type { Competency, CompetencyState, Macroarea } from "@/data/types";
import { MACROAREA_LABEL } from "@/data/types";
import { usePrototype } from "@/prototype/context";
import { competencyResultById } from "@/services/assessment/methodologyEngine";
import { orWarn } from "@/lib/integrity";

const AREA_META: Record<Macroarea, { icon: LucideIcon; description: string }> = {
  Estrategicas: {
    icon: Compass,
    description: "Competências que orientam direção, decisão e crescimento do negócio.",
  },
  Laborais: {
    icon: Settings2,
    description: "Competências que sustentam a execução, a organização e a escala da operação.",
  },
  Relacionais: {
    icon: Users,
    description: "Competências que envolvem pessoas, time, parcerias e o próprio desenvolvimento.",
  },
};

export default function Competencias() {
  const { latestAssessment } = usePrototype();
  const [selected, setSelected] = useState<Competency | null>(null);

  if (!latestAssessment) return <ResultEmptyState />;

  const realResults = competencyResultById(latestAssessment.competencyResults);

  const stateOf = (competencyId: string): CompetencyState =>
    orWarn(realResults.get(competencyId)?.state, `estado da competência ${competencyId}`, "observacao");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <div className="mb-10 max-w-3xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-navy-800">
          Mapa das Competências
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-navy-950 sm:text-4xl">
          Seu Mapa de Competências para o Próximo Nível
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Veja como cada competência se relaciona aos comportamentos que a sustentam
          e quais merecem maior atenção diante do momento atual do seu negócio.
        </p>
      </div>

      <div className="mb-10 flex items-start gap-3 rounded-2xl border border-white/70 bg-gradient-soft p-4 text-sm leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-navy-800" />
        <p>
          Todas as competências deste Mapa fazem parte de uma jornada contínua de desenvolvimento.
          O Mapa não determina quais são mais ou menos importantes: ele indica onde
          concentrar energia diante do momento atual. À medida que você e o negócio evoluem,
          novas competências podem ganhar prioridade.
        </p>
      </div>

      <div className="space-y-12">
        {MACROAREA_ORDER.map((area) => {
          const meta = AREA_META[area];
          const Icon = meta.icon;
          const list = activeCompetencies.filter((c) => c.category === area);
          return (
            <section key={area}>
              <div className="mb-5 flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-800 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-semibold tracking-tight text-navy-950">
                    {MACROAREA_LABEL[area]}
                  </h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">{meta.description}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((comp) => (
                  <button
                    key={comp.id}
                    type="button"
                    onClick={() => setSelected(comp)}
                    className="group text-left"
                  >
                    <Card className="flex h-full flex-col rounded-2xl p-6 shadow-card transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-navy-800/30 group-hover:shadow-soft">
                      <div className="mb-4 flex items-center justify-between">
                        <StatusBadge state={stateOf(comp.id)} />
                        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-navy-800" />
                      </div>
                      <h3 className="font-display text-lg font-semibold leading-snug text-navy-950">
                        {comp.displayName}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                        {comp.description}
                      </p>
                    </Card>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <CompetencySheet competency={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </div>
  );
}
