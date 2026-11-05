import { useMemo, useState } from "react";
import {
  CheckCheck,
  Download,
  Eye,
  EyeOff,
  FlaskConical,
  Images,
  Pin,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL, FESTA_STATUS_MODERACAO } from "@/constants";
import { Banner } from "@/components/ui/Banner";
import { Badge } from "@/components/ui/badge";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  useExcluirMidiaAdminMutation,
  useLimparMidiasAdminMutation,
  useMidiasAdminQuery,
  useModerarMidiaAdminMutation,
  useModerarMidiasLoteAdminMutation,
} from "@/hooks/api/useMidiasApi";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import type { EventoAdminDto, MidiaDto } from "@/types/festa.types";

export interface MidiasEventoAdminDialogPayload {
  evento: EventoAdminDto;
}

interface MidiasEventoAdminDialogProps {
  open: boolean;
  onClose: () => void;
  payload: MidiasEventoAdminDialogPayload | null;
}

type FiltroMidiaAdmin = "TODAS" | "VISIVEIS" | "PENDENTES" | "OCULTAS" | "DEMO";

export function MidiasEventoAdminDialog({
  open,
  onClose,
  payload,
}: MidiasEventoAdminDialogProps) {
  const evento = payload?.evento ?? null;
  const [filtro, setFiltro] = useState<FiltroMidiaAdmin>("TODAS");
  const [baixandoZip, setBaixandoZip] = useState(false);

  const midiasQuery = useMidiasAdminQuery(evento?.id);
  const moderarMutation = useModerarMidiaAdminMutation(evento?.id ?? "");
  const moderarLoteMutation = useModerarMidiasLoteAdminMutation(
    evento?.id ?? ""
  );
  const excluirMutation = useExcluirMidiaAdminMutation(evento?.id ?? "");
  const limparMutation = useLimparMidiasAdminMutation(evento?.id ?? "");

  const midias = midiasQuery.data ?? [];

  const midiasFiltradas = useMemo(() => {
    return midias.filter((m) => {
      if (filtro === "VISIVEIS") {
        return m.status_moderacao === FESTA_STATUS_MODERACAO.APROVADA;
      }
      if (filtro === "PENDENTES") {
        return m.status_moderacao === FESTA_STATUS_MODERACAO.PENDENTE;
      }
      if (filtro === "OCULTAS") {
        return m.status_moderacao === FESTA_STATUS_MODERACAO.OCULTA;
      }
      if (filtro === "DEMO") {
        return m.fixada_demo;
      }
      return true;
    });
  }, [midias, filtro]);

  if (!evento) return null;

  const pendentesCount = midias.filter(
    (m) => m.status_moderacao === FESTA_STATUS_MODERACAO.PENDENTE
  ).length;

  const handleToggleVisibilidade = async (midia: MidiaDto) => {
    const visivel =
      midia.status_moderacao === FESTA_STATUS_MODERACAO.APROVADA;
    try {
      await moderarMutation.mutateAsync({
        midiaId: midia.id,
        status_moderacao: visivel
          ? FESTA_STATUS_MODERACAO.OCULTA
          : FESTA_STATUS_MODERACAO.APROVADA,
      });
      toast.success(visivel ? "Foto ocultada" : "Foto aprovada no mural");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao moderar");
    }
  };

  const handleToggleFixadaDemo = async (midia: MidiaDto) => {
    try {
      await moderarMutation.mutateAsync({
        midiaId: midia.id,
        fixada_demo: !midia.fixada_demo,
      });
      toast.success(
        !midia.fixada_demo
          ? "Foto fixada como oficial na vitrine Demo!"
          : "Foto desafixada da vitrine Demo."
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar");
    }
  };

  const handleAprovarTodasPendentes = async () => {
    const ids = midias
      .filter((m) => m.status_moderacao === FESTA_STATUS_MODERACAO.PENDENTE)
      .map((m) => m.id);
    if (ids.length === 0) return;
    try {
      const res = await moderarLoteMutation.mutateAsync({
        midia_ids: ids,
        status_moderacao: FESTA_STATUS_MODERACAO.APROVADA,
      });
      toast.success(`${res.atualizadas} foto(s) pendente(s) aprovada(s)!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao aprovar lote");
    }
  };

  const handleLimparNaoFixadas = async () => {
    try {
      const res = await limparMutation.mutateAsync();
      toast.success(`${res.removidas} foto(s) de teste/visitantes removida(s)!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao limpar fotos");
    }
  };

  const handleBaixarZipAdmin = async () => {
    setBaixandoZip(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const response = await fetch(
        `${API_BASE_URL}/api/admin/eventos/${evento.id}/midias/zip`,
        {
          headers: session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {},
        }
      );
      if (!response.ok) throw new Error("Não foi possível gerar o arquivo ZIP");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fotos-${evento.slug}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Download do arquivo .ZIP concluído!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao baixar ZIP");
    } finally {
      setBaixandoZip(false);
    }
  };

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
        subtitle={`${midias.length} foto(s) no álbum (/e/${evento.slug})`}
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
              {pendentesCount > 0 && (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAprovarTodasPendentes}
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Aprovar Pendentes ({pendentesCount})</span>
                </Button>
              )}
              <Button
                type="button"
                variant="tonal"
                size="sm"
                disabled={midias.length === 0 || baixandoZip}
                onClick={handleBaixarZipAdmin}
              >
                <Download className="w-3.5 h-3.5" />
                <span>{baixandoZip ? "Gerando ZIP..." : "Baixar .ZIP"}</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLimparNaoFixadas}
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Limpar Não-Fixadas</span>
              </Button>
            </div>
          }
        />

        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "TODAS", label: `Todas (${midias.length})` },
              { id: "VISIVEIS", label: "Visíveis" },
              { id: "PENDENTES", label: `Pendentes (${pendentesCount})` },
              { id: "OCULTAS", label: "Ocultas" },
              ...(evento.is_demo
                ? [{ id: "DEMO" as const, label: "Fixadas no Demo" }]
                : []),
            ] as const
          ).map((f) => (
            <Button
              key={f.id}
              type="button"
              size="sm"
              variant={filtro === f.id ? "default" : "outline"}
              onClick={() => setFiltro(f.id)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        {midiasFiltradas.length === 0 ? (
          <div className="p-10 text-center rounded-2xl border border-border/60 bg-muted/20 text-xs text-muted-foreground">
            Nenhuma foto encontrada neste filtro.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {midiasFiltradas.map((m) => {
              const visivel =
                m.status_moderacao === FESTA_STATUS_MODERACAO.APROVADA;
              return (
                <div
                  key={m.id}
                  className="rounded-2xl border border-border/80 bg-background overflow-hidden flex flex-col"
                >
                  <div className="aspect-[9/16] bg-zinc-900 relative">
                    <img
                      src={m.url_miniatura || m.url_publica}
                      alt={m.autor ?? "Convidado"}
                      className={`w-full h-full object-cover ${
                        !visivel ? "opacity-45 grayscale" : ""
                      }`}
                    />
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                      <Badge variant={visivel ? "success" : "warning"}>
                        {m.status_moderacao}
                      </Badge>
                      {m.fixada_demo && <Badge variant="tonal">Fixada</Badge>}
                    </div>
                  </div>
                  <div className="p-2.5 space-y-2">
                    <p className="text-xs font-bold truncate">
                      {m.autor || "Convidado"}
                    </p>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="flex-1 h-7 text-[11px] px-1.5"
                        onClick={() => handleToggleVisibilidade(m)}
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

                      <Button
                        type="button"
                        size="icon"
                        variant={m.fixada_demo ? "default" : "outline"}
                        className="h-7 w-7"
                        onClick={() => handleToggleFixadaDemo(m)}
                      >
                        <Pin className="w-3 h-3" />
                      </Button>

                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="h-7 w-7"
                        onClick={() =>
                          excluirMutation
                            .mutateAsync(m.id)
                            .then(() => toast.success("Foto removida"))
                            .catch((err: Error) => toast.error(err.message))
                        }
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
