import {
  FESTA_PACOTE_TIPO,
  FESTA_STATUS_MODERACAO,
  FESTA_STATUS_PEDIDO,
} from "@/constants";
import type {
  FestaPacoteTipoEnum,
  FestaStatusModeracaoEnum,
  FestaStatusPedidoEnum,
} from "@/types/festa.types";

export const STATUS_PEDIDO_LABELS: Record<FestaStatusPedidoEnum, string> = {
  [FESTA_STATUS_PEDIDO.AGUARDANDO_SINAL]: "Aguardando Sinal (50%)",
  [FESTA_STATUS_PEDIDO.SINAL_PAGO]: "Sinal Pago",
  [FESTA_STATUS_PEDIDO.AGUARDANDO_BRIEFING]: "Aguardando Briefing",
  [FESTA_STATUS_PEDIDO.EM_MONTAGEM]: "Em Produção de Arte",
  [FESTA_STATUS_PEDIDO.ENTREGUE]: "Entregue (Aguardando Quitação)",
  [FESTA_STATUS_PEDIDO.PAGO_COMPLETO]: "Quitado & Pronto",
  [FESTA_STATUS_PEDIDO.CANCELADO]: "Cancelado",
};

export const PACOTE_TIPO_LABELS: Record<FestaPacoteTipoEnum, string> = {
  [FESTA_PACOTE_TIPO.BASICO]: "Memória Básica",
  [FESTA_PACOTE_TIPO.COMPLETO]: "Festa Completa",
};

export const STATUS_MODERACAO_LABELS: Record<FestaStatusModeracaoEnum, string> =
  {
    [FESTA_STATUS_MODERACAO.APROVADA]: "Visível no Mural",
    [FESTA_STATUS_MODERACAO.PENDENTE]: "Pendente",
    [FESTA_STATUS_MODERACAO.OCULTA]: "Oculta",
  };

export function gerarUrlPublicaEvento(slug: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/e/${slug}`;
}

export function gerarUrlTelaoEvento(slug: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/telao/${slug}`;
}

export function gerarUrlGestaoPai(tokenGestao: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/gestao/${tokenGestao}`;
}

export function gerarLinkWhatsappCliente(
  whatsapp: string | null | undefined,
  mensagem: string
): string {
  const digitos = (whatsapp ?? "").replace(/\D/g, "");
  const foneFormatado =
    digitos.length >= 10 && !digitos.startsWith("55")
      ? `55${digitos}`
      : digitos;
  const textoEncoded = encodeURIComponent(mensagem);
  return foneFormatado
    ? `https://wa.me/${foneFormatado}?text=${textoEncoded}`
    : `https://wa.me/?text=${textoEncoded}`;
}
