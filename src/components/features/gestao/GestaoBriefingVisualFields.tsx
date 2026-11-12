import { Upload } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import type { BriefingPaiFormValues } from "@/hooks/form/useBriefingPaiForm";
import type { FestaTemaCatalogo } from "@/types/festa.types";

interface GestaoBriefingVisualFieldsProps {
  form: UseFormReturn<BriefingPaiFormValues>;
  temasCatalogo: FestaTemaCatalogo[];
  enviandoCapa: boolean;
  onEnviarFotoCapa: (file: File) => void;
  incluiGaleria?: boolean;
}

export function GestaoBriefingVisualFields({
  form,
  temasCatalogo,
  enviandoCapa,
  onEnviarFotoCapa,
  incluiGaleria = true,
}: GestaoBriefingVisualFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="sm:col-span-2">
          <FormField
            control={form.control}
            name="tema_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-muted-foreground">
                  Tema
                </FormLabel>
                <FormControl>
                  <NativeSelect
                    {...field}
                    onChange={(e) => {
                      const id = e.target.value;
                      field.onChange(id);
                      const temaEscolhido = temasCatalogo.find(
                        (t) => t.id === id
                      );
                      if (temaEscolhido) {
                        form.setValue(
                          "cor_primaria",
                          temaEscolhido.cor_primaria_padrao
                        );
                        form.setValue(
                          "cor_secundaria",
                          temaEscolhido.cor_secundaria_padrao
                        );
                      }
                    }}
                  >
                    <option value="">Tema exclusivo</option>
                    {temasCatalogo.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nome} ({t.categoria})
                      </option>
                    ))}
                  </NativeSelect>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="cor_primaria"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-muted-foreground">
                Cor principal
              </FormLabel>
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
              <FormLabel className="text-sm font-semibold text-muted-foreground">
                Cor secundária
              </FormLabel>
              <FormControl>
                <Input type="color" className="h-10 p-1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
        <div className="sm:col-span-2">
          <FormField
            control={form.control}
            name="capa_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-muted-foreground">
                  Foto de capa (opcional)
                </FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      placeholder="https://... ou envie uma foto ao lado"
                      {...field}
                    />
                  </FormControl>
                  <label className="shrink-0 inline-flex items-center gap-1.5 px-3.5 h-10 rounded-full bg-secondary text-secondary-foreground text-sm font-semibold cursor-pointer transition hover:bg-primary hover:text-primary-foreground">
                    <Upload className="w-3.5 h-3.5" />
                    <span>
                      {enviandoCapa ? "Enviando..." : "Enviar foto"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={enviandoCapa}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (file) onEnviarFotoCapa(file);
                      }}
                    />
                  </label>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="tempo_slideshow_segundos"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-muted-foreground">
                Segundos por foto no telão
              </FormLabel>
              <FormControl>
                <Input type="number" min={3} max={30} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="boas_vindas"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold text-muted-foreground">
              Frase de boas-vindas
            </FormLabel>
            <FormControl>
              <Textarea
                rows={3}
                placeholder="Ex: Registre seu carinho no 1º aninho da Helena! Escolha sua moldura favorita..."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {incluiGaleria && (
        <div className="flex flex-wrap gap-6 pt-1">
          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded accent-primary"
              {...form.register("galeria_publica")}
            />
            <span>
              Galeria pública: os convidados veem as fotos uns dos outros
            </span>
          </label>

          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded accent-primary"
              {...form.register("moderacao_previa")}
            />
            <span>
              Aprovar as fotos antes de aparecerem no mural e no telão
            </span>
          </label>
        </div>
      )}
    </>
  );
}
