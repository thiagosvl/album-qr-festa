import {
  CheckCheck,
  Download,
  Eye,
  EyeOff,
  FlaskConical,
  Images,
  Pin,
  Play,
  Trash2,
} from "lucide-react";
import {
  FESTA_DIALOG_NAMES,
  FESTA_FILTRO_MIDIA_ADMIN,
  FESTA_STATUS_MODERACAO,
  FESTA_TIPO_MIDIA,
} from "@/constants";
import { Banner } from "@/components/ui/Banner";
import { Badge } from "@/components/ui/badge";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { useLayout } from "@/contexts/LayoutContext";
import { STATUS_MODERACAO_LABELS } from "@/hooks/business/useCalculosPedido";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { useMidiasEventoAdminViewModel } from "@/hooks/ui/useMidiasEventoAdminViewModel";
import type { EventoAdminDto } from "@/types/festa.types";

export interface MidiasEventoAdminDialogPayload {
  evento: EventoAdminDto;
}

interface MidiasEventoAdminDialogProps {
  open: boolean;
  onClose: () => void;
  payload: MidiasEventoAdminDialogPayload | null;
}

export function MidiasEventoAdminDialog({
  open,
  onClose,
  payload,
}: MidiasEventoAdminDialogProps) {
  const { openDialog } = useLayout();
  const evento = payload?.evento ?? null;
  const vm = useMidiasEventoAdminViewModel(evento);

  if (!evento) return null;

  const opcoesFiltro = [
    {
      id: FESTA_FILTRO_MIDIA_ADMIN.TODAS,
      label: `Todas (${vm.midias.length})`,
    },
    { id: FESTA_FILTRO_MIDIA_ADMIN.VISIVEIS, label: "Visíveis" },
    {
      id: FESTA_FILTRO_MIDIA_ADMIN.PENDENTES,
      label: `Pendentes (${vm.pendentesCount})`,
    },
    { id: FESTA_FILTRO_MIDIA_ADMIN.OCULTAS, label: "Ocultas" },
    ...(evento.is_demo
      ? [
          {
            id: FESTA_FILTRO_MIDIA_ADMIN.DEMO,
            label: `Fixadas no Demo (${vm.fixadasCount})`,
          },
        ]
      : []),
  ];

  return (
    <BaseDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) safeCloseDialog(onClose);
      }}
      className="sm:max-w-[780px]"
    >
      <BaseDialog.Header
        title={`Galeria & Moderação • ${evento.titulo}`}
        subtitle={`${vm.midias.length} foto(s) no álbum (/e/${evento.slug})`}
        icon={Images}
        onClose={onClose}
      />
      <BaseDialog.Body className="space-y-4">
        <Banner
          variant="info"
          title="Gestão Administrativa de Mídias"
          description={
            evento.is_demo
              ? "No evento Demo, marque o ícone de Alfinete (Fixar) nas fotos que devem aparecer para todos os visitantes da Landing Page."
              : "Aprove, oculte, limpe fotos de teste antes da festa ou baixe o pacote completo em .ZIP."
          }
          action={
            <div className="flex flex-wrap gap-2">
              {vm.pendentesCount > 0 && (
                <Button
                  type="button"
                  size="sm"
                  loading={vm.aprovandoLote}
                  onClick={vm.handleAprovarTodasPendentes}
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Aprovar Pendentes ({vm.pendentesCount})</span>
                </Button>
              )}
              <Button
                type="button"
                variant="tonal"
                size="sm"
                loading={vm.baixandoZip}
                disabled={vm.midias.length === 0}
                onClick={vm.handleBaixarZipAdmin}
              >
                <Download className="w-3.5 h-3.5" />
                <span>{vm.baixandoZip ? "Gerando ZIP..." : "Baixar .ZIP"}</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                loading={vm.limpandoMidias}
                disabled={vm.midias.length === 0}
                onClick={vm.handleLimparNaoFixadas}
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>
                  {evento.is_demo ? "Limpar Não-Fixadas" : "Limpar Fotos de Teste"}
                </span>
              </Button>
            </div>
          }
        />

        <div className="flex flex-wrap gap-2">
          {opcoesFiltro.map((f) => (
            <Button
              key={f.id}
              type="button"
              size="sm"
              variant={vm.filtro === f.id ? "default" : "outline"}
              onClick={() => vm.setFiltro(f.id)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        {vm.isLoadingMidias ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="aspect-[9/16] rounded-2xl bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : vm.midiasFiltradas.length === 0 ? (
          <Banner
            variant="neutral"
            title="Nenhuma foto encontrada neste filtro"
            description="Altere o filtro acima ou envie novas fotos pela câmera do evento."
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {vm.midiasFiltradas.map((m) => {
              const visivel =
                m.status_moderacao === FESTA_STATUS_MODERACAO.APROVADA;
              const processandoEsta = vm.acaoMidia?.id === m.id;
              return (
                <div
                  key={m.id}
                  className={`rounded-2xl border overflow-hidden flex flex-col transition-all ${
                    m.fixada_demo
                      ? "border-primary ring-2 ring-primary/25 bg-primary/[0.03]"
                      : "border-border/80 bg-background"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      openDialog(FESTA_DIALOG_NAMES.MIDIA_VIEWER, {
                        midia: m,
                        midias: vm.midiasFiltradas,
                        corPrimaria: evento.cor_primaria,
                      })
                    }
                    className="aspect-[9/16] bg-ameixa relative block w-full text-left group overflow-hidden"
                  >
                    {m.tipo_midia === FESTA_TIPO_MIDIA.VIDEO &&
                    !m.url_miniatura ? (
                      <video
                        src={m.url_publica}
                        muted
                        playsInline
                        preload="metadata"
                        className={`w-full h-full object-cover ${
                          !visivel ? "opacity-45 grayscale" : ""
                        }`}
                      />
                    ) : (
                      <img
                        src={m.url_miniatura || m.url_publica}
                        alt={m.autor ?? "Convidado"}
                        className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03] ${
                          !visivel ? "opacity-45 grayscale" : ""
                        }`}
                      />
                    )}
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1">
                      {m.fixada_demo && visivel ? (
                        <Badge variant="default" className="gap-1 shadow-sm">
                          <Pin className="w-2.5 h-2.5 fill-current" />
                          Fixada no Demo
                        </Badge>
                      ) : (
                        <Badge variant={visivel ? "success" : "warning"}>
                          {STATUS_MODERACAO_LABELS[m.status_moderacao]}
                        </Badge>
                      )}
                      {m.tipo_midia === FESTA_TIPO_MIDIA.VIDEO && (
                        <Badge variant="default" className="gap-1">
                          <Play className="w-2.5 h-2.5 fill-current" />
                          Vídeo
                        </Badge>
                      )}
                    </div>
                  </button>
                  <div className="p-2.5 space-y-2">
                    <p className="text-xs font-bold truncate">
                      {m.autor || "Convidado"}
                    </p>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        loading={
                          processandoEsta &&
                          vm.acaoMidia?.tipo === "VISIBILIDADE"
                        }
                        disabled={processandoEsta}
                        className="flex-1 h-7 text-[11px] px-1.5"
                        onClick={() => vm.handleToggleVisibilidade(m)}
                      >
                        {visivel ? (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Ocultar</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Aprovar</span>
                          </>
                        )}
                      </Button>

                      {evento.is_demo && (
                        <Button
                          type="button"
                          size="icon"
                          variant={m.fixada_demo ? "default" : "outline"}
                          loading={
                            processandoEsta && vm.acaoMidia?.tipo === "PIN"
                          }
                          disabled={processandoEsta}
                          title={
                            m.fixada_demo
                              ? "Fixada na vitrine Demo (clique para desafixar)"
                              : "Fixar como foto oficial da vitrine Demo"
                          }
                          className="h-7 w-7"
                          onClick={() => vm.handleToggleFixadaDemo(m)}
                        >
                          <Pin
                            className={`w-3 h-3 ${
                              m.fixada_demo ? "fill-current" : ""
                            }`}
                          />
                        </Button>
                      )}

                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        loading={
                          processandoEsta && vm.acaoMidia?.tipo === "EXCLUIR"
                        }
                        disabled={processandoEsta}
                        className="h-7 w-7"
                        onClick={() => vm.handleExcluirMidia(m.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </BaseDialog.Body>
      <BaseDialog.Footer>
        <Button
          type="button"
          variant="outline"
          onClick={() => safeCloseDialog(onClose)}
        >
          Fechar
        </Button>
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
