import {
  Building2,
  CalendarHeart,
  Crown,
  ExternalLink,
  LogOut,
  Package,
  Palette,
  Tv,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { AlternadorTema } from "@/components/ui/AlternadorTema";
import { LogoFestalgia } from "@/components/ui/LogoFestalgia";
import {
  SidebarAtalho,
  SidebarNavItem,
  SidebarSecao,
} from "@/components/ui/SidebarNav";
import {
  FESTA_ADMIN_TABS,
  LOGO_FUNDO,
  FESTA_ROUTES,
  type FestaAdminTab,
} from "@/constants";

interface AdminSidebarProps {
  abaAtiva: FestaAdminTab;
  onChangeAba: (aba: FestaAdminTab) => void;
  totalEventos: number;
  totalParceiros: number;
  tokenDemoGestao?: string | null;
  onLogout: () => void;
}

const LINK_ATALHO =
  "flex items-center rounded-2xl bg-white/[0.05] px-3 py-2 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gema";

export function AdminSidebar({
  abaAtiva,
  onChangeAba,
  totalEventos,
  totalParceiros,
  tokenDemoGestao,
  onLogout,
}: AdminSidebarProps) {
  const navItems: {
    id: FestaAdminTab;
    rotulo: string;
    descricao: string;
    Icone: LucideIcon;
    contador?: number;
  }[] = [
    {
      id: FESTA_ADMIN_TABS.EVENTOS,
      rotulo: "Pedidos e eventos",
      descricao: "Sinal, molduras e links",
      Icone: CalendarHeart,
      contador: totalEventos,
    },
    {
      id: FESTA_ADMIN_TABS.CATALOGO_B2C,
      rotulo: "Catálogo e extras",
      descricao: "Pacotes e opcionais avulsos",
      Icone: Package,
    },
    {
      id: FESTA_ADMIN_TABS.TEMAS,
      rotulo: "Vitrine de temas",
      descricao: "Molduras e paletas de cores",
      Icone: Palette,
    },
    {
      id: FESTA_ADMIN_TABS.PARCEIROS_B2B,
      rotulo: "Parceiros e planos",
      descricao: "Buffets, fotógrafos e créditos",
      Icone: Building2,
      contador: totalParceiros,
    },
  ];

  return (
    <aside className="flex w-full shrink-0 flex-col justify-between border-b border-sidebar-border bg-sidebar text-sidebar-foreground lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:overflow-y-auto lg:border-b-0 lg:border-r">
      <div className="space-y-6 p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <h1>
              <LogoFestalgia fundo={LOGO_FUNDO.ESCURO} className="h-9 w-auto" />
            </h1>
            <p className="text-xs font-medium text-white/50">Painel administrativo</p>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <AlternadorTema sobre="sidebar" />
            <button
              type="button"
              onClick={onLogout}
              aria-label="Sair"
              className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/15"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        <nav
          aria-label="Seções do painel"
          className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-1"
        >
          {navItems.map((item) => (
            <SidebarNavItem
              key={item.id}
              rotulo={item.rotulo}
              descricao={item.descricao}
              Icone={item.Icone}
              contador={item.contador}
              ativo={abaAtiva === item.id}
              onClick={() => onChangeAba(item.id)}
            />
          ))}
        </nav>
      </div>

      <div className="hidden space-y-4 border-t border-sidebar-border p-5 lg:block">
        <SidebarSecao titulo="Atalhos de demonstração">
          <div className="space-y-1.5">
            <Link to={FESTA_ROUTES.DEMO_CONVIDADO} target="_blank" className={LINK_ATALHO}>
              <SidebarAtalho className="w-full">
                <span>Álbum demo</span>
                <ExternalLink className="h-3.5 w-3.5 text-white/40" />
              </SidebarAtalho>
            </Link>

            <Link to={FESTA_ROUTES.DEMO_TELAO} target="_blank" className={LINK_ATALHO}>
              <SidebarAtalho className="w-full">
                <span className="flex items-center gap-1.5">
                  <Tv className="h-3.5 w-3.5 text-gema" />
                  Telão demo
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-white/40" />
              </SidebarAtalho>
            </Link>

            {tokenDemoGestao && (
              <Link
                to={`/gestao/${tokenDemoGestao}`}
                target="_blank"
                className={LINK_ATALHO}
              >
                <SidebarAtalho className="w-full">
                  <span className="flex items-center gap-1.5">
                    <Crown className="h-3.5 w-3.5 text-gema" />
                    Painel dos pais demo
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-white/40" />
                </SidebarAtalho>
              </Link>
            )}
          </div>
        </SidebarSecao>

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
      </div>
    </aside>
  );
}
