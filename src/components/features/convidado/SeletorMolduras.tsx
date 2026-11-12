import { COR_DESTAQUE_MOLDURA_PADRAO } from "@/constants";
import { Ban } from "lucide-react";
import type { MolduraDto } from "@/types/festa.types";

export const VARIANTE_SELETOR = {
  ESCURO: "ESCURO",
  CLARO: "CLARO",
} as const;
type VarianteSeletor = (typeof VARIANTE_SELETOR)[keyof typeof VARIANTE_SELETOR];

export const TAMANHO_SELETOR = {
  MINI: "MINI",
  PADRAO: "PADRAO",
  GRANDE: "GRANDE",
} as const;
type TamanhoSeletor = (typeof TAMANHO_SELETOR)[keyof typeof TAMANHO_SELETOR];

const CLASSES_TAMANHO: Record<TamanhoSeletor, string> = {
  [TAMANHO_SELETOR.MINI]: "h-[68px] w-[38px]",
  [TAMANHO_SELETOR.PADRAO]: "h-[84px] w-[48px]",
  [TAMANHO_SELETOR.GRANDE]: "h-[108px] w-[61px]",
};

interface SeletorMoldurasProps {
  molduras: MolduraDto[];
  molduraSelecionadaId: string | null;
  onSelectMoldura: (id: string | null) => void;
  variante?: VarianteSeletor;
  corDestaque?: string;
  tamanho?: TamanhoSeletor;
}

export function SeletorMolduras({
  molduras,
  molduraSelecionadaId,
  onSelectMoldura,
  variante = VARIANTE_SELETOR.ESCURO,
  corDestaque = COR_DESTAQUE_MOLDURA_PADRAO,
  tamanho = TAMANHO_SELETOR.PADRAO,
}: SeletorMoldurasProps) {
  const claro = variante === VARIANTE_SELETOR.CLARO;

  const estado = (ativa: boolean) => ({
    className: ativa
      ? "ring-[3px]"
      : claro
        ? "ring-1 ring-ameixa/15 hover:ring-ameixa/30"
        : "opacity-70 ring-1 ring-white/25 hover:opacity-100",
    style: ativa ? { ["--tw-ring-color" as string]: corDestaque } : undefined,
  });

  const base = `xadrez relative shrink-0 snap-start overflow-hidden rounded-lg transition active:scale-95 ${CLASSES_TAMANHO[tamanho]}`;
  const semMoldura = estado(molduraSelecionadaId === null);

  return (
    <div
      className="no-scrollbar flex snap-x items-center gap-2.5 scroll-px-1.5 overflow-x-auto p-1.5"
      role="group"
      aria-label="Molduras"
    >
      <button
        type="button"
        onClick={() => onSelectMoldura(null)}
        aria-pressed={molduraSelecionadaId === null}
        aria-label="Sem moldura"
        title="Sem moldura"
        style={semMoldura.style}
        className={`${base} grid place-items-center ${semMoldura.className}`}
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-ameixa shadow-sm">
          <Ban className="h-4 w-4" />
        </span>
      </button>

      {molduras.map((moldura) => {
        const ativa = molduraSelecionadaId === moldura.id;
        const { className, style } = estado(ativa);
        return (
          <button
            key={moldura.id}
            type="button"
            onClick={() => onSelectMoldura(moldura.id)}
            aria-pressed={ativa}
            aria-label={moldura.nome}
            title={moldura.nome}
            style={style}
            className={`${base} ${className}`}
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
