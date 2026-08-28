import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Wand2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScaleOption } from "@/components/scale-option";
import {
  activeItems,
  BLOCKS,
  itemsByBlock,
} from "@/data/methodology/assessmentItems";
import { usePrototype } from "@/prototype/context";
import { cn } from "@/lib/utils";

const TOTAL = activeItems.length; // 60 afirmações ativas

export default function Assessment() {
  const { answers, setAnswer, answeredCount, fillExampleAnswers, completeAssessment } =
    usePrototype();
  const navigate = useNavigate();
  const [block, setBlock] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const blockItems = useMemo(() => itemsByBlock(block + 1), [block]);
  const percent = Math.round((answeredCount / TOTAL) * 100);
  const pendingInBlock = blockItems.filter((item) => answers[item.id] == null);

  const requireBlockComplete = (): boolean => {
    if (pendingInBlock.length > 0) {
      setPendingIds(new Set(pendingInBlock.map((i) => i.id)));
      setHint("Responda às afirmações que faltam para continuar.");
      return false;
    }
    setPendingIds(new Set());
    setHint(null);
    return true;
  };

  const goNext = () => {
    if (!requireBlockComplete()) return;
    setBlock((b) => b + 1);
  };

  const handleConclude = () => {
    if (!requireBlockComplete()) return;
    const result = completeAssessment();
    if (result) {
      navigate("/organizando");
    } else {
      setHint("Responda às afirmações que faltam para continuar.");
    }
  };

  const handleSelect = (id: string, value: number) => {
    setAnswer(id, value);
    setPendingIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setHint(null);
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 md:py-14">
      {/* Cabeçalho do assessment */}
      <div className="mb-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-navy-800">
            Avaliação · Bloco {block + 1} de {BLOCKS}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full text-muted-foreground"
            title="Recurso de demonstração do protótipo — não faz parte da versão pública."
            onClick={() => {
              fillExampleAnswers();
              setPendingIds(new Set());
              setHint(null);
            }}
          >
            <Wand2 className="h-4 w-4" />
            Preencher respostas de exemplo
            <span className="ml-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-navy-800">
              Demo
            </span>
          </Button>
        </div>

        <Progress value={percent} className="h-2" />

        <div className="mt-5 rounded-2xl border border-white/70 bg-gradient-soft p-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            Pensando em como você tem agido nos últimos 6 meses no contexto
            profissional e do seu negócio, indique o quanto cada afirmação representa
            sua forma de agir.
          </p>
          <p className="mt-2 font-medium text-navy-900">
            Não há respostas certas ou erradas. Pense em como você age de fato — e não
            em como gostaria de agir.
          </p>
        </div>
      </div>

      {/* Legenda das extremidades */}
      <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-white/70 bg-gradient-soft px-4 py-3 text-center text-[11px] font-medium leading-tight text-muted-foreground sm:text-xs">
        <span className="max-w-[150px] text-left sm:max-w-[220px]">
          Não representa minha forma de agir
        </span>
        <span className="hidden flex-1 border-t border-dashed border-muted-foreground/30 sm:block" />
        <span className="max-w-[150px] text-right sm:max-w-[220px]">
          Representa muito minha forma de agir
        </span>
      </div>

      {/* Afirmações do bloco */}
      <Card className="overflow-hidden rounded-2xl shadow-card">
        <ul>
          {blockItems.map((item, idx) => {
            const value = answers[item.id] ?? null;
            const pending = pendingIds.has(item.id);
            return (
              <li
                key={item.id}
                className={cn(
                  "flex flex-col gap-4 border-l-2 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6",
                  idx !== 0 && "border-t border-border/70",
                  pending ? "border-status-prioridade bg-status-prioridade-bg/40" : "border-transparent"
                )}
              >
                <p className="text-[15px] leading-relaxed text-foreground">{item.text}</p>
                <div className="flex shrink-0 items-center justify-center gap-1.5 sm:justify-end">
                  {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                    <ScaleOption
                      key={n}
                      value={n}
                      selected={value === n}
                      onSelect={() => handleSelect(item.id, n)}
                    />
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      {hint && (
        <p className="mt-4 flex items-center gap-2 rounded-lg bg-status-prioridade-bg px-4 py-3 text-sm font-medium text-status-prioridade">
          <CheckCircle2 className="h-4 w-4" />
          {hint}
        </p>
      )}

      {/* Navegação */}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="text-muted-foreground">
            <Link to="/contexto">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
          {block > 0 && (
            <Button variant="outline" onClick={() => { setPendingIds(new Set()); setHint(null); setBlock(block - 1); }}>
              Bloco anterior
            </Button>
          )}
        </div>

        {block < BLOCKS - 1 ? (
          <Button onClick={goNext} size="lg" className="h-12 rounded-full px-6 text-base">
            Próximo bloco
            <ArrowRight className="h-5 w-5" />
          </Button>
        ) : (
          <Button onClick={handleConclude} size="lg" className="h-12 rounded-full px-6 text-base shadow-brand">
            Concluir
            <ArrowRight className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
