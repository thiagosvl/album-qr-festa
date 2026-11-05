import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Palette, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  FESTA_BUCKET_MIDIAS,
  FESTA_CATEGORIA_TEMA,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
} from "@/constants";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useAtualizarTemaCatalogoMutation,
  useCriarTemaCatalogoMutation,
} from "@/hooks/api/useCatalogoApi";
import { uploadBlobComProgresso } from "@/hooks/business/useComposicaoCanvas";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { gerarUuidLocal } from "@/lib/utils";
import type { FestaTemaCatalogo } from "@/types/festa.types";

const temaSchema = z.object({
  nome: z.string().min(2, "Informe o nome do tema"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Use letras minúsculas, números e hífens"),
  categoria: z.enum([
    FESTA_CATEGORIA_TEMA.INFANTIL,
    FESTA_CATEGORIA_TEMA.QUINZE_ANOS,
    FESTA_CATEGORIA_TEMA.CASAMENTO,
    FESTA_CATEGORIA_TEMA.ADULTO,
    FESTA_CATEGORIA_TEMA.CORPORATIVO,
  ]),
  cor_primaria_padrao: z.string().default("#e6007e"),
  cor_secundaria_padrao: z.string().default("#7b3fe4"),
  moldura_preview_url: z.string().optional(),
  thumb_url: z.string().optional(),
  ordem: z.coerce.number().int().min(0).default(1),
  ativo: z.boolean().default(true),
});

type TemaFormValues = z.infer<typeof temaSchema>;

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
  const [enviandoImg, setEnviandoImg] = useState(false);

  const criarMutation = useCriarTemaCatalogoMutation();
  const atualizarMutation = useAtualizarTemaCatalogoMutation();

  const form = useForm<TemaFormValues>({
    resolver: zodResolver(temaSchema),
    defaultValues: {
      nome: "",
      slug: "",
      categoria: FESTA_CATEGORIA_TEMA.INFANTIL,
      cor_primaria_padrao: "#e6007e",
      cor_secundaria_padrao: "#7b3fe4",
      moldura_preview_url: "",
      thumb_url: "",
      ordem: 1,
      ativo: true,
    },
  });

  useEffect(() => {
    if (!open) return;
    if (temaEdicao) {
      form.reset({
        nome: temaEdicao.nome,
        slug: temaEdicao.slug,
        categoria: temaEdicao.categoria,
        cor_primaria_padrao: temaEdicao.cor_primaria_padrao,
        cor_secundaria_padrao: temaEdicao.cor_secundaria_padrao,
        moldura_preview_url: temaEdicao.moldura_preview_url ?? "",
        thumb_url: temaEdicao.thumb_url ?? "",
        ordem: temaEdicao.ordem,
        ativo: temaEdicao.ativo,
      });
    } else {
      form.reset({
        nome: "",
        slug: "",
        categoria: FESTA_CATEGORIA_TEMA.INFANTIL,
        cor_primaria_padrao: "#e6007e",
        cor_secundaria_padrao: "#7b3fe4",
        moldura_preview_url: "",
        thumb_url: "",
        ordem: 1,
        ativo: true,
      });
    }
  }, [open, temaEdicao, form]);

  const handleUploadPreview = async (file: File) => {
    setEnviandoImg(true);
    try {
      const storagePath = `catalogo/midias/tema-${gerarUuidLocal()}.png`;
      const url = await uploadBlobComProgresso(
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        FESTA_BUCKET_MIDIAS,
        storagePath,
        file
      );
      form.setValue("moldura_preview_url", url);
      toast.success("Moldura de prévia enviada!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro no upload");
    } finally {
      setEnviandoImg(false);
    }
  };

  const isSubmitting =
    criarMutation.isPending || atualizarMutation.isPending || enviandoImg;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const apiPayload = {
        nome: values.nome.trim(),
        slug: values.slug.trim().toLowerCase(),
        categoria: values.categoria,
        cor_primaria_padrao: values.cor_primaria_padrao,
        cor_secundaria_padrao: values.cor_secundaria_padrao,
        moldura_preview_url: values.moldura_preview_url?.trim() || null,
        thumb_url: values.thumb_url?.trim() || null,
        ordem: values.ordem,
        ativo: values.ativo,
      };
      if (temaEdicao) {
        await atualizarMutation.mutateAsync({
          id: temaEdicao.id,
          payload: apiPayload,
        });
        toast.success("Tema atualizado na vitrine!");
      } else {
        await criarMutation.mutateAsync(apiPayload);
        toast.success("Novo tema adicionado à vitrine!");
      }
      safeCloseDialog(onClose);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar tema");
    }
  });

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
      <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
        <BaseDialog.Body className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold">Nome do Tema *</label>
              <Input
                placeholder="Ex: Jardim Encantado"
                {...form.register("nome")}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">Slug *</label>
              <Input
                placeholder="Ex: jardim-encantado"
                {...form.register("slug")}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold">Categoria</label>
              <select
                className="flex h-10 w-full rounded-[18px] border border-input bg-background px-3 py-2 text-xs font-medium"
                {...form.register("categoria")}
              >
                <option value={FESTA_CATEGORIA_TEMA.INFANTIL}>Infantil</option>
                <option value={FESTA_CATEGORIA_TEMA.QUINZE_ANOS}>
                  15 Anos
                </option>
                <option value={FESTA_CATEGORIA_TEMA.CASAMENTO}>
                  Casamento
                </option>
                <option value={FESTA_CATEGORIA_TEMA.ADULTO}>Adulto</option>
                <option value={FESTA_CATEGORIA_TEMA.CORPORATIVO}>
                  Corporativo
                </option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">Cor Primária</label>
              <Input
                type="color"
                className="h-10 p-1"
                {...form.register("cor_primaria_padrao")}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">Cor Secundária</label>
              <Input
                type="color"
                className="h-10 p-1"
                {...form.register("cor_secundaria_padrao")}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold">
              Moldura PNG de Prévia (1080x1920)
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="https://..."
                {...form.register("moldura_preview_url")}
              />
              <label className="shrink-0 inline-flex items-center gap-1.5 px-3.5 h-10 rounded-[18px] border border-border bg-muted/60 text-xs font-bold cursor-pointer hover:bg-muted">
                <Upload className="w-3.5 h-3.5" />
                <span>Subir PNG</span>
                <input
                  type="file"
                  accept="image/png"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (f) handleUploadPreview(f);
                  }}
                />
              </label>
            </div>
          </div>

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
            onClick={() => safeCloseDialog(onClose)}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar Tema"}
          </Button>
        </BaseDialog.Footer>
      </form>
    </BaseDialog>
  );
}
