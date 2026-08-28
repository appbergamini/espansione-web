import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrandLogo } from "@/components/brand";
import { cn } from "@/lib/utils";

const STATUS = [
  "Consolidando suas respostas",
  "Mapeando seus comportamentos",
  "Conectando com o próximo nível",
];

export default function Transicao() {
  const navigate = useNavigate();
  const [statusIdx, setStatusIdx] = useState(0);

  useEffect(() => {
    const statusTimer = setInterval(() => {
      setStatusIdx((i) => Math.min(i + 1, STATUS.length - 1));
    }, 800);
    const redirectTimer = setTimeout(() => navigate("/dashboard", { replace: true }), 2800);
    return () => {
      clearInterval(statusTimer);
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-24 text-center">
      <div className="animate-rise flex flex-col items-center">
        <div className="relative">
          <BrandLogo className="h-16" />
          <span className="absolute -inset-6 -z-10 animate-ping rounded-3xl bg-blue-light/30" style={{ animationDuration: "1.6s" }} />
        </div>

        <h1 className="font-display mt-8 text-3xl font-semibold tracking-tight text-navy-950 sm:text-4xl">
          Organizando seu Mapa.
        </h1>

        <div className="mt-6 flex h-5 items-center gap-2 text-sm text-muted-foreground">
          {STATUS.map((label, i) => (
            <span
              key={label}
              className={cn(
                "transition-all duration-300",
                i < statusIdx ? "text-navy-800" : i === statusIdx ? "text-foreground" : "opacity-0"
              )}
            >
              {label}
            </span>
          ))}
          <span className="ml-1 flex items-center gap-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-navy-800" style={{ animationDelay: "0ms" }} />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-navy-800" style={{ animationDelay: "120ms" }} />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-navy-800" style={{ animationDelay: "240ms" }} />
          </span>
        </div>
      </div>
    </div>
  );
}
