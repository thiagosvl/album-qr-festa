import { useEffect, useState } from "react";
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
import { useAtualizarBriefingMutation } from "@/hooks/api/useGestaoApi";
import { uploadBlobComProgresso } from "@/hooks/business/useComposicaoCanvas";
import { gerarUuidLocal } from "@/lib/utils";
import type { EventoGestaoDto } from "@/types/festa.types";

const briefingSchema = z.object({
  titulo: z.string().min(2, "Informe o título da festa"),
  subtitulo: z.string().optional(),
  boas_vindas: z.string().max(300).optional(),
  nome_aniversariante: z.string().optional(),
  idade_aniversariante: z.string().optional(),
  data_evento: z.string().optional(),
  cor_primaria: z.string().default("#e6007e"),
  cor_secundaria: z.string().default("#7b3fe4"),
  capa_url: z.string().optional(),
  tema_id: z.string().optional(),
  galeria_publica: z.boolean().default(true),
  moderacao_previa: z.boolean().default(false),
  tempo_slideshow_segundos: z.coerce.number().int().min(3).max(30).default(6),
});

export type BriefingPaiFormValues = z.infer<typeof briefingSchema>;

export function useBriefingPaiForm(
  token: string,
  gestao: EventoGestaoDto | undefined
) {
  const atualizarMutation = useAtualizarBriefingMutation(token);
  const [enviandoCapa, setEnviandoCapa] = useState(false);

  const form = useForm<BriefingPaiFormValues>({
    resolver: zodResolver(briefingSchema),
    defaultValues: {
      titulo: "",
      subtitulo: "",
      boas_vindas: "",
      nome_aniversariante: "",
      idade_aniversariante: "",
      data_evento: "",
      cor_primaria: "#e6007e",
      cor_secundaria: "#7b3fe4",
      capa_url: "",
      tema_id: "",
      galeria_publica: true,
      moderacao_previa: false,
      tempo_slideshow_segundos: 6,
    },
  });

  const { reset } = form;
  const eventoId = gestao?.evento?.id ?? null;

  useEffect(() => {
    if (gestao?.evento) {
      const ev = gestao.evento;
      reset({
        titulo: ev.titulo,
        subtitulo: ev.subtitulo ?? "",
        boas_vindas: ev.boas_vindas ?? "",
        nome_aniversariante: ev.nome_aniversariante ?? "",
        idade_aniversariante: ev.idade_aniversariante ?? "",
        data_evento: ev.data_evento ?? "",
        cor_primaria: ev.cor_primaria,
        cor_secundaria: ev.cor_secundaria,
        capa_url: ev.capa_url ?? "",
        tema_id: ev.tema_id ?? "",
        galeria_publica: ev.galeria_publica,
        moderacao_previa: ev.moderacao_previa,
        tempo_slideshow_segundos: ev.tempo_slideshow_segundos,
      });
    }
  }, [eventoId, reset]);

  const enviarFotoCapa = async (file: File) => {
    if (!gestao?.evento) return;
    setEnviandoCapa(true);
    try {
      const storagePath = `${gestao.evento.slug}/midias/capa-${gerarUuidLocal()}.jpg`;
      const publicUrl = await uploadBlobComProgresso(
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        FESTA_BUCKET_MIDIAS,
        storagePath,
        file
      );
      form.setValue("capa_url", publicUrl);
      toast.success("Foto de capa enviada! Clique em Salvar alterações.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao enviar foto de capa"
      );
    } finally {
      setEnviandoCapa(false);
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await atualizarMutation.mutateAsync({
        titulo: values.titulo.trim(),
        subtitulo: values.subtitulo?.trim() || null,
        boas_vindas: values.boas_vindas?.trim() || null,
        nome_aniversariante: values.nome_aniversariante?.trim() || null,
        idade_aniversariante: values.idade_aniversariante?.trim() || null,
        data_evento: values.data_evento || null,
        cor_primaria: values.cor_primaria,
        cor_secundaria: values.cor_secundaria,
        capa_url: values.capa_url?.trim() || null,
        tema_id: values.tema_id || null,
        galeria_publica: values.galeria_publica,
        moderacao_previa: values.moderacao_previa,
        tempo_slideshow_segundos: values.tempo_slideshow_segundos,
      });
      toast.success("Briefing e preferências salvos com sucesso!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao salvar briefing"
      );
    }
  }, notificarErrosFormulario);

  return {
    form,
    enviandoCapa,
    enviarFotoCapa,
    onSubmit,
    isSaving: atualizarMutation.isPending,
  };
}
