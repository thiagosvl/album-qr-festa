import React from "react";
import { FESTA_DIALOG_NAMES } from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import {
  ConfirmActionDialog,
  type ConfirmActionDialogPayload,
} from "@/components/dialogs/ConfirmActionDialog";
import {
  EventoFormDialog,
  type EventoFormDialogPayload,
} from "@/components/dialogs/EventoFormDialog";
import {
  EventoParceiroB2bFormDialog,
  type EventoParceiroB2bFormDialogPayload,
} from "@/components/dialogs/EventoParceiroB2bFormDialog";
import {
  ExtraB2cFormDialog,
  type ExtraB2cFormDialogPayload,
} from "@/components/dialogs/ExtraB2cFormDialog";
import {
  ExtrasEventoAdminDialog,
  type ExtrasEventoAdminDialogPayload,
} from "@/components/dialogs/ExtrasEventoAdminDialog";
import {
  MidiasEventoAdminDialog,
  type MidiasEventoAdminDialogPayload,
} from "@/components/dialogs/MidiasEventoAdminDialog";
import {
  MidiaViewerDialog,
  type MidiaViewerDialogPayload,
} from "@/components/dialogs/MidiaViewerDialog";
import {
  MoldurasEventoDialog,
  type MoldurasEventoDialogPayload,
} from "@/components/dialogs/MoldurasEventoDialog";
import {
  PacoteB2cFormDialog,
  type PacoteB2cFormDialogPayload,
} from "@/components/dialogs/PacoteB2cFormDialog";
import {
  PagamentoManualDialog,
  type PagamentoManualDialogPayload,
} from "@/components/dialogs/PagamentoManualDialog";
import {
  ParceiroB2bFormDialog,
  type ParceiroB2bFormDialogPayload,
} from "@/components/dialogs/ParceiroB2bFormDialog";
import {
  QrCodeLinksDialog,
  type QrCodeLinksDialogPayload,
} from "@/components/dialogs/QrCodeLinksDialog";
import {
  TemaCatalogoFormDialog,
  type TemaCatalogoFormDialogPayload,
} from "@/components/dialogs/TemaCatalogoFormDialog";

