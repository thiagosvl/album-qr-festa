import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { notificarErrosFormulario } from "@/components/ui/form";
import { useAtualizarBriefingMutation } from "@/hooks/api/useGestaoApi";
import { uploadBlobComProgresso } from "@/hooks/business/useComposicaoCanvas";
import { gerarUuidLocal } from "@/lib/utils";
import type { EventoGestaoDto } from "@/types/festa.types";
import {
  FESTA_CORES_PADRAO,
  FESTA_DESTINO_UPLOAD_EXTRA,
  type FestaDestinoUploadExtra,
} from "@/constants";

const briefingSchema = z.object({
  titulo: z.string().min(2, "Informe o título da festa"),
  subtitulo: z.string().optional(),
  boas_vindas: z.string().max(300).optional(),
  nome_aniversariante: z.string().optional(),
  idade_aniversariante: z.string().optional(),
  data_evento: z.string().optional(),
  cor_primaria: z.string().default(FESTA_CORES_PADRAO.PRIMARIA),
  cor_secundaria: z.string().default(FESTA_CORES_PADRAO.SECUNDARIA),
  capa_url: z.string().optional(),
  tema_id: z.string().optional(),
  galeria_publica: z.boolean().default(true),
  moderacao_previa: z.boolean().default(false),
  tempo_slideshow_segundos: z.coerce.number().int().min(3).max(30).default(6),
  convite_texto_chamada: z.string().optional(),
  convite_foto_url: z.string().optional(),
  convite_banner_topo_url: z.string().optional(),
  convite_musica_url: z.string().optional(),
  convite_audio_obrigado_url: z.string().optional(),
  convite_horario_inicio: z.string().optional(),
  convite_horario_texto: z.string().optional(),
  convite_nome_local: z.string().optional(),
  convite_endereco: z.string().optional(),
  convite_exibir_presentes: z.boolean().default(true),
  convite_titulo_tamanhos: z.string().optional(),
  convite_tamanho_calcado: z.string().optional(),
  convite_tamanho_roupa: z.string().optional(),
  convite_ideias_presentes_texto: z.string().optional(),
  convite_texto_prazo_rsvp: z.string().optional(),
  convite_whatsapp_contato: z.string().optional(),
});

export type BriefingPaiFormValues = z.infer<typeof briefingSchema>;

