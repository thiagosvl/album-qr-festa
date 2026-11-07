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
      titulo: "Faturamento Contratado",
      valor: formatarMoedaCentavos(kpis.faturamentoTotalCentavos),
      sub: `${kpis.totalEventos} evento(s) comercial(is)`,
      icon: DollarSign,
      color: "text-primary bg-primary/15",
    },
    {
      titulo: "Total Recebido (Pix)",
      valor: formatarMoedaCentavos(kpis.recebidoTotalCentavos),
      sub: `${kpis.quitadosCount} pedido(s) 100% quitado(s)`,
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      titulo: "Saldo a Receber (Quitação)",
      valor: formatarMoedaCentavos(kpis.aReceberCentavos),
      sub: "50% restantes antes da festa",
      icon: Clock,
      color: "text-amber-600 bg-amber-50",
    },
    {
      titulo: "Em Produção / Prontos",
      valor: String(kpis.emProducaoOuAtivos),
      sub: "Festas ativas no pipeline",
      icon: CalendarCheck2,
      color: "text-sky-600 bg-sky-50",
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
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 ${item.color}`}
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-muted-foreground truncate">
                  {item.titulo}
                </p>
                <p className="font-display text-lg sm:text-xl font-bold text-foreground mt-0.5 tabular-nums truncate">
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
