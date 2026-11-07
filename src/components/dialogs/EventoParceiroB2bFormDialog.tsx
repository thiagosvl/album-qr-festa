import { Sparkles } from "lucide-react";
import { FESTA_PACOTE_TIPO } from "@/constants";
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
  FestaTemaCatalogo,
  ParceiroB2bAdminDto,
} from "@/types/festa.types";

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
  const { form, pacoteSelecionado, custoCreditos, onSubmit, isSubmitting } =
    useEventoParceiroB2bForm(open, parceiro, onClose);

  if (!parceiro) return null;

  return (
    <BaseDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) safeCloseDialog(onClose);
      }}
      lockClose={isSubmitting}
      className="sm:max-w-[560px]"
    >
      <BaseDialog.Header
        title="Ativar Novo Evento com Créditos B2B"
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
              title={`Custo desta ativação: ${custoCreditos} crédito(s) (${pacoteSelecionado})`}
              description="O álbum e o link de gestão do cliente são liberados imediatamente como Quitado."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug da URL (/e/slug) *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: lucas-5-anos" {...field} />
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
                    <FormLabel>Tipo do Evento</FormLabel>
                    <FormControl>
                      <NativeSelect className="text-xs" {...field}>
                        <option value={FESTA_PACOTE_TIPO.BASICO}>
                          Pacote Básico (
                          {parceiro.plano?.custo_creditos_basico ?? 1} crédito)
                        </option>
                        <option value={FESTA_PACOTE_TIPO.COMPLETO}>
                          Completo + Telão (
                          {parceiro.plano?.custo_creditos_completo ?? 2}{" "}
                          créditos)
                        </option>
                      </NativeSelect>
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
                ? "Ativando..."
                : `Ativar por ${custoCreditos} Crédito(s)`}
            </Button>
          </BaseDialog.Footer>
        </form>
      </Form>
    </BaseDialog>
  );
}