export function useBriefingPaiForm(
  token: string,
  gestao: EventoGestaoDto | undefined
) {
  const atualizarMutation = useAtualizarBriefingMutation(token);
  const [enviandoCapa, setEnviandoCapa] = useState(false);
  const [enviandoMidiaConvite, setEnviandoMidiaConvite] =
    useState<FestaDestinoUploadExtra | null>(null);

  const form = useForm<BriefingPaiFormValues>({
    resolver: zodResolver(briefingSchema),
    defaultValues: {
      titulo: "",
      subtitulo: "",
      boas_vindas: "",
      nome_aniversariante: "",
      idade_aniversariante: "",
      data_evento: "",
      cor_primaria: FESTA_CORES_PADRAO.PRIMARIA,
      cor_secundaria: FESTA_CORES_PADRAO.SECUNDARIA,
      capa_url: "",
      tema_id: "",
      galeria_publica: true,
      moderacao_previa: false,
      tempo_slideshow_segundos: 6,
      convite_texto_chamada: "",
      convite_foto_url: "",
      convite_banner_topo_url: "",
      convite_musica_url: "",
      convite_audio_obrigado_url: "",
      convite_horario_inicio: "15:00",
      convite_horario_texto: "Às 15h00",
      convite_nome_local: "",
      convite_endereco: "",
      convite_exibir_presentes: true,
      convite_titulo_tamanhos: "",
      convite_tamanho_calcado: "",
      convite_tamanho_roupa: "",
      convite_ideias_presentes_texto: "",
      convite_texto_prazo_rsvp: "",
      convite_whatsapp_contato: "",
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
        convite_texto_chamada: ev.convite_texto_chamada ?? "",
        convite_foto_url: ev.convite_foto_url ?? "",
        convite_banner_topo_url: ev.convite_banner_topo_url ?? "",
        convite_musica_url: ev.convite_musica_url ?? "",
        convite_audio_obrigado_url: ev.convite_audio_obrigado_url ?? "",
        convite_horario_inicio: ev.convite_horario_inicio ?? "15:00",
        convite_horario_texto: ev.convite_horario_texto ?? "",
        convite_nome_local: ev.convite_nome_local ?? "",
        convite_endereco: ev.convite_endereco ?? "",
        convite_exibir_presentes: ev.convite_exibir_presentes,
        convite_titulo_tamanhos: ev.convite_titulo_tamanhos ?? "",
        convite_tamanho_calcado: ev.convite_tamanho_calcado ?? "",
        convite_tamanho_roupa: ev.convite_tamanho_roupa ?? "",
        convite_ideias_presentes_texto: (
          ev.convite_ideias_presentes ?? []
        ).join(", "),
        convite_texto_prazo_rsvp: ev.convite_texto_prazo_rsvp ?? "",
        convite_whatsapp_contato: ev.convite_whatsapp_contato ?? "",
      });
    }
  }, [eventoId, reset]);

  const enviarFotoCapa = async (file: File) => {
    if (!gestao?.evento) return;
    setEnviandoCapa(true);
    try {
      const prefixo = gestao.evento.codigo_url || gestao.evento.slug;
      const storagePath = `${prefixo}/midias/capa-${gerarUuidLocal()}.jpg`;
      const publicUrl = await uploadBlobComProgresso(storagePath, file);
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

  const enviarArquivoConvite = async (
    file: File,
    destino: FestaDestinoUploadExtra
  ) => {
    if (!gestao?.evento) return;
    setEnviandoMidiaConvite(destino);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const prefixo = gestao.evento.codigo_url || gestao.evento.slug;
      const storagePath = `${prefixo}/convite/${destino}-${gerarUuidLocal()}.${ext}`;
      const publicUrl = await uploadBlobComProgresso(storagePath, file);
      if (destino === FESTA_DESTINO_UPLOAD_EXTRA.CONVITE_FOTO) {
        form.setValue("convite_foto_url", publicUrl);
      } else if (destino === FESTA_DESTINO_UPLOAD_EXTRA.CONVITE_BANNER) {
        form.setValue("convite_banner_topo_url", publicUrl);
      } else if (destino === FESTA_DESTINO_UPLOAD_EXTRA.CONVITE_MUSICA) {
        form.setValue("convite_musica_url", publicUrl);
      } else if (destino === FESTA_DESTINO_UPLOAD_EXTRA.CONVITE_AUDIO_OBRIGADO) {
        form.setValue("convite_audio_obrigado_url", publicUrl);
      }
      toast.success("Arquivo enviado! Clique em Salvar alterações.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao enviar arquivo do convite"
      );
    } finally {
      setEnviandoMidiaConvite(null);
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const ideiasPresentes = (values.convite_ideias_presentes_texto ?? "")
        .split(/[,;\n]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

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
        convite_texto_chamada: values.convite_texto_chamada?.trim() || null,
        convite_foto_url: values.convite_foto_url?.trim() || null,
        convite_banner_topo_url: values.convite_banner_topo_url?.trim() || null,
        convite_musica_url: values.convite_musica_url?.trim() || null,
        convite_audio_obrigado_url:
          values.convite_audio_obrigado_url?.trim() || null,
        convite_horario_inicio: values.convite_horario_inicio?.trim() || null,
        convite_horario_texto: values.convite_horario_texto?.trim() || null,
        convite_nome_local: values.convite_nome_local?.trim() || null,
        convite_endereco: values.convite_endereco?.trim() || null,
        convite_exibir_presentes: values.convite_exibir_presentes,
        convite_titulo_tamanhos: values.convite_titulo_tamanhos?.trim() || null,
        convite_tamanho_calcado: values.convite_tamanho_calcado?.trim() || null,
        convite_tamanho_roupa: values.convite_tamanho_roupa?.trim() || null,
        convite_ideias_presentes: ideiasPresentes,
        convite_texto_prazo_rsvp:
          values.convite_texto_prazo_rsvp?.trim() || null,
        convite_whatsapp_contato:
          values.convite_whatsapp_contato?.trim() || null,
      });
      toast.success("Briefing e convite salvos com sucesso!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao salvar briefing"
      );
    }
  }, notificarErrosFormulario);

  return {
    form,
    enviandoCapa,
    enviandoMidiaConvite,
    enviarFotoCapa,
    enviarArquivoConvite,
    onSubmit,
    isSaving: atualizarMutation.isPending,
  };
}
