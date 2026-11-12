import {
  Download,
  ExternalLink,
  Images,
  Loader2,
  Lock,
  MailOpen,
  QrCode,
  Sparkles,
  Unlock,
  UserCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { AlternadorTema } from "@/components/ui/AlternadorTema";
import { FESTA_GESTAO_PAI_TABS } from "@/constants";
import { STATUS_PEDIDO_LABELS } from "@/hooks/business/useCalculosPedido";
import type { AbaGestaoPai } from "@/hooks/ui/useGestaoPaiViewModel";
import { formatarDataBr } from "@/lib/utils";
import type { FestaEvento } from "@/types/festa.types";

interface GestaoPaiHeaderProps {
  evento: FestaEvento;
  abaAtiva: AbaGestaoPai;
  onChangeAba: (aba: AbaGestaoPai) => void;
  onAlternarBloqueioUploads: () => void;
  onBaixarZip: () => void;
  totalMidias: number;
  totalConfirmadosPessoas?: number;
  pausandoEnvios?: boolean;
  baixandoZip?: boolean;
}

const BOTAO =
  "inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45";

export function GestaoPaiHeader({
  evento,
  abaAtiva,
  onChangeAba,
  onAlternarBloqueioUploads,
  onBaixarZip,
  totalMidias,
  totalConfirmadosPessoas = 0,
  pausandoEnvios = false,
  baixandoZip = false,
}: GestaoPaiHeaderProps) {
  const envioPausado = !evento.permite_envio_midias;

  const abas = [
    ...(evento.inclui_galeria
      ? [
          {
            id: FESTA_GESTAO_PAI_TABS.MODERACAO,
            rotulo: `Fotos (${totalMidias})`,
            Icone: Images,
          },
        ]
      : []),
    ...(evento.inclui_convite
      ? [
          {
            id: FESTA_GESTAO_PAI_TABS.CONVITE_CONFIRMADOS,
            rotulo: `Confirmados (${totalConfirmadosPessoas})`,
            Icone: UserCheck,
          },
        ]
      : []),
    {
      id: FESTA_GESTAO_PAI_TABS.BRIEFING,
      rotulo: evento.inclui_convite
        ? "Personalizar festa e convite"
        : "Tema e molduras",
      Icone: Sparkles,
    },
    {
      id: FESTA_GESTAO_PAI_TABS.ACESSO_QR,
      rotulo: "Links e QR Code",
      Icone: QrCode,
    },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-bar/90 backdrop-blur-md">
      <div className="mx-auto max-w-6xl space-y-4 px-4 pb-3 pt-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-muted-foreground">
              Painel dos anfitriões
              <span className="rounded-full bg-gema px-2.5 py-0.5 text-xs font-bold text-gema-foreground">
                {STATUS_PEDIDO_LABELS[evento.status_pedido]}
              </span>
              <AlternadorTema className="sm:hidden" />
            </div>
            <h1 className="mt-1 font-display text-3xl font-extrabold leading-none tracking-tight text-foreground sm:text-4xl">
              {evento.titulo}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {formatarDataBr(evento.data_evento)} •{" "}
              {[
                evento.inclui_galeria ? "Galeria QR Code" : null,
                evento.inclui_convite ? "Convite Interativo" : null,
              ]
                .filter(Boolean)
                .join(" + ")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <AlternadorTema className="hidden sm:inline-flex" />
            {evento.inclui_galeria && (
              <>
                <button
                  type="button"
                  disabled={pausandoEnvios}
                  onClick={onAlternarBloqueioUploads}
                  className={`${BOTAO} flex-1 sm:flex-initial ${
                    envioPausado
                      ? "bg-destructive text-destructive-foreground"
                      : "bg-card text-foreground ring-1 ring-border hover:ring-foreground/30"
                  }`}
                >
                  {pausandoEnvios ? (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                  ) : envioPausado ? (
                    <Lock className="h-4 w-4 shrink-0" />
                  ) : (
                    <Unlock className="h-4 w-4 shrink-0" />
                  )}
                  <span className="truncate">
                    {envioPausado ? "Reabrir envios" : "Pausar envios"}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={totalMidias === 0 || baixandoZip}
                  onClick={onBaixarZip}
                  className={`${BOTAO} flex-1 sm:flex-initial bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground`}
                >
                  {baixandoZip ? (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 shrink-0" />
                  )}
                  <span className="truncate">
                    {baixandoZip ? "Gerando .zip..." : "Baixar fotos"}
                  </span>
                </button>

                <Link
                  to={
                    evento.slug === "demo"
                      ? `/e/${evento.slug}`
                      : `/e/${evento.codigo_url}/${evento.slug}`
                  }
                  target="_blank"
                  className={`${BOTAO} w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary-hover`}
                >
                  <ExternalLink className="h-4 w-4 shrink-0" />
                  <span>Abrir álbum</span>
                </Link>
              </>
            )}

            {evento.inclui_convite && (
              <Link
                to={
                  evento.slug === "demo"
                    ? `/convite/${evento.slug}`
                    : `/convite/${evento.codigo_url}/${evento.slug}`
                }
                target="_blank"
                className={`${BOTAO} w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary-hover`}
              >
                <MailOpen className="h-4 w-4 shrink-0" />
                <span>Ver Convite</span>
              </Link>
            )}
          </div>
        </div>

        <div
          className="no-scrollbar flex gap-1 overflow-x-auto rounded-full bg-muted p-1"
          role="tablist"
        >
          {abas.map(({ id, rotulo, Icone }) => {
            const ativa = abaAtiva === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={ativa}
                onClick={() => onChangeAba(id)}
                className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold transition sm:flex-1 sm:justify-center ${
                  ativa
                    ? "bg-card text-foreground shadow-sm dark:bg-accent"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icone className={`h-3.5 w-3.5 ${ativa ? "text-primary" : ""}`} />
                {rotulo}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
