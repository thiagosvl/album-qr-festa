import {
  Building2,
  CalendarHeart,
  Crown,
  ExternalLink,
  LogOut,
  Package,
  Palette,
  Sparkles,
  Tv,
} from "lucide-react";
import { Link } from "react-router-dom";
import { NOME_MARCA } from "@/constants";
import {
  FESTA_ADMIN_TABS,
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
    label: string;
    sublabel: string;
    icon: typeof CalendarHeart;
    badge?: number;
  }[] = [
    {
      id: FESTA_ADMIN_TABS.EVENTOS,
      label: "Pedidos & Eventos B2C",
      sublabel: "Sinal 50%, Molduras e Links",
      icon: CalendarHeart,
      badge: totalEventos,
    },
    {
      id: FESTA_ADMIN_TABS.CATALOGO_B2C,
      label: "Catálogo B2C & Extras",
      sublabel: "Pacotes e Opcionais avulsos",
      icon: Package,
    },
    {
      id: FESTA_ADMIN_TABS.TEMAS,
      label: "Vitrine de Temas",
      sublabel: "Molduras e paletas de cores",
      icon: Palette,
    },
    {
      id: FESTA_ADMIN_TABS.PARCEIROS_B2B,
      label: "Parceiros & Planos B2B",
      sublabel: "Buffets, Fotógrafos e Créditos",
      icon: Building2,
      badge: totalParceiros,
    },
  ];

  return (
    <aside className="w-full lg:w-72 shrink-0 bg-ameixa text-white lg:min-h-screen flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10">
      <div className="p-5 space-y-6">
        <div className="flex items-center justify-between lg:justify-start gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 text-primary flex items-center justify-center border border-primary/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display text-lg font-extrabold tracking-tight text-white">
                {NOME_MARCA}
              </h1>
              <p className="text-[11px] text-white/60 font-medium">
                Backoffice Admin • B2C & B2B
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="lg:hidden px-3 py-1.5 rounded-xl bg-white/10 text-xs font-semibold text-white/80 hover:bg-white/15 flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        </div>

        <nav className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-1 gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const ativo = abaAtiva === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeAba(item.id)}
                className={`w-full text-left px-3.5 py-3 rounded-xl transition-all flex items-center justify-between gap-2 ${
                  ativo
                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                    : "text-white/75 hover:bg-white/8 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      ativo ? "text-white" : "text-primary"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold truncate">
                      {item.label}
                    </p>
                    <p
                      className={`hidden lg:block text-[11px] truncate ${
                        ativo ? "text-white/80" : "text-white/50"
                      }`}
                    >
                      {item.sublabel}
                    </p>
                  </div>
                </div>

                {typeof item.badge === "number" && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${
                      ativo
                        ? "bg-white/20 text-white"
                        : "bg-white/10 text-white/80"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="hidden lg:block p-5 space-y-3 border-t border-white/10">
        <p className="text-xs text-white/55 font-semibold">
          Atalhos rápidos e demonstração
        </p>

        <div className="space-y-1.5">
          <Link
            to={FESTA_ROUTES.DEMO_CONVIDADO}
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-white/85 transition-colors"
          >
            <span>Álbum Demo (/e/demo)</span>
            <ExternalLink className="w-3.5 h-3.5 text-white/50" />
          </Link>

          <Link
            to={FESTA_ROUTES.DEMO_TELAO}
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-white/85 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5 text-primary" />
              <span>Telão Demo (/telao/demo)</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-white/50" />
          </Link>

          {tokenDemoGestao && (
            <Link
              to={`/gestao/${tokenDemoGestao}`}
              target="_blank"
              className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-white/85 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Painel dos Pais Demo</span>
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-white/50" />
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="w-full mt-2 px-3.5 py-2.5 rounded-xl bg-white/8 hover:bg-white/15 text-xs font-bold text-white/80 flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Encerrar Sessão</span>
        </button>
      </div>
    </aside>
  );
}
