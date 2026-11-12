import { Sparkles } from "lucide-react";
import { EventoConviteConfigSection } from "@/components/dialogs/evento-form/EventoConviteConfigSection";
import { EventoDadosBasicosSection } from "@/components/dialogs/evento-form/EventoDadosBasicosSection";
import { EventoFinanceiroExtrasSection } from "@/components/dialogs/evento-form/EventoFinanceiroExtrasSection";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useEventoAdminForm } from "@/hooks/form/useEventoAdminForm";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import type { EventoAdminDto } from "@/types/festa.types";

export interface EventoFormDialogPayload {
  evento: EventoAdminDto | null;
}

interface EventoFormDialogProps {
  open: boolean;
  onClose: () => void;
  payload: EventoFormDialogPayload | null;
}

export function EventoFormDialog({
  open,
  onClose,
  payload,
}: EventoFormDialogProps) {
  const eventoEdicao = payload?.evento ?? null;
  const {
    form,
    pacotes,
    extrasCatalogo,
    temas,
    extrasArray,
    enviandoMidiaConvite,
    alternarModuloProduto,
    aplicarKitGaleriaCompleta,
    selecionarPacoteTipo,
    enviarArquivoConvite,
    onSubmit,
    isSubmitting,
  } = useEventoAdminForm(open, eventoEdicao, onClose);

  const incluiConvite = form.watch("inclui_convite");

  return (
    <BaseDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) safeCloseDialog(onClose);
      }}
      lockClose={isSubmitting}
      className="sm:max-w-[760px]"
    >
      <BaseDialog.Header
        title={eventoEdicao ? "Editar Evento" : "Novo Evento / Pedido B2C"}
        subtitle="Configure produtos (Galeria e/ou Convite), extras negociados e valores"
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
          <BaseDialog.Body className="space-y-5">
            <EventoDadosBasicosSection
              form={form}
              pacotes={pacotes}
              temas={temas}
              onSelectPacote={selecionarPacoteTipo}
              onToggleModulo={alternarModuloProduto}
              onAplicarKitCompleto={aplicarKitGaleriaCompleta}
            />
            {incluiConvite && (
              <EventoConviteConfigSection
                form={form}
                enviandoMidiaConvite={enviandoMidiaConvite}
                onUploadArquivoConvite={enviarArquivoConvite}
              />
            )}
            <EventoFinanceiroExtrasSection
              form={form}
              extrasArray={extrasArray}
              extrasCatalogo={extrasCatalogo}
            />
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
            <Button type="submit" loading={isSubmitting}>
              {isSubmitting
                ? "Salvando..."
                : eventoEdicao
                  ? "Salvar Alterações"
                  : "Criar Evento"}
            </Button>
          </BaseDialog.Footer>
        </form>
      </Form>
    </BaseDialog>
  );
}
