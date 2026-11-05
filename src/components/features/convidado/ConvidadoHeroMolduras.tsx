import { useRef } from "react";
import { Camera, Check, ImagePlus, Slash, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  return (
    <section className="rounded-card overflow-hidden border border-border/70 bg-card shadow-card">
      <div className="relative min-h-[220px] sm:min-h-[260px] flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={
            evento.capa_url
              ? {
                  backgroundImage: `url(${evento.capa_url})`,
                }
              : {
                  background: `linear-gradient(155deg, ${evento.cor_primaria}, ${evento.cor_secundaria})`,
                }
          }
        />
        <div
          className="absolute inset-0"
          style={{
            background: evento.capa_url
              ? "linear-gradient(to top, rgba(19,13,30,0.88) 8%, rgba(19,13,30,0.25) 65%)"
              : "linear-gradient(to top, rgba(19,13,30,0.60), rgba(19,13,30,0.08) 70%)",
          }}
        />

        <div className="relative z-10 w-full p-5 sm:p-7 text-white text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {evento.subtitulo ||
                  (evento.idade_aniversariante
                    ? `${evento.nome_aniversariante ?? evento.titulo} • ${evento.idade_aniversariante}`
                    : "Álbum Oficial da Festa")}
              </span>
            </div>
            <h2 className="font-festive text-2xl sm:text-4xl font-bold leading-tight drop-shadow-sm">
              {evento.titulo}
            </h2>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
              {evento.boas_vindas ||
                "Escolha sua moldura favorita abaixo, tire uma foto ou envie da sua galeria para aparecer no mural ao vivo!"}
            </p>
          </div>

          {evento.data_evento && (
            <div className="shrink-0 self-center sm:self-end px-3.5 py-1.5 rounded-full bg-black/35 backdrop-blur-md border border-white/15 text-xs font-semibold">
              {formatarDataBr(evento.data_evento)}
            </div>
          )}
        </div>
      </div>

      {podeEnviar && (
        <div className="p-4 sm:p-5 bg-muted/35 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-festive text-sm font-bold text-foreground">
                1. Escolha sua moldura da festa ({molduras.length + 1} opções)
              </p>
              <span className="text-[11px] text-muted-foreground">
                Você também pode trocar depois de tirar a foto
              </span>
            </div>

            <div className="flex items-stretch gap-3 overflow-x-auto pb-2 pt-1">
              <button
                type="button"
                onClick={() => onSelectMoldura(null)}
                style={
                  molduraSelecionadaId === null
                    ? { borderColor: evento.cor_primaria }
                    : undefined
                }
                className={`relative shrink-0 w-24 sm:w-28 rounded-2xl p-2 border-2 bg-background flex flex-col items-center gap-1.5 transition-all ${
                  molduraSelecionadaId === null
                    ? "shadow-md ring-2 ring-primary/20"
                    : "border-border/80 hover:border-primary/40"
                }`}
              >
                {molduraSelecionadaId === null && (
                  <span
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-white flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: evento.cor_primaria }}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
                <div className="w-full aspect-[9/13] rounded-xl bg-muted flex flex-col items-center justify-center gap-1 text-muted-foreground">
                  <Slash className="w-6 h-6" />
                  <span className="text-[10px] font-semibold">Foto Pura</span>
                </div>
                <span className="text-[11px] font-bold truncate w-full text-center">
                  Sem moldura
                </span>
              </button>

              {molduras.map((m) => {
                const selecionada = molduraSelecionadaId === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onSelectMoldura(m.id)}
                    style={
                      selecionada
                        ? { borderColor: evento.cor_primaria }
                        : undefined
                    }
                    className={`relative shrink-0 w-24 sm:w-28 rounded-2xl p-2 border-2 bg-background flex flex-col items-center gap-1.5 transition-all ${
                      selecionada
                        ? "shadow-md ring-2 ring-primary/20"
                        : "border-border/80 hover:border-primary/40"
                    }`}
                  >
                    {selecionada && (
                      <span
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-white flex items-center justify-center shadow-sm z-10"
                        style={{ backgroundColor: evento.cor_primaria }}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <div
                      className="w-full aspect-[9/13] rounded-xl overflow-hidden flex items-center justify-center"
                      style={{
                        backgroundImage:
                          "repeating-conic-gradient(#e9e3f0 0% 25%, #f6f2fa 0% 50%)",
                        backgroundSize: "14px 14px",
                      }}
                    >
                      <img
                        src={m.arquivo_url}
                        alt={m.nome}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-[11px] font-bold truncate w-full text-center">
                      {m.nome}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Button
              type="button"
              size="lg"
              onClick={onAbrirCamera}
              style={{ backgroundColor: evento.cor_primaria }}
              className="w-full h-12 text-white border-0 font-festive text-base shadow-card"
            >
              <Camera className="w-5 h-5" />
              <span>Tirar Foto com a Câmera</span>
            </Button>

            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={() => inputGaleriaRef.current?.click()}
              style={{
                borderColor: evento.cor_secundaria,
                color: evento.cor_secundaria,
              }}
              className="w-full h-12 bg-background font-festive text-base border-2"
            >
              <ImagePlus className="w-5 h-5" />
              <span>Escolher Foto do Celular</span>
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
