import type { UseFormReturn } from "react-hook-form";
import type { EventoParceiroB2bFormValues } from "@/hooks/form/useEventoParceiroB2bForm";
import type { FestaCatalogoExtraB2c } from "@/types/festa.types";

interface EventoParceiroModulosSectionProps {
  form: UseFormReturn<EventoParceiroB2bFormValues>;
  extrasCatalogo: FestaCatalogoExtraB2c[];
  extrasIdsSelecionados: string[];
  onAlternarExtra: (extraId: string) => void;
}

export function EventoParceiroModulosSection({
  form,
  extrasCatalogo,
  extrasIdsSelecionados,
  onAlternarExtra,
}: EventoParceiroModulosSectionProps) {
  return (
    <div className="space-y-2.5 p-3 rounded-xl border border-border/80 bg-muted/20">
      <p className="text-xs font-bold text-foreground">Módulos Contratados *</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border/80 bg-background cursor-pointer">
          <input type="checkbox" {...form.register("inclui_galeria")} />
          <div>
            <p className="text-xs font-bold text-foreground">
              Galeria QR Code Ao Vivo (1 crédito)
            </p>
            <p className="text-[11px] text-muted-foreground">
              Álbum colaborativo e molduras da festa
            </p>
          </div>
        </label>

        <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border/80 bg-background cursor-pointer">
          <input type="checkbox" {...form.register("inclui_convite")} />
          <div>
            <p className="text-xs font-bold text-foreground">
              Convite Interativo + RSVP (1 crédito)
            </p>
            <p className="text-[11px] text-muted-foreground">
              Convite animado e lista de presença
            </p>
          </div>
        </label>
      </div>

      {extrasCatalogo.length > 0 && (
        <div className="pt-2 space-y-1.5">
          <p className="text-[11px] font-bold text-muted-foreground">
            Add-ons Opcionais B2B
          </p>
          <div className="flex flex-wrap gap-2">
            {extrasCatalogo.map((ex) => {
              const selecionado = extrasIdsSelecionados.includes(ex.id);
              return (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => onAlternarExtra(ex.id)}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                    selecionado
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/80 bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {selecionado ? "✓ " : "+ "}
                  {ex.nome} (
                  {ex.custo_creditos_b2b > 0
                    ? `${ex.custo_creditos_b2b} créd.`
                    : "Incluso"}
                  )
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
