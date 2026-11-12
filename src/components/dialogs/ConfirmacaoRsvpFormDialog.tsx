import { Minus, Plus, Users } from "lucide-react";
import { Banner } from "@/components/ui/Banner";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SalvarConfirmacaoRsvpPayload } from "@/hooks/api/useConviteApi";
import { useConfirmacaoRsvpForm } from "@/hooks/form/useConfirmacaoRsvpForm";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import type { FestaEventoConfirmacao } from "@/types/festa.types";

export interface ConfirmacaoRsvpFormDialogPayload {
  confirmacao: FestaEventoConfirmacao | null;
  onSave: (payload: SalvarConfirmacaoRsvpPayload) => Promise<unknown>;
}

interface ConfirmacaoRsvpFormDialogProps {
  open: boolean;
  onClose: () => void;
  payload: ConfirmacaoRsvpFormDialogPayload | null;
}

export function ConfirmacaoRsvpFormDialog({
  open,
  onClose,
  payload,
}: ConfirmacaoRsvpFormDialogProps) {
  const confirmacao = payload?.confirmacao ?? null;
  const onSave = payload?.onSave ?? (async () => undefined);

  const {
    adultos,
    criancas,
    nomesAdultos,
    nomesCriancas,
    erroValidacao,
    isSubmitting,
    alterarQuantidadeAdultos,
    alterarQuantidadeCriancas,
    atualizarNomeAdulto,
    atualizarNomeCrianca,
    handleSubmit,
  } = useConfirmacaoRsvpForm(open, confirmacao, onSave, onClose);

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
        title={
          confirmacao
            ? "Editar Confirmação de Presença"
            : "Adicionar Convidado / Família"
        }
        subtitle="Informe a quantidade de adultos e crianças e os nomes de cada pessoa"
        icon={Users}
        onClose={onClose}
        lockClose={isSubmitting}
      />
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col flex-1 overflow-hidden"
      >
        <BaseDialog.Body className="space-y-4">
          {erroValidacao && (
            <Banner
              variant="danger"
              title="Atenção"
              description={erroValidacao}
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-border/80 bg-muted/20 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-foreground">Adultos</p>
                <p className="text-[11px] text-muted-foreground">Mínimo 1</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  disabled={adultos <= 1}
                  onClick={() => alterarQuantidadeAdultos(adultos - 1)}
                >
                  <Minus className="w-3.5 h-3.5" />
                </Button>
                <span className="w-6 text-center text-sm font-extrabold">
                  {adultos}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  disabled={adultos >= 30}
                  onClick={() => alterarQuantidadeAdultos(adultos + 1)}
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-border/80 bg-muted/20 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-foreground">Crianças</p>
                <p className="text-[11px] text-muted-foreground">Opcional</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  disabled={criancas <= 0}
                  onClick={() => alterarQuantidadeCriancas(criancas - 1)}
                >
                  <Minus className="w-3.5 h-3.5" />
                </Button>
                <span className="w-6 text-center text-sm font-extrabold">
                  {criancas}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  disabled={criancas >= 30}
                  onClick={() => alterarQuantidadeCriancas(criancas + 1)}
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <p className="text-xs font-bold text-foreground">
              Nome dos Adultos ({adultos})
            </p>
            {nomesAdultos.map((nome, idx) => (
              <div key={`adulto-${idx}`}>
                <Input
                  value={nome}
                  onChange={(e) => atualizarNomeAdulto(idx, e.target.value)}
                  placeholder={
                    idx === 0
                      ? "1º Adulto Responsável (Obrigatório) *"
                      : `${idx + 1}º Adulto`
                  }
                />
              </div>
            ))}
          </div>

          {criancas > 0 && (
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-foreground">
                Nome das Crianças ({criancas})
              </p>
              {nomesCriancas.map((nome, idx) => (
                <div key={`crianca-${idx}`}>
                  <Input
                    value={nome}
                    onChange={(e) => atualizarNomeCrianca(idx, e.target.value)}
                    placeholder={`${idx + 1}ª Criança (ex: Pedro - 5 anos)`}
                  />
                </div>
              ))}
            </div>
          )}
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
              : confirmacao
                ? "Salvar Alterações"
                : "Confirmar Presença"}
          </Button>
        </BaseDialog.Footer>
      </form>
    </BaseDialog>
  );
}
