import { ArrowRight, Bug, Flag, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { ResultEmptyState } from "@/components/result-empty-state";
import { behaviorById, competencyById, activeCompetencies } from "@/data/methodology";
import { MACROAREA_LABEL, STATE_LABEL, type CompetencyState } from "@/data/types";
import { usePrototype } from "@/prototype/context";
import {
  behaviorScoreById,
  competencyResultById,
} from "@/services/assessment/methodologyEngine";
import { orWarn } from "@/lib/integrity";
import { cn } from "@/lib/utils";

const STATE_ORDER: CompetencyState[] = ["observacao", "base"];
const IS_DEV = import.meta.env.DEV;

export default function Dashboard() {
  const { selectedChallenges, participant, latestAssessment } = usePrototype();

  // Single source of truth: sem Assessment concluído, não há resultado a exibir.
  if (!latestAssessment) return <ResultEmptyState />;

  const realResults = competencyResultById(latestAssessment.competencyResults);
  const realBehaviorScores = behaviorScoreById(latestAssessment.behaviorResults);
  const focusIds = latestAssessment.focusCompetencyIds;

  const scoreOf = (behaviorId: string): number =>
    orWarn(realBehaviorScores.get(behaviorId), `score do comportamento ${behaviorId}`, 50);

  const stateOf = (competencyId: string): CompetencyState =>
    orWarn(realResults.get(competencyId)?.state, `estado da competência ${competencyId}`, "observacao");

  const keyBehaviorIdsOf = (competencyId: string): string[] =>
    orWarn(
      realResults.get(competencyId)?.keyBehaviors.map((kb) => kb.behaviorId),
      `comportamentos-chave de ${competencyId}`,
      []
    );

  const byState = (state: CompetencyState) =>
    activeCompetencies.filter((c) => stateOf(c.id) === state);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <div className="mb-10 max-w-3xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-navy-800">
          {participant.name}
        </p>
        <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-navy-950 sm:text-4xl">
          O que o seu próximo nível está exigindo de você
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          O mapa conecta o desafio que você declarou às competências e comportamentos
          que merecem mais atenção neste momento. Nenhum percentual — apenas direção.
        </p>
      </div>

      {latestAssessment.isDemo && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-status-observacao/30 bg-status-observacao-bg p-4 text-sm leading-relaxed text-navy-900">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-navy-800" />
          <p>
            Visualização com dados de demonstração — o resultado real aparece após
            você concluir o Assessment sem o recurso de demonstração.
          </p>
        </div>
      )}

      {/* Desafio declarado */}
      <Card className="rounded-2xl border-white/70 bg-gradient-soft shadow-card">
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-800 text-white">
              <Flag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-navy-800">
                Desafio declarado
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                O que você quer que aconteça no próximo nível
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedChallenges.map((c) => (
              <span
                key={c.id}
                className="rounded-full border border-navy-800/15 bg-white px-3.5 py-1.5 text-sm font-medium text-navy-950"
              >
                {c.label}
              </span>
            ))}
          </div>
        </div>
      </Card>

      {/* Focos de Desenvolvimento Agora */}
      <div className="mt-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-navy-950">
              Focos de desenvolvimento
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Onde concentrar sua energia diante do momento atual
            </p>
          </div>
          <Link
            to="/prioridades"
            className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-navy-800 hover:underline sm:inline-flex"
          >
            Compreender as prioridades
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className={cn("grid gap-5", focusIds.length >= 4 ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-3")}>
          {focusIds.map((id, i) => {
            const comp = competencyById.get(id)!;
            const keyBehaviorIds = keyBehaviorIdsOf(id);
            return (
              <Card
                key={id}
                className="group flex flex-col overflow-hidden rounded-2xl border-t-4 shadow-card"
                style={{ borderTopColor: "hsl(var(--status-prioridade))" }}
              >
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-display text-4xl font-semibold text-navy-800/20">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <StatusBadge state={stateOf(id)} />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {MACROAREA_LABEL[comp.category]}
                  </p>
                  <h3 className="font-display mt-1 text-xl font-semibold leading-snug text-navy-950">
                    {comp.displayName}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                    {comp.description}
                  </p>
                  {keyBehaviorIds.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-navy-800">
                        Comportamentos que mais influenciam
                      </p>
                      <ul className="space-y-2">
                        {keyBehaviorIds.map((bid) => {
                          const b = behaviorById.get(bid);
                          if (!b) return null;
                          const score = scoreOf(bid);
                          return (
                            <li key={bid} className="flex items-center gap-2 text-sm text-foreground">
                              <span
                                className="h-2 w-2 shrink-0 rounded-full"
                                style={{
                                  background:
                                    score >= 35 && score <= 65
                                      ? "hsl(var(--status-observacao))"
                                      : "hsl(var(--navy-800))",
                                }}
                              />
                              {b.displayName}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                  <div className="mt-6">
                    <Button asChild variant="outline" className="w-full rounded-full text-navy-900">
                      <Link to="/prioridades">
                        Compreender prioridade
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Demais competências por estado */}
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {STATE_ORDER.map((state) => {
          const list = byState(state);
          if (list.length === 0) return null;
          return (
            <Card key={state} className="rounded-2xl shadow-card">
              <div className="flex items-center justify-between p-6 pb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-navy-800">
                  {STATE_LABEL[state]}
                </h3>
                <StatusBadge state={state} />
              </div>
              <ul className="px-3 pb-3">
                {list.map((comp) => (
                  <li key={comp.id}>
                    <Link
                      to="/competencias"
                      className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-secondary"
                    >
                      <span className="font-medium">{comp.displayName}</span>
                      <span className="text-xs text-muted-foreground">
                        {MACROAREA_LABEL[comp.category]}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>

      {/* Jornada contínua */}
      <div className="mt-10 flex items-start gap-3 rounded-2xl border border-white/70 bg-gradient-soft p-5 text-sm leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-navy-800" />
        <p>
          Todas as competências deste Mapa fazem parte de uma jornada contínua de
          desenvolvimento. O Mapa não determina quais são mais ou menos importantes:
          ele indica onde concentrar energia diante do momento atual. À medida que
          você e o negócio evoluem, novas competências podem ganhar prioridade.
        </p>
      </div>

      {/* Diagnóstico técnico (somente desenvolvimento) */}
      {IS_DEV && (
        <div className="mt-10 rounded-2xl border border-dashed border-navy-800/20 bg-white p-5 text-xs leading-relaxed text-muted-foreground">
          <p className="mb-2 flex items-center gap-2 font-semibold uppercase tracking-wider text-navy-800">
            <Bug className="h-4 w-4" />
            Diagnóstico técnico (desenvolvimento)
          </p>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
            <dt className="text-muted-foreground">resultId</dt>
            <dd className="font-mono">{latestAssessment.id}</dd>
            <dt>assessmentSessionId</dt>
            <dd className="font-mono">{latestAssessment.assessmentSessionId}</dd>
            <dt>isDemo</dt>
            <dd>{String(latestAssessment.isDemo)}</dd>
            <dt>createdAt</dt>
            <dd>{latestAssessment.createdAt}</dd>
            <dt>selectedChallenges</dt>
            <dd>{latestAssessment.contextData.selectedChallengeIds.join(", ")}</dd>
            <dt>assessmentItemsVersion</dt>
            <dd className="font-mono">{latestAssessment.assessmentItemsVersion}</dd>
            <dt>methodologyVersion</dt>
            <dd className="font-mono">{latestAssessment.methodologyVersion}</dd>
            <dt>functionalMatrixVersion</dt>
            <dd className="font-mono">{latestAssessment.functionalMatrixVersion}</dd>
            <dt>challengeMatrixVersion</dt>
            <dd className="font-mono">{latestAssessment.challengeMatrixVersion}</dd>
          </dl>
        </div>
      )}
    </div>
  );
}
