import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  PACOTE_TIPO_LABELS,
  STATUS_PEDIDO_LABELS,
} from "@/hooks/business/useCalculosPedido";
import type { EventoAdminFormValues } from "@/hooks/form/useEventoAdminForm";
import type {
  FestaCatalogoPacoteB2c,
  FestaPacoteTipoEnum,
  FestaStatusPedidoEnum,
  FestaTemaCatalogo,
} from "@/types/festa.types";

interface EventoDadosBasicosSectionProps {
  form: UseFormReturn<EventoAdminFormValues>;
  pacotes: FestaCatalogoPacoteB2c[];
  temas: FestaTemaCatalogo[];
  onSelectPacote: (tipo: FestaPacoteTipoEnum) => void;
}

export function EventoDadosBasicosSection({
  form,
  pacotes,
  temas,
  onSelectPacote,
}: EventoDadosBasicosSectionProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-bold">Título da Festa *</label>
          <Input
            placeholder="Ex: 1 Aninho da Helena"
            {...form.register("titulo")}
          />
          {form.formState.errors.titulo && (
            <p className="text-xs text-destructive">
              {form.formState.errors.titulo.message}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold">Slug da URL (/e/slug) *</label>
          <Input placeholder="Ex: helena-1-ano" {...form.register("slug")} />
          {form.formState.errors.slug && (
            <p className="text-xs text-destructive">
              {form.formState.errors.slug.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-bold">
            Aniversariante / Homenageado
          </label>
          <Input
            placeholder="Ex: Helena"
            {...form.register("nome_aniversariante")}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold">Idade (opcional)</label>
          <Input
            placeholder="Ex: 1 Aninho"
            {...form.register("idade_aniversariante")}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold">Data da Festa</label>
          <Input type="date" {...form.register("data_evento")} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-bold">Pacote Base B2C</label>
          <select
            className="flex h-10 w-full rounded-[18px] border border-input bg-background px-3 py-2 text-sm"
            value={form.watch("pacote")}
            onChange={(e) =>
              onSelectPacote(e.target.value as FestaPacoteTipoEnum)
            }
          >
            {pacotes.length > 0
              ? pacotes.map((p) => (
                  <option key={p.id} value={p.tipo_pacote}>
                    {p.nome_exibicao} (R$ {(p.preco_centavos / 100).toFixed(0)})
                  </option>
                ))
              : (Object.keys(PACOTE_TIPO_LABELS) as FestaPacoteTipoEnum[]).map(
                  (t) => (
                    <option key={t} value={t}>
                      {PACOTE_TIPO_LABELS[t]}
                    </option>
                  )
                )}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold">Status do Pedido</label>
          <select
            className="flex h-10 w-full rounded-[18px] border border-input bg-background px-3 py-2 text-sm"
            {...form.register("status_pedido")}
          >
            {(Object.keys(STATUS_PEDIDO_LABELS) as FestaStatusPedidoEnum[]).map(
              (st) => (
                <option key={st} value={st}>
                  {STATUS_PEDIDO_LABELS[st]}
                </option>
              )
            )}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold">Tema do Catálogo</label>
          <select
            className="flex h-10 w-full rounded-[18px] border border-input bg-background px-3 py-2 text-sm"
            {...form.register("tema_id")}
          >
            <option value="">Personalizado / Sob Medida</option>
            {temas.map((tema) => (
              <option key={tema.id} value={tema.id}>
                {tema.nome} ({tema.categoria})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-bold">
            Anfitrião (Mãe/Pai/Cliente)
          </label>
          <Input
            placeholder="Nome completo"
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
        <div className="space-y-1">
          <label className="text-xs font-bold">E-mail do Cliente</label>
          <Input
            type="email"
            placeholder="cliente@email.com"
            {...form.register("email_anfitriao")}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-center pt-1">
        <div className="space-y-1">
          <label className="text-xs font-bold">Cor Primária</label>
          <Input
            type="color"
            className="h-10 p-1"
            {...form.register("cor_primaria")}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold">Cor Secundária</label>
          <Input
            type="color"
            className="h-10 p-1"
            {...form.register("cor_secundaria")}
          />
        </div>
        <label className="flex items-center gap-2 text-xs font-medium cursor-pointer pt-4">
          <input
            type="checkbox"
            className="rounded border-input"
            {...form.register("galeria_publica")}
          />
          <span>Galeria Pública</span>
        </label>
        <label className="flex items-center gap-2 text-xs font-medium cursor-pointer pt-4">
          <input
            type="checkbox"
            className="rounded border-input"
            {...form.register("moderacao_previa")}
          />
          <span>Moderação Prévia</span>
        </label>
        <label className="flex items-center gap-2 text-xs font-medium cursor-pointer pt-4">
          <input
            type="checkbox"
            className="rounded border-input"
            {...form.register("permite_envio_midias")}
          />
          <span>Uploads Abertos</span>
        </label>
      </div>
    </div>
  );
}
