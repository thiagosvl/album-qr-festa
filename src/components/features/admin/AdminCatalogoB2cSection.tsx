import { Edit3, Package, Plus, Sparkles } from "lucide-react";
import { FESTA_PACOTE_TIPO } from "@/constants";
import { Banner } from "@/components/ui/Banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatarMoedaCentavos } from "@/lib/utils";
import type {
  FestaCatalogoExtraB2c,
  FestaCatalogoPacoteB2c,
} from "@/types/festa.types";

interface AdminCatalogoB2cSectionProps {
  pacotes: FestaCatalogoPacoteB2c[];
  extras: FestaCatalogoExtraB2c[];
  onEditarPacote: (pacote: FestaCatalogoPacoteB2c) => void;
  onNovoExtra: () => void;
  onEditarExtra: (extra: FestaCatalogoExtraB2c) => void;
}

export function AdminCatalogoB2cSection({
  pacotes,
  extras,
  onEditarPacote,
  onNovoExtra,
  onEditarExtra,
}: AdminCatalogoB2cSectionProps) {
  return (
    <div className="space-y-6">
      <Banner
        variant="info"
        title="Catálogo Oficial B2C sincronizado com a Vitrine Comercial"
        description="Alterações de preços, limites de molduras, benefícios ou opcionais avulsos feitas aqui atualizam automaticamente o formulário de pedidos e a calculadora da Landing Page."
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2.5">
            <Package className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">
              Pacotes B2C (Básico & Completo)
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pacotes.map((pkg) => {
              const destaque = pkg.tipo_pacote === FESTA_PACOTE_TIPO.COMPLETO;
              return (
                <div
                  key={pkg.id}
                  className={`rounded-2xl border p-4 flex flex-col justify-between gap-4 ${
                    destaque
                      ? "border-primary bg-primary/5"
                      : "border-border/70 bg-card"
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant={pkg.ativo ? "success" : "secondary"}>
                        {pkg.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                      {destaque && (
                        <Badge variant="warning">Mais Vendido</Badge>
                      )}
                    </div>

                    <div>
                      <h4 className="font-display text-lg font-extrabold">
                        {pkg.nome_exibicao}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {pkg.descricao}
                      </p>
                    </div>

                    <p className="font-display text-2xl font-extrabold text-primary">
                      {formatarMoedaCentavos(pkg.preco_centavos)}
                    </p>

                    <div className="text-xs text-muted-foreground space-y-1 pt-1 border-t border-border/50">
                      <p>
                        • Limite padrão:{" "}
                        <strong>{pkg.limite_molduras} molduras</strong>
                      </p>
                      <p>
                        • Validade do álbum:{" "}
                        <strong>{pkg.dias_galeria_ativa} dias</strong>
                      </p>
                      <p>
                        • Telão ao vivo:{" "}
                        <strong>{pkg.inclui_telao ? "Incluso" : "Não"}</strong>
                      </p>
                      <p>
                        • Vídeos curtos:{" "}
                        <strong>{pkg.permite_video ? "Incluso" : "Não"}</strong>
                      </p>
                      <p>
                        • Kit gráfico QR:{" "}
                        <strong>
                          {pkg.inclui_qr_tematico ? "Incluso" : "Não"}
                        </strong>
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => onEditarPacote(pkg)}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar Pacote</span>
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">
              Extras & Opcionais Avulsos ({extras.length})
            </CardTitle>
          </div>

          <Button type="button" size="sm" onClick={onNovoExtra}>
            <Plus className="w-4 h-4" />
            <span>Novo Extra B2C</span>
          </Button>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {extras.map((extra) => (
              <div
                key={extra.id}
                className="rounded-xl border border-border/70 p-3.5 flex items-center justify-between gap-3 bg-card"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm truncate">
                      {extra.nome}
                    </span>
                    <Badge variant={extra.ativo ? "success" : "secondary"}>
                      {extra.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {extra.descricao || `Slug: ${extra.slug}`}
                  </p>
                  <p className="text-xs font-mono font-bold text-primary">
                    {formatarMoedaCentavos(extra.preco_centavos)} •{" "}
                    {extra.efeito_tipo} (+{extra.efeito_valor})
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onEditarExtra(extra)}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
