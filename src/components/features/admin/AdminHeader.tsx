import { Plus, Search } from "lucide-react";
import { FESTA_FILTRO_STATUS_TODOS } from "@/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { STATUS_PEDIDO_LABELS } from "@/hooks/business/useCalculosPedido";
import type { FestaStatusPedidoEnum } from "@/types/festa.types";

interface AdminHeaderProps {
  busca: string;
  onChangeBusca: (termo: string) => void;
  filtroStatus: FestaStatusPedidoEnum | typeof FESTA_FILTRO_STATUS_TODOS;
  onChangeFiltroStatus: (
    status: FestaStatusPedidoEnum | typeof FESTA_FILTRO_STATUS_TODOS
  ) => void;
  onNovoEvento: () => void;
}

export function AdminHeader({
  busca,
  onChangeBusca,
  filtroStatus,
  onChangeFiltroStatus,
  onNovoEvento,
}: AdminHeaderProps) {
  return (
    <header className="glass-surface sticky top-0 z-30 border-b border-border/60">
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
              Pedidos e eventos
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Sinal de 50%, molduras e links dos pais de cada festa.
            </p>
          </div>

          <Button type="button" size="lg" onClick={onNovoEvento}>
            <Plus className="h-4 w-4" />
            Novo pedido
          </Button>
        </div>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por festa, aniversariante, link ou responsável"
              aria-label="Buscar pedidos"
              value={busca}
              onChange={(e) => onChangeBusca(e.target.value)}
              className="pl-10"
            />
          </div>

          <NativeSelect
            wrapperClassName="sm:w-60"
            aria-label="Filtrar por situação"
            value={filtroStatus}
            onChange={(e) =>
              onChangeFiltroStatus(
                e.target.value as
                  | FestaStatusPedidoEnum
                  | typeof FESTA_FILTRO_STATUS_TODOS
              )
            }
          >
            <option value={FESTA_FILTRO_STATUS_TODOS}>Todas as situações</option>
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
