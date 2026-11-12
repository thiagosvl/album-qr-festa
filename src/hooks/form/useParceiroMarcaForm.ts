import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { notificarErrosFormulario } from "@/components/ui/form";
import { useAtualizarPerfilPortalParceiroMutation } from "@/hooks/api/useParceiroB2bApi";
import { uploadBlobComProgresso } from "@/hooks/business/useComposicaoCanvas";
import { gerarUuidLocal } from "@/lib/utils";
import type { ParceiroB2bAdminDto } from "@/types/festa.types";

const parceiroMarcaSchema = z.object({
  nome_empresa: z.string().min(2, "Informe o nome fantasia da empresa"),
  cor_marca: z.string().default("#a133d8"),
  telefone: z.string().optional(),
  email: z
    .string()
    .email("Informe um e-mail válido")
    .or(z.literal(""))
    .optional(),
  documento: z.string().optional(),
  logo_url: z.string().optional(),
});

export type ParceiroMarcaFormValues = z.infer<typeof parceiroMarcaSchema>;

export function useParceiroMarcaForm(parceiro: ParceiroB2bAdminDto | null) {
  const [enviandoLogo, setEnviandoLogo] = useState(false);
  const atualizarMarcaMutation = useAtualizarPerfilPortalParceiroMutation();

  const marcaForm = useForm<ParceiroMarcaFormValues>({
    resolver: zodResolver(parceiroMarcaSchema),
    defaultValues: {
      nome_empresa: "",
      cor_marca: "#a133d8",
      telefone: "",
      email: "",
      documento: "",
      logo_url: "",
    },
  });

  const { reset } = marcaForm;
  const parceiroId = parceiro?.id ?? null;

  useEffect(() => {
    if (parceiro) {
      reset({
        nome_empresa: parceiro.nome_empresa,
        telefone: parceiro.telefone ?? "",
        email: parceiro.email ?? "",
        documento: parceiro.documento ?? "",
        cor_marca: parceiro.cor_marca ?? "#a133d8",
        logo_url: parceiro.logo_url ?? "",
      });
    }
  }, [parceiroId, reset]);

  const enviarLogoParceiro = async (file: File) => {
    setEnviandoLogo(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const storagePath = `parceiros/midias/logo-${gerarUuidLocal()}.${ext}`;
      const url = await uploadBlobComProgresso(
        storagePath,
        file
      );
      marcaForm.setValue("logo_url", url);
      toast.success("Logo enviada! Clique em Salvar identidade visual.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar logo");
    } finally {
      setEnviandoLogo(false);
    }
  };

  const salvarIdentidadeVisual = marcaForm.handleSubmit(async (values) => {
    if (!parceiro) return;
    try {
      await atualizarMarcaMutation.mutateAsync({
        nome_empresa: values.nome_empresa.trim(),
        telefone: values.telefone?.trim() || null,
        email: values.email?.trim() || null,
        documento: values.documento?.trim() || null,
        cor_marca: values.cor_marca,
        logo_url: values.logo_url?.trim() || null,
      });
      toast.success("Identidade visual atualizada com sucesso!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao salvar marca do parceiro"
      );
    }
  }, notificarErrosFormulario);

  return {
    marcaForm,
    enviandoLogo,
    enviarLogoParceiro,
    salvandoMarca: atualizarMarcaMutation.isPending,
    salvarIdentidadeVisual,
  };
}
