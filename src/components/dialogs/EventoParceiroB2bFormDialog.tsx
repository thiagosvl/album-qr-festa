import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { FESTA_PACOTE_TIPO } from "@/constants";
import { Banner } from "@/components/ui/Banner";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCriarEventoPortalParceiroMutation } from "@/hooks/api/useParceiroB2bApi";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import type {
  FestaTemaCatalogo,
  ParceiroB2bAdminDto,
} from "@/types/festa.types";

const schema = z.object({
  titulo: z.string().min(2, "Informe o título da festa"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Use letras minúsculas, números e hífens"),
  nome_aniversariante: z.string().optional(),
  idade_aniversariante: z.string().optional(),
  data_evento: z.string().optional(),
  pacote: z.enum([FESTA_PACOTE_TIPO.BASICO, FESTA_PACOTE_TIPO.COMPLETO]),
  tema_id: z.string().optional(),
  cor_primaria: z.string().default("#e6007e"),
  cor_secundaria: z.string().default("#7c3aed"),
  nome_anfitriao: z.string().optional(),
  telefone_anfitriao: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export interface EventoParceiroB2bFormDialogPayload {
  parceiro: ParceiroB2bAdminDto;
  temas: FestaTemaCatalogo[];
}

interface EventoParceiroB2bFormDialogProps {
  open: boolean;
  onClose: () => void;
  payload: EventoParceiroB2bFormDialogPayload | null;
}

export function EventoParceiroB2bFormDialog({
  open,
  onClose,
  payload,
}: EventoParceiroB2bFormDialogProps) {
  const parceiro = payload?.parceiro ?? null;
  const temas = payload?.temas ?? [];
  const criarMutation = useCriarEventoPortalParceiroMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      titulo: "",
      slug: "",
      nome_aniversariante: "",
      idade_aniversariante: "",
      data_evento: new Date().toISOString().slice(0, 10),
      pacote: FESTA_PACOTE_TIPO.COMPLETO,
      tema_id: "",
      cor_primaria: parceiro?.cor_marca ?? "#e6007e",
      cor_secundaria: "#7c3aed",
      nome_anfitriao: "",
      telefone_anfitriao: "",
    },
  });

  if (!parceiro) return null;

  const pacoteSelecionado = form.watch("pacote");
  const custoCreditos =
    pacoteSelecionado === FESTA_PACOTE_TIPO.COMPLETO
      ? (parceiro.plano?.custo_creditos_completo ?? 2)
      : (parceiro.plano?.custo_creditos_basico ?? 1);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await criarMutation.mutateAsync({
        parceiroId: parceiro.id,
        payload: {
          titulo: values.titulo.trim(),
          slug: values.slug.trim().toLowerCase(),
          nome_aniversariante: values.nome_aniversariante?.trim() || null,
          idade_aniversariante: values.idade_aniversariante?.trim() || null,
          data_evento: values.data_evento || null,
          pacote: values.pacote,
          tema_id: values.tema_id || null,
          cor_primaria: values.cor_primaria,
          cor_secundaria: values.cor_secundaria,
          nome_anfitriao: values.nome_anfitriao?.trim() || null,
          telefone_anfitriao: values.telefone_anfitriao?.trim() || null,
        },
      });
      toast.success(
        `Evento criado com sucesso! ${custoCreditos} crédito(s) utilizado(s).`
      );
      safeCloseDialog(onClose);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao criar evento B2B"
      );
    }
  });

  return (
    <BaseDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) safeCloseDialog(onClose);
      }}
      lockClose={criarMutation.isPending}
      className="sm:max-w-[560px]"
    >
      <BaseDialog.Header
        title="Ativar Novo Evento com Créditos B2B"
        subtitle={`${parceiro.nome_empresa} • Saldo disponível: ${parceiro.saldo_creditos} crédito(s)`}
        icon={Sparkles}
        onClose={onClose}
        lockClose={criarMutation.isPending}
      />
      <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
        <BaseDialog.Body className="space-y-4">
          <Banner
            variant={
              parceiro.saldo_creditos >= custoCreditos ? "info" : "warning"
            }
            title={`Custo desta ativação: ${custoCreditos} crédito(s) (${pacoteSelecionado})`}
            description="O álbum e o link de gestão do cliente são liberados imediatamente como Quitado."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold">Título da Festa *</label>
              <Input
                placeholder="Ex: 5 Anos do Lucas"
                {...form.register("titulo")}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">Slug da URL (/e/slug) *</label>
              <Input
                placeholder="Ex: lucas-5-anos"
                {...form.register("slug")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold">Tipo do Evento</label>
              <select
                className="flex h-10 w-full rounded-[18px] border border-input bg-background px-3 py-2 text-xs font-medium"
                {...form.register("pacote")}
              >
                <option value={FESTA_PACOTE_TIPO.BASICO}>
                  Pacote Básico ({parceiro.plano?.custo_creditos_basico ?? 1}{" "}
                  crédito)
                </option>
                <option value={FESTA_PACOTE_TIPO.COMPLETO}>
                  Completo + Telão (
                  {parceiro.plano?.custo_creditos_completo ?? 2} créditos)
                </option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">Data da Festa</label>
              <Input type="date" {...form.register("data_evento")} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">Tema Base</label>
              <select
                className="flex h-10 w-full rounded-[18px] border border-input bg-background px-3 py-2 text-xs font-medium"
                {...form.register("tema_id")}
              >
                <option value="">Personalizado</option>
                {temas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold">
                Nome do Cliente Final (Pais/Anfitrião)
              </label>
              <Input
                placeholder="Ex: Fernanda Souza"
                {...form.register("nome_anfitriao")}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">WhatsApp do Cliente</label>
              <Input
                placeholder="(11) 99999-9999"
                {...form.register("telefone_anfitriao")}
              />
            </div>
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
          <Button
            type="submit"
            disabled={
              criarMutation.isPending || parceiro.saldo_creditos < custoCreditos
            }
          >
            {criarMutation.isPending
              ? "Ativando..."
              : `Ativar por ${custoCreditos} Crédito(s)`}
          </Button>
        </BaseDialog.Footer>
      </form>
    </BaseDialog>
  );
}
