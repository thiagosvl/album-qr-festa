import { useEffect, useState } from "react";
import { CheckCircle2, Clock, PackageCheck, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  FESTA_BUCKET_MIDIAS,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
} from "@/constants";
import { Banner } from "@/components/ui/Banner";
import { Badge } from "@/components/ui/badge";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useAlternarExtraEntregueMutation,
  useAtualizarEventoMutation,
} from "@/hooks/api/useEventosApi";
import { uploadBlobComProgresso } from "@/hooks/business/useComposicaoCanvas";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { formatarMoedaCentavos, gerarUuidLocal } from "@/lib/utils";
import type { EventoAdminDto, FestaEventoExtra } from "@/types/festa.types";

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
  const [extrasLocais, setExtrasLocais] = useState<FestaEventoExtra[]>([]);
  const [capaUrl, setCapaUrl] = useState("");
  const [qrPdfUrl, setQrPdfUrl] = useState("");
  const [enviandoArquivo, setEnviandoArquivo] = useState(false);

  const alternarEntregueMutation = useAlternarExtraEntregueMutation();
  const atualizarEventoMutation = useAtualizarEventoMutation();

  useEffect(() => {
    if (evento) {
      setExtrasLocais(evento.extras ?? []);
      setCapaUrl(evento.capa_url ?? "");
      setQrPdfUrl(evento.qr_code_pdf_url ?? "");
    }
  }, [evento]);

  if (!evento) return null;

  const handleToggleEntregue = async (extra: FestaEventoExtra) => {
    const novoValor = !extra.entregue;
    try {
      await alternarEntregueMutation.mutateAsync({
        eventoId: evento.id,
        extraEventoId: extra.id,
        entregue: novoValor,
      });
      setExtrasLocais((prev) =>
        prev.map((item) =>
          item.id === extra.id ? { ...item, entregue: novoValor } : item
        )
      );
      toast.success(
        novoValor
          ? `Item "${extra.nome}" marcado como entregue!`
          : `Item "${extra.nome}" voltou para pendente.`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar item");
    }
  };

  const handleUploadArquivo = async (
    file: File,
    destino: "capa" | "pdf"
  ) => {
    setEnviandoArquivo(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const storagePath = `${evento.slug}/midias/${destino}-${gerarUuidLocal()}.${ext}`;
      const url = await uploadBlobComProgresso(
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        FESTA_BUCKET_MIDIAS,
        storagePath,
        file
      );
      if (destino === "capa") setCapaUrl(url);
      else setQrPdfUrl(url);
      toast.success("Arquivo enviado! Clique em Salvar Arquivos.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro no upload");
    } finally {
      setEnviandoArquivo(false);
    }
  };

  const handleSalvarUrls = async () => {
    try {
      await atualizarEventoMutation.mutateAsync({
        id: evento.id,
        payload: {
          capa_url: capaUrl.trim() || null,
          qr_code_pdf_url: qrPdfUrl.trim() || null,
        },
      });
      toast.success("Arquivos e entregáveis do evento atualizados!");
      safeCloseDialog(onClose);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar");
    }
  };

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
      <BaseDialog.Body className="space-y-5">
        <Banner
          variant="info"
          title="Controle de Entregáveis e Artes"
          description="Marque os itens extras já entregues ao cliente e anexe a Foto de Capa do álbum ou o PDF do Display QR Code Temático."
        />

        <div className="space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Checklist de Extras Contratados ({extrasLocais.length})
          </p>
          {extrasLocais.length === 0 ? (
            <div className="p-4 rounded-2xl border border-border/60 bg-muted/20 text-xs text-muted-foreground">
              Nenhum item extra avulso contratado neste evento.
            </div>
          ) : (
            <div className="space-y-2">
              {extrasLocais.map((ex) => (
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
                      variant={ex.entregue ? "outline" : "tonal"}
                      onClick={() => handleToggleEntregue(ex)}
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
          <div className="space-y-1">
            <label className="text-xs font-bold">
              Foto de Capa do Evento (Hero /e/{evento.slug})
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="https://..."
                value={capaUrl}
                onChange={(e) => setCapaUrl(e.target.value)}
              />
              <label className="shrink-0 inline-flex items-center gap-1.5 px-3.5 h-10 rounded-[18px] border border-border bg-muted/60 text-xs font-bold cursor-pointer hover:bg-muted">
                <Upload className="w-3.5 h-3.5" />
                <span>Subir Capa</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={enviandoArquivo}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (f) handleUploadArquivo(f, "capa");
                  }}
                />
              </label>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold">
              Link da Arte do Display QR Temático / Convite (PDF ou Imagem)
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="https://..."
                value={qrPdfUrl}
                onChange={(e) => setQrPdfUrl(e.target.value)}
              />
              <label className="shrink-0 inline-flex items-center gap-1.5 px-3.5 h-10 rounded-[18px] border border-border bg-muted/60 text-xs font-bold cursor-pointer hover:bg-muted">
                <Upload className="w-3.5 h-3.5" />
                <span>Subir Arte</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  disabled={enviandoArquivo}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (f) handleUploadArquivo(f, "pdf");
                  }}
                />
              </label>
            </div>
          </div>
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
        <Button
          type="button"
          disabled={atualizarEventoMutation.isPending || enviandoArquivo}
          onClick={handleSalvarUrls}
        >
          <Save className="w-4 h-4" />
          <span>Salvar Arquivos</span>
        </Button>
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
