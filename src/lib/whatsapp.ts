import { WHATSAPP_COMERCIAL } from "@/constants";

export const WHATSAPP_MENSAGENS = {
  ORCAMENTO_DEMO:
    "Olá! Vi a demonstração do Álbum QR Festa e quero o álbum para a minha festa.",
  RECARGA_CREDITOS_PARCEIRO: (nomeEmpresa: string) =>
    `Olá! Sou do parceiro B2B "${nomeEmpresa}" e gostaria de adquirir mais créditos de eventos.`,
} as const;

export function gerarLinkWhatsappComercial(mensagem: string): string {
  return `https://wa.me/${WHATSAPP_COMERCIAL}?text=${encodeURIComponent(mensagem)}`;
}
