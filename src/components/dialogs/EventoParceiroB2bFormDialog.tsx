import { Sparkles } from "lucide-react";
import { EventoParceiroModulosSection } from "@/components/dialogs/evento-form/EventoParceiroModulosSection";
import { Banner } from "@/components/ui/Banner";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { useEventoParceiroB2bForm } from "@/hooks/form/useEventoParceiroB2bForm";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { phoneMask } from "@/lib/masks";
import type {
  EventoAdminDto,
  FestaCatalogoExtraB2c,
  FestaCatalogoProduto,
  FestaTemaCatalogo,
  ParceiroB2bAdminDto,
} from "@/types/festa.types";

export interface EventoParceiroB2bFormDialogPayload {
  parceiro: ParceiroB2bAdminDto;
  temas: FestaTemaCatalogo[];
  produtosCatalogo?: FestaCatalogoProduto[];
  extrasCatalogo?: FestaCatalogoExtraB2c[];
  evento?: EventoAdminDto | null;
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
  const produtosCatalogo = payload?.produtosCatalogo ?? [];
  const extrasCatalogo = (payload?.extrasCatalogo ?? []).filter(
    (e) => e.disponivel_b2b && e.ativo
  );
  const eventoEdicao = payload?.evento ?? null;

  const {
    form,
    incluiConvite,
    extrasIdsSelecionados,
    custoCreditos,
    custoCreditosTotal,
    creditosJaConsumidos,
    alternarExtraB2b,
    onSubmit,
    isSubmitting,
  } = useEventoParceiroB2bForm(
    open,
    parceiro,
    onClose,
    produtosCatalogo,
    extrasCatalogo,
    eventoEdicao
  );

  if (!parceiro) return null;

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
          eventoEdicao
            ? "Editar / Fazer Upgrade do Evento B2B"
            : "Ativar Novo Evento com Créditos B2B"
        }
        subtitle={`${parceiro.nome_empresa} • Saldo disponível: ${parceiro.saldo_creditos} crédito(s)`}
        icon={Sparkles}
        onClose={onClose}
        lockClose={isSubmitting}
      />
      <Form {...form}>
        <form
          onSubmit={onSubmit}
          noValidate
          className="flex flex-col flex-1 overflow-hidden"
        >
          <BaseDialog.Body className="space-y-4">
            <Banner
              variant={
                parceiro.saldo_creditos >= custoCreditos ? "info" : "warning"
              }
              title={
                eventoEdicao
                  ? `Diferença a debitar: ${custoCreditos} crédito(s) (Total: ${custoCreditosTotal} • Já consumido: ${creditosJaConsumidos})`
                  : `Custo desta ativação: ${custoCreditos} crédito(s)`
              }
              description="Selecione Galeria QR Code, Convite Interativo ou ambos e opcionais extras."
            />

            <EventoParceiroModulosSection
              form={form}
              extrasCatalogo={extrasCatalogo}
              extrasIdsSelecionados={extrasIdsSelecionados}
              onAlternarExtra={alternarExtraB2b}
            />

            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título da Festa *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 5 Anos do Lucas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <FormField
                control={form.control}
                name="tema_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tema Base</FormLabel>
                    <FormControl>
                      <NativeSelect
                        className="text-xs"
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
                        <option value="">Personalizado</option>
                        {temas.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.nome}
                          </option>
                        ))}
                      </NativeSelect>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {incluiConvite && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-muted/30 border border-border/60">
                <FormField
                  control={form.control}
                  name="convite_horario_texto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Horário da Festa</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Às 15h00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="convite_nome_local"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Nome do Local</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Buffet Alegria" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="convite_endereco"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Endereço (Maps)</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <FormField
                control={form.control}
                name="nome_aniversariante"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel>Aniversariante</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Lucas" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="idade_aniversariante"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel>Idade</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 5 anos" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cor_primaria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor Principal</FormLabel>
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="nome_anfitriao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nome do Cliente Final (Pais/Anfitrião)
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Fernanda Souza" {...field} />
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
                        onChange={(e) =>
                          field.onChange(phoneMask(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </BaseDialog.Body>
          <BaseDialog.Footer>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => safeCloseDialog(onClose)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={parceiro.saldo_creditos < custoCreditos}
            >
              {isSubmitting
                ? "Salvando..."
                : eventoEdicao
                  ? custoCreditos > 0
                    ? `Salvar Upgrade (+${custoCreditos} Créd.)`
                    : "Salvar Alterações"
                  : `Ativar por ${custoCreditos} Crédito(s)`}
            </Button>
          </BaseDialog.Footer>
        </form>
      </Form>
    </BaseDialog>
  );
}
