import { Monitor, Moon, Sun } from "lucide-react";
import { TEMA, type Tema } from "@/constants";
import { cn } from "@/lib/utils";
import { useTema } from "@/providers/TemaProvider";

const OPCOES: { id: Tema; rotulo: string; Icone: typeof Sun }[] = [
  { id: TEMA.CLARO, rotulo: "Tema claro", Icone: Sun },
  { id: TEMA.SISTEMA, rotulo: "Tema do aparelho", Icone: Monitor },
  { id: TEMA.ESCURO, rotulo: "Tema escuro", Icone: Moon },
];

interface AlternadorTemaProps {
  /** `escuro` quando o botão fica sobre a sidebar, que é escura nos dois temas. */
  sobre?: "superficie" | "sidebar";
  className?: string;
}

export function AlternadorTema({
  sobre = "superficie",
  className,
}: AlternadorTemaProps) {
  const { tema, definirTema } = useTema();
  const naSidebar = sobre === "sidebar";

  return (
    <div
      role="radiogroup"
      aria-label="Tema da interface"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full p-0.5",
        naSidebar ? "bg-white/10" : "bg-muted",
        className
      )}
    >
      {OPCOES.map(({ id, rotulo, Icone }) => {
        const ativo = tema === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={ativo}
            aria-label={rotulo}
            title={rotulo}
            onClick={() => definirTema(id)}
            className={cn(
              "grid h-7 w-7 place-items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              ativo
                ? naSidebar
                  ? "bg-gema text-ameixa"
                  : "bg-card text-foreground shadow-sm dark:bg-accent"
                : naSidebar
                  ? "text-white/60 hover:text-white"
                  : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icone className="h-3.5 w-3.5" />
          </button>
        );
      })}
    </div>
  );
}
