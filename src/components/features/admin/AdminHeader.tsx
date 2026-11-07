import { LogOut, Plus, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { STATUS_PEDIDO_LABELS } from "@/hooks/business/useCalculosPedido";
import type { FestaStatusPedidoEnum } from "@/types/festa.types";

interface AdminHeaderProps {
  busca: string;
  onChangeBusca: (termo: string) => void;
  filtroStatus: FestaStatusPedidoEnum | "TODOS";
  onChangeFiltroStatus: (status: FestaStatusPedidoEnum | "TODOS") => void;
  onNovoEvento: () => void;
  onLogout: () => void;
}

export function AdminHeader({
  busca,
  onChangeBusca,
  filtroStatus,
  onChangeFiltroStatus,
  onNovoEvento,
  onLogout,
}: AdminHeaderProps) {
  return (
    <header className="glass-surface border-b border-border/60 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary/15 text-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-bold">
                Álbum QR Festa • Backoffice Admin
              </h1>
              <p className="text-xs text-muted-foreground">
                Gestão comercial de pedidos B2C, sinal 50%, molduras PNG e links
                dos pais
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" onClick={onNovoEvento}>
              <Plus className="w-4 h-4" />
              <span>Novo Pedido / Evento</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onLogout}
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Buscar por nome da festa, aniversariante, slug ou responsável..."
              value={busca}
              onChange={(e) => onChangeBusca(e.target.value)}
              className="pl-9"
            />
          </div>

          <NativeSelect
            wrapperClassName="sm:w-60"
            value={filtroStatus}
            onChange={(e) =>
              onChangeFiltroStatus(
                e.target.value as FestaStatusPedidoEnum | "TODOS"
              )
            }
          >
            <option value="TODOS">Todos os Status</option>
            {(Object.keys(STATUS_PEDIDO_LABELS) as FestaStatusPedidoEnum[]).map(
              (st) => (
                <option key={st} value={st}>
                  {STATUS_PEDIDO_LABELS[st]}
                </option>
              )
            )}
          </NativeSelect>
        </div>
      </div>
    </header>
  );
}
