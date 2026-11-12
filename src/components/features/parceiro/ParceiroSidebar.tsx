import {
  Building2,
  CalendarHeart,
  Coins,
  LogOut,
  Palette,
  Plus,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  FESTA_CORES_PADRAO,
  FESTA_PARCEIRO_TABS,
  type FestaParceiroTab,
} from "@/constants";
import { AlternadorTema } from "@/components/ui/AlternadorTema";
import { Button } from "@/components/ui/button";
import { LogoFestalgia } from "@/components/ui/LogoFestalgia";
import { SidebarNavItem } from "@/components/ui/SidebarNav";
import { LOGO_FUNDO, LOGO_VARIANTE } from "@/constants";
import type { ParceiroB2bAdminDto } from "@/types/festa.types";

interface ParceiroSidebarProps {
  parceiro: ParceiroB2bAdminDto | null;
  ehParceiroAdmin: boolean;
  abaAtiva: FestaParceiroTab;
  onChangeAba: (aba: FestaParceiroTab) => void;
  totalEventos: number;
  totalOperadores: number;
  onAtivarEvento: () => void;
  onLogout: () => void;
}

export function ParceiroSidebar({
  parceiro,
  ehParceiroAdmin,
  abaAtiva,
  onChangeAba,
  totalEventos,
  totalOperadores,
  onAtivarEvento,
  onLogout,
}: ParceiroSidebarProps) {
  const itens: {
    id: FestaParceiroTab;
    rotulo: string;
    Icone: LucideIcon;
    contador?: number;
    somenteAdmin?: boolean;
  }[] = [
    {
      id: FESTA_PARCEIRO_TABS.EVENTOS,
      rotulo: "Eventos",
      Icone: CalendarHeart,
      contador: totalEventos,
    },
    { id: FESTA_PARCEIRO_TABS.CREDITOS, rotulo: "Extrato e planos", Icone: Coins },
    {
      id: FESTA_PARCEIRO_TABS.EQUIPE,
      rotulo: "Equipe",
      Icone: Users,
      contador: totalOperadores,
      somenteAdmin: true,
    },
    {
      id: FESTA_PARCEIRO_TABS.MARCA,
      rotulo: "Identidade visual",
      Icone: Palette,
      somenteAdmin: true,
    },
  ];

  return (
    <aside className="flex w-full shrink-0 flex-col justify-between border-b border-sidebar-border bg-sidebar text-sidebar-foreground lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:overflow-y-auto lg:border-b-0 lg:border-r">
      <div className="space-y-5 p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-white shadow-md ring-1 ring-white/15"
              style={{
                backgroundColor:
                  parceiro?.cor_marca ?? FESTA_CORES_PADRAO.PARCEIRO_MARCA,
              }}
            >
              {parceiro?.logo_url ? (
                <img
                  src={parceiro.logo_url}
                  alt={parceiro.nome_empresa}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Building2 className="h-5 w-5" />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="truncate font-display text-base font-extrabold text-white">
                {parceiro?.nome_empresa ?? "Portal do parceiro"}
              </h1>
              <p className="truncate text-[11px] text-white/55">
                {parceiro?.email_acesso ??
                  parceiro?.email ??
                  "Buffets e fotógrafos"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <AlternadorTema sobre="sidebar" />
            <button
              type="button"
              onClick={onLogout}
              aria-label="Sair da conta"
              className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/15"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3 rounded-3xl border border-white/10 bg-white/[0.06] p-4">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-xs text-white/60">Saldo disponível</p>
              <p className="font-display text-3xl font-extrabold leading-none tabular-nums text-gema">
                {parceiro?.saldo_creditos ?? 0}
                <span className="ml-1.5 text-sm font-semibold text-white/70">
                  {(parceiro?.saldo_creditos ?? 0) === 1 ? "crédito" : "créditos"}
                </span>
              </p>
            </div>
          </div>
          <p className="text-[11px] text-white/55">
            Plano atual:{" "}
            <strong className="font-semibold text-white">
              {parceiro?.plano?.nome ?? "Pacote de créditos"}
            </strong>
          </p>
          <Button type="button" size="sm" className="w-full" onClick={onAtivarEvento}>
            <Plus className="h-4 w-4" />
            <span>Ativar evento</span>
          </Button>
        </div>

        <nav
          aria-label="Seções do portal"
          className={`grid gap-1.5 ${
            ehParceiroAdmin
              ? "grid-cols-2 sm:grid-cols-4 lg:grid-cols-1"
              : "grid-cols-2 lg:grid-cols-1"
          }`}
        >
          {itens
            .filter((item) => !item.somenteAdmin || ehParceiroAdmin)
            .map((item) => (
              <SidebarNavItem
                key={item.id}
                rotulo={item.rotulo}
                Icone={item.Icone}
                contador={item.contador}
                ativo={abaAtiva === item.id}
                onClick={() => onChangeAba(item.id)}
              />
            ))}
        </nav>
      </div>

      <div className="hidden space-y-4 border-t border-sidebar-border p-5 lg:block">
        <div className="flex items-center justify-between gap-2">
          <AlternadorTema sobre="sidebar" />
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex h-9 items-center gap-2 rounded-full bg-white/[0.08] px-3.5 text-xs font-semibold text-white/80 transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gema"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sair
          </button>
        </div>
        <LogoFestalgia
          variante={LOGO_VARIANTE.HORIZONTAL}
          fundo={LOGO_FUNDO.ESCURO}
          className="h-6 w-auto opacity-60"
        />
      </div>
    </aside>
  );
}
