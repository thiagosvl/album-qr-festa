import {
  CalendarCheck2,
  CheckCircle2,
  Clock,
  DollarSign,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatarMoedaCentavos } from "@/lib/utils";

interface AdminKpiCardsProps {
  kpis: {
    totalEventos: number;
    faturamentoTotalCentavos: number;
    recebidoTotalCentavos: number;
    aReceberCentavos: number;
    emProducaoOuAtivos: number;
    quitadosCount: number;
  };
}

export function AdminKpiCards({ kpis }: AdminKpiCardsProps) {
  const items = [
    {
      titulo: "Faturamento contratado",
      valor: formatarMoedaCentavos(kpis.faturamentoTotalCentavos),
      sub: `${kpis.totalEventos} pedido(s) fechado(s)`,
      icon: DollarSign,
      color: "text-primary bg-primary/15",
    },
    {
      titulo: "Recebido por Pix",
      valor: formatarMoedaCentavos(kpis.recebidoTotalCentavos),
      sub: `${kpis.quitadosCount} pedido(s) quitado(s)`,
      icon: CheckCircle2,
      color: "text-success bg-success-soft",
    },
    {
      titulo: "Saldo a receber",
      valor: formatarMoedaCentavos(kpis.aReceberCentavos),
      sub: "Os 50% finais, antes da festa",
      icon: Clock,
      color: "text-warning bg-warning-soft",
    },
    {
      titulo: "Festas em andamento",
      valor: String(kpis.emProducaoOuAtivos),
      sub: "Em produção ou prontas",
      icon: CalendarCheck2,
      color: "text-info bg-info-soft",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.titulo}>
            <CardContent className="p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl sm:h-12 sm:w-12 ${item.color}`}
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-muted-foreground">
                  {item.titulo}
                </p>
                <p className="mt-0.5 truncate font-display text-xl font-extrabold tabular-nums tracking-tight text-foreground sm:text-2xl">
                  {item.valor}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                  {item.sub}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
