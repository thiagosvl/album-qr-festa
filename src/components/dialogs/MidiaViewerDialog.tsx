import {
  ChevronLeft,
  ChevronRight,
  Download,
  Heart,
  Share2,
  Trash2,
  User,
} from "lucide-react";
import { FESTA_TIPO_MIDIA } from "@/constants";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import {
  formatarDataHoraEnvioMidia,
  useMidiaViewerViewModel,
  type MidiaViewerDialogPayload,
} from "@/hooks/ui/useMidiaViewerViewModel";

export type { MidiaViewerDialogPayload };

interface MidiaViewerDialogProps {
  open: boolean;
  onClose: () => void;
  payload: MidiaViewerDialogPayload | null;
}

export function MidiaViewerDialog({
  open,
  onClose,
  payload,
}: MidiaViewerDialogProps) {
  const vm = useMidiaViewerViewModel(open, payload, onClose);

  if (!vm.midia || !payload) return null;

  const dataEnvioTexto = formatarDataHoraEnvioMidia(vm.midia.created_at);
  const subtitulo =
    vm.totalMidias > 1
      ? `Foto ${vm.indiceAtual + 1} de ${vm.totalMidias} • ${dataEnvioTexto}`
      : dataEnvioTexto;
  const corDestaque = payload.corPrimaria || "#e6007e";

  return (
    <BaseDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) safeCloseDialog(onClose);
      }}
      className="sm:max-w-[500px] bg-ameixa text-white border-white/15 shadow-palco"
    >
      <BaseDialog.Header
        title={vm.midia.autor || "Convidado da Festa"}
        subtitle={subtitulo}
        icon={User}
        onClose={onClose}
        className="bg-ameixa border-white/10 text-white [&_h2]:text-white [&_p]:text-white/70 [&_button]:bg-white/15 [&_button]:text-white [&_button:hover]:bg-white/25"
      />

      <BaseDialog.Body className="relative p-3 sm:p-4 bg-black/55 flex items-center justify-center overflow-hidden">
        {vm.totalMidias > 1 && (
          <button
            type="button"
            onClick={vm.irParaAnterior}
            aria-label="Foto anterior"
            title="Foto anterior (←)"
            className="absolute left-3 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ameixa shadow-palco transition hover:scale-105 active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        <div className="relative flex items-center justify-center overflow-hidden rounded-2xl ring-2 ring-white/20 shadow-palco bg-ameixa">
          {vm.midia.tipo_midia === FESTA_TIPO_MIDIA.VIDEO ? (
            <video
              key={vm.midia.id}
              src={vm.midia.url_publica}
              controls
              autoPlay
              playsInline
              loop
              className="max-h-[68vh] w-auto object-contain select-none"
            />
          ) : (
            <img
              key={vm.midia.id}
              src={vm.midia.url_publica}
              alt={vm.midia.autor ?? "Foto da festa"}
              className="max-h-[68vh] w-auto object-contain select-none"
            />
          )}
        </div>

        {vm.totalMidias > 1 && (
          <button
            type="button"
            onClick={vm.irParaProxima}
            aria-label="Próxima foto"
            title="Próxima foto (→)"
            className="absolute right-3 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ameixa shadow-palco transition hover:scale-105 active:scale-95"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </BaseDialog.Body>

      <BaseDialog.Footer className="bg-ameixa border-white/10 justify-between">
        <div className="flex items-center gap-2">
          {payload.onToggleCurtida ? (
            <Button
              type="button"
              variant={vm.curtidaLocal ? "default" : "secondary"}
              size="sm"
              onClick={vm.handleCurtir}
              aria-pressed={vm.curtidaLocal}
              aria-label={vm.curtidaLocal ? "Descurtir foto" : "Curtir foto"}
              className="rounded-full"
            >
              <Heart
                className={`w-4 h-4 ${vm.curtidaLocal ? "fill-current" : ""}`}
              />
              <span className="tabular-nums">
                {vm.contadorCurtidas === 1
                  ? "1 curtida"
                  : `${vm.contadorCurtidas} curtidas`}
              </span>
            </Button>
          ) : (
            <span className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white/12 px-3.5 text-xs font-bold text-white">
              <Heart
                className="w-4 h-4 fill-current"
                style={{ color: corDestaque }}
              />
              <span className="tabular-nums">
                {vm.contadorCurtidas === 1
                  ? "1 curtida"
                  : `${vm.contadorCurtidas} curtidas`}
              </span>
            </span>
          )}

          {vm.ehMinhaAtual && payload.onExcluirPropria && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              loading={vm.excluindo}
              onClick={vm.handleExcluir}
              aria-label="Apagar foto"
              className="rounded-full"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Apagar</span>
            </Button>
          )}
        </div>

        <Button
          type="button"
          size="sm"
          loading={vm.baixando}
          onClick={vm.handleCompartilharOuBaixar}
          className="rounded-full"
        >
          {vm.podeCompartilharNativo ? (
            <>
              <Share2 className="w-4 h-4" />
              <span>Compartilhar</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Baixar lembrança</span>
            </>
          )}
        </Button>
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
