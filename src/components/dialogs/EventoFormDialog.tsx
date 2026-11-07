import { Sparkles } from "lucide-react";
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
    selecionarPacoteTipo,
    onSubmit,
    isSubmitting,
  } = useEventoAdminForm(open, eventoEdicao, onClose);

  return (
    <BaseDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) safeCloseDialog(onClose);
      }}
      lockClose={isSubmitting}
      className="sm:max-w-[720px]"
    >
      <BaseDialog.Header
        title={eventoEdicao ? "Editar Evento" : "Novo Evento / Pedido B2C"}
        subtitle="Configure pacote, limites de molduras, extras negociados e valores"
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
            />
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
