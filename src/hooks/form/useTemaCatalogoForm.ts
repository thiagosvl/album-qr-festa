import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FESTA_CATEGORIA_TEMA, FESTA_CORES_PADRAO } from "@/constants";
import { notificarErrosFormulario } from "@/components/ui/form";
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
  cor_primaria_padrao: z.string().default(FESTA_CORES_PADRAO.PRIMARIA),
  cor_secundaria_padrao: z.string().default(FESTA_CORES_PADRAO.SECUNDARIA),
  moldura_preview_url: z.string().optional(),
  thumb_url: z.string().optional(),
  ordem: z.coerce.number().int().min(0).default(1),
  ativo: z.boolean().default(true),
});

export type TemaCatalogoFormValues = z.infer<typeof temaSchema>;

export function useTemaCatalogoForm(
  open: boolean,
  temaEdicao: FestaTemaCatalogo | null,
  onClose: () => void
) {
  const [enviandoImg, setEnviandoImg] = useState(false);
  const criarMutation = useCriarTemaCatalogoMutation();
  const atualizarMutation = useAtualizarTemaCatalogoMutation();

  const form = useForm<TemaCatalogoFormValues>({
    resolver: zodResolver(temaSchema),
    defaultValues: {
      nome: "",
      slug: "",
      categoria: FESTA_CATEGORIA_TEMA.INFANTIL,
      cor_primaria_padrao: FESTA_CORES_PADRAO.PRIMARIA,
      cor_secundaria_padrao: FESTA_CORES_PADRAO.SECUNDARIA,
      moldura_preview_url: "",
      thumb_url: "",
      ordem: 1,
      ativo: true,
    },
  });

  const { reset } = form;
  const temaId = temaEdicao?.id ?? null;

  useEffect(() => {
    if (!open) return;
    if (temaEdicao) {
      reset({
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
      reset({
        nome: "",
        slug: "",
        categoria: FESTA_CATEGORIA_TEMA.INFANTIL,
        cor_primaria_padrao: FESTA_CORES_PADRAO.PRIMARIA,
        cor_secundaria_padrao: FESTA_CORES_PADRAO.SECUNDARIA,
        moldura_preview_url: "",
        thumb_url: "",
        ordem: 1,
        ativo: true,
      });
    }
  }, [open, temaId, reset]);

  const handleUploadPreview = async (
    file: File,
    campo: "moldura_preview_url" | "thumb_url"
  ) => {
    setEnviandoImg(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const storagePath = `catalogo/midias/tema-${campo}-${gerarUuidLocal()}.${ext}`;
      const url = await uploadBlobComProgresso(
        storagePath,
        file
      );
      form.setValue(campo, url);
      toast.success("Imagem enviada com sucesso!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro no upload");
    } finally {
      setEnviandoImg(false);
    }
  };

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
  }, notificarErrosFormulario);

  return {
    form,
    enviandoImg,
    handleUploadPreview,
    onSubmit,
    isSubmitting:
      criarMutation.isPending || atualizarMutation.isPending || enviandoImg,
  };
}
