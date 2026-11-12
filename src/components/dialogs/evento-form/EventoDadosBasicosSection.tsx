import { Sparkles } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { FESTA_CODIGO_MODULO } from "@/constants";
import { EventoPersonalizacaoFields } from "@/components/dialogs/evento-form/EventoPersonalizacaoFields";
import { Button } from "@/components/ui/button";
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
  onToggleModulo: (
    modulo:
      | typeof FESTA_CODIGO_MODULO.GALERIA
      | typeof FESTA_CODIGO_MODULO.CONVITE,
    ativo: boolean
  ) => void;
  onAplicarKitCompleto: () => void;
}

export function EventoDadosBasicosSection({
  form,
  pacotes,
  temas,
  onSelectPacote,
  onToggleModulo,
  onAplicarKitCompleto,
}: EventoDadosBasicosSectionProps) {
  const incluiGaleria = form.watch("inclui_galeria");
  const incluiConvite = form.watch("inclui_convite");

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl border border-border/80 bg-muted/20 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-bold text-foreground">
            Produtos Contratados neste Evento *
          </p>
          <Button
            type="button"
            variant="tonal"
            size="sm"
            className="h-7 px-2.5 text-[11px]"
            onClick={onAplicarKitCompleto}
          >
            <Sparkles className="w-3 h-3" />
            <span>Aplicar Kit Galeria Completa</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border/80 bg-background cursor-pointer">
            <input
              type="checkbox"
              checked={incluiGaleria}
              onChange={(e) =>
                onToggleModulo(FESTA_CODIGO_MODULO.GALERIA, e.target.checked)
              }
            />
            <div>
              <p className="text-xs font-bold text-foreground">
                Galeria QR Code Ao Vivo (/e/slug)
              </p>
              <p className="text-[11px] text-muted-foreground">
                Fotos com moldura e mural ao vivo da festa
              </p>
            </div>
          </label>

          <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border/80 bg-background cursor-pointer">
            <input
              type="checkbox"
              checked={incluiConvite}
              onChange={(e) =>
                onToggleModulo(FESTA_CODIGO_MODULO.CONVITE, e.target.checked)
              }
            />
            <div>
              <p className="text-xs font-bold text-foreground">
                Convite Interativo + RSVP (/convite/slug)
              </p>
              <p className="text-[11px] text-muted-foreground">
                Envelope 3D, mapa, presentes e lista de presença
              </p>
            </div>
          </label>
        </div>
      </div>
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

      <EventoPersonalizacaoFields form={form} />
    </div>
  );
}
