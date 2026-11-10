import {
  CheckCheck,
  Download,
  FlaskConical,
  Images,
} from "lucide-react";
import {
  FESTA_DIALOG_NAMES,
  FESTA_FILTRO_MIDIA_ADMIN,
} from "@/constants";
import { MidiaEventoAdminCard } from "@/components/dialogs/midias-admin/MidiaEventoAdminCard";
import { Banner } from "@/components/ui/Banner";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { useLayout } from "@/contexts/LayoutContext";
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
            {vm.midiasFiltradas.map((m) => (
              <MidiaEventoAdminCard
                key={m.id}
                midia={m}
                isDemo={evento.is_demo}
                acaoMidia={vm.acaoMidia}
                onVisualizar={(midia) =>
                  openDialog(FESTA_DIALOG_NAMES.MIDIA_VIEWER, {
                    midia,
                    midias: vm.midiasFiltradas,
                    corPrimaria: evento.cor_primaria,
                  })
                }
                onToggleVisibilidade={vm.handleToggleVisibilidade}
                onToggleFixadaDemo={vm.handleToggleFixadaDemo}
                onExcluir={vm.handleExcluirMidia}
              />
            ))}
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
