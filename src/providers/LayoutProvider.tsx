import React from "react";
import { FESTA_DIALOG_NAMES } from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import {
  ConfirmActionDialog,
  type ConfirmActionDialogPayload,
} from "@/components/dialogs/ConfirmActionDialog";
import {
  ConfirmacaoRsvpFormDialog,
  type ConfirmacaoRsvpFormDialogPayload,
} from "@/components/dialogs/ConfirmacaoRsvpFormDialog";
import {
  ConfirmacoesEventoDialog,
  type ConfirmacoesEventoDialogPayload,
} from "@/components/dialogs/ConfirmacoesEventoDialog";
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
  OperadorParceiroFormDialog,
  type OperadorParceiroFormDialogPayload,
} from "@/components/dialogs/OperadorParceiroFormDialog";
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
  PlanoB2bFormDialog,
  type PlanoB2bFormDialogPayload,
} from "@/components/dialogs/PlanoB2bFormDialog";
import {
  ProdutoB2cFormDialog,
  type ProdutoB2cFormDialogPayload,
} from "@/components/dialogs/ProdutoB2cFormDialog";
import {
  QrCodeLinksDialog,
  type QrCodeLinksDialogPayload,
} from "@/components/dialogs/QrCodeLinksDialog";
import {
  RecuperarSenhaDialog,
  type RecuperarSenhaDialogPayload,
} from "@/components/dialogs/RecuperarSenhaDialog";
import {
  TemaCatalogoFormDialog,
  type TemaCatalogoFormDialogPayload,
} from "@/components/dialogs/TemaCatalogoFormDialog";