export function GlobalDialogsRenderer() {
  const { activeDialog, closeDialog, isDialogOpen } = useLayout();

  return (
    <>
      <ConfirmActionDialog
        open={isDialogOpen(FESTA_DIALOG_NAMES.CONFIRM_ACTION)}
        onClose={() => closeDialog(FESTA_DIALOG_NAMES.CONFIRM_ACTION)}
        payload={
          isDialogOpen(FESTA_DIALOG_NAMES.CONFIRM_ACTION)
            ? (activeDialog.payload as ConfirmActionDialogPayload)
            : null
        }
      />

      <MidiaViewerDialog
        open={isDialogOpen(FESTA_DIALOG_NAMES.MIDIA_VIEWER)}
        onClose={() => closeDialog(FESTA_DIALOG_NAMES.MIDIA_VIEWER)}
        payload={
          isDialogOpen(FESTA_DIALOG_NAMES.MIDIA_VIEWER)
            ? (activeDialog.payload as MidiaViewerDialogPayload)
            : null
        }
      />

      <EventoFormDialog
        open={isDialogOpen(FESTA_DIALOG_NAMES.EVENTO_FORM)}
        onClose={() => closeDialog(FESTA_DIALOG_NAMES.EVENTO_FORM)}
        payload={
          isDialogOpen(FESTA_DIALOG_NAMES.EVENTO_FORM)
            ? (activeDialog.payload as EventoFormDialogPayload)
            : null
        }
      />

      <PagamentoManualDialog
        open={isDialogOpen(FESTA_DIALOG_NAMES.PAGAMENTO_MANUAL)}
        onClose={() => closeDialog(FESTA_DIALOG_NAMES.PAGAMENTO_MANUAL)}
        payload={
          isDialogOpen(FESTA_DIALOG_NAMES.PAGAMENTO_MANUAL)
            ? (activeDialog.payload as PagamentoManualDialogPayload)
            : null
        }
      />

      <MoldurasEventoDialog
        open={isDialogOpen(FESTA_DIALOG_NAMES.MOLDURAS_EVENTO)}
        onClose={() => closeDialog(FESTA_DIALOG_NAMES.MOLDURAS_EVENTO)}
        payload={
          isDialogOpen(FESTA_DIALOG_NAMES.MOLDURAS_EVENTO)
            ? (activeDialog.payload as MoldurasEventoDialogPayload)
            : null
        }
      />

      <QrCodeLinksDialog
        open={isDialogOpen(FESTA_DIALOG_NAMES.QRCODE_LINKS)}
        onClose={() => closeDialog(FESTA_DIALOG_NAMES.QRCODE_LINKS)}
        payload={
          isDialogOpen(FESTA_DIALOG_NAMES.QRCODE_LINKS)
            ? (activeDialog.payload as QrCodeLinksDialogPayload)
            : null
        }
      />

      <MidiasEventoAdminDialog
        open={isDialogOpen(FESTA_DIALOG_NAMES.MIDIAS_EVENTO_ADMIN)}
        onClose={() => closeDialog(FESTA_DIALOG_NAMES.MIDIAS_EVENTO_ADMIN)}
        payload={
          isDialogOpen(FESTA_DIALOG_NAMES.MIDIAS_EVENTO_ADMIN)
            ? (activeDialog.payload as MidiasEventoAdminDialogPayload)
            : null
        }
      />

      <ExtrasEventoAdminDialog
        open={isDialogOpen(FESTA_DIALOG_NAMES.EXTRAS_EVENTO_ADMIN)}
        onClose={() => closeDialog(FESTA_DIALOG_NAMES.EXTRAS_EVENTO_ADMIN)}
        payload={
          isDialogOpen(FESTA_DIALOG_NAMES.EXTRAS_EVENTO_ADMIN)
            ? (activeDialog.payload as ExtrasEventoAdminDialogPayload)
            : null
        }
      />

      <PacoteB2cFormDialog
        open={isDialogOpen(FESTA_DIALOG_NAMES.PACOTE_B2C_FORM)}
        onClose={() => closeDialog(FESTA_DIALOG_NAMES.PACOTE_B2C_FORM)}
        payload={
          isDialogOpen(FESTA_DIALOG_NAMES.PACOTE_B2C_FORM)
            ? (activeDialog.payload as PacoteB2cFormDialogPayload)
            : null
        }
      />

      <ExtraB2cFormDialog
        open={isDialogOpen(FESTA_DIALOG_NAMES.EXTRA_B2C_FORM)}
        onClose={() => closeDialog(FESTA_DIALOG_NAMES.EXTRA_B2C_FORM)}
        payload={
          isDialogOpen(FESTA_DIALOG_NAMES.EXTRA_B2C_FORM)
            ? (activeDialog.payload as ExtraB2cFormDialogPayload)
            : null
        }
      />

      <TemaCatalogoFormDialog
        open={isDialogOpen(FESTA_DIALOG_NAMES.TEMA_CATALOGO_FORM)}
        onClose={() => closeDialog(FESTA_DIALOG_NAMES.TEMA_CATALOGO_FORM)}
        payload={
          isDialogOpen(FESTA_DIALOG_NAMES.TEMA_CATALOGO_FORM)
            ? (activeDialog.payload as TemaCatalogoFormDialogPayload)
            : null
        }
      />

      <ParceiroB2bFormDialog
        open={isDialogOpen(FESTA_DIALOG_NAMES.PARCEIRO_B2B_FORM)}
        onClose={() => closeDialog(FESTA_DIALOG_NAMES.PARCEIRO_B2B_FORM)}
        payload={
          isDialogOpen(FESTA_DIALOG_NAMES.PARCEIRO_B2B_FORM)
            ? (activeDialog.payload as ParceiroB2bFormDialogPayload)
            : null
        }
      />

      <EventoParceiroB2bFormDialog
        open={isDialogOpen(FESTA_DIALOG_NAMES.EVENTO_PARCEIRO_B2B_FORM)}
        onClose={() =>
          closeDialog(FESTA_DIALOG_NAMES.EVENTO_PARCEIRO_B2B_FORM)
        }
        payload={
          isDialogOpen(FESTA_DIALOG_NAMES.EVENTO_PARCEIRO_B2B_FORM)
            ? (activeDialog.payload as EventoParceiroB2bFormDialogPayload)
            : null
        }
      />
    </>
  );
}

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <GlobalDialogsRenderer />
    </>
  );
}
