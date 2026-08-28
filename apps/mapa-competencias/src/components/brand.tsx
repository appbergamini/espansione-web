import { cn } from "@/lib/utils";

/**
 * Logotipo oficial da Espansione — arquivo oficial (não redesenhar, não
 * alterar proporções). O lockup já inclui o símbolo, o wordmark "espansione"
 * e a assinatura "Crescimento Integrado".
 */
export function BrandLogo({ className }: { className?: string }) {
  return (
    <img
      src="/logo-espansione.png"
      alt="Espansione — Crescimento Integrado"
      className={cn("h-auto w-auto object-contain", className)}
    />
  );
}

/** Cabeçalho com a marca oficial (presença discreta, porém maior). */
export function BrandHeader({ className }: { className?: string }) {
  return <BrandLogo className={cn("h-10 md:h-11", className)} />;
}
