import {
  Download,
  ExternalLink,
  Images,
  Loader2,
  Lock,
  QrCode,
  Sparkles,
  Unlock,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  PACOTE_TIPO_LABELS,
  STATUS_PEDIDO_LABELS,
} from "@/hooks/business/useCalculosPedido";
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
  pausandoEnvios = false,
  baixandoZip = false,
}: GestaoPaiHeaderProps) {
  const envioPausado = !evento.permite_envio_midias;

  const abas = [
    { id: "MODERACAO" as const, rotulo: `Fotos (${totalMidias})`, Icone: Images },
    { id: "BRIEFING" as const, rotulo: "Tema e molduras", Icone: Sparkles },
    { id: "ACESSO_QR" as const, rotulo: "QR Code e telão", Icone: QrCode },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-ameixa/10 bg-papel/90 backdrop-blur-md">
      <div className="mx-auto max-w-6xl space-y-4 px-4 pb-3 pt-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ameixa-suave">
              Painel dos anfitriões
              <span className="rounded-full bg-gema px-2.5 py-0.5 text-xs font-bold text-ameixa">
                {STATUS_PEDIDO_LABELS[evento.status_pedido]}
              </span>
            </p>
            <h1 className="mt-1 font-display text-3xl font-extrabold leading-none tracking-tight text-ameixa sm:text-4xl">
              {evento.titulo}
            </h1>
            <p className="mt-2 text-sm text-ameixa-suave">
              {formatarDataBr(evento.data_evento)}, pacote{" "}
              {PACOTE_TIPO_LABELS[evento.pacote]}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={pausandoEnvios}
              onClick={onAlternarBloqueioUploads}
              className={`${BOTAO} flex-1 sm:flex-initial ${
                envioPausado
                  ? "bg-rosa text-white"
                  : "bg-white text-ameixa ring-1 ring-ameixa/15 hover:ring-ameixa/30"
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
              className={`${BOTAO} flex-1 sm:flex-initial bg-uva-claro text-uva hover:bg-uva hover:text-white`}
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
              to={`/e/${evento.slug}`}
              target="_blank"
              className={`${BOTAO} w-full sm:w-auto bg-ameixa text-white`}
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              <span>Abrir álbum</span>
            </Link>
          </div>
        </div>

        <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-full bg-ameixa/[0.06] p-1" role="tablist">
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
                    ? "bg-white text-ameixa shadow-sm"
                    : "text-ameixa-suave hover:text-ameixa"
                }`}
              >
                <Icone className={`h-3.5 w-3.5 ${ativa ? "text-uva" : ""}`} />
                {rotulo}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
