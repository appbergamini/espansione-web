import { useState } from "react";
import { Info, ListOrdered } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { CompetencySheet } from "@/components/competency-sheet";
import { ResultEmptyState } from "@/components/result-empty-state";
import { activeCompetencies, competencyById } from "@/data/methodology";
import type { Competency, CompetencyState } from "@/data/types";
import { MACROAREA_LABEL, STATE_LABEL } from "@/data/types";
import { usePrototype } from "@/prototype/context";
import { competencyResultById } from "@/services/assessment/methodologyEngine";
import { orWarn } from "@/lib/integrity";

/* Área de plotagem do SVG */
const W = 860;
const H = 620;
const X0 = 90;
const X1 = 820;
const Y0 = 46;
const Y1 = 556;

const px = (v: number) => X0 + (v / 100) * (X1 - X0);
const py = (v: number) => Y1 - (v / 100) * (Y1 - Y0);

/** Linhas de referência (internas): R = 50 (vertical) e N = 33 (horizontal). */
const RX = px(50);
const NY = py(33);

const shorten = (name: string, max = 26) =>
  name.length > max ? `${name.slice(0, max - 1)}…` : name;

interface PlacedLabel {
  id: string;
  x: number;
  top: number;
  w: number;
  h: number;
  text: string;
}

function layoutLabels(items: (Omit<PlacedLabel, "top"> & { y: number })[]): PlacedLabel[] {
  const placed: { x1: number; x2: number; y1: number; y2: number }[] = [];
  return items
    .slice()
    .sort((a, b) => a.y - b.y)
    .map((l) => {
      let top = l.y;
      let guard = 0;
      let collided = true;
      while (collided && guard < 40) {
        collided = false;
        for (const r of placed) {
          if (
            l.x - l.w / 2 < r.x2 &&
            l.x + l.w / 2 > r.x1 &&
            top - l.h < r.y2 &&
            top > r.y1
          ) {
            top = r.y2 + 4;
            collided = true;
            break;
          }
        }
        guard += 1;
      }
      top = Math.min(Math.max(top, Y0), Y1 - l.h - 4);
      placed.push({ x1: l.x - l.w / 2, x2: l.x + l.w / 2, y1: top - l.h, y2: top });
      return { ...l, top };
    });
}

interface Point {
  id: string;
  x: number;
  y: number;
  text: string;
  isPriority: boolean;
}

