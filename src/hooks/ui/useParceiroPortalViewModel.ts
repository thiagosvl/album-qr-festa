import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FESTA_DIALOG_NAMES } from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import {
  useAtualizarPerfilPortalParceiroMutation,
  usePortalParceiroB2bQuery,
} from "@/hooks/api/useParceiroB2bApi";
import type { EventoAdminDto } from "@/types/festa.types";

export function useParceiroPortalViewModel() {
  const { openDialog } = useLayout();
  const [parceiroIdSelecionado, setParceiroIdSelecionado] = useState<
    string | undefined
  >(undefined);
  const [abaAtiva, setAbaAtiva] = useState<"EVENTOS" | "CREDITOS" | "MARCA">(
    "EVENTOS"
  );

  const portalQuery = usePortalParceiroB2bQuery(parceiroIdSelecionado);
  const atualizarMarcaMutation = useAtualizarPerfilPortalParceiroMutation();

  const dados = portalQuery.data;
  const parceiro = dados?.parceiro ?? null;

  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [documento, setDocumento] = useState("");
  const [corMarca, setCorMarca] = useState("#a133d8");
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    if (parceiro) {
      setNomeEmpresa(parceiro.nome_empresa);
      setTelefone(parceiro.telefone ?? "");
      setEmail(parceiro.email ?? "");
      setDocumento(parceiro.documento ?? "");
      setCorMarca(parceiro.cor_marca ?? "#a133d8");
      setLogoUrl(parceiro.logo_url ?? "");
    }
  }, [parceiro]);

  const abrirAtivarEventoDialog = () => {
    if (!parceiro) return;
    openDialog(FESTA_DIALOG_NAMES.EVENTO_PARCEIRO_B2B_FORM, {
      parceiro,
      temas: dados?.temas ?? [],
    });
  };

  const abrirQrLinksEvento = (evento: EventoAdminDto) => {
    openDialog(FESTA_DIALOG_NAMES.QRCODE_LINKS, { evento });
  };

  const abrirMoldurasEvento = (evento: EventoAdminDto) => {
    openDialog(FESTA_DIALOG_NAMES.MOLDURAS_EVENTO, { evento });
  };

  const abrirMidiasEvento = (evento: EventoAdminDto) => {
    openDialog(FESTA_DIALOG_NAMES.MIDIAS_EVENTO_ADMIN, { evento });
  };

  const salvarIdentidadeVisual = async () => {
    if (!parceiro) return;
    try {
      await atualizarMarcaMutation.mutateAsync({
        id: parceiro.id,
        payload: {
          nome_empresa: nomeEmpresa.trim(),
          telefone: telefone.trim() || null,
          email: email.trim() || null,
          documento: documento.trim() || null,
          cor_marca: corMarca,
          logo_url: logoUrl.trim() || null,
        },
      });
      toast.success("Identidade visual atualizada com sucesso!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao salvar marca do parceiro"
      );
    }
  };

  return {
    isLoading: portalQuery.isLoading,
    parceiro,
    parceirosDisponiveis: dados?.parceiros_disponiveis ?? [],
    eventos: dados?.eventos ?? [],
    transacoes: parceiro?.transacoes ?? [],
    planosB2b: dados?.planos_b2b ?? [],
    parceiroIdSelecionado: parceiro?.id ?? parceiroIdSelecionado ?? "",
    setParceiroIdSelecionado,
    abaAtiva,
    setAbaAtiva,
    nomeEmpresa,
    setNomeEmpresa,
    telefone,
    setTelefone,
    email,
    setEmail,
    documento,
    setDocumento,
    corMarca,
    setCorMarca,
    logoUrl,
    setLogoUrl,
    salvandoMarca: atualizarMarcaMutation.isPending,
    salvarIdentidadeVisual,
    abrirAtivarEventoDialog,
    abrirQrLinksEvento,
    abrirMoldurasEvento,
    abrirMidiasEvento,
  };
}
