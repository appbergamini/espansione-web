import { Link2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { BipolarBar } from "@/components/bipolar-bar";
import { competencyById } from "@/data/methodology";
import type { Behavior } from "@/data/types";

interface BehaviorDetailSheetProps {
  behavior: Behavior | null;
  /** posição atual no eixo (real do Assessment ou demonstração) */
  score: number;
  onOpenChange: (open: boolean) => void;
}

/**
 * Detalhamento de um comportamento (expansível).
 * Conteúdo estrutural: posição atual no eixo e competências relacionadas.
 * Leituras interpretativas só entrarão com a Base Oficial Espansione.
 */
export function BehaviorDetailSheet({ behavior, score, onOpenChange }: BehaviorDetailSheetProps) {
  const related = behavior?.relatedCompetencyIds
    .map((id) => competencyById.get(id))
    .filter((c) => Boolean(c));

  return (
    <Sheet open={Boolean(behavior)} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-lg md:max-w-2xl">
        {behavior && (
          <div className="flex h-full flex-col">
            <SheetHeader className="border-b bg-gradient-soft px-6 pb-5 pt-7 sm:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-navy-800">
                Comportamento · Eixo comportamental
              </p>
              <SheetTitle className="font-display text-2xl font-semibold text-navy-950 sm:text-3xl">
                {behavior.displayName}
              </SheetTitle>
              <BipolarBar behavior={behavior} score={score} showScore={false} className="mt-4" />
            </SheetHeader>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6 sm:px-8">
              <section>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-navy-800">
                  <Link2 className="h-4 w-4" />
                  Competências relacionadas
                </h4>
                <div className="flex flex-wrap gap-2">
                  {related?.map((c) => (
                    <Link key={c!.id} to="/competencias" onClick={() => onOpenChange(false)}>
                      <Badge
                        variant="secondary"
                        className="border-navy-800/15 bg-white py-1.5 text-navy-900 hover:bg-secondary"
                      >
                        {c!.displayName}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </section>

              <p className="text-[11px] text-muted-foreground">
                A posição indica sua tendência atual no eixo. Nenhuma direção é melhor
                que a outra — interpretações serão fornecidas com a Base Oficial
                Espansione.
              </p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
