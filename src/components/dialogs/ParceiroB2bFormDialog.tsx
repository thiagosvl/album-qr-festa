import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, Coins } from "lucide-react";
import { toast } from "sonner";
import {
  FESTA_STATUS_ASSINATURA_B2B,
  FESTA_TIPO_TRANSACAO_CREDITO,
} from "@/constants";
import { Badge } from "@/components/ui/badge";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useAtualizarParceiroB2bMutation,
  useCriarParceiroB2bMutation,
  useRegistrarCreditoB2bMutation,
} from "@/hooks/api/useParceiroB2bApi";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import type {
  FestaCatalogoPlanoB2b,
  FestaTipoTransacaoCreditoEnum,
  ParceiroB2bAdminDto,
} from "@/types/festa.types";

const parceiroSchema = z.object({
  nome_empresa: z.string().min(2, "Informe o nome da empresa/parceiro"),
  documento: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().optional(),
  cor_marca: z.string().default("#7c3aed"),
  status_assinatura: z.enum([
    FESTA_STATUS_ASSINATURA_B2B.TRIAL,
    FESTA_STATUS_ASSINATURA_B2B.ATIVA,
    FESTA_STATUS_ASSINATURA_B2B.INADIMPLENTE,
    FESTA_STATUS_ASSINATURA_B2B.CANCELADA,
  ]),
  plano_b2b_id: z.string().optional(),
  saldo_creditos: z.coerce.number().int().min(0).default(6),
  ativo: z.boolean().default(true),
});

type ParceiroFormValues = z.infer<typeof parceiroSchema>;

export interface ParceiroB2bFormDialogPayload {
  parceiro: ParceiroB2bAdminDto | null;
  planos: FestaCatalogoPlanoB2b[];
}

interface ParceiroB2bFormDialogProps {
  open: boolean;
  onClose: () => void;
  payload: ParceiroB2bFormDialogPayload | null;
}

