import type { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import {
  PACOTE_TIPO_LABELS,
  STATUS_PEDIDO_LABELS,
} from "@/hooks/business/useCalculosPedido";
import type { EventoAdminFormValues } from "@/hooks/form/useEventoAdminForm";
import { phoneMask } from "@/lib/masks";
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
        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título da Festa *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: 1 Aninho da Helena" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug da URL (/e/slug) *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: helena-1-ano" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <FormField
          control={form.control}
          name="nome_aniversariante"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Aniversariante / Homenageado</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Helena" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="idade_aniversariante"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Idade (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ex: 1 Aninho" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="data_evento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data da Festa</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <FormField
          control={form.control}
          name="pacote"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pacote Base B2C</FormLabel>
              <FormControl>
                <NativeSelect
                  value={field.value}
                  onChange={(e) =>
                    onSelectPacote(e.target.value as FestaPacoteTipoEnum)
                  }
                >
                  {pacotes.length > 0
                    ? pacotes.map((p) => (
                        <option key={p.id} value={p.tipo_pacote}>
                          {p.nome_exibicao} (R${" "}
                          {(p.preco_centavos / 100).toFixed(0)})
                        </option>
                      ))
                    : (
                        Object.keys(PACOTE_TIPO_LABELS) as FestaPacoteTipoEnum[]
                      ).map((t) => (
                        <option key={t} value={t}>
                          {PACOTE_TIPO_LABELS[t]}
                        </option>
                      ))}
                </NativeSelect>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status_pedido"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status do Pedido</FormLabel>
              <FormControl>
                <NativeSelect {...field}>
                  {(
                    Object.keys(STATUS_PEDIDO_LABELS) as FestaStatusPedidoEnum[]
                  ).map((st) => (
                    <option key={st} value={st}>
                      {STATUS_PEDIDO_LABELS[st]}
                    </option>
                  ))}
                </NativeSelect>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tema_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tema do Catálogo</FormLabel>
              <FormControl>
                <NativeSelect
                  {...field}
                  onChange={(e) => {
                    const id = e.target.value;
                    field.onChange(id);
                    const temaEscolhido = temas.find((t) => t.id === id);
                    if (temaEscolhido) {
                      form.setValue(
                        "cor_primaria",
                        temaEscolhido.cor_primaria_padrao
                      );
                      form.setValue(
                        "cor_secundaria",
                        temaEscolhido.cor_secundaria_padrao
                      );
                    }
                  }}
                >
                  <option value="">Personalizado / Sob Medida</option>
                  {temas.map((tema) => (
                    <option key={tema.id} value={tema.id}>
                      {tema.nome} ({tema.categoria})
                    </option>
                  ))}
                </NativeSelect>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <FormField
          control={form.control}
          name="nome_anfitriao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Anfitrião (Mãe/Pai/Cliente)</FormLabel>
              <FormControl>
                <Input placeholder="Nome completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="telefone_anfitriao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>WhatsApp do Cliente</FormLabel>
              <FormControl>
                <Input
                  placeholder="(11) 99999-9999"
                  {...field}
                  onChange={(e) => field.onChange(phoneMask(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email_anfitriao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail do Cliente</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="cliente@email.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 items-center pt-1">
        <FormField
          control={form.control}
          name="cor_primaria"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cor Primária</FormLabel>
              <FormControl>
                <Input type="color" className="h-10 p-1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cor_secundaria"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cor Secundária</FormLabel>
              <FormControl>
                <Input type="color" className="h-10 p-1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
        <label className="flex items-center gap-2 text-xs font-medium cursor-pointer pt-4">
          <input
            type="checkbox"
            className="rounded border-input"
            {...form.register("permite_video")}
          />
          <span>Vídeos Curtos</span>
        </label>
      </div>
    </div>
  );
}
