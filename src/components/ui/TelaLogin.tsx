import { CalendarHeart, QrCode, Tv, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { AlternadorTema } from "@/components/ui/AlternadorTema";
import { LogoFestalgia } from "@/components/ui/LogoFestalgia";
import { VersaoApp } from "@/components/ui/VersaoApp";
import { LOGO_FUNDO } from "@/constants";

const BENEFICIOS: { Icone: LucideIcon; titulo: string; texto: string }[] = [
  {
    Icone: QrCode,
    titulo: "Álbum por QR Code",
    texto: "Os convidados enviam fotos pelo celular, sem instalar nada.",
  },
  {
    Icone: Tv,
    titulo: "Telão ao vivo",
    texto: "As fotos aparecem na festa assim que são aprovadas.",
  },
  {
    Icone: CalendarHeart,
    titulo: "Convite com confirmação",
    texto: "Lista de presença de cada evento no mesmo painel.",
  },
];

/**
 * Moldura da tela de login (parceiros e equipe). Mobile e tablet: formulário
 * centralizado com a logo no topo. Desktop: painel de marca à esquerda.
 */
export function TelaLogin({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-12 text-sidebar-foreground lg:flex xl:p-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gema/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-primary/30 blur-3xl"
        />

        <LogoFestalgia fundo={LOGO_FUNDO.ESCURO} className="relative h-10 w-auto self-start" />

        <div className="relative max-w-md space-y-10">
          <h2 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight xl:text-5xl">
            Cada festa vira um álbum ao vivo.
          </h2>
          <ul className="space-y-5">
            {BENEFICIOS.map(({ Icone, titulo, texto }) => (
              <li key={titulo} className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sidebar-foreground/10 text-gema">
                  <Icone className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-semibold">{titulo}</span>
                  <span className="block text-sm text-sidebar-foreground/65">{texto}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-sidebar-foreground/45">
          Portal para buffets, casas de festas e estúdios fotográficos.
        </p>
      </aside>

      <main className="relative flex min-h-dvh flex-col px-5 pb-4 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8">
        <div className="flex items-center justify-between lg:justify-end">
          <LogoFestalgia className="h-9 w-auto dark:hidden lg:hidden" />
          <LogoFestalgia
            fundo={LOGO_FUNDO.ESCURO}
            className="hidden h-9 w-auto dark:block dark:lg:hidden"
          />
          <AlternadorTema />
        </div>

        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-sm md:max-w-md md:rounded-card md:border md:border-border/60 md:bg-card md:p-8 md:shadow-card lg:max-w-md">
            {children}
          </div>
        </div>

        <VersaoApp />
      </main>
    </div>
  );
}