export function GlobalDialogsRenderer() {
  const { closeDialog, isDialogOpen, getDialogPayload } = useLayout();

  return (
    <>
      <EventoFormDialog
        open={isDialogOpen(FESTA_DIALOG_NAMES.EVENTO_FORM)}
        onClose={() => closeDialog(FESTA_DIALOG_NAMES.EVENTO_FORM)}
        payload={getDialogPayload<EventoFormDialogPayload>(
          FESTA_DIALOG_NAMES.EVENTO_FORM
        )}
      />

      <PagamentoManualDialog
        open={isDialogOpen(FESTA_DIALOG_NAMES.PAGAMENTO_MANUAL)}
        onClose={() => closeDialog(FESTA_DIALOG_NAMES.PAGAMENTO_MANUAL)}
        payload={getDialogPayload<PagamentoManualDialogPayload>(
          FESTA_DIALOG_NAMES.PAGAMENTO_MANUAL
        )}
      />

      <MoldurasEventoDialog
        open={isDialogOpen(FESTA_DIALOG_NAMES.MOLDURAS_EVENTO)}
        onClose={() => closeDialog(FESTA_DIALOG_NAMES.MOLDURAS_EVENTO)}
        payload={getDialogPayload<MoldurasEventoDialogPayload>(
          FESTA_DIALOG_NAMES.MOLDURAS_EVENTO
        )}
      />

      <QrCodeLinksDialog
        open={isDialogOpen(FESTA_DIALOG_NAMES.QRCODE_LINKS)}
        onClose={() => closeDialog(FESTA_DIALOG_NAMES.QRCODE_LINKS)}
        payload={getDialogPayload<QrCodeLinksDialogPayload>(
          FESTA_DIALOG_NAMES.QRCODE_LINKS
        )}
      />

      <MidiasEventoAdminDialog
        open={isDialogOpen(FESTA_DIALOG_NAMES.MIDIAS_EVENTO_ADMIN)}
        onClose={() => closeDialog(FESTA_DIALOG_NAMES.MIDIAS_EVENTO_ADMIN)}
        payload={getDialogPayload<MidiasEventoAdminDialogPayload>(
          FESTA_DIALOG_NAMES.MIDIAS_EVENTO_ADMIN
        )}
      />

      <ExtrasEventoAdminDialog
        open={isDialogOpen(FESTA_DIALOG_NAMES.EXTRAS_EVENTO_ADMIN)}
        onClose={() => closeDialog(FESTA_DIALOG_NAMES.EXTRAS_EVENTO_ADMIN)}
        payload={getDialogPayload<ExtrasEventoAdminDialogPayload>(
          FESTA_DIALOG_NAMES.EXTRAS_EVENTO_ADMIN
        )}
      />

      <PacoteB2cFormDialog
        open={isDialogOpen(FESTA_DIALOG_NAMES.PACOTE_B2C_FORM)}
        onClose={() => closeDialog(FESTA_DIALOG_NAMES.PACOTE_B2C_FORM)}
        payload={getDialogPayload<PacoteB2cFormDialogPayload>(
          FESTA_DIALOG_NAMES.PACOTE_B2C_FORM
        )}
      />

      <ProdutoB2cFormDialog
        open={isDialogOpen(FESTA_DIALOG_NAMES.PRODUTO_B2C_FORM)}
        onClose={() => closeDialog(FESTA_DIALOG_NAMES.PRODUTO_B2C_FORM)}
        payload={getDialogPayload<ProdutoB2cFormDialogPayload>(
          FESTA_DIALOG_NAMES.PRODUTO_B2C_FORM
        )}
      />

      <ConfirmacoesEventoDialog
        open={isDialogOpen(FESTA_DIALOG_NAMES.CONFIRMACOES_EVENTO)}
        onClose={() => closeDialog(FESTA_DIALOG_NAMES.CONFIRMACOES_EVENTO)}
        payload={getDialogPayload<ConfirmacoesEventoDialogPayload>(
          FESTA_DIALOG_NAMES.CONFIRMACOES_EVENTO
        )}
      />

      <ConfirmacaoRsvpFormDialog
        open={isDialogOpen(FESTA_DIALOG_NAMES.CONFIRMACAO_RSVP_FORM)}
        onClose={() => closeDialog(FESTA_DIALOG_NAMES.CONFIRMACAO_RSVP_FORM)}
        payload={getDialogPayload<ConfirmacaoRsvpFormDialogPayload>(
          FESTA_DIALOG_NAMES.CONFIRMACAO_RSVP_FORM
        )}
      />

      <ExtraB2cFormDialog
        open={isDialogOpen(FESTA_DIALOG_NAMES.EXTRA_B2C_FORM)}
        onClose={() => closeDialog(FESTA_DIALOG_NAMES.EXTRA_B2C_FORM)}
        payload={getDialogPayload<ExtraB2cFormDialogPayload>(
          FESTA_DIALOG_NAMES.EXTRA_B2C_FORM
        )}
      />

      <TemaCatalogoFormDialog
        open={isDialogOpen(FESTA_DIALOG_NAMES.TEMA_CATALOGO_FORM)}
        onClose={() => closeDialog(FESTA_DIALOG_NAMES.TEMA_CATALOGO_FORM)}
        payload={getDialogPayload<TemaCatalogoFormDialogPayload>(
          FESTA_DIALOG_NAMES.TEMA_CATALOGO_FORM
        )}
      />

      <ParceiroB2bFormDialog
        open={isDialogOpen(FESTA_DIALOG_NAMES.PARCEIRO_B2B_FORM)}
        onClose={() => closeDialog(FESTA_DIALOG_NAMES.PARCEIRO_B2B_FORM)}
        payload={getDialogPayload<ParceiroB2bFormDialogPayload>(
          FESTA_DIALOG_NAMES.PARCEIRO_B2B_FORM
        )}
      />

      <PlanoB2bFormDialog
        open={isDialogOpen(FESTA_DIALOG_NAMES.PLANO_B2B_FORM)}
        onClose={() => closeDialog(FESTA_DIALOG_NAMES.PLANO_B2B_FORM)}
        payload={getDialogPayload<PlanoB2bFormDialogPayload>(
          FESTA_DIALOG_NAMES.PLANO_B2B_FORM
        )}
      />

      <EventoParceiroB2bFormDialog
        open={isDialogOpen(FESTA_DIALOG_NAMES.EVENTO_PARCEIRO_B2B_FORM)}
        onClose={() =>
          closeDialog(FESTA_DIALOG_NAMES.EVENTO_PARCEIRO_B2B_FORM)
        }
        payload={getDialogPayload<EventoParceiroB2bFormDialogPayload>(
          FESTA_DIALOG_NAMES.EVENTO_PARCEIRO_B2B_FORM
        )}
      />

      <OperadorParceiroFormDialog
        open={isDialogOpen(FESTA_DIALOG_NAMES.OPERADOR_PARCEIRO_FORM)}
        onClose={() => closeDialog(FESTA_DIALOG_NAMES.OPERADOR_PARCEIRO_FORM)}
        payload={getDialogPayload<OperadorParceiroFormDialogPayload>(
          FESTA_DIALOG_NAMES.OPERADOR_PARCEIRO_FORM
        )}
      />

      <RecuperarSenhaDialog
        open={isDialogOpen(FESTA_DIALOG_NAMES.RECUPERAR_SENHA)}
        onClose={() => closeDialog(FESTA_DIALOG_NAMES.RECUPERAR_SENHA)}
        payload={getDialogPayload<RecuperarSenhaDialogPayload>(
          FESTA_DIALOG_NAMES.RECUPERAR_SENHA
        )}
      />

      <MidiaViewerDialog
        open={isDialogOpen(FESTA_DIALOG_NAMES.MIDIA_VIEWER)}
        onClose={() => closeDialog(FESTA_DIALOG_NAMES.MIDIA_VIEWER)}
        payload={getDialogPayload<MidiaViewerDialogPayload>(
          FESTA_DIALOG_NAMES.MIDIA_VIEWER
        )}
      />

      <ConfirmActionDialog
        open={isDialogOpen(FESTA_DIALOG_NAMES.CONFIRM_ACTION)}
        onClose={() => closeDialog(FESTA_DIALOG_NAMES.CONFIRM_ACTION)}
        payload={getDialogPayload<ConfirmActionDialogPayload>(
          FESTA_DIALOG_NAMES.CONFIRM_ACTION
        )}
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
