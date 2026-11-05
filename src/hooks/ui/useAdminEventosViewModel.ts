import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  FESTA_ADMIN_TABS,
  FESTA_DIALOG_NAMES,
  FESTA_ROUTES,
  FESTA_STATUS_PEDIDO,
  type FestaAdminTab,
} from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import { supabase } from "@/integrations/supabase/client";
import { useCatalogoAdminQuery } from "@/hooks/api/useCatalogoApi";
import {
  useEventosAdminQuery,
  useExcluirEventoMutation,
} from "@/hooks/api/useEventosApi";
import { useParceirosB2bAdminQuery } from "@/hooks/api/useParceiroB2bApi";
import type {
  EventoAdminDto,
  FestaCatalogoExtraB2c,
  FestaCatalogoPacoteB2c,
  FestaStatusPedidoEnum,
  FestaTemaCatalogo,
  ParceiroB2bAdminDto,
} from "@/types/festa.types";

export function useAdminEventosViewModel() {
  const navigate = useNavigate();
  const { openDialog } = useLayout();
  const [autenticado, setAutenticado] = useState<boolean>(false);
  const [verificandoSessao, setVerificandoSessao] = useState<boolean>(true);
  const [abaAtiva, setAbaAtiva] = useState<FestaAdminTab>(
    FESTA_ADMIN_TABS.EVENTOS
  );
  const [busca, setBusca] = useState<string>("");
  const [filtroStatus, setFiltroStatus] = useState<
    FestaStatusPedidoEnum | "TODOS"
  >("TODOS");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate(FESTA_ROUTES.ADMIN_LOGIN, { replace: true });
      } else {
        setAutenticado(true);
      }
      setVerificandoSessao(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          setAutenticado(false);
          navigate(FESTA_ROUTES.ADMIN_LOGIN, { replace: true });
        } else {
          setAutenticado(true);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  const eventosQuery = useEventosAdminQuery(autenticado);
  const catalogoQuery = useCatalogoAdminQuery(autenticado);
  const parceirosQuery = useParceirosB2bAdminQuery(autenticado);
  const excluirMutation = useExcluirEventoMutation();

  const eventos = eventosQuery.data ?? [];
  const parceiros = parceirosQuery.data ?? [];

  const eventosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return eventos.filter((ev) => {
      const bateStatus =
        filtroStatus === "TODOS" || ev.status_pedido === filtroStatus;
      const bateBusca =
        !termo ||
        ev.titulo.toLowerCase().includes(termo) ||
        ev.slug.toLowerCase().includes(termo) ||
        (ev.anfitriao?.nome ?? "").toLowerCase().includes(termo) ||
        (ev.nome_aniversariante ?? "").toLowerCase().includes(termo);
      return bateStatus && bateBusca;
    });
  }, [eventos, busca, filtroStatus]);

  const kpis = useMemo(() => {
    const eventosComerciais = eventos.filter((e) => !e.is_demo);
    const faturamentoTotalCentavos = eventosComerciais.reduce(
      (acc, e) => acc + e.valor_total_centavos,
      0
    );
    const recebidoTotalCentavos = eventosComerciais.reduce(
      (acc, e) => acc + e.valor_pago_centavos,
      0
    );
    const aReceberCentavos = eventosComerciais.reduce(
      (acc, e) => acc + e.valor_restante_centavos,
      0
    );
    const emProducaoOuAtivos = eventosComerciais.filter(
      (e) =>
        e.status_pedido === FESTA_STATUS_PEDIDO.EM_MONTAGEM ||
        e.status_pedido === FESTA_STATUS_PEDIDO.ENTREGUE ||
        e.status_pedido === FESTA_STATUS_PEDIDO.PAGO_COMPLETO
    ).length;
    const quitadosCount = eventosComerciais.filter(
      (e) => e.status_pedido === FESTA_STATUS_PEDIDO.PAGO_COMPLETO
    ).length;

    return {
      totalEventos: eventosComerciais.length,
      faturamentoTotalCentavos,
      recebidoTotalCentavos,
      aReceberCentavos,
      emProducaoOuAtivos,
      quitadosCount,
    };
  }, [eventos]);

  const abrirNovoEventoDialog = () => {
    openDialog(FESTA_DIALOG_NAMES.EVENTO_FORM, { evento: null });
  };

  const abrirEditarEventoDialog = (evento: EventoAdminDto) => {
    openDialog(FESTA_DIALOG_NAMES.EVENTO_FORM, { evento });
  };

  const abrirPagamentoManualDialog = (evento: EventoAdminDto) => {
    openDialog(FESTA_DIALOG_NAMES.PAGAMENTO_MANUAL, { evento });
  };

  const abrirMoldurasDialog = (evento: EventoAdminDto) => {
    openDialog(FESTA_DIALOG_NAMES.MOLDURAS_EVENTO, { evento });
  };

  const abrirMidiasAdminDialog = (evento: EventoAdminDto) => {
    openDialog(FESTA_DIALOG_NAMES.MIDIAS_EVENTO_ADMIN, { evento });
  };

  const abrirExtrasAdminDialog = (evento: EventoAdminDto) => {
    openDialog(FESTA_DIALOG_NAMES.EXTRAS_EVENTO_ADMIN, { evento });
  };

  const abrirQrCodeLinksDialog = (evento: EventoAdminDto) => {
    openDialog(FESTA_DIALOG_NAMES.QRCODE_LINKS, { evento });
  };

  const abrirEditarPacoteDialog = (pacote: FestaCatalogoPacoteB2c) => {
    openDialog(FESTA_DIALOG_NAMES.PACOTE_B2C_FORM, { pacote });
  };

  const abrirNovoExtraDialog = () => {
    openDialog(FESTA_DIALOG_NAMES.EXTRA_B2C_FORM, { extra: null });
  };

  const abrirEditarExtraDialog = (extra: FestaCatalogoExtraB2c) => {
    openDialog(FESTA_DIALOG_NAMES.EXTRA_B2C_FORM, { extra });
  };

  const abrirNovoTemaDialog = () => {
    openDialog(FESTA_DIALOG_NAMES.TEMA_CATALOGO_FORM, { tema: null });
  };

  const abrirEditarTemaDialog = (tema: FestaTemaCatalogo) => {
    openDialog(FESTA_DIALOG_NAMES.TEMA_CATALOGO_FORM, { tema });
  };

  const abrirNovoParceiroDialog = () => {
    openDialog(FESTA_DIALOG_NAMES.PARCEIRO_B2B_FORM, {
      parceiro: null,
      planos: catalogoQuery.data?.planos_b2b ?? [],
    });
  };

  const abrirEditarParceiroDialog = (parceiro: ParceiroB2bAdminDto) => {
    openDialog(FESTA_DIALOG_NAMES.PARCEIRO_B2B_FORM, {
      parceiro,
      planos: catalogoQuery.data?.planos_b2b ?? [],
    });
  };

  const confirmarExclusaoEvento = (evento: EventoAdminDto) => {
    openDialog(FESTA_DIALOG_NAMES.CONFIRM_ACTION, {
      title: `Excluir "${evento.titulo}"?`,
      description:
        "Esta ação removerá o evento, suas molduras e registros financeiros. Não pode ser desfeita.",
      confirmLabel: "Excluir Evento",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await excluirMutation.mutateAsync(evento.id);
          toast.success("Evento excluído com sucesso.");
        } catch (err) {
          toast.error(
            err instanceof Error ? err.message : "Erro ao excluir evento"
          );
        }
      },
    });
  };

  const fazerLogout = async () => {
    await supabase.auth.signOut();
    navigate(FESTA_ROUTES.ADMIN_LOGIN, { replace: true });
  };

  return {
    verificandoSessao,
    abaAtiva,
    setAbaAtiva,
    isLoading: eventosQuery.isLoading,
    isLoadingParceiros: parceirosQuery.isLoading,
    eventos,
    eventosFiltrados,
    parceiros,
    catalogo: catalogoQuery.data,
    kpis,
    busca,
    setBusca,
    filtroStatus,
    setFiltroStatus,
    abrirNovoEventoDialog,
    abrirEditarEventoDialog,
    abrirPagamentoManualDialog,
    abrirMoldurasDialog,
    abrirMidiasAdminDialog,
    abrirExtrasAdminDialog,
    abrirQrCodeLinksDialog,
    abrirEditarPacoteDialog,
    abrirNovoExtraDialog,
    abrirEditarExtraDialog,
    abrirNovoTemaDialog,
    abrirEditarTemaDialog,
    abrirNovoParceiroDialog,
    abrirEditarParceiroDialog,
    confirmarExclusaoEvento,
    fazerLogout,
  };
}
