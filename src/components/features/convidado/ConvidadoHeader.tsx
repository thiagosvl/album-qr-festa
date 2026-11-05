import { Camera, Heart, Images, Tv } from "lucide-react";
import { Link } from "react-router-dom";
import type { AbaGaleriaConvidado } from "@/hooks/ui/useConvidadoViewModel";
import { formatarDataBr } from "@/lib/utils";
import type { EventoPublicoDto } from "@/types/festa.types";

interface ConvidadoHeaderProps {
  evento: EventoPublicoDto;
  abaGaleria: AbaGaleriaConvidado;
  onChangeAba: (aba: AbaGaleriaConvidado) => void;
  todasMidiasCount: number;
  minhasMidiasCount: number;
  onAbrirCamera: () => void;
}

export function ConvidadoHeader({
  evento,
  abaGaleria,
  onChangeAba,
  todasMidiasCount,
  minhasMidiasCount,
  onAbrirCamera,
}: ConvidadoHeaderProps) {
  const podeEnviar = evento.permite_envio_midias && !evento.galeria_expirada;
  const abaMural = evento.galeria_publica && abaGaleria === "MURAL";

  const abas = [
    ...(evento.galeria_publica
      ? [
          {
            id: "MURAL" as const,
            rotulo: "Mural da festa",
            total: todasMidiasCount,
            Icone: Images,
            ativa: abaMural,
          },
        ]
      : []),
    {
      id: "MINHAS" as const,
      rotulo: "Minhas fotos",
      total: minhasMidiasCount,
      Icone: Heart,
      ativa: !abaMural,
    },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-ameixa/10 bg-papel/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 pb-3 pt-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate font-display text-[22px] font-extrabold leading-none tracking-tight text-ameixa sm:text-[26px]">
              {evento.titulo}
            </h1>
            <p className="mt-1.5 flex items-center gap-2 text-xs text-ameixa-suave">
              <span>{formatarDataBr(evento.data_evento)}</span>
              {evento.is_demo && (
                <span className="rounded-full bg-gema px-2 py-0.5 text-[11px] font-bold text-ameixa">
                  Demonstração
                </span>
              )}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {evento.inclui_telao && (
              <Link
                to={`/telao/${evento.slug}`}
                className="hidden h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-ameixa ring-1 ring-ameixa/15 transition hover:ring-ameixa/30 sm:inline-flex"
              >
                <Tv className="h-4 w-4" />
                Telão
              </Link>
            )}
            {podeEnviar && (
              <button
                type="button"
                onClick={onAbrirCamera}
                style={{ backgroundColor: evento.cor_primaria }}
                className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold text-white shadow-card transition active:scale-[0.97]"
              >
                <Camera className="h-4 w-4" />
                Tirar foto
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-1 rounded-full bg-ameixa/[0.06] p-1" role="tablist">
          {abas.map(({ id, rotulo, total, Icone, ativa }) => (
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
              <Icone
                className="h-3.5 w-3.5"
                style={ativa ? { color: evento.cor_primaria } : undefined}
              />
              <span>{rotulo}</span>
              <span className="rounded-full bg-ameixa/[0.07] px-1.5 text-[11px] tabular-nums">
                {total}
              </span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
