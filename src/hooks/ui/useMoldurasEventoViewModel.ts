import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  FESTA_BUCKET_MIDIAS,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
} from "@/constants";
import { notificarErrosFormulario } from "@/components/ui/form";
import {
  useAtualizarMolduraMutation,
  useCriarMolduraMutation,
  useExcluirMolduraMutation,
  useMoldurasEventoQuery,
  useReordenarMoldurasMutation,
} from "@/hooks/api/useMoldurasApi";
import { uploadBlobComProgresso } from "@/hooks/business/useComposicaoCanvas";
import { gerarUuidLocal } from "@/lib/utils";
import type { EventoAdminDto, MolduraDto } from "@/types/festa.types";

const novaMolduraSchema = z.object({
  nome: z.string().min(2, "Informe o título da moldura"),
  arquivo: z
    .instanceof(File, { message: "Selecione um arquivo PNG transparente" })
    .refine((file) => file.type === "image/png" || file.name.endsWith(".png"), {
      message: "O arquivo deve estar em formato PNG",
    }),
});

export type NovaMolduraFormValues = z.infer<typeof novaMolduraSchema>;

export type TipoAcaoMoldura = "ATIVA" | "EXCLUIR";

export function useMoldurasEventoViewModel(evento: EventoAdminDto | null) {
  const [enviando, setEnviando] = useState(false);
  const [acaoMoldura, setAcaoMoldura] = useState<{
    id: string;
    tipo: TipoAcaoMoldura;
  } | null>(null);

  const form = useForm<NovaMolduraFormValues>({
    resolver: zodResolver(novaMolduraSchema),
    defaultValues: {
      nome: "",
    },
  });

  const moldurasQuery = useMoldurasEventoQuery(
    evento?.id,
    evento?.token_gestao
  );
  const criarMutation = useCriarMolduraMutation(
    evento?.id ?? "",
    evento?.token_gestao
  );
  const atualizarMutation = useAtualizarMolduraMutation(
    evento?.id ?? "",
    evento?.token_gestao
  );
  const excluirMutation = useExcluirMolduraMutation(
    evento?.id ?? "",
    evento?.token_gestao
  );
  const reordenarMutation = useReordenarMoldurasMutation(
    evento?.id ?? "",
    evento?.token_gestao
  );

  const molduras = moldurasQuery.data ?? [];
  const ativasCount = molduras.filter((m) => m.ativa).length;

  const handleUploadMoldura = form.handleSubmit(async (values) => {
    if (!evento) return;
    setEnviando(true);
    try {
      const idUnico = gerarUuidLocal();
      const storagePath = `${evento.slug}/midias/molduras/${idUnico}.png`;
      await uploadBlobComProgresso(
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        FESTA_BUCKET_MIDIAS,
        storagePath,
        values.arquivo
      );

      await criarMutation.mutateAsync({
        nome: values.nome.trim(),
        arquivo_path: storagePath,
        ordem: molduras.length + 1,
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

  const moverOrdem = async (indexAtual: number, direcao: -1 | 1) => {
    const novoIndex = indexAtual + direcao;
    if (novoIndex < 0 || novoIndex >= molduras.length) return;
    const copia: MolduraDto[] = [...molduras];
    const [removida] = copia.splice(indexAtual, 1);
    copia.splice(novoIndex, 0, removida);

    try {
      await reordenarMutation.mutateAsync(
        copia.map((item, idx) => ({ id: item.id, ordem: idx + 1 }))
      );
      toast.success("Ordem das molduras atualizada!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao reordenar molduras"
      );
    }
  };

  const alternarAtivaMoldura = async (moldura: MolduraDto) => {
    setAcaoMoldura({ id: moldura.id, tipo: "ATIVA" });
    try {
      await atualizarMutation.mutateAsync({
        molduraId: moldura.id,
        payload: { ativa: !moldura.ativa },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar");
    } finally {
      setAcaoMoldura(null);
    }
  };

  const excluirMoldura = async (molduraId: string) => {
    setAcaoMoldura({ id: molduraId, tipo: "EXCLUIR" });
    try {
      await excluirMutation.mutateAsync(molduraId);
      toast.success("Moldura excluída");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir");
    } finally {
      setAcaoMoldura(null);
    }
  };

  return {
    form,
    enviando,
    isLoadingMolduras: moldurasQuery.isLoading,
    acaoMoldura,
    reordenando: reordenarMutation.isPending,
    molduras,
    ativasCount,
    handleUploadMoldura,
    moverOrdem,
    alternarAtivaMoldura,
    excluirMoldura,
  };
}
