import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { BipolarBar } from "@/components/bipolar-bar";
import { StatusBadge } from "@/components/status-badge";
import { behaviorById } from "@/data/methodology";
import { MACROAREA_LABEL, type Competency, type CompetencyState } from "@/data/types";
import { usePrototype } from "@/prototype/context";
import { behaviorScoreById, competencyResultById } from "@/services/assessment/methodologyEngine";
import { orWarn } from "@/lib/integrity";

interface CompetencySheetProps {
  competency: Competency | null;
  onOpenChange: (open: boolean) => void;
}

/**
 * Detalhamento de uma competência.
 * Conteúdo estrutural confiável: categoria, estado (mesmo do card), definição,
 * comportamentos associados e posição atual em cada eixo. Textos interpretativos
 * só voltarão com a Base Interpretativa oficial (nada demonstrativo aqui).
 */
export function CompetencySheet({ competency, onOpenChange }: CompetencySheetProps) {
  const { latestAssessment } = usePrototype();
  const realResults = latestAssessment ? competencyResultById(latestAssessment.competencyResults) : null;
  const realBehaviorScores = latestAssessment ? behaviorScoreById(latestAssessment.behaviorResults) : null;

  const scoreOf = (behaviorId: string): number =>
    orWarn(realBehaviorScores?.get(behaviorId), `score do comportamento ${behaviorId}`, 50);

  /** Estado SEMPRE vindo do mesmo result do card (nunca fallback hardcoded). */
  const state: CompetencyState | null = competency
    ? realResults?.get(competency.id)?.state ?? null
    : null;

  const commercialContextActive = latestAssessment?.commercialContextActive ?? false;
  const showCommercialApplication =
    competency?.id === "influencia-persuasao" && commercialContextActive;

  const behaviors = competency?.behaviorIds
    .map((id) => behaviorById.get(id))
    .filter((b) => Boolean(b));

  return (
    <Sheet open={Boolean(competency)} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-lg md:max-w-2xl">
        {competency && (
          <div className="flex h-full flex-col">
            <SheetHeader className="border-b bg-gradient-soft px-6 pb-5 pt-7 sm:px-8">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="bg-white/70">
                  {MACROAREA_LABEL[competency.category]}
                </Badge>
                {state && <StatusBadge state={state} />}
              </div>
              <SheetTitle className="font-display text-2xl font-semibold text-navy-950 sm:text-3xl">
                {competency.displayName}
              </SheetTitle>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {competency.description}
              </p>
            </SheetHeader>

            <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6 sm:px-8">
              {showCommercialApplication && (
                <section className="rounded-xl border border-navy-800/15 bg-white p-4 shadow-card">
                  <p className="text-sm font-semibold uppercase tracking-wider text-navy-800">
                    Aplicação no seu contexto
                  </p>
                  <p className="mt-1 text-sm font-semibold text-navy-950">
                    Influência em decisões de compra
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    Quando a atuação envolve vendas ou desafios comerciais, esta
                    competência também se aplica à capacidade de influenciar decisões
                    de compra.
                  </p>
                </section>
              )}

              <section>
                <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-navy-800">
                  Comportamentos associados a esta competência
                </h4>
                <div className="space-y-4">
                  {behaviors?.map((b) => (
                    <BipolarBar
                      key={b!.id}
                      behavior={b!}
                      score={scoreOf(b!.id)}
                      showScore={false}
                    />
                  ))}
                </div>
              </section>

              <p className="text-[11px] text-muted-foreground">
                As posições indicam sua tendência atual no eixo. Interpretações serão
                fornecidas com a Base Oficial Espansione.
              </p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
