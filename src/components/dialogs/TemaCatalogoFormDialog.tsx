import { Palette, Upload } from "lucide-react";
import { FESTA_CATEGORIA_TEMA } from "@/constants";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { useTemaCatalogoForm } from "@/hooks/form/useTemaCatalogoForm";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import type { FestaTemaCatalogo } from "@/types/festa.types";

export interface TemaCatalogoFormDialogPayload {
  tema: FestaTemaCatalogo | null;
}

interface TemaCatalogoFormDialogProps {
  open: boolean;
  onClose: () => void;
  payload: TemaCatalogoFormDialogPayload | null;
}

export function TemaCatalogoFormDialog({
  open,
  onClose,
  payload,
}: TemaCatalogoFormDialogProps) {
  const temaEdicao = payload?.tema ?? null;
  const { form, enviandoImg, handleUploadPreview, onSubmit, isSubmitting } =
    useTemaCatalogoForm(open, temaEdicao, onClose);

  return (
    <BaseDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) safeCloseDialog(onClose);
      }}
      lockClose={isSubmitting}
      className="sm:max-w-[540px]"
    >
      <BaseDialog.Header
        title={temaEdicao ? "Editar Tema da Vitrine" : "Novo Tema do Catálogo"}
        subtitle="Temas públicos aparecem na Landing Page e no Briefing dos Pais"
        icon={Palette}
        onClose={onClose}
        lockClose={isSubmitting}
      />
      <Form {...form}>
        <form
          onSubmit={onSubmit}
          noValidate
          className="flex flex-col flex-1 overflow-hidden"
        >
          <BaseDialog.Body className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Tema *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Jardim Encantado" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: jardim-encantado" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <FormControl>
                      <NativeSelect className="text-xs" {...field}>
                        <option value={FESTA_CATEGORIA_TEMA.INFANTIL}>
                          Infantil
                        </option>
                        <option value={FESTA_CATEGORIA_TEMA.QUINZE_ANOS}>
                          15 Anos
                        </option>
                        <option value={FESTA_CATEGORIA_TEMA.CASAMENTO}>
                          Casamento
                        </option>
                        <option value={FESTA_CATEGORIA_TEMA.ADULTO}>
                          Adulto
                        </option>
                        <option value={FESTA_CATEGORIA_TEMA.CORPORATIVO}>
                          Corporativo
                        </option>
                      </NativeSelect>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cor_primaria_padrao"
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
                name="cor_secundaria_padrao"
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
            </div>

            <FormField
              control={form.control}
              name="moldura_preview_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Moldura PNG de Prévia (1080x1920)</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <label className="shrink-0 inline-flex items-center gap-1.5 px-3.5 h-10 rounded-[18px] border border-border bg-muted/60 text-xs font-bold cursor-pointer hover:bg-muted">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{enviandoImg ? "Enviando..." : "Subir PNG"}</span>
                      <input
                        type="file"
                        accept="image/png"
                        disabled={enviandoImg}
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          e.target.value = "";
                          if (f) handleUploadPreview(f, "moldura_preview_url");
                        }}
                      />
                    </label>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="thumb_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Foto / Miniatura de Fundo da Vitrine (Opcional)
                  </FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <label className="shrink-0 inline-flex items-center gap-1.5 px-3.5 h-10 rounded-[18px] border border-border bg-muted/60 text-xs font-bold cursor-pointer hover:bg-muted">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{enviandoImg ? "Enviando..." : "Subir Foto"}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        disabled={enviandoImg}
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          e.target.value = "";
                          if (f) handleUploadPreview(f, "thumb_url");
                        }}
                      />
                    </label>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input type="checkbox" {...form.register("ativo")} />
                <span>Tema Ativo na Vitrine</span>
              </label>
            </div>
          </BaseDialog.Body>
          <BaseDialog.Footer>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => safeCloseDialog(onClose)}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Tema"}
            </Button>
          </BaseDialog.Footer>
        </form>
      </Form>
    </BaseDialog>
  );
}
