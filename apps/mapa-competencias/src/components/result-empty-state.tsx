import { Target } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

/** Estado exibido nas páginas de resultado quando ainda não há Assessment concluído. */
export function ResultEmptyState() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-5 px-6 py-24 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-800 text-white">
        <Target className="h-6 w-6" />
      </div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-navy-950 sm:text-3xl">
        Conclua o Assessment para ver seus resultados
      </h1>
      <p className="text-base leading-relaxed text-muted-foreground">
        Responda as 5 etapas (60 afirmações) para gerar o seu Mapa de Competências.
      </p>
      <Button asChild size="lg" className="h-12 rounded-full px-7 text-base shadow-brand">
        <Link to="/assessment">Ir para o Assessment</Link>
      </Button>
    </div>
  );
}
