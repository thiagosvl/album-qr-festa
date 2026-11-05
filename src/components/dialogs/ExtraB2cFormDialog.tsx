import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { FESTA_EFEITO_EXTRA } from "@/constants";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useAtualizarExtraB2cMutation,
  useCriarExtraB2cMutation,
} from "@/hooks/api/useCatalogoApi";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import type { FestaCatalogoExtraB2c } from "@/types/festa.types";

const extraFormSchema = z.object({
  nome: z.string().min(2, "Informe o nome do extra"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Use letras minúsculas, números e hífens"),
  descricao: z.string().optional(),
  preco_reais: z.coerce.number().min(0),
  efeito_tipo: z.enum([
    FESTA_EFEITO_EXTRA.MOLDURA_ADICIONAL,
    FESTA_EFEITO_EXTRA.DIAS_GALERIA_ADICIONAIS,
    FESTA_EFEITO_EXTRA.LIBERAR_TELAO,
    FESTA_EFEITO_EXTRA.LIBERAR_VIDEO,
    FESTA_EFEITO_EXTRA.ENTREGAVEL_MANUAL,
  ]),
  efeito_valor: z.coerce.number().int().min(1),
  ordem: z.coerce.number().int().min(0),
  ativo: z.boolean().default(true),
});

type ExtraFormValues = z.infer<typeof extraFormSchema>;

export interface ExtraB2cFormDialogPayload {
  extra: FestaCatalogoExtraB2c | null;
}

interface ExtraB2cFormDialogProps {
  open: boolean;
  onClose: () => void;
  payload: ExtraB2cFormDialogPayload | null;
}

export function ExtraB2cFormDialog({
  open,
  onClose,
  payload,
}: ExtraB2cFormDialogProps) {
  const extraEdicao = payload?.extra ?? null;
  const criarMutation = useCriarExtraB2cMutation();
  const atualizarMutation = useAtualizarExtraB2cMutation();

  const form = useForm<ExtraFormValues>({
    resolver: zodResolver(extraFormSchema),
    defaultValues: {
      nome: "",
      slug: "",
      descricao: "",
      preco_reais: 15,
      efeito_tipo: FESTA_EFEITO_EXTRA.MOLDURA_ADICIONAL,
      efeito_valor: 1,
      ordem: 1,
      ativo: true,
    },
  });

  useEffect(() => {
    if (!open) return;
    if (extraEdicao) {
      form.reset({
        nome: extraEdicao.nome,
        slug: extraEdicao.slug,
        descricao: extraEdicao.descricao ?? "",
        preco_reais: extraEdicao.preco_centavos / 100,
        efeito_tipo: extraEdicao.efeito_tipo,
        efeito_valor: extraEdicao.efeito_valor,
        ordem: extraEdicao.ordem,
        ativo: extraEdicao.ativo,
      });
    } else {
      form.reset({
        nome: "",
        slug: "",
        descricao: "",
        preco_reais: 15,
        efeito_tipo: FESTA_EFEITO_EXTRA.MOLDURA_ADICIONAL,
        efeito_valor: 1,
        ordem: 1,
        ativo: true,
      });
    }
  }, [open, extraEdicao, form]);

  const isSubmitting = criarMutation.isPending || atualizarMutation.isPending;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const apiPayload = {
        nome: values.nome.trim(),
        slug: values.slug.trim().toLowerCase(),
        descricao: values.descricao?.trim() || null,
        preco_centavos: Math.round(values.preco_reais * 100),
        efeito_tipo: values.efeito_tipo,
        efeito_valor: values.efeito_valor,
        ordem: values.ordem,
        ativo: values.ativo,
      };
      if (extraEdicao) {
        await atualizarMutation.mutateAsync({
          id: extraEdicao.id,
          payload: apiPayload,
        });
        toast.success("Adicional B2C atualizado!");
      } else {
        await criarMutation.mutateAsync(apiPayload);
        toast.success("Novo adicional B2C cadastrado!");
      }
      safeCloseDialog(onClose);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar extra");
    }
  });

  return (
    <BaseDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) safeCloseDialog(onClose);
      }}
      lockClose={isSubmitting}
      className="sm:max-w-[520px]"
    >
      <BaseDialog.Header
        title={extraEdicao ? "Editar Adicional B2C" : "Novo Adicional (Add-on)"}
        subtitle="Configure preço padrão e efeito automático nas permissões do evento"
        icon={Sparkles}
        onClose={onClose}
        lockClose={isSubmitting}
      />
      <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
        <BaseDialog.Body className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold">Nome do Adicional *</label>
              <Input
                placeholder="Ex: Moldura Personalizada Extra"
                {...form.register("nome")}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">Slug *</label>
              <Input
                placeholder="Ex: moldura-extra"
                {...form.register("slug")}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold">Descrição</label>
            <Input
              placeholder="Descrição exibida na Landing Page"
              {...form.register("descricao")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold">Preço Padrão (R$)</label>
              <Input
                type="number"
                step="0.01"
                {...form.register("preco_reais")}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">Efeito Automático</label>
              <select
                className="flex h-10 w-full rounded-[18px] border border-input bg-background px-3 py-2 text-xs font-medium"
                {...form.register("efeito_tipo")}
              >
                <option value={FESTA_EFEITO_EXTRA.MOLDURA_ADICIONAL}>
                  + Moldura(s) no Limite
                </option>
                <option value={FESTA_EFEITO_EXTRA.DIAS_GALERIA_ADICIONAIS}>
                  + Dias de Galeria Ativa
                </option>
                <option value={FESTA_EFEITO_EXTRA.LIBERAR_TELAO}>
                  Liberar Modo Telão
                </option>
                <option value={FESTA_EFEITO_EXTRA.LIBERAR_VIDEO}>
                  Liberar Vídeos Curtos
                </option>
                <option value={FESTA_EFEITO_EXTRA.ENTREGAVEL_MANUAL}>
                  Entregável Manual (Convite/PDF)
                </option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">Qtd do Efeito</label>
              <Input type="number" {...form.register("efeito_valor")} />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input type="checkbox" {...form.register("ativo")} />
              <span>Ativo no Catálogo e na Landing Page</span>
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
            {isSubmitting ? "Salvando..." : "Salvar Adicional"}
          </Button>
        </BaseDialog.Footer>
      </form>
    </BaseDialog>
  );
}
