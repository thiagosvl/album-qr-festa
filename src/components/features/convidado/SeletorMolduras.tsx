import { Slash } from "lucide-react";
import type { MolduraDto } from "@/types/festa.types";

interface SeletorMoldurasProps {
  molduras: MolduraDto[];
  molduraSelecionadaId: string | null;
  onSelectMoldura: (id: string | null) => void;
}

const MINIATURA =
  "relative h-[84px] w-[48px] shrink-0 overflow-hidden rounded-xl transition active:scale-95";

function classeEstado(ativa: boolean): string {
  return ativa
    ? "ring-[3px] ring-white"
    : "opacity-70 ring-1 ring-white/25 hover:opacity-100";
}

/** Faixa horizontal de molduras: o desenho da moldura é o que identifica a opção. */
export function SeletorMolduras({
  molduras,
  molduraSelecionadaId,
  onSelectMoldura,
}: SeletorMoldurasProps) {
  return (
    <div
      className="no-scrollbar flex items-center gap-2.5 overflow-x-auto px-1 py-1"
      role="group"
      aria-label="Molduras"
    >
      <button
        type="button"
        onClick={() => onSelectMoldura(null)}
        aria-pressed={molduraSelecionadaId === null}
        aria-label="Sem moldura"
        title="Sem moldura"
        className={`${MINIATURA} grid place-items-center bg-white/10 text-white ${classeEstado(
          molduraSelecionadaId === null
        )}`}
      >
        <Slash className="h-5 w-5" />
      </button>

      {molduras.map((moldura) => {
        const ativa = molduraSelecionadaId === moldura.id;
        return (
          <button
            key={moldura.id}
            type="button"
            onClick={() => onSelectMoldura(moldura.id)}
            aria-pressed={ativa}
            aria-label={moldura.nome}
            title={moldura.nome}
            className={`${MINIATURA} xadrez ${classeEstado(ativa)}`}
          >
            <img
              src={moldura.arquivo_url}
              alt=""
              className="h-full w-full object-contain"
            />
          </button>
        );
      })}
    </div>
  );
}
