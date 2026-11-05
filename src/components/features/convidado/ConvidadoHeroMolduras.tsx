import { useRef } from "react";
import { Camera, Check, ImagePlus, Slash } from "lucide-react";
import { formatarDataBr } from "@/lib/utils";
import type { EventoPublicoDto, MolduraDto } from "@/types/festa.types";

interface ConvidadoHeroMoldurasProps {
  evento: EventoPublicoDto;
  molduras: MolduraDto[];
  molduraSelecionadaId: string | null;
  onSelectMoldura: (id: string | null) => void;
  onAbrirCamera: () => void;
  onSelecionarArquivo: (file: File) => void;
  podeEnviar: boolean;
}

const INCLINACOES = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2"] as const;

export function ConvidadoHeroMolduras({
  evento,
  molduras,
  molduraSelecionadaId,
  onSelectMoldura,
  onAbrirCamera,
  onSelecionarArquivo,
  podeEnviar,
}: ConvidadoHeroMoldurasProps) {
  const inputGaleriaRef = useRef<HTMLInputElement | null>(null);

  const selo =
    evento.subtitulo ||
    (evento.idade_aniversariante
      ? `${evento.nome_aniversariante ?? evento.titulo} faz ${evento.idade_aniversariante}`
      : "Álbum oficial da festa");

  return (
    <section className="relative overflow-hidden rounded-card bg-white shadow-palco">
      <div className="relative flex min-h-[250px] items-end overflow-hidden sm:min-h-[300px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={
            evento.capa_url
              ? { backgroundImage: `url(${evento.capa_url})` }
              : {
                  background: `linear-gradient(155deg, ${evento.cor_primaria}, ${evento.cor_secundaria})`,
                }
          }
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(28,15,46,0.82) 6%, rgba(28,15,46,0.15) 70%)",
          }}
        />

        <div className="relative z-10 flex w-full flex-col gap-4 p-6 text-white sm:flex-row sm:items-end sm:justify-between sm:p-8">
          <div className="max-w-xl">
            <p className="text-sm font-semibold text-white/85">{selo}</p>
            <h2 className="mt-1 font-display text-[34px] font-extrabold leading-[1.02] tracking-tight sm:text-5xl">
              {evento.titulo}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-snug text-white/90">
              {evento.boas_vindas ||
                "Escolha uma moldura, tire a foto e veja ela aparecer no mural da festa."}
            </p>
          </div>

          {evento.data_evento && (
            <span className="shrink-0 -rotate-3 self-start rounded-xl bg-gema px-3.5 py-2 font-display text-base font-extrabold text-ameixa shadow-suave sm:self-end">
              {formatarDataBr(evento.data_evento)}
            </span>
          )}
        </div>
      </div>

      {podeEnviar && (
        <>
          <div className="relative text-ameixa/25" aria-hidden="true">
            <span className="absolute -left-3.5 -top-3.5 h-7 w-7 rounded-full bg-background" />
            <span className="absolute -right-3.5 -top-3.5 h-7 w-7 rounded-full bg-background" />
            <div className="picotado mx-5" />
          </div>

          <div className="space-y-5 p-5 sm:p-7">
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <h3 className="font-display text-xl font-extrabold tracking-tight">
                  Escolha a moldura
                </h3>
                <p className="text-xs text-ameixa-suave">
                  Dá para trocar depois de tirar a foto.
                </p>
              </div>

              <div className="no-scrollbar -mx-5 mt-3 flex items-stretch gap-3 overflow-x-auto px-5 pb-3 pt-3 sm:-mx-7 sm:px-7">
                <button
                  type="button"
                  onClick={() => onSelectMoldura(null)}
                  aria-pressed={molduraSelecionadaId === null}
                  style={
                    molduraSelecionadaId === null
                      ? { borderColor: evento.cor_primaria }
                      : undefined
                  }
                  className={`relative flex w-24 shrink-0 flex-col items-center gap-2 rounded-2xl border-2 bg-white p-2 transition sm:w-28 ${
                    molduraSelecionadaId === null
                      ? "-translate-y-1 shadow-suave"
                      : "border-ameixa/10 hover:border-ameixa/25"
                  }`}
                >
                  {molduraSelecionadaId === null && (
                    <Marca cor={evento.cor_primaria} />
                  )}
                  <div className="flex aspect-[9/13] w-full flex-col items-center justify-center gap-1 rounded-xl bg-ameixa/[0.05] text-ameixa-suave">
                    <Slash className="h-6 w-6" />
                    <span className="text-[11px] font-semibold">Foto limpa</span>
                  </div>
                  <span className="w-full truncate text-center text-xs font-bold">
                    Sem moldura
                  </span>
                </button>

                {molduras.map((moldura, indice) => {
                  const selecionada = molduraSelecionadaId === moldura.id;
                  return (
                    <button
                      key={moldura.id}
                      type="button"
                      onClick={() => onSelectMoldura(moldura.id)}
                      aria-pressed={selecionada}
                      style={
                        selecionada
                          ? { borderColor: evento.cor_primaria }
                          : undefined
                      }
                      className={`relative flex w-24 shrink-0 flex-col items-center gap-2 rounded-2xl border-2 bg-white p-2 transition sm:w-28 ${
                        selecionada
                          ? `-translate-y-1 shadow-suave ${INCLINACOES[indice % INCLINACOES.length]}`
                          : "border-ameixa/10 hover:border-ameixa/25"
                      }`}
                    >
                      {selecionada && <Marca cor={evento.cor_primaria} />}
                      <div className="xadrez flex aspect-[9/13] w-full items-center justify-center overflow-hidden rounded-xl">
                        <img
                          src={moldura.arquivo_url}
                          alt={moldura.nome}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <span className="w-full truncate text-center text-xs font-bold">
                        {moldura.nome}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <input
              ref={inputGaleriaRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) onSelecionarArquivo(file);
              }}
            />

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <button
                type="button"
                onClick={onAbrirCamera}
                style={{ backgroundColor: evento.cor_primaria }}
                className="flex h-14 items-center justify-center gap-2.5 rounded-full font-display text-lg font-extrabold text-white shadow-suave transition active:scale-[0.98]"
              >
                <Camera className="h-5 w-5" />
                Tirar foto agora
              </button>

              <button
                type="button"
                onClick={() => inputGaleriaRef.current?.click()}
                style={{
                  borderColor: evento.cor_secundaria,
                  color: evento.cor_secundaria,
                }}
                className="flex h-14 items-center justify-center gap-2.5 rounded-full border-2 bg-white font-display text-lg font-extrabold transition active:scale-[0.98]"
              >
                <ImagePlus className="h-5 w-5" />
                Escolher do celular
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function Marca({ cor }: { cor: string }) {
  return (
    <span
      className="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full text-white shadow-sm"
      style={{ backgroundColor: cor }}
    >
      <Check className="h-3.5 w-3.5" />
    </span>
  );
}
