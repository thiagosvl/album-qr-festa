import { Plus, Trash2 } from "lucide-react";
import type { UseFieldArrayReturn, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
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
      <p className="text-sm font-semibold text-muted-foreground">
        Negociação financeira (pacote e desconto do pedido)
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <FormField
          control={form.control}
          name="valor_pacote_reais"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor Pacote (R$)</FormLabel>
              <FormControl>
                <MoneyInput
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="desconto_reais"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Desconto Concedido (R$)</FormLabel>
              <FormControl>
                <MoneyInput
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="valor_sinal_reais"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sinal Combinado (R$)</FormLabel>
              <FormControl>
                <MoneyInput
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-muted-foreground">
            Extras avulsos e permissões técnicas
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

        {extrasArray.fields.map((fieldItem, index) => (
          <div
            key={fieldItem.id}
            className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 rounded-xl bg-muted/30 border border-border/60 items-start"
          >
            <div className="sm:col-span-6">
              <FormField
                control={form.control}
                name={`extras.${index}.nome`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px]">Descrição *</FormLabel>
                    <FormControl>
                      <Input className="h-9 text-xs" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name={`extras.${index}.quantidade`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px]">Quantidade *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="h-9 text-xs px-2"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="sm:col-span-3">
              <FormField
                control={form.control}
                name={`extras.${index}.preco_unitario_reais`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px]">
                      Valor Unitário (R$) *
                    </FormLabel>
                    <FormControl>
                      <MoneyInput
                        className="h-9 text-xs px-2"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="sm:col-span-1 flex justify-end pt-5">
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
