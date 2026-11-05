import {
  Building2,
  CalendarHeart,
  Coins,
  ExternalLink,
  Palette,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { FESTA_ROUTES } from "@/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  FestaParceiroB2b,
  ParceiroB2bAdminDto,
} from "@/types/festa.types";

interface ParceiroSidebarProps {
  parceiro: ParceiroB2bAdminDto | null;
  parceirosDisponiveis: FestaParceiroB2b[];
  parceiroIdSelecionado: string;
  onChangeParceiroId: (id: string) => void;
  abaAtiva: "EVENTOS" | "CREDITOS" | "MARCA";
  onChangeAba: (aba: "EVENTOS" | "CREDITOS" | "MARCA") => void;
  totalEventos: number;
  onAtivarEvento: () => void;
}

export function ParceiroSidebar({
  parceiro,
  parceirosDisponiveis,
  parceiroIdSelecionado,
  onChangeParceiroId,
  abaAtiva,
  onChangeAba,
  totalEventos,
  onAtivarEvento,
}: ParceiroSidebarProps) {
  return (
    <aside className="w-full lg:w-72 shrink-0 bg-[#130d1e] text-[#f9f6fb] lg:min-h-screen flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10">
      <div className="p-5 space-y-5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-md"
            style={{
              backgroundColor: parceiro?.cor_marca ?? "#a133d8",
            }}
          >
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-base font-extrabold text-white truncate">
              {parceiro?.nome_empresa ?? "Portal do Parceiro B2B"}
            </h1>
            <p className="text-[11px] text-white/60">
              Portal do parceiro • Buffets & Fotógrafos
            </p>
          </div>
        </div>

        {parceirosDisponiveis.length > 1 && (
          <div className="space-y-1">
            <label className="text-[11px] uppercase tracking-wider text-white/50 font-bold">
              Alternar Conta Parceira (Demo)
            </label>
            <select
              value={parceiroIdSelecionado}
              onChange={(e) => onChangeParceiroId(e.target.value)}
              className="w-full h-9 rounded-xl bg-white/10 border border-white/15 px-3 text-xs font-semibold text-white"
            >
              {parceirosDisponiveis.map((p) => (
                <option key={p.id} value={p.id} className="text-slate-900">
                  {p.nome_empresa} ({p.saldo_creditos} créd.)
                </option>
              ))}
            </select>
          </div>
        )}

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
            <span>Ativar Novo Evento (-1 Créd.)</span>
          </Button>
        </div>

        <nav className="grid grid-cols-3 lg:grid-cols-1 gap-1.5">
          <button
            type="button"
            onClick={() => onChangeAba("EVENTOS")}
            className={`px-3.5 py-2.5 rounded-xl text-left text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all ${
              abaAtiva === "EVENTOS"
                ? "bg-primary text-white"
                : "text-white/75 hover:bg-white/10"
            }`}
          >
            <CalendarHeart className="w-4 h-4 shrink-0" />
            <span>Eventos ({totalEventos})</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeAba("CREDITOS")}
            className={`px-3.5 py-2.5 rounded-xl text-left text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all ${
              abaAtiva === "CREDITOS"
                ? "bg-primary text-white"
                : "text-white/75 hover:bg-white/10"
            }`}
          >
            <Coins className="w-4 h-4 shrink-0" />
            <span>Extrato & Planos</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeAba("MARCA")}
            className={`px-3.5 py-2.5 rounded-xl text-left text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all ${
              abaAtiva === "MARCA"
                ? "bg-primary text-white"
                : "text-white/75 hover:bg-white/10"
            }`}
          >
            <Palette className="w-4 h-4 shrink-0" />
            <span>Identidade visual</span>
          </button>
        </nav>
      </div>

      <div className="hidden lg:block p-5 border-t border-white/10 space-y-2">
        <Link
          to={FESTA_ROUTES.ADMIN_DASHBOARD}
          className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-white/80"
        >
          <span>Ir para Backoffice Admin</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </aside>
  );
}
