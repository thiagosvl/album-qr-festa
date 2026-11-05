import { Camera, Heart, Images, Sparkles, Tv } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  return (
    <header className="sticky top-0 z-30 glass-surface border-b border-border/60">
      <div className="max-w-5xl mx-auto px-4 py-3.5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Badge
                variant="tonal"
                className="gap-1"
                style={{
                  backgroundColor: `${evento.cor_primaria}18`,
                  color: evento.cor_primaria,
                }}
              >
                <Sparkles className="w-3 h-3" />
                <span>Álbum ao Vivo</span>
              </Badge>
              {evento.is_demo && (
                <Badge variant="warning">Demonstração Interativa</Badge>
              )}
            </div>
            <h1 className="font-festive text-xl sm:text-2xl font-bold text-foreground truncate mt-1">
              {evento.titulo}
            </h1>
            <p className="text-xs text-muted-foreground">
              {formatarDataBr(evento.data_evento)} •{" "}
              {evento.boas_vindas ||
                "Tire fotos com as molduras exclusivas da festa!"}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {evento.inclui_telao && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="hidden sm:inline-flex"
              >
                <Link to={`/telao/${evento.slug}`}>
                  <Tv className="w-4 h-4" />
                  <span>Telão</span>
                </Link>
              </Button>
            )}
            {evento.permite_envio_midias && !evento.galeria_expirada && (
              <Button
                type="button"
                onClick={onAbrirCamera}
                className="shadow-card text-white border-0"
                style={{ backgroundColor: evento.cor_primaria }}
              >
                <Camera className="w-4 h-4" />
                <span>Tirar Foto</span>
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {evento.galeria_publica && (
            <button
              type="button"
              onClick={() => onChangeAba("MURAL")}
              style={
                abaGaleria === "MURAL"
                  ? { backgroundColor: evento.cor_primaria, color: "#ffffff" }
                  : undefined
              }
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                abaGaleria === "MURAL"
                  ? "shadow-sm"
                  : "bg-muted/70 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Images className="w-3.5 h-3.5" />
              <span>Mural da Festa ({todasMidiasCount})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onChangeAba("MINHAS")}
            style={
              abaGaleria === "MINHAS" || !evento.galeria_publica
                ? { backgroundColor: evento.cor_primaria, color: "#ffffff" }
                : undefined
            }
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              abaGaleria === "MINHAS" || !evento.galeria_publica
                ? "shadow-sm"
                : "bg-muted/70 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Minhas Fotos ({minhasMidiasCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
}
