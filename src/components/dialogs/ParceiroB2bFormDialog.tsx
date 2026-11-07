import { Building2, Upload } from "lucide-react";
import { FESTA_STATUS_ASSINATURA_B2B } from "@/constants";
import { ParceiroCredenciaisAdminSection } from "@/components/dialogs/parceiro-b2b/ParceiroCredenciaisAdminSection";
import { ParceiroCreditosAdminSection } from "@/components/dialogs/parceiro-b2b/ParceiroCreditosAdminSection";
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
import { useParceiroB2bForm } from "@/hooks/form/useParceiroB2bForm";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { cpfCnpjMask, phoneMask } from "@/lib/masks";
import type {
  FestaCatalogoPlanoB2b,
  ParceiroB2bAdminDto,
} from "@/types/festa.types";

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

  const {
    form,
    creditoForm,
    enviandoLogo,
    lancandoCredito,
    gerandoLinkAcesso,
    handleUploadLogo,
    handleLancarCreditos,
    handleCopiarLinkAcesso,
    onSubmit,
    isSubmitting,
  } = useParceiroB2bForm(open, parceiroEdicao, planos, onClose);

  return (
    <BaseDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) safeCloseDialog(onClose);
      }}
      lockClose={isSubmitting}
      className="sm:max-w-[640px]"
    >
      <BaseDialog.Header
        title={
          parceiroEdicao
            ? `Parceiro B2B • ${parceiroEdicao.nome_empresa}`
            : "Novo Parceiro B2B (Buffet / Fotógrafo)"
        }
        subtitle="Gerencie credenciais de acesso ao portal, plano de créditos e identidade visual"
        icon={Building2}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="nome_empresa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Buffet / Estúdio *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Buffet Castelo Mágico"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="documento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ / CPF</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="00.000.000/0001-00"
                        {...field}
                        onChange={(e) =>
                          field.onChange(cpfCnpjMask(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp</FormLabel>
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
              <FormField
                control={form.control}
                name="cor_marca"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor da Marca</FormLabel>
                    <FormControl>
                      <Input type="color" className="h-10 p-1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <ParceiroCredenciaisAdminSection
              form={form}
              parceiroEdicao={parceiroEdicao}
              gerandoLinkAcesso={gerandoLinkAcesso}
              onCopiarLinkAcesso={handleCopiarLinkAcesso}
            />

            <FormField
              control={form.control}
              name="logo_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logotipo do Parceiro (Opcional)</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <label className="shrink-0 inline-flex items-center gap-1.5 px-3.5 h-10 rounded-[18px] border border-border bg-muted/60 text-xs font-bold cursor-pointer hover:bg-muted">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{enviandoLogo ? "Enviando..." : "Subir Logo"}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          e.target.value = "";
                          if (f) handleUploadLogo(f);
                        }}
                      />
                    </label>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="plano_b2b_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plano B2B</FormLabel>
                    <FormControl>
                      <NativeSelect className="text-xs" {...field}>
                        <option value="">Sem Plano Fixo</option>
                        {planos.map((pl) => (
                          <option key={pl.id} value={pl.id}>
                            {pl.nome} ({pl.creditos_mensais} créd/mês)
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
                name="status_assinatura"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Assinatura</FormLabel>
                    <FormControl>
                      <NativeSelect className="text-xs" {...field}>
                        <option value={FESTA_STATUS_ASSINATURA_B2B.ATIVA}>
                          Ativa
                        </option>
                        <option value={FESTA_STATUS_ASSINATURA_B2B.TRIAL}>
                          Trial
                        </option>
                        <option
                          value={FESTA_STATUS_ASSINATURA_B2B.INADIMPLENTE}
                        >
                          Inadimplente
                        </option>
                        <option value={FESTA_STATUS_ASSINATURA_B2B.CANCELADA}>
                          Cancelada
                        </option>
                      </NativeSelect>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!parceiroEdicao && (
                <FormField
                  control={form.control}
                  name="saldo_creditos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Créditos Iniciais</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {parceiroEdicao && (
              <ParceiroCreditosAdminSection
                saldoAtual={parceiroEdicao.saldo_creditos}
                creditoForm={creditoForm}
                lancandoCredito={lancandoCredito}
                onLancarCreditos={handleLancarCreditos}
              />
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
              {isSubmitting ? "Salvando..." : "Salvar Parceiro"}
            </Button>
          </BaseDialog.Footer>
        </form>
      </Form>
    </BaseDialog>
  );
}
