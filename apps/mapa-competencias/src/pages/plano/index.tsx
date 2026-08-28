import { ArrowRight, BookOpen, PenLine, Printer } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BrandLogo } from "@/components/brand";
import { behaviorById, competencyById } from "@/data/methodology";
import { MACROAREA_LABEL } from "@/data/types";
import { usePrototype } from "@/prototype/context";
import { competencyResultById } from "@/services/assessment/methodologyEngine";
import { ResultEmptyState } from "@/components/result-empty-state";
import { directionPhrase } from "@/lib/direction";

function JourneyStep({
  index,
  label,
  children,
}: {
  index: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="print-block flex flex-1 flex-col rounded-2xl border border-white/70 bg-gradient-soft p-5 shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy-800 text-[11px] font-bold text-white">
          {index}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-navy-800">{label}</span>
      </div>
      <div className="flex-1 text-sm leading-relaxed text-foreground">{children}</div>
    </div>
  );
}

function Connector() {
  return (
    <div className="flex items-center justify-center py-1 print:hidden md:px-1 md:py-0">
      <ArrowRight className="h-5 w-5 rotate-90 text-navy-800/50 md:rotate-0" />
    </div>
  );
}

export default function Plano() {
  const { participant, selectedChallenges, latestAssessment } = usePrototype();

  if (!latestAssessment) return <ResultEmptyState />;

  const realResults = competencyResultById(latestAssessment.competencyResults);
  const focusIds = latestAssessment.focusCompetencyIds;
  const today = new Date().toLocaleDateString("pt-BR");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      {/* Cabeçalho de impressão (somente no print) */}
      <div className="mb-8 hidden border-b border-black/10 pb-6 print:block">
        <BrandLogo className="h-14" />
        <p className="mt-3 text-sm text-muted-foreground">
          Mapa de Competências para o Próximo Nível · {participant.name} · {today}
        </p>
      </div>

      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-navy-800">
            Plano de Desenvolvimento
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-navy-950 sm:text-4xl">
            A jornada até o próximo nível
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Das prioridades do seu Mapa aos materiais de desenvolvimento recomendados —
            para transformar intenção em ação.
          </p>
        </div>
        <Button
          onClick={() => window.print()}
          variant="outline"
          size="lg"
          className="no-print shrink-0 rounded-full border-navy-800/20 text-navy-900"
        >
          <Printer className="h-4 w-4" />
          Imprimir / Salvar PDF
        </Button>
      </div>

      {/* Jornadas por prioridade */}
      <div className="space-y-12">
        {focusIds.map((id, i) => {
          const comp = competencyById.get(id)!;
          const result = realResults.get(id)!;
          const keyBehaviorIds = result.keyBehaviors.map((kb) => kb.behaviorId);
          const movements = result.keyBehaviors;

          return (
            <section key={id} className="print-block">
              <div className="mb-5 flex items-center gap-3">
                <Badge className="bg-status-prioridade text-white">
                  Prioridade {i + 1}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {MACROAREA_LABEL[comp.category]}
                </span>
              </div>

              <div className="flex flex-col md:flex-row md:items-stretch">
                <JourneyStep index="1" label="Competência">
                  <p className="font-display text-lg font-semibold leading-snug text-navy-950">
                    {comp.displayName}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{comp.description}</p>
                </JourneyStep>

                <Connector />

                <JourneyStep index="2" label="Comportamentos-chave">
                  <ul className="space-y-1.5">
                    {keyBehaviorIds.map((bid) => {
                      const b = behaviorById.get(bid);
                      if (!b) return null;
                      return (
                        <li key={bid} className="flex items-start gap-2">
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-navy-800" />
                          {b.displayName}
                        </li>
                      );
                    })}
                  </ul>
                </JourneyStep>

                <Connector />

                <JourneyStep index="3" label="Direção de desenvolvimento">
                  {movements.length > 0 ? (
                    <ul className="space-y-2">
                      {movements.map((m) => {
                        const b = behaviorById.get(m.behaviorId);
                        if (!b) return null;
                        return (
                          <li key={m.behaviorId} className="text-xs leading-snug">
                            <span className="font-semibold text-navy-950">
                              {b.displayName}
                            </span>
                            <br />
                            {directionPhrase(b, m.movement)}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-xs italic text-muted-foreground">
                      Em preparação — será calculado após a conclusão do Assessment.
                    </p>
                  )}
                </JourneyStep>

                <Connector />

                <JourneyStep index="4" label="Material recomendado">
                  <div className="flex items-start gap-2">
                    <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-navy-800" />
                    <div>
                      <p className="font-semibold text-navy-950">Material em preparação</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        A seleção oficial das apostilas será definida após o inventário
                        dos materiais.
                      </p>
                    </div>
                  </div>
                </JourneyStep>
              </div>
            </section>
          );
        })}
      </div>

      {/* Intenção em Ação */}
      <Card className="print-block mt-14 rounded-2xl border-2 border-navy-800/20 p-6 shadow-card sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-brand">
            <PenLine className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-navy-800">
              Intenção em Ação
            </p>
            <h2 className="font-display mt-1 text-2xl font-semibold tracking-tight text-navy-950">
              Entre as prioridades apresentadas, qual você vai começar a desenvolver e
              o que pretende colocar em prática primeiro?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Registre uma decisão concreta de aplicação para iniciar seu próximo ciclo
              de desenvolvimento.
            </p>
            <Textarea
              className="mt-4 min-h-[120px] rounded-xl bg-gradient-soft"
              placeholder="Ex.: Vou começar por... e, nas próximas semanas, pretendo colocar em prática..."
            />
          </div>
        </div>
      </Card>

      {/* Contexto para impressão */}
      <div className="mt-10 hidden grid-cols-2 gap-6 text-sm text-muted-foreground print:grid">
        <div>
          <p className="font-semibold text-navy-950">Participante</p>
          <p>
            {participant.name} · {participant.atuacao} · {participant.empresa}
          </p>
        </div>
        <div>
          <p className="font-semibold text-navy-950">Desafio declarado</p>
          <p>{selectedChallenges.map((c) => c.label).join(" · ")}</p>
        </div>
      </div>
    </div>
  );
}
