import { useState } from "react";
import {
  Copy,
  Download,
  ExternalLink,
  Loader2,
  MailOpen,
  Tv,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { QrCodeView } from "@/components/ui/QrCodeView";
import {
  gerarPathConviteEvento,
  gerarPathPublicoEvento,
  gerarPathTelaoEvento,
  gerarUrlConviteEvento,
  gerarUrlPublicaEvento,
  gerarUrlTelaoEvento,
} from "@/hooks/business/useCalculosPedido";
import { baixarPlaquinhaQrCodePng } from "@/hooks/business/useGeradorDisplayQr";
import type { FestaEvento } from "@/types/festa.types";

interface GestaoAcessoQrSectionProps {
  evento: FestaEvento;
}

export function GestaoAcessoQrSection({ evento }: GestaoAcessoQrSectionProps) {
  const [baixandoPlaquinha, setBaixandoPlaquinha] = useState(false);
  const urlPublica = gerarUrlPublicaEvento(evento.slug, evento.codigo_url);
  const urlConvite = gerarUrlConviteEvento(evento.slug, evento.codigo_url);
  const urlTelao = gerarUrlTelaoEvento(evento.slug, evento.codigo_url);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {evento.inclui_convite && (
        <section className="flex flex-col justify-between rounded-card border border-border/60 bg-card p-6 shadow-card sm:p-8">
          <div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
              <MailOpen className="h-6 w-6" />
            </div>
            <h2 className="mt-4 font-display text-2xl font-extrabold tracking-tight">
              Link do Convite Interativo
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Envie este link para os seus convidados no WhatsApp para verem os
              detalhes da festa e confirmarem presença.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <p className="break-all rounded-2xl bg-muted p-3 text-xs text-muted-foreground">
              {urlConvite}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-secondary px-4 text-sm font-semibold text-secondary-foreground transition hover:bg-primary hover:text-primary-foreground"
                onClick={() => {
                  navigator.clipboard.writeText(urlConvite);
                  toast.success("Link do convite copiado!");
                }}
              >
                <Copy className="h-4 w-4" />
                Copiar link do convite
              </button>
              <Link
                to={gerarPathConviteEvento(evento.slug, evento.codigo_url)}
                target="_blank"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
              >
                <ExternalLink className="h-4 w-4" />
                Abrir convite
              </Link>
            </div>
          </div>
        </section>
      )}

      {evento.inclui_galeria && (
        <section className="relative overflow-hidden rounded-card border border-border/60 bg-card p-6 text-center shadow-card sm:p-8">
          <h2 className="font-display text-2xl font-extrabold tracking-tight">
            QR Code da festa
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Imprima e deixe nas mesas, na entrada e na lembrancinha.
          </p>
          <div className="mx-auto mt-5 w-fit rounded-3xl bg-white p-3 ring-1 ring-border">
            <QrCodeView value={urlPublica} size={200} />
          </div>
          <div
            className="picotado mx-auto mt-6 text-foreground/25"
            aria-hidden="true"
          />
          <p className="mt-4 break-all text-xs text-muted-foreground">
            {urlPublica}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-secondary px-4 text-sm font-semibold text-secondary-foreground transition hover:bg-primary hover:text-primary-foreground"
              onClick={() => {
                navigator.clipboard.writeText(urlPublica);
                toast.success("Link do álbum copiado");
              }}
            >
              <Copy className="h-4 w-4" />
              Copiar link
            </button>
            <Link
              to={gerarPathPublicoEvento(evento.slug, evento.codigo_url)}
              target="_blank"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
            >
              <ExternalLink className="h-4 w-4" />
              Testar o álbum
            </Link>
            <button
              type="button"
              disabled={baixandoPlaquinha}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-rosa-vivo px-4 text-sm font-semibold text-ameixa disabled:pointer-events-none disabled:opacity-50"
              onClick={() => {
                setBaixandoPlaquinha(true);
                baixarPlaquinhaQrCodePng({
                  slug: evento.slug,
                  titulo: evento.titulo,
                  subtitulo: evento.subtitulo,
                  cor_primaria: evento.cor_primaria,
                  cor_secundaria: evento.cor_secundaria,
                  urlPublica,
                })
                  .then(() =>
                    toast.success(
                      "Plaquinha QR Code pronta para impressão baixada!"
                    )
                  )
                  .catch((err: Error) => toast.error(err.message))
                  .finally(() => setBaixandoPlaquinha(false));
              }}
            >
              {baixandoPlaquinha ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {baixandoPlaquinha
                ? "Gerando plaquinha..."
                : "Gerar Plaquinha QR (PNG)"}
            </button>
            {evento.qr_code_pdf_url && (
              <a
                href={evento.qr_code_pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-secondary px-4 text-sm font-semibold text-secondary-foreground"
              >
                <Download className="h-4 w-4" />
                Baixar plaquinha pronta
              </a>
            )}
          </div>
        </section>
      )}

      {evento.inclui_galeria && (
        <section className="flex flex-col justify-between rounded-card border border-border/60 bg-card p-6 shadow-card sm:p-8">
          <div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
              <Tv className="h-6 w-6" />
            </div>
            <h2 className="mt-4 font-display text-2xl font-extrabold tracking-tight">
              Telão da festa
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {evento.inclui_telao
                ? "Abra na Smart TV ou no notebook ligado ao projetor. As fotos entram na hora."
                : "O telão faz parte do Kit Completo e pode ser adicionado avulso quando quiser."}
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <p className="break-all rounded-2xl bg-muted p-3 text-xs text-muted-foreground">
              {urlTelao}
            </p>
            {evento.inclui_telao && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-secondary px-4 text-sm font-semibold text-secondary-foreground transition hover:bg-primary hover:text-primary-foreground"
                  onClick={() => {
                    navigator.clipboard.writeText(urlTelao);
                    toast.success("Link do telão copiado");
                  }}
                >
                  <Copy className="h-4 w-4" />
                  Copiar link do telão
                </button>
                <Link
                  to={gerarPathTelaoEvento(evento.slug, evento.codigo_url)}
                  target="_blank"
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
                >
                  <Tv className="h-4 w-4" />
                  Abrir o telão
                </Link>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
