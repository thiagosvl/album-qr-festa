import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  API_BASE_URL,
  FESTA_DIALOG_NAMES,
  FESTA_FILTRO_MIDIA_ADMIN,
  FESTA_STATUS_MODERACAO,
  type FestaFiltroMidiaAdmin,
} from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import { supabase } from "@/integrations/supabase/client";
import {
  useExcluirMidiaAdminMutation,
  useLimparMidiasAdminMutation,
  useMidiasAdminQuery,
  useModerarMidiaAdminMutation,
  useModerarMidiasLoteAdminMutation,
} from "@/hooks/api/useMidiasApi";
import type { EventoAdminDto, MidiaDto } from "@/types/festa.types";

export type TipoAcaoMidiaAdmin = "VISIBILIDADE" | "PIN" | "EXCLUIR";

export function useMidiasEventoAdminViewModel(evento: EventoAdminDto | null) {
  const { openDialog } = useLayout();
  const [filtro, setFiltro] = useState<FestaFiltroMidiaAdmin>(
    FESTA_FILTRO_MIDIA_ADMIN.TODAS
  );
  const [baixandoZip, setBaixandoZip] = useState(false);
  const [acaoMidia, setAcaoMidia] = useState<{
    id: string;
    tipo: TipoAcaoMidiaAdmin;
  } | null>(null);

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
      if (filtro === FESTA_FILTRO_MIDIA_ADMIN.VISIVEIS) {
        return m.status_moderacao === FESTA_STATUS_MODERACAO.APROVADA;
      }
      if (filtro === FESTA_FILTRO_MIDIA_ADMIN.PENDENTES) {
        return m.status_moderacao === FESTA_STATUS_MODERACAO.PENDENTE;
      }
      if (filtro === FESTA_FILTRO_MIDIA_ADMIN.OCULTAS) {
        return m.status_moderacao === FESTA_STATUS_MODERACAO.OCULTA;
      }
      if (filtro === FESTA_FILTRO_MIDIA_ADMIN.DEMO) {
        return m.fixada_demo;
      }
      return true;
    });
  }, [midias, filtro]);

  const pendentesCount = useMemo(
    () =>
      midias.filter(
        (m) => m.status_moderacao === FESTA_STATUS_MODERACAO.PENDENTE
      ).length,
    [midias]
  );

  const fixadasCount = useMemo(
    () => midias.filter((m) => m.fixada_demo).length,
    [midias]
  );

  const handleToggleVisibilidade = async (midia: MidiaDto) => {
    const visivel =
      midia.status_moderacao === FESTA_STATUS_MODERACAO.APROVADA;
    setAcaoMidia({ id: midia.id, tipo: "VISIBILIDADE" });
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
    } finally {
      setAcaoMidia(null);
    }
  };

  const handleToggleFixadaDemo = async (midia: MidiaDto) => {
    const novoFixada = !midia.fixada_demo;
    setAcaoMidia({ id: midia.id, tipo: "PIN" });
    try {
      await moderarMutation.mutateAsync({
        midiaId: midia.id,
        fixada_demo: novoFixada,
        ...(novoFixada &&
        midia.status_moderacao !== FESTA_STATUS_MODERACAO.APROVADA
          ? { status_moderacao: FESTA_STATUS_MODERACAO.APROVADA }
          : {}),
      });
      toast.success(
        novoFixada
          ? "Foto fixada como oficial na vitrine Demo!"
          : "Foto desafixada da vitrine Demo."
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar");
    } finally {
      setAcaoMidia(null);
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

  const handleLimparNaoFixadas = () => {
    openDialog(FESTA_DIALOG_NAMES.CONFIRM_ACTION, {
      title: evento?.is_demo
        ? "Limpar fotos não-fixadas do Demo?"
        : "Limpar fotos de teste do álbum?",
      description: evento?.is_demo
        ? "Todas as fotos que não estão fixadas na vitrine Demo serão removidas permanentemente."
        : "Todas as fotos não fixadas enviadas até agora serão removidas permanentemente do álbum.",
      confirmLabel: evento?.is_demo
        ? "Sim, Limpar Não-Fixadas"
        : "Sim, Limpar Fotos",
      variant: "destructive",
      onConfirm: async () => {
        try {
          const res = await limparMutation.mutateAsync();
          toast.success(
            `${res.removidas} foto(s) de teste/visitantes removida(s)!`
          );
        } catch (err) {
          toast.error(
            err instanceof Error ? err.message : "Erro ao limpar fotos"
          );
        }
      },
    });
  };

  const handleExcluirMidia = (midia: MidiaDto) => {
    const nomeAutor = midia.autor || "Convidado";
    openDialog(FESTA_DIALOG_NAMES.CONFIRM_ACTION, {
      title: "Excluir esta foto?",
      description: `Tem certeza que deseja excluir permanentemente a foto enviada por "${nomeAutor}"? Esta ação não pode ser desfeita.`,
      confirmLabel: "Sim, Excluir Foto",
      variant: "destructive",
      onConfirm: async () => {
        setAcaoMidia({ id: midia.id, tipo: "EXCLUIR" });
        try {
          await excluirMutation.mutateAsync(midia.id);
          toast.success("Foto removida");
        } catch (err) {
          toast.error(
            err instanceof Error ? err.message : "Erro ao remover foto"
          );
        } finally {
          setAcaoMidia(null);
        }
      },
    });
  };

  const handleBaixarZipAdmin = async () => {
    if (!evento) return;
    setBaixandoZip(true);
    try {
      const endpointZip = evento.token_gestao
        ? `${API_BASE_URL}/api/gestao/${encodeURIComponent(evento.token_gestao)}/midias/zip`
        : `${API_BASE_URL}/api/admin/eventos/${evento.id}/midias/zip`;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const response = await fetch(endpointZip, {
        headers:
          !evento.token_gestao && session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {},
      });
      if (!response.ok) {
        throw new Error("Não foi possível gerar o arquivo ZIP");
      }
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

  return {
    filtro,
    setFiltro,
    baixandoZip,
    isLoadingMidias: midiasQuery.isLoading,
    acaoMidia,
    aprovandoLote: moderarLoteMutation.isPending,
    limpandoMidias: limparMutation.isPending,
    midias,
    midiasFiltradas,
    pendentesCount,
    fixadasCount,
    handleToggleVisibilidade,
    handleToggleFixadaDemo,
    handleAprovarTodasPendentes,
    handleLimparNaoFixadas,
    handleExcluirMidia,
    handleBaixarZipAdmin,
  };
}