export default function Matriz() {
  const { latestAssessment } = usePrototype();
  const [selected, setSelected] = useState<Competency | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  if (!latestAssessment) return <ResultEmptyState />;

  // Single source of truth: usa EXCLUSIVAMENTE as 14 competências ativas e os
  // competencyResults do result atual. Persuasão de Compra não aparece.
  const realResults = competencyResultById(latestAssessment.competencyResults);

  const coordsOf = (competencyId: string): { relevancia: number; necessidade: number } => {
    const r = realResults.get(competencyId);
    if (!r) {
      console.warn(`[Integridade] competencyResult ausente para ${competencyId}.`);
      return { relevancia: 50, necessidade: 50 };
    }
    return { relevancia: r.relevance, necessidade: r.need };
  };

  const stateOf = (competencyId: string): CompetencyState =>
    orWarn(realResults.get(competencyId)?.state, `estado da competência ${competencyId}`, "observacao");

  const points: Point[] = activeCompetencies.map((c) => {
    const coords = coordsOf(c.id);
    return {
      id: c.id,
      x: px(coords.relevancia),
      y: py(coords.necessidade),
      text: shorten(c.displayName),
      isPriority: stateOf(c.id) === "prioridade",
    };
  });

  const labels = layoutLabels(
    points
      .filter((p) => p.isPriority)
      .map((p) => ({
        id: p.id,
        x: p.x,
        y: p.y - 16 - 19,
        w: shorten(p.text).length * 7.8,
        h: 19,
        text: p.text,
      }))
  );

  const ranked = [...activeCompetencies]
    .map((c) => {
      const r = realResults.get(c.id);
      return {
        competency: c,
        score: r?.priorityIndex ?? 0,
        isPriority: r?.state === "prioridade",
      };
    })
    .sort((a, b) => Number(b.isPriority) - Number(a.isPriority) || b.score - a.score);

  const labelById = new Map(labels.map((l) => [l.id, l]));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <div className="mb-8 max-w-3xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-navy-800">
          Matriz do Próximo Nível
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-navy-950 sm:text-4xl">
          Onde concentrar atenção
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          As competências são posicionadas conforme a relevância para o próximo nível
          (horizontal) e a necessidade de adaptação ou desenvolvimento no momento atual
          (vertical). O quadrante destacado reúne o que mais pede atenção agora.
        </p>
      </div>

      <Card className="rounded-2xl border-white/70 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 p-6 pb-2">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-2 font-medium text-navy-950">
              <span className="h-3 w-3 rounded-full bg-status-prioridade" />
              {STATE_LABEL.prioridade}
            </span>
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-full bg-navy-800" />
              Demais competências
            </span>
          </div>
          <span className="text-xs text-muted-foreground">Passe o mouse para ver o nome completo</span>
        </div>

        <div className="overflow-x-auto px-2 pb-4">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full min-w-[620px]"
            role="img"
            aria-label="Matriz do próximo nível: relevância para o próximo nível versus necessidade de desenvolvimento"
          >
            <rect
              x={RX}
              y={Y0}
              width={X1 - RX}
              height={NY - Y0}
              fill="hsl(353 69% 46% / 0.055)"
              stroke="hsl(353 69% 46% / 0.45)"
              strokeDasharray="6 5"
              strokeWidth="1.2"
            />

            <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke="hsl(214 30% 82%)" strokeWidth="1" />
            <line x1={X0} y1={NY} x2={X1} y2={NY} stroke="hsl(214 30% 86%)" strokeWidth="1" strokeDasharray="3 4" />
            <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke="hsl(214 30% 82%)" strokeWidth="1" />
            <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke="hsl(214 30% 82%)" strokeWidth="1" />
            <line x1={RX} y1={Y0} x2={RX} y2={Y1} stroke="hsl(214 30% 86%)" strokeWidth="1" strokeDasharray="3 4" />
            <line x1={X1} y1={Y0} x2={X1} y2={Y1} stroke="hsl(214 30% 82%)" strokeWidth="1" />

            <text x={RX + 14} y={Y0 + 20} className="fill-status-prioridade" style={{ fontSize: 13, fontWeight: 700 }}>
              Zona de maior convergência
            </text>
            <text x={X0 + 14} y={Y0 + 20} className="fill-muted-foreground" style={{ fontSize: 12, fontWeight: 600, opacity: 0.85 }}>
              Maior necessidade · menor relevância
            </text>
            <text x={RX + 14} y={Y1 - 12} className="fill-muted-foreground" style={{ fontSize: 12, fontWeight: 600, opacity: 0.85 }}>
              Alta relevância · menor necessidade
            </text>
            <text x={X0 + 14} y={Y1 - 12} className="fill-muted-foreground" style={{ fontSize: 12, fontWeight: 600, opacity: 0.85 }}>
              Menor necessidade · menor relevância
            </text>

            <text x={X0} y={Y1 + 28} className="fill-muted-foreground" style={{ fontSize: 12, fontWeight: 600 }}>
              Baixa relevância para o próximo nível
            </text>
            <text x={X1} y={Y1 + 28} textAnchor="end" className="fill-navy-950" style={{ fontSize: 12, fontWeight: 700 }}>
              Alta relevância →
            </text>

            <text
              transform={`rotate(-90 ${X0 - 42} ${Y0})`}
              x={X0 - 42}
              y={Y0}
              textAnchor="end"
              className="fill-navy-950"
              style={{ fontSize: 12, fontWeight: 700 }}
            >
              Maior necessidade de desenvolvimento
            </text>
            <text
              transform={`rotate(-90 ${X0 - 42} ${Y1})`}
              x={X0 - 42}
              y={Y1}
              textAnchor="end"
              className="fill-muted-foreground"
              style={{ fontSize: 12, fontWeight: 600 }}
            >
              Menor necessidade de desenvolvimento
            </text>

            {/* Nomes dos FOCUS sempre visíveis na web (com collision avoidance) */}
            <g className="print:hidden">
              {points
                .filter((p) => p.isPriority)
                .map((p) => {
                  const label = labelById.get(p.id);
                  if (!label) return null;
                  const fullName = competencyById.get(p.id)?.displayName ?? p.text;
                  return (
                    <text
                      key={p.id}
                      x={p.x}
                      y={label.top + label.h - 3}
                      textAnchor="middle"
                      className="fill-status-prioridade"
                      style={{ fontSize: 12.5, fontWeight: 700, paintOrder: "stroke", stroke: "#ffffff", strokeWidth: 3 }}
                    >
                      {fullName.length > 26 ? label.text : fullName}
                    </text>
                  );
                })}
            </g>

            {/* Print/PDF: marcadores numerados 01–14 (legenda = lista abaixo) */}
            <g className="hidden print:block">
              {ranked.map(({ competency }, idx) => {
                const p = points.find((pp) => pp.id === competency.id);
                if (!p) return null;
                const num = String(idx + 1).padStart(2, "0");
                return (
                  <g key={competency.id}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={p.isPriority ? 10 : 6.5}
                      fill={p.isPriority ? "#c72437" : "#ffffff"}
                      stroke={p.isPriority ? "#c72437" : "#1f2a44"}
                      strokeWidth={1.5}
                    />
                    <text
                      x={p.x}
                      y={p.y + (p.isPriority ? 3.5 : 2.5)}
                      textAnchor="middle"
                      fill={p.isPriority ? "#ffffff" : "#1f2a44"}
                      style={{ fontSize: p.isPriority ? 8 : 6.5, fontWeight: 700 }}
                    >
                      {num}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* Pontos */}
            {points.map((p) => {
              const fullName = competencyById.get(p.id)?.displayName ?? p.id;
              return (
                <g
                  key={p.id}
                  onClick={() => setSelected(competencyById.get(p.id)!)}
                  onMouseEnter={() => setHovered(p.id)}
                  onMouseLeave={() => setHovered(null)}
                  className="cursor-pointer"
                >
                  <title>{fullName}</title>
                  {hovered === p.id && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={p.isPriority ? 15 : 11}
                      fill="none"
                      stroke={p.isPriority ? "hsl(353 69% 46% / 0.4)" : "hsl(214 100% 30% / 0.3)"}
                      strokeWidth={1.5}
                    />
                  )}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={p.isPriority ? 9 : 5.5}
                    className={p.isPriority ? "fill-status-prioridade" : "fill-navy-800"}
                    opacity={p.isPriority ? 1 : 0.85}
                    stroke="#ffffff"
                    strokeWidth={p.isPriority ? 2.5 : 1}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </Card>

      {/* Lista ordenada por prioridade */}
      <Card className="mt-6 rounded-2xl shadow-card">
        <div className="flex items-center gap-2 p-6 pb-4">
          <ListOrdered className="h-4 w-4 text-navy-800" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-navy-800">
            Competências por prioridade
          </h2>
        </div>
        <ol className="px-3 pb-3">
          {ranked.map(({ competency: c, isPriority }, i) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setSelected(c)}
                className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-secondary"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    className={
                      isPriority
                        ? "font-display text-lg font-semibold text-status-prioridade"
                        : "font-display text-lg font-semibold text-navy-800/30"
                    }
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-foreground">{c.displayName}</span>
                    <span className="block text-xs text-muted-foreground">
                      {MACROAREA_LABEL[c.category]}
                    </span>
                  </span>
                </span>
                <StatusBadge state={stateOf(c.id)} />
              </button>
            </li>
          ))}
        </ol>
      </Card>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-white/70 bg-gradient-soft p-5 text-sm leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-navy-800" />
        <p>
          As competências mais acima e à direita combinam maior relevância para o
          próximo nível com maior necessidade de adaptação ou desenvolvimento no
          momento atual.
        </p>
      </div>

      <CompetencySheet competency={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </div>
  );
}
