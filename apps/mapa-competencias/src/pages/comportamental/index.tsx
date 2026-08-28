import { useState } from "react";
import { ArrowLeftRight, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { BipolarBar } from "@/components/bipolar-bar";
import { BehaviorDetailSheet } from "@/components/behavior-detail-sheet";
import { ResultEmptyState } from "@/components/result-empty-state";
import { behaviors } from "@/data/methodology";
import type { Behavior } from "@/data/types";
import { usePrototype } from "@/prototype/context";
import { behaviorScoreById } from "@/services/assessment/methodologyEngine";
import { orWarn } from "@/lib/integrity";

export default function Comportamental() {
  const { latestAssessment } = usePrototype();
  const [selected, setSelected] = useState<Behavior | null>(null);

  if (!latestAssessment) return <ResultEmptyState />;

  const realBehaviorScores = behaviorScoreById(latestAssessment.behaviorResults);

  /** Posição real (0–100) no eixo — sem fallback mock. */
  const scoreOf = (behaviorId: string): number =>
    orWarn(realBehaviorScores.get(behaviorId), `score do comportamento ${behaviorId}`, 50);

  const selectedScore = selected ? scoreOf(selected.id) : 0;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <div className="mb-10 max-w-3xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-navy-800">
          Mapa Comportamental
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-navy-950 sm:text-4xl">
          Como você age em cada eixo
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {latestAssessment.isDemo
            ? "Resultados de demonstração (pré-piloto) — conclua o Assessment sem o recurso demo para gerar seus resultados."
            : `Resultados do seu Assessment · ${latestAssessment.assessmentVersion}`}
        </p>
      </div>

      <Card className="mb-10 flex items-start gap-4 rounded-2xl border-white/70 bg-gradient-soft p-6 shadow-card">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-800 text-white">
          <ArrowLeftRight className="h-5 w-5" />
        </div>
        <div className="text-sm leading-relaxed text-muted-foreground">
          <p>
            Cada comportamento é apresentado em um eixo com duas direções possíveis de ação. Sua
            posição indica uma tendência atual. Nenhuma direção é melhor que a outra: sua
            contribuição depende do contexto, da competência envolvida e do resultado esperado.
          </p>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {behaviors.map((b) => (
          <button key={b.id} type="button" onClick={() => setSelected(b)} className="group text-left">
            <Card className="flex h-full flex-col rounded-2xl p-5 shadow-card transition-all duration-200 group-hover:border-navy-800/30 group-hover:shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <BipolarBar behavior={b} score={scoreOf(b.id)} showScore={false} showPositionNote />
                </div>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-navy-800" />
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground print:hidden">
                Toque para ver as competências relacionadas.
              </p>
            </Card>
          </button>
        ))}
      </div>

      <BehaviorDetailSheet
        behavior={selected}
        score={selectedScore}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  );
}
