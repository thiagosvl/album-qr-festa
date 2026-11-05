import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Package } from "lucide-react";
import { toast } from "sonner";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAtualizarPacoteB2cMutation } from "@/hooks/api/useCatalogoApi";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import type { FestaCatalogoPacoteB2c } from "@/types/festa.types";

const pacoteSchema = z.object({
  nome_exibicao: z.string().min(2, "Informe o nome de exibição"),
  descricao: z.string().optional(),
  preco_reais: z.coerce.number().min(0),
  preco_ancora_reais: z.coerce.number().min(0),
  limite_molduras: z.coerce.number().int().min(1).max(20),
  dias_galeria_ativa: z.coerce.number().int().min(1).max(3650),
  inclui_qr_tematico: z.boolean().default(false),
  inclui_telao: z.boolean().default(false),
  permite_video: z.boolean().default(false),
  ativo: z.boolean().default(true),
});

type PacoteFormValues = z.infer<typeof pacoteSchema>;

export interface PacoteB2cFormDialogPayload {
  pacote: FestaCatalogoPacoteB2c;
}

interface PacoteB2cFormDialogProps {
  open: boolean;
  onClose: () => void;
  payload: PacoteB2cFormDialogPayload | null;
}

export function PacoteB2cFormDialog({
  open,
  onClose,
  payload,
}: PacoteB2cFormDialogProps) {
  const pacote = payload?.pacote ?? null;
  const atualizarMutation = useAtualizarPacoteB2cMutation();

  const form = useForm<PacoteFormValues>({
    resolver: zodResolver(pacoteSchema),
    defaultValues: {
      nome_exibicao: "",
      descricao: "",
      preco_reais: 0,
      preco_ancora_reais: 0,
      limite_molduras: 1,
      dias_galeria_ativa: 90,
      inclui_qr_tematico: false,
      inclui_telao: false,
      permite_video: false,
      ativo: true,
    },
  });

  useEffect(() => {
    if (!open || !pacote) return;
    form.reset({
      nome_exibicao: pacote.nome_exibicao,
      descricao: pacote.descricao ?? "",
      preco_reais: pacote.preco_centavos / 100,
      preco_ancora_reais: (pacote.preco_ancora_centavos ?? 0) / 100,
      limite_molduras: pacote.limite_molduras,
      dias_galeria_ativa: pacote.dias_galeria_ativa,
      inclui_qr_tematico: pacote.inclui_qr_tematico,
      inclui_telao: pacote.inclui_telao,
      permite_video: pacote.permite_video,
      ativo: pacote.ativo,
    });
  }, [open, pacote, form]);

  if (!pacote) return null;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await atualizarMutation.mutateAsync({
        id: pacote.id,
        payload: {
          nome_exibicao: values.nome_exibicao.trim(),
          descricao: values.descricao?.trim() || null,
          preco_centavos: Math.round(values.preco_reais * 100),
          preco_ancora_centavos:
            values.preco_ancora_reais > 0
              ? Math.round(values.preco_ancora_reais * 100)
              : null,
          limite_molduras: values.limite_molduras,
          dias_galeria_ativa: values.dias_galeria_ativa,
          inclui_qr_tematico: values.inclui_qr_tematico,
          inclui_telao: values.inclui_telao,
          permite_video: values.permite_video,
          ativo: values.ativo,
        },
      });
      toast.success("Pacote B2C atualizado no catálogo e na Landing Page!");
      safeCloseDialog(onClose);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar pacote");
    }
  });

  return (
    <BaseDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) safeCloseDialog(onClose);
      }}
      lockClose={atualizarMutation.isPending}
      className="sm:max-w-[540px]"
    >
      <BaseDialog.Header
        title={`Editar ${pacote.nome_exibicao} (${pacote.tipo_pacote})`}
        subtitle="Altere preços, limites de molduras e permissões padrão do pacote"
        icon={Package}
        onClose={onClose}
        lockClose={atualizarMutation.isPending}
      />
      <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
        <BaseDialog.Body className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold">Nome de Exibição *</label>
            <Input {...form.register("nome_exibicao")} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold">Descrição Comercial</label>
            <textarea
              rows={2}
              className="flex w-full rounded-[18px] border border-input bg-background p-3 text-sm"
              {...form.register("descricao")}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold">Preço Oficial (R$)</label>
              <Input
                type="number"
                step="0.01"
                {...form.register("preco_reais")}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">Preço Âncora (De R$)</label>
              <Input
                type="number"
                step="0.01"
                {...form.register("preco_ancora_reais")}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">Molduras Inclusas</label>
              <Input type="number" {...form.register("limite_molduras")} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">Dias de Galeria</label>
              <Input type="number" {...form.register("dias_galeria_ativa")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input type="checkbox" {...form.register("inclui_telao")} />
              <span>Inclui Telão / TV em Tempo Real</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input type="checkbox" {...form.register("inclui_qr_tematico")} />
              <span>Inclui Display QR Code Temático</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input type="checkbox" {...form.register("permite_video")} />
              <span>Permite Vídeos Curtos</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input type="checkbox" {...form.register("ativo")} />
              <span>Pacote Ativo para Venda</span>
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
          <Button type="submit" disabled={atualizarMutation.isPending}>
            {atualizarMutation.isPending ? "Salvando..." : "Salvar Pacote"}
          </Button>
        </BaseDialog.Footer>
      </form>
    </BaseDialog>
  );
}
