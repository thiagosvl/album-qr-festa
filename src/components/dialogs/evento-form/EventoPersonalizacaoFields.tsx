import type { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { EventoAdminFormValues } from "@/hooks/form/useEventoAdminForm";
import { phoneMask } from "@/lib/masks";

interface EventoPersonalizacaoFieldsProps {
  form: UseFormReturn<EventoAdminFormValues>;
}

export function EventoPersonalizacaoFields({
  form,
}: EventoPersonalizacaoFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <FormField
          control={form.control}
          name="nome_anfitriao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Anfitrião (Mãe/Pai/Cliente)</FormLabel>
              <FormControl>
                <Input placeholder="Nome completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="telefone_anfitriao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>WhatsApp do Cliente</FormLabel>
              <FormControl>
                <Input
                  placeholder="(11) 99999-9999"
                  {...field}
                  onChange={(e) => field.onChange(phoneMask(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email_anfitriao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail do Cliente</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="cliente@email.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 items-center pt-1">
        <FormField
          control={form.control}
          name="cor_primaria"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cor Primária</FormLabel>
              <FormControl>
                <Input type="color" className="h-10 p-1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cor_secundaria"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cor Secundária</FormLabel>
              <FormControl>
                <Input type="color" className="h-10 p-1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <label className="flex items-center gap-2 text-xs font-medium cursor-pointer pt-4">
          <input
            type="checkbox"
            className="rounded border-input accent-primary"
            {...form.register("galeria_publica")}
          />
          <span>Galeria Pública</span>
        </label>
        <label className="flex items-center gap-2 text-xs font-medium cursor-pointer pt-4">
          <input
            type="checkbox"
            className="rounded border-input accent-primary"
            {...form.register("moderacao_previa")}
          />
          <span>Moderação Prévia</span>
        </label>
        <label className="flex items-center gap-2 text-xs font-medium cursor-pointer pt-4">
          <input
            type="checkbox"
            className="rounded border-input accent-primary"
            {...form.register("permite_envio_midias")}
          />
          <span>Uploads Abertos</span>
        </label>
        <label className="flex items-center gap-2 text-xs font-medium cursor-pointer pt-4">
          <input
            type="checkbox"
            className="rounded border-input accent-primary"
            {...form.register("permite_video")}
          />
          <span>Vídeos Curtos</span>
        </label>
      </div>
    </>
  );
}
