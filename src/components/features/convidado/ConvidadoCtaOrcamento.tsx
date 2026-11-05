import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import {
  WHATSAPP_MENSAGENS,
  gerarLinkWhatsappComercial,
} from "@/lib/whatsapp";

const ROTULO_CTA = "Quero para minha festa";

/** Chamada comercial exibida só na demonstração: leva o visitante ao WhatsApp. */
export function ConvidadoCtaOrcamento() {
  return (
    <a
      href={gerarLinkWhatsappComercial(WHATSAPP_MENSAGENS.ORCAMENTO_DEMO)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-whatsapp font-display text-base font-extrabold text-white shadow-suave transition hover:bg-whatsapp-escuro active:scale-[0.98]"
    >
      <WhatsAppIcon className="h-5 w-5 shrink-0" />
      {ROTULO_CTA}
    </a>
  );
}
