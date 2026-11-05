import { ArrowLeft, Camera, Tv } from "lucide-react";
import { Link } from "react-router-dom";
import type { AbaGaleriaConvidado } from "@/hooks/ui/useConvidadoViewModel";
import type { EventoPublicoDto } from "@/types/festa.types";

interface ConvidadoHeaderProps {
  evento: EventoPublicoDto;
  abaGaleria: AbaGaleriaConvidado;
  onChangeAba: (aba: AbaGaleriaConvidado) => void;
  todasMidiasCount: number;
  minhasMidiasCount: number;
  onVoltar: () => void;
}

export function ConvidadoHeader({
  evento,
  abaGaleria,
  onChangeAba,
  todasMidiasCount,
  minhasMidiasCount,
  onVoltar,
}: ConvidadoHeaderProps) {
  const mostrarAbas = evento.galeria_publica;
  const abas = [
    { id: "MURAL" as const, rotulo: "Todas", total: todasMidiasCount },
    { id: "MINHAS" as const, rotulo: "Minhas", total: minhasMidiasCount },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-ameixa/10 bg-papel/90 backdrop-blur-md">
      <div className="mx-auto max-w-5xl space-y-3 px-4 pb-3 pt-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onVoltar}
            aria-label="Voltar para o início"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ameixa/[0.06] text-ameixa transition hover:bg-ameixa/10 active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="font-display text-xl font-extrabold leading-none tracking-tight text-ameixa">
              {mostrarAbas ? "Fotos da festa" : "Minhas fotos"}
            </h1>
            <p className="mt-1 truncate text-xs text-ameixa-suave">{evento.titulo}</p>
          </div>

          {evento.inclui_telao && (
            <Link
              to={`/telao/${evento.slug}`}
              aria-label="Abrir telão"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ameixa/[0.06] text-ameixa transition hover:bg-ameixa/10"
            >
              <Tv className="h-5 w-5" />
            </Link>
          )}
        </div>

        {mostrarAbas && (
          <div className="flex gap-1 rounded-full bg-ameixa/[0.06] p-1" role="tablist">
            {abas.map(({ id, rotulo, total }) => {
              const ativa = abaGaleria === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={ativa}
                  onClick={() => onChangeAba(id)}
                  className={`flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full text-[13px] font-semibold transition ${
                    ativa
                      ? "bg-white text-ameixa shadow-sm"
                      : "text-ameixa-suave hover:text-ameixa"
                  }`}
                >
                  {rotulo}
                  <span className="rounded-full bg-ameixa/[0.07] px-1.5 text-[11px] tabular-nums">
                    {total}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}

export function BotaoFlutuanteFoto({
  corPrimaria,
  onClick,
}: {
  corPrimaria: string;
  onClick: () => void;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-20 flex justify-center px-4">
      <button
        type="button"
        onClick={onClick}
        style={{ backgroundColor: corPrimaria }}
        className="pointer-events-auto inline-flex h-14 items-center gap-2 rounded-full px-7 font-display text-base font-extrabold text-white shadow-modal transition active:scale-[0.97]"
      >
        <Camera className="h-5 w-5" />
        Tirar foto
      </button>
    </div>
  );
}
