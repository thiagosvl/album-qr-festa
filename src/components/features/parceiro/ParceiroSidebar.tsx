import {
  Building2,
  CalendarHeart,
  Coins,
  LogOut,
  Palette,
  Plus,
  Users,
} from "lucide-react";
import { FESTA_PARCEIRO_TABS, type FestaParceiroTab } from "@/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  return (
    <aside className="w-full lg:w-72 shrink-0 bg-ameixa text-white lg:min-h-screen flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10">
      <div className="p-5 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-2xl overflow-hidden flex items-center justify-center text-white font-bold shadow-md shrink-0"
              style={{
                backgroundColor: parceiro?.cor_marca ?? "#a133d8",
              }}
            >
              {parceiro?.logo_url ? (
                <img
                  src={parceiro.logo_url}
                  alt={parceiro.nome_empresa}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-base font-extrabold text-white truncate">
                {parceiro?.nome_empresa ?? "Portal do Parceiro B2B"}
              </h1>
              <p className="text-[11px] text-white/60 truncate">
                {parceiro?.email_acesso ??
                  parceiro?.email ??
                  "Portal do parceiro • Buffets & Fotógrafos"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            title="Sair da conta"
            className="lg:hidden p-2 rounded-xl bg-white/8 hover:bg-white/15 text-white/80"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="rounded-2xl bg-white/8 border border-white/10 p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/70">Saldo Disponível</span>
            <Badge variant="warning">
              {parceiro?.saldo_creditos ?? 0} créditos
            </Badge>
          </div>
          <p className="text-[11px] text-white/55">
            Plano atual:{" "}
            <strong className="text-white">
              {parceiro?.plano?.nome ?? "Pacote de Créditos"}
            </strong>
          </p>
          <Button
            type="button"
            size="sm"
            className="w-full"
            onClick={onAtivarEvento}
          >
            <Plus className="w-4 h-4" />
            <span>Ativar Novo Evento (Usar Créd.)</span>
          </Button>
        </div>

        <nav
          className={`grid gap-1.5 ${
            ehParceiroAdmin
              ? "grid-cols-2 sm:grid-cols-4 lg:grid-cols-1"
              : "grid-cols-2 lg:grid-cols-1"
          }`}
        >
          <button
            type="button"
            onClick={() => onChangeAba(FESTA_PARCEIRO_TABS.EVENTOS)}
            className={`px-3.5 py-2.5 rounded-xl text-left text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all ${
              abaAtiva === FESTA_PARCEIRO_TABS.EVENTOS
                ? "bg-gema text-ameixa"
                : "text-white/75 hover:bg-white/10"
            }`}
          >
            <CalendarHeart className="w-4 h-4 shrink-0" />
            <span>Eventos ({totalEventos})</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeAba(FESTA_PARCEIRO_TABS.CREDITOS)}
            className={`px-3.5 py-2.5 rounded-xl text-left text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all ${
              abaAtiva === FESTA_PARCEIRO_TABS.CREDITOS
                ? "bg-gema text-ameixa"
                : "text-white/75 hover:bg-white/10"
            }`}
          >
            <Coins className="w-4 h-4 shrink-0" />
            <span>Extrato & Planos</span>
          </button>

          {ehParceiroAdmin && (
            <>
              <button
                type="button"
                onClick={() => onChangeAba(FESTA_PARCEIRO_TABS.EQUIPE)}
                className={`px-3.5 py-2.5 rounded-xl text-left text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all ${
                  abaAtiva === FESTA_PARCEIRO_TABS.EQUIPE
                    ? "bg-gema text-ameixa"
                    : "text-white/75 hover:bg-white/10"
                }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span>Equipe ({totalOperadores})</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeAba(FESTA_PARCEIRO_TABS.MARCA)}
                className={`px-3.5 py-2.5 rounded-xl text-left text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all ${
                  abaAtiva === FESTA_PARCEIRO_TABS.MARCA
                    ? "bg-gema text-ameixa"
                    : "text-white/75 hover:bg-white/10"
                }`}
              >
                <Palette className="w-4 h-4 shrink-0" />
                <span>Identidade visual</span>
              </button>
            </>
          )}
        </nav>
      </div>

      <div className="hidden lg:block p-5 border-t border-white/10 space-y-2">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-white/80 cursor-pointer"
        >
          <span>Sair da conta</span>
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
