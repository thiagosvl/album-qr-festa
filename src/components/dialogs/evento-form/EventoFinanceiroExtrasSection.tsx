import { Plus, Trash2 } from "lucide-react";
import type { UseFieldArrayReturn, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { EventoAdminFormValues } from "@/hooks/form/useEventoAdminForm";
import type { FestaCatalogoExtraB2c } from "@/types/festa.types";

interface EventoFinanceiroExtrasSectionProps {
  form: UseFormReturn<EventoAdminFormValues>;
  extrasArray: UseFieldArrayReturn<EventoAdminFormValues, "extras">;
  extrasCatalogo: FestaCatalogoExtraB2c[];
}

export function EventoFinanceiroExtrasSection({
  form,
  extrasArray,
  extrasCatalogo,
}: EventoFinanceiroExtrasSectionProps) {
  const adicionarExtraDoCatalogo = (extraCat: FestaCatalogoExtraB2c) => {
    extrasArray.append({
      extra_id: extraCat.id,
      nome: extraCat.nome,
      quantidade: 1,
      preco_unitario_reais: extraCat.preco_centavos / 100,
    });
  };

  const adicionarExtraLivre = () => {
    extrasArray.append({
      extra_id: null,
      nome: "Moldura Personalizada Extra",
      quantidade: 1,
      preco_unitario_reais: 15,
    });
  };

  return (
    <div className="space-y-4 pt-3 border-t border-border/60">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Negociação Financeira (Pacote + Desconto do Pedido)
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-bold">Valor Pacote (R$)</label>
          <Input
            type="number"
            step="0.01"
            {...form.register("valor_pacote_reais")}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold">Desconto Concedido (R$)</label>
          <Input
            type="number"
            step="0.01"
            {...form.register("desconto_reais")}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold">Sinal Combinado (R$)</label>
          <Input
            type="number"
            step="0.01"
            {...form.register("valor_sinal_reais")}
          />
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Extras Avulsos & Permissões Técnicas
          </p>
          <div className="flex flex-wrap gap-1.5">
            {extrasCatalogo.map((ex) => (
              <Button
                key={ex.id}
                type="button"
                variant="tonal"
                size="sm"
                className="h-7 px-2.5 text-[11px]"
                onClick={() => adicionarExtraDoCatalogo(ex)}
              >
                + {ex.nome}
              </Button>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 px-2.5 text-[11px]"
              onClick={adicionarExtraLivre}
            >
              <Plus className="w-3 h-3" />
              <span>Item Livre</span>
            </Button>
          </div>
        </div>

        {extrasArray.fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 rounded-xl bg-muted/30 border border-border/60 items-end"
          >
            <div className="sm:col-span-6 space-y-1">
              <label className="text-[11px] font-bold">Descrição</label>
              <Input
                className="h-9 text-xs"
                {...form.register(`extras.${index}.nome`)}
              />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[11px] font-bold">Quantidade</label>
              <Input
                type="number"
                className="h-9 text-xs px-2"
                {...form.register(`extras.${index}.quantidade`)}
              />
            </div>
            <div className="sm:col-span-3 space-y-1">
              <label className="text-[11px] font-bold">
                Valor Unitário Negociado (R$)
              </label>
              <Input
                type="number"
                step="0.01"
                className="h-9 text-xs px-2"
                {...form.register(`extras.${index}.preco_unitario_reais`)}
              />
            </div>
            <div className="sm:col-span-1 flex justify-end">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-9 w-9 rounded-lg"
                onClick={() => extrasArray.remove(index)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
