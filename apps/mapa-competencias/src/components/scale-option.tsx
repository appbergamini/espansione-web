import { cn } from "@/lib/utils";

interface ScaleOptionProps {
  value: number;
  selected: boolean;
  onSelect: (value: number) => void;
}

/** Botão circular da escala 1–7 do assessment. */
export function ScaleOption({ value, selected, onSelect }: ScaleOptionProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={`Escala ${value} de 7`}
      onClick={() => onSelect(value)}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold transition-all md:h-9 md:w-9",
        selected
          ? "border-navy-800 bg-navy-800 text-white shadow-brand"
          : "border-input bg-white text-foreground hover:border-navy-800/50 hover:bg-secondary"
      )}
    >
      {value}
    </button>
  );
}