export function ParceiroB2bFormDialog({
  open,
  onClose,
  payload,
}: ParceiroB2bFormDialogProps) {
  const parceiroEdicao = payload?.parceiro ?? null;
  const planos = payload?.planos ?? [];
  const primeiroPlanoId = planos[0]?.id ?? "";

  const [qtdCredito, setQtdCredito] = useState(6);
  const [tipoCredito, setTipoCredito] =
    useState<FestaTipoTransacaoCreditoEnum>(
      FESTA_TIPO_TRANSACAO_CREDITO.RECARGA_PLANO
    );
  const [obsCredito, setObsCredito] = useState("");

  const criarMutation = useCriarParceiroB2bMutation();
  const atualizarMutation = useAtualizarParceiroB2bMutation();
  const creditoMutation = useRegistrarCreditoB2bMutation();

  const form = useForm<ParceiroFormValues>({
    resolver: zodResolver(parceiroSchema),
    defaultValues: {
      nome_empresa: "",
      documento: "",
      telefone: "",
      email: "",
      cor_marca: "#7c3aed",
      status_assinatura: FESTA_STATUS_ASSINATURA_B2B.ATIVA,
      plano_b2b_id: primeiroPlanoId,
      saldo_creditos: 6,
      ativo: true,
    },
  });

  useEffect(() => {
    if (!open) return;
    if (parceiroEdicao) {
      form.reset({
        nome_empresa: parceiroEdicao.nome_empresa,
        documento: parceiroEdicao.documento ?? "",
        telefone: parceiroEdicao.telefone ?? "",
        email: parceiroEdicao.email ?? "",
        cor_marca: parceiroEdicao.cor_marca ?? "#7c3aed",
        status_assinatura: parceiroEdicao.status_assinatura,
        plano_b2b_id: parceiroEdicao.plano_b2b_id ?? "",
        saldo_creditos: parceiroEdicao.saldo_creditos,
        ativo: parceiroEdicao.ativo,
      });
    } else {
      form.reset({
        nome_empresa: "",
        documento: "",
        telefone: "",
        email: "",
        cor_marca: "#7c3aed",
        status_assinatura: FESTA_STATUS_ASSINATURA_B2B.ATIVA,
        plano_b2b_id: primeiroPlanoId,
        saldo_creditos: 6,
        ativo: true,
      });
    }
  }, [open, parceiroEdicao, primeiroPlanoId, form]);

  const handleLancarCreditos = async () => {
    if (!parceiroEdicao) return;
    try {
      await creditoMutation.mutateAsync({
        parceiroId: parceiroEdicao.id,
        payload: {
          tipo: tipoCredito,
          quantidade: qtdCredito,
          observacao: obsCredito.trim() || null,
        },
      });
      setObsCredito("");
      toast.success("Movimentação de créditos B2B registrada!");
      safeCloseDialog(onClose);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao lançar créditos"
      );
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const apiPayload = {
        nome_empresa: values.nome_empresa.trim(),
        documento: values.documento?.trim() || null,
        telefone: values.telefone?.trim() || null,
        email: values.email?.trim() || null,
        cor_marca: values.cor_marca,
        status_assinatura: values.status_assinatura,
        plano_b2b_id: values.plano_b2b_id || null,
        saldo_creditos: values.saldo_creditos,
        ativo: values.ativo,
      };
      if (parceiroEdicao) {
        await atualizarMutation.mutateAsync({
          id: parceiroEdicao.id,
          payload: apiPayload,
        });
        toast.success("Parceiro B2B atualizado!");
      } else {
        await criarMutation.mutateAsync(apiPayload);
        toast.success("Parceiro B2B cadastrado com sucesso!");
      }
      safeCloseDialog(onClose);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao salvar parceiro"
      );
    }
  });

  const isSubmitting = criarMutation.isPending || atualizarMutation.isPending;

  return (
    <BaseDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) safeCloseDialog(onClose);
      }}
      lockClose={isSubmitting}
      className="sm:max-w-[620px]"
    >
      <BaseDialog.Header
        title={
          parceiroEdicao
            ? `Parceiro B2B • ${parceiroEdicao.nome_empresa}`
            : "Novo Parceiro B2B (Buffet / Fotógrafo)"
        }
        subtitle="Gerencie assinatura, plano de créditos e identidade White-Label"
        icon={Building2}
        onClose={onClose}
        lockClose={isSubmitting}
      />
      <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
        <BaseDialog.Body className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold">
                Nome do Buffet / Estúdio *
              </label>
              <Input
                placeholder="Ex: Buffet Castelo Mágico"
                {...form.register("nome_empresa")}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">CNPJ / CPF</label>
              <Input
                placeholder="00.000.000/0001-00"
                {...form.register("documento")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold">WhatsApp</label>
              <Input
                placeholder="(11) 99999-9999"
                {...form.register("telefone")}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">E-mail Comercial</label>
              <Input
                type="email"
                placeholder="contato@empresa.com"
                {...form.register("email")}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">Cor da Marca</label>
              <Input
                type="color"
                className="h-10 p-1"
                {...form.register("cor_marca")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold">Plano B2B</label>
              <select
                className="flex h-10 w-full rounded-[18px] border border-input bg-background px-3 py-2 text-xs font-medium"
                {...form.register("plano_b2b_id")}
              >
                <option value="">Sem Plano Fixo</option>
                {planos.map((pl) => (
                  <option key={pl.id} value={pl.id}>
                    {pl.nome} ({pl.creditos_mensais} créd/mês)
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">Status Assinatura</label>
              <select
                className="flex h-10 w-full rounded-[18px] border border-input bg-background px-3 py-2 text-xs font-medium"
                {...form.register("status_assinatura")}
              >
                <option value={FESTA_STATUS_ASSINATURA_B2B.ATIVA}>Ativa</option>
                <option value={FESTA_STATUS_ASSINATURA_B2B.TRIAL}>Trial</option>
                <option value={FESTA_STATUS_ASSINATURA_B2B.INADIMPLENTE}>
                  Inadimplente
                </option>
                <option value={FESTA_STATUS_ASSINATURA_B2B.CANCELADA}>
                  Cancelada
                </option>
              </select>
            </div>
            {!parceiroEdicao && (
              <div className="space-y-1">
                <label className="text-xs font-bold">Créditos Iniciais</label>
                <Input type="number" {...form.register("saldo_creditos")} />
              </div>
            )}
          </div>

          {parceiroEdicao && (
            <div className="p-4 rounded-2xl border border-primary/25 bg-primary/5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold flex items-center gap-1.5 text-primary">
                  <Coins className="w-4 h-4" />
                  <span>
                    Recarregar / Movimentar Créditos (Saldo atual:{" "}
                    {parceiroEdicao.saldo_creditos} créditos)
                  </span>
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select
                  value={tipoCredito}
                  onChange={(e) =>
                    setTipoCredito(
                      e.target.value as FestaTipoTransacaoCreditoEnum
                    )
                  }
                  className="h-9 rounded-xl border border-input bg-background px-2.5 text-xs font-medium"
                >
                  <option value={FESTA_TIPO_TRANSACAO_CREDITO.RECARGA_PLANO}>
                    + Recarga Mensal do Plano
                  </option>
                  <option value={FESTA_TIPO_TRANSACAO_CREDITO.COMPRA_AVULSA}>
                    + Compra de Crédito Avulso
                  </option>
                  <option value={FESTA_TIPO_TRANSACAO_CREDITO.ESTORNO}>
                    + Estorno de Crédito
                  </option>
                  <option value={FESTA_TIPO_TRANSACAO_CREDITO.CONSUMO_EVENTO}>
                    - Débito Manual de Crédito
                  </option>
                </select>
                <Input
                  type="number"
                  min={1}
                  value={qtdCredito}
                  onChange={(e) => setQtdCredito(Number(e.target.value))}
                  className="h-9 text-xs"
                  placeholder="Qtd créditos"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="tonal"
                  disabled={creditoMutation.isPending}
                  onClick={handleLancarCreditos}
                >
                  Lançar Créditos
                </Button>
              </div>
              <Input
                value={obsCredito}
                onChange={(e) => setObsCredito(e.target.value)}
                placeholder="Observação do lançamento (ex: Pix avulso 10 créditos)"
                className="h-9 text-xs"
              />

              {parceiroEdicao.transacoes.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <p className="text-[11px] font-bold text-muted-foreground">
                    Últimas Movimentações:
                  </p>
                  <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                    {parceiroEdicao.transacoes.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-background border border-border/60"
                      >
                        <span className="truncate">
                          {tx.observacao || tx.tipo}
                        </span>
                        <Badge
                          variant={tx.quantidade >= 0 ? "success" : "secondary"}
                        >
                          {tx.quantidade >= 0
                            ? `+${tx.quantidade}`
                            : tx.quantidade}{" "}
                          créd
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
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
            {isSubmitting ? "Salvando..." : "Salvar Parceiro"}
          </Button>
        </BaseDialog.Footer>
      </form>
    </BaseDialog>
  );
}
