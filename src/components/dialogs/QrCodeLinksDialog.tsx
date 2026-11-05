import { Copy, ExternalLink, MessageCircle, QrCode } from "lucide-react";
import { toast } from "sonner";
import { Banner } from "@/components/ui/Banner";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { QrCodeView } from "@/components/ui/QrCodeView";
import {
  gerarLinkWhatsappCliente,
  gerarUrlGestaoPai,
  gerarUrlPublicaEvento,
  gerarUrlTelaoEvento,
} from "@/hooks/business/useCalculosPedido";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import type { EventoAdminDto } from "@/types/festa.types";

export interface QrCodeLinksDialogPayload {
  evento: EventoAdminDto;
}

interface QrCodeLinksDialogProps {
  open: boolean;
  onClose: () => void;
  payload: QrCodeLinksDialogPayload | null;
}

export function QrCodeLinksDialog({
  open,
  onClose,
  payload,
}: QrCodeLinksDialogProps) {
  const evento = payload?.evento ?? null;
  if (!evento) return null;

  const urlConvidado = gerarUrlPublicaEvento(evento.slug);
  const urlTelao = gerarUrlTelaoEvento(evento.slug);
  const urlGestaoPai = gerarUrlGestaoPai(evento.token_gestao);

  const copiarTexto = async (texto: string, rotulo: string) => {
    await navigator.clipboard.writeText(texto);
    toast.success(`${rotulo} copiado para a área de transferência!`);
  };

  const mensagemWhatsApp = [
    `Olá${evento.anfitriao?.nome ? `, ${evento.anfitriao.nome}` : ""}! 🎉`,
    `Aqui estão os links oficiais do álbum digital da festa *${evento.titulo}*:`,
    "",
    `📸 *Link do QR Code (Convidados):*`,
    urlConvidado,
    "",
    `👑 *Painel Exclusivo dos Pais (Moderação e Download das fotos):*`,
    urlGestaoPai,
    "",
    `📺 *Modo Telão / TV Ao Vivo:*`,
    urlTelao,
  ].join("\n");

  const linkWhats = gerarLinkWhatsappCliente(
    evento.anfitriao?.telefone,
    mensagemWhatsApp
  );

  return (
    <BaseDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) safeCloseDialog(onClose);
      }}
      className="sm:max-w-[540px]"
    >
      <BaseDialog.Header
        title="QR Code e Links da Festa"
        subtitle={evento.titulo}
        icon={QrCode}
        onClose={onClose}
      />
      <BaseDialog.Body className="space-y-5">
        <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-muted/40 border border-border/60 gap-3">
          <div className="p-4 bg-white rounded-2xl shadow-sm border">
            <QrCodeView value={urlConvidado} size={180} />
          </div>
          <p className="text-xs font-bold text-muted-foreground text-center">
            Escaneie para abrir a câmera e galeria dos convidados
          </p>
        </div>

        <Banner
          variant="neutral"
          title="Link mágico dos pais sem senha"
          description="Envie o link de gestão abaixo apenas para os pais/anfitriões da festa."
        />

        <div className="space-y-3">
          {[
            {
              titulo: "1. Link dos Convidados (QR Code das Mesas)",
              url: urlConvidado,
            },
            {
              titulo: "2. Link Secreto de Gestão dos Pais / Anfitrião",
              url: urlGestaoPai,
            },
            {
              titulo: "3. Link do Telão / TV em Tempo Real",
              url: urlTelao,
            },
          ].map((item) => (
            <div
              key={item.titulo}
              className="p-3 rounded-xl border border-border/80 bg-background flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground">
                  {item.titulo}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {item.url}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  type="button"
                  variant="tonal"
                  size="sm"
                  onClick={() => copiarTexto(item.url, item.titulo)}
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  asChild
                  className="h-9 w-9"
                >
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </BaseDialog.Body>
      <BaseDialog.Footer className="justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => safeCloseDialog(onClose)}
        >
          Fechar
        </Button>
        <Button type="button" asChild>
          <a href={linkWhats} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="w-4 h-4" />
            <span>Enviar Tudo no WhatsApp</span>
          </a>
        </Button>
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
