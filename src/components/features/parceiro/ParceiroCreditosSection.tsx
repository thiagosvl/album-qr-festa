import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { Banner } from "@/components/ui/Banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatarDataBr, formatarMoedaCentavos } from "@/lib/utils";
import type {
  FestaCatalogoPlanoB2b,
  FestaTransacaoCreditoB2b,
} from "@/types/festa.types";

interface ParceiroCreditosSectionProps {
  transacoes: FestaTransacaoCreditoB2b[];
  planosB2b: FestaCatalogoPlanoB2b[];
  linkWhatsappRecarga: string;
}

export function ParceiroCreditosSection({
  transacoes,
  planosB2b,
  linkWhatsappRecarga,
}: ParceiroCreditosSectionProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">Extrato de Créditos B2B</CardTitle>
          <Button size="sm" variant="whatsapp" asChild>
            <a
              href={linkWhatsappRecarga}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>Comprar Mais Créditos</span>
            </a>
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {transacoes.length === 0 ? (
            <Banner
              variant="neutral"
              title="Nenhuma movimentação registrada"
              description="Seus lançamentos de recarga mensal, compras avulsas e ativações de álbuns aparecerão aqui."
            />
          ) : (
            transacoes.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between text-xs p-3 rounded-xl border border-border/60"
              >
                <div>
                  <p className="font-semibold text-sm">
                    {t.observacao || t.tipo}
                  </p>
                  <p className="text-muted-foreground">
                    {formatarDataBr(t.created_at)} • Tipo: {t.tipo}
                  </p>
                </div>
                <Badge variant={t.quantidade > 0 ? "success" : "secondary"}>
                  {t.quantidade > 0 ? `+${t.quantidade}` : t.quantidade} créd.
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {planosB2b.map((pl) => (
          <Card key={pl.id}>
            <CardContent className="p-4 space-y-2">
              <Badge variant="tonal">{pl.creditos_mensais} festas</Badge>
              <h4 className="font-display font-bold text-base">{pl.nome}</h4>
              <p className="text-xs text-muted-foreground">{pl.descricao}</p>
              <p className="font-display text-xl font-extrabold text-primary">
                {formatarMoedaCentavos(pl.preco_mensal_centavos)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
