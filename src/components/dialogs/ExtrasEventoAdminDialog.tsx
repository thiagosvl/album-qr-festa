import {
  CheckCircle2,
  Clock,
  Loader2,
  PackageCheck,
  Save,
  Upload,
} from "lucide-react";
import { Banner } from "@/components/ui/Banner";
import { Badge } from "@/components/ui/badge";
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
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { useExtrasEventoAdminViewModel } from "@/hooks/ui/useExtrasEventoAdminViewModel";
import { formatarMoedaCentavos } from "@/lib/utils";
import type { EventoAdminDto } from "@/types/festa.types";

export interface ExtrasEventoAdminDialogPayload {
  evento: EventoAdminDto;
}

interface ExtrasEventoAdminDialogProps {
  open: boolean;
  onClose: () => void;
  payload: ExtrasEventoAdminDialogPayload | null;
}

export function ExtrasEventoAdminDialog({
  open,
  onClose,
  payload,
}: ExtrasEventoAdminDialogProps) {
  const evento = payload?.evento ?? null;
  const vm = useExtrasEventoAdminViewModel(evento, onClose);

  if (!evento) return null;

  return (
    <BaseDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) safeCloseDialog(onClose);
      }}
      className="sm:max-w-[600px]"
    >
      <BaseDialog.Header
        title="Entregáveis, Capa & Extras do Pedido"
        subtitle={evento.titulo}
        icon={PackageCheck}
        onClose={onClose}
      />
      <Form {...vm.form}>
        <form
          onSubmit={vm.handleSalvarUrls}
          noValidate
          className="flex flex-col flex-1 overflow-hidden"
        >
          <BaseDialog.Body className="space-y-5">
            <Banner
              variant="info"
              title="Controle de Entregáveis e Artes"
              description="Marque os itens extras já entregues ao cliente e anexe a Foto de Capa do álbum ou o PDF do Display QR Code Temático."
            />

            <div className="space-y-2.5">
              <p className="text-sm font-semibold text-ameixa-suave">
                Checklist de extras contratados ({vm.extrasLocais.length})
              </p>
              {vm.extrasLocais.length === 0 ? (
                <Banner
                  variant="neutral"
                  title="Nenhum extra avulso contratado"
                  description="Para adicionar itens extras a este pedido, edite o evento na listagem principal."
                />
              ) : (
                <div className="space-y-2">
                  {vm.extrasLocais.map((ex) => (
                    <div
                      key={ex.id}
                      className="p-3 rounded-2xl border border-border/80 bg-background flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="text-xs font-bold">
                          {ex.quantidade}x {ex.nome}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Unitário:{" "}
                          {formatarMoedaCentavos(ex.preco_unitario_centavos)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={ex.entregue ? "success" : "warning"}>
                          {ex.entregue ? "Entregue" : "Pendente"}
                        </Badge>
                        <Button
                          type="button"
                          size="sm"
                          loading={vm.extraProcessandoId === ex.id}
                          variant={ex.entregue ? "outline" : "tonal"}
                          onClick={() => vm.handleToggleEntregue(ex)}
                        >
                          {ex.entregue ? (
                            <>
                              <Clock className="w-3.5 h-3.5" />
                              <span>Reabrir</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Dar Baixa</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3 pt-2 border-t border-border/60">
              <FormField
                control={vm.form.control}
                name="capa_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Foto de Capa do Evento (Hero /e/{evento.slug})
                    </FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <label className="shrink-0 inline-flex items-center gap-1.5 px-3.5 h-10 rounded-[18px] border border-border bg-muted/60 text-xs font-bold cursor-pointer hover:bg-muted">
                        {vm.enviandoDestino === "capa" ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {vm.enviandoDestino === "capa"
                            ? "Enviando..."
                            : "Subir Capa"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={vm.enviandoArquivo}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            e.target.value = "";
                            if (f) vm.handleUploadArquivo(f, "capa");
                          }}
                        />
                      </label>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={vm.form.control}
                name="qr_code_pdf_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Link da Arte do Display QR Temático / Convite (PDF ou
                      Imagem)
                    </FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <label className="shrink-0 inline-flex items-center gap-1.5 px-3.5 h-10 rounded-[18px] border border-border bg-muted/60 text-xs font-bold cursor-pointer hover:bg-muted">
                        {vm.enviandoDestino === "pdf" ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {vm.enviandoDestino === "pdf"
                            ? "Enviando..."
                            : "Subir Arte"}
                        </span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          disabled={vm.enviandoArquivo}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            e.target.value = "";
                            if (f) vm.handleUploadArquivo(f, "pdf");
                          }}
                        />
                      </label>
                    </div>
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
              onClick={() => safeCloseDialog(onClose)}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={vm.salvando}>
              <Save className="w-4 h-4" />
              <span>{vm.salvando ? "Salvando..." : "Salvar Arquivos"}</span>
            </Button>
          </BaseDialog.Footer>
        </form>
      </Form>
    </BaseDialog>
  );
}
