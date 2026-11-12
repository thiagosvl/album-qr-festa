import { Upload } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import {
  FESTA_DESTINO_UPLOAD_EXTRA,
  type FestaDestinoUploadExtra,
} from "@/constants";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { EventoAdminFormValues } from "@/hooks/form/useEventoAdminForm";

interface EventoConviteConfigSectionProps {
  form: UseFormReturn<EventoAdminFormValues>;
  enviandoMidiaConvite: FestaDestinoUploadExtra | null;
  onUploadArquivoConvite: (
    file: File,
    destino: FestaDestinoUploadExtra
  ) => Promise<void>;
}

export function EventoConviteConfigSection({
  form,
  enviandoMidiaConvite,
  onUploadArquivoConvite,
}: EventoConviteConfigSectionProps) {
  const exibirPresentes = form.watch("convite_exibir_presentes");

  const handleFileChange =
    (destino: FestaDestinoUploadExtra) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        void onUploadArquivoConvite(file, destino);
      }
      e.target.value = "";
    };

  return (
    <div className="space-y-4 pt-3 border-t border-border/60">
      <p className="text-sm font-semibold text-muted-foreground">
        Configuração do Convite Interativo (/convite/slug)
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <FormField
          control={form.control}
          name="convite_horario_inicio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horário Início (Contagem)</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="convite_horario_texto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horário Exibido</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Das 15h às 19h" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="convite_texto_prazo_rsvp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prazo de Confirmação</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Confirme até 10/11" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="convite_nome_local"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Local / Buffet</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Buffet Mundo Mágico" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="convite_endereco"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço Completo (Maps / Waze)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Rua das Flores, 123 - Centro, São Paulo"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="convite_texto_chamada"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Frase / Texto de Chamada do Convite</FormLabel>
            <FormControl>
              <Textarea
                rows={2}
                placeholder="Ex: Venha comemorar conosco esse momento mágico!"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="convite_foto_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Foto Principal do Convite (URL ou Upload)</FormLabel>
              <div className="flex gap-1.5">
                <FormControl>
                  <Input
                    placeholder="https://..."
                    className="text-xs"
                    {...field}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 relative overflow-hidden"
                  loading={
                    enviandoMidiaConvite ===
                    FESTA_DESTINO_UPLOAD_EXTRA.CONVITE_FOTO
                  }
                >
                  <Upload className="w-3.5 h-3.5" />
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileChange(
                      FESTA_DESTINO_UPLOAD_EXTRA.CONVITE_FOTO
                    )}
                  />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="convite_musica_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Música de Fundo MP3 (Opcional)</FormLabel>
              <div className="flex gap-1.5">
                <FormControl>
                  <Input
                    placeholder="https://... (vazio = sem música)"
                    className="text-xs"
                    {...field}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 relative overflow-hidden"
                  loading={
                    enviandoMidiaConvite ===
                    FESTA_DESTINO_UPLOAD_EXTRA.CONVITE_MUSICA
                  }
                >
                  <Upload className="w-3.5 h-3.5" />
                  <input
                    type="file"
                    accept="audio/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileChange(
                      FESTA_DESTINO_UPLOAD_EXTRA.CONVITE_MUSICA
                    )}
                  />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-3 p-3 rounded-xl bg-muted/30 border border-border/60">
        <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
          <input
            type="checkbox"
            {...form.register("convite_exibir_presentes")}
          />
          <span>Exibir seção de Dicas de Presentes e Tamanhos no Convite</span>
        </label>

        {exibirPresentes && (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="convite_tamanho_roupa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Tamanho de Roupa</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Tam. 2 ou 3 anos" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="convite_tamanho_calcado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      Tamanho de Calçado
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Nº 22 / 23" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="convite_titulo_tamanhos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      Título da Seção (Opcional)
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Sugestões para..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="convite_ideias_presentes_texto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">
                    Ideias de Presentes (separe por vírgula)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Brinquedos educativos, Livros infantis, Massinha"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
}
