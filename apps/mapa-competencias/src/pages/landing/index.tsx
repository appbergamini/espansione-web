import { ArrowRight, ArrowLeftRight, Scale, Target, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BipolarBar } from "@/components/bipolar-bar";
import { behaviorById } from "@/data/methodology";
import { getMockBehaviorScore } from "@/data/mock/mockResultsData";

const PRINCIPLES = [
  {
    icon: Scale,
    title: "O contexto importa",
    text: "Um comportamento pode contribuir em determinadas situações e exigir adaptação em outras. O valor está em saber quando cada forma de agir favorece o resultado.",
  },
  {
    icon: ArrowLeftRight,
    title: "Eixos comportamentais",
    text: "Cada comportamento é apresentado entre duas formas possíveis de agir. Sua posição mostra uma tendência atual, não uma nota.",
  },
  {
    icon: Target,
    title: "Competência em ação",
    text: "Competência é comportamento em ação, adequado ao contexto e orientado ao resultado. O Mapa conecta como você age ao que seu próximo nível exige.",
  },
];

export default function Landing() {
  const sampleBehavior = behaviorById.get("positividade-pessoas")!;

  return (
    <div className="bg-gradient-soft">
      {/* Hero */}
      <section className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.1fr_0.9fr] md:items-center md:py-24">
        <div className="animate-rise">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-navy-800/15 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-navy-800">
            Mapa de Competências · Espansione
          </p>
          <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight text-navy-950 sm:text-5xl lg:text-6xl">
            O que o próximo nível do seu negócio exige de você?
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Descubra quais competências ganham maior importância para o momento atual
            do seu negócio, como seus comportamentos influenciam essas competências e
            por onde começar seu desenvolvimento.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button asChild size="lg" className="h-12 rounded-full px-7 text-base shadow-brand">
              <Link to="/contexto">
                Iniciar meu Mapa
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Cerca de 8 a 10 minutos
            </span>
          </div>
        </div>

        {/* Preview do conceito */}
        <div className="animate-rise md:justify-self-end" style={{ animationDelay: "120ms" }}>
          <Card className="w-full max-w-sm rounded-2xl border-white/60 p-6 shadow-soft md:w-[360px]">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-navy-950">Como você age hoje</span>
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Eixo comportamental
              </span>
            </div>
            <BipolarBar
              behavior={sampleBehavior}
              score={getMockBehaviorScore(sampleBehavior.id)}
              showScore={false}
            />
            <p className="mt-4 border-t pt-4 text-[13px] leading-relaxed text-muted-foreground">
              Cada posição é apenas um ponto no mapa. O que importa é o que o próximo
              nível pede de você — e para onde se mover.
            </p>
          </Card>
        </div>
      </section>

      {/* Metodologia */}
      <section className="border-t border-white/60 bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <div className="mb-10 max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-navy-800">
              Metodologia
            </p>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-navy-950 sm:text-4xl">
              Entenda como você age hoje para ampliar o que o próximo nível exige
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {PRINCIPLES.map(({ icon: Icon, title, text }) => (
              <Card key={title} className="rounded-2xl border-white/70 p-6 shadow-card">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-navy-800 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-navy-950">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
              </Card>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Button asChild size="lg" className="h-12 rounded-full px-7 text-base shadow-brand">
              <Link to="/contexto">
                Iniciar meu Mapa
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
