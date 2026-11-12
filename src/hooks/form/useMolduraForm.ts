import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { notificarErrosFormulario } from "@/components/ui/form";
import { useCriarMolduraMutation } from "@/hooks/api/useMoldurasApi";
import { uploadBlobComProgresso } from "@/hooks/business/useComposicaoCanvas";
import { gerarUuidLocal } from "@/lib/utils";
import type { EventoAdminDto } from "@/types/festa.types";

const novaMolduraSchema = z.object({
  nome: z.string().min(2, "Informe o título da moldura"),
  arquivo: z
    .instanceof(File, { message: "Selecione um arquivo PNG transparente" })
    .refine((file) => file.type === "image/png" || file.name.endsWith(".png"), {
      message: "O arquivo deve estar em formato PNG",
    }),
});

export type NovaMolduraFormValues = z.infer<typeof novaMolduraSchema>;

export function useMolduraForm(
  evento: EventoAdminDto | null,
  totalMolduras: number,
  ativasCount: number
) {
  const [enviando, setEnviando] = useState(false);

  const form = useForm<NovaMolduraFormValues>({
    resolver: zodResolver(novaMolduraSchema),
    defaultValues: {
      nome: "",
    },
  });

  const criarMutation = useCriarMolduraMutation(
    evento?.id ?? "",
    evento?.token_gestao
  );

  const handleUploadMoldura = form.handleSubmit(async (values) => {
    if (!evento) return;
    setEnviando(true);
    try {
      const idUnico = gerarUuidLocal();
      const prefixo = evento.codigo_url || evento.slug;
      const storagePath = `${prefixo}/midias/molduras/${idUnico}.png`;
      await uploadBlobComProgresso(
        storagePath,
        values.arquivo
      );

      await criarMutation.mutateAsync({
        nome: values.nome.trim(),
        arquivo_path: storagePath,
        ordem: totalMolduras + 1,
        ativa: ativasCount < evento.limite_molduras,
      });

      form.reset({ nome: "" });
      toast.success("Moldura PNG 1080x1920 adicionada com sucesso!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao adicionar moldura"
      );
    } finally {
      setEnviando(false);
    }
  }, notificarErrosFormulario);

  return {
    form,
    enviando,
    handleUploadMoldura,
  };
}
