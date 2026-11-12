import { Edit3, Layers, Package, Plus, Sparkles } from "lucide-react";
import { FESTA_PACOTE_TIPO } from "@/constants";
import { Banner } from "@/components/ui/Banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatarMoedaCentavos } from "@/lib/utils";
import type {
  FestaCatalogoExtraB2c,
  FestaCatalogoPacoteB2c,
  FestaCatalogoProduto,
} from "@/types/festa.types";

interface AdminCatalogoB2cSectionProps {
  produtos: FestaCatalogoProduto[];
  pacotes: FestaCatalogoPacoteB2c[];
  extras: FestaCatalogoExtraB2c[];
  onEditarProduto: (produto: FestaCatalogoProduto) => void;
  onEditarPacote: (pacote: FestaCatalogoPacoteB2c) => void;
  onNovoExtra: () => void;
  onEditarExtra: (extra: FestaCatalogoExtraB2c) => void;
}

export function AdminCatalogoB2cSection({
  produtos,
  pacotes,
  extras,
  onEditarProduto,
  onEditarPacote,
  onNovoExtra,
  onEditarExtra,
}: AdminCatalogoB2cSectionProps) {
  return (
    <div className="space-y-6">
      <Banner
        variant="info"
        title="Catálogo Multi-Produto & Add-ons sincronizado com B2C e B2B"
        description="Configure aqui os preços avulsos e créditos B2B dos produtos independentes (Galeria QR Code e Convite Interativo) e dos opcionais avulsos."
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">
              Produtos Principais Independentes ({produtos.length})
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {produtos.map((prod) => (
              <div
                key={prod.id}
                className="rounded-2xl border border-border/80 bg-card p-4 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={prod.ativo ? "success" : "secondary"}>
                        {prod.ativo ? "Ativo B2C" : "Inativo"}
                      </Badge>
                      <Badge variant="outline">{prod.codigo_modulo}</Badge>
                    </div>
                    <Badge variant="tonal">
                      B2B: {prod.custo_creditos_b2b} crédito(s)
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-display text-lg font-extrabold">
                      {prod.nome_exibicao}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {prod.descricao}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <p className="font-display text-2xl font-extrabold text-primary">
                      {formatarMoedaCentavos(prod.preco_centavos)}
                    </p>
                    {prod.preco_ancora_centavos && (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatarMoedaCentavos(prod.preco_ancora_centavos)}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1 pt-1 border-t border-border/50">
                    <p>
                      • Molduras base inclusas:{" "}
                      <strong>{prod.limite_molduras_base}</strong>
                    </p>
                    <p>
                      • Dias de validade base:{" "}
                      <strong>{prod.dias_validade_base} dias</strong>
                    </p>
                    <p>
                      • Portal Parceiro B2B:{" "}
                      <strong>
                        {prod.disponivel_b2b ? "Disponível" : "Oculto"}
                      </strong>
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => onEditarProduto(prod)}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar Produto</span>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">
              Extras & Add-ons Gerais ({extras.length})
            </CardTitle>
          </div>

          <Button type="button" size="sm" onClick={onNovoExtra}>
            <Plus className="w-4 h-4" />
            <span>Novo Extra (Add-on)</span>
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
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm truncate">
                      {extra.nome}
                    </span>
                    <Badge variant={extra.ativo ? "success" : "secondary"}>
                      {extra.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                    {extra.disponivel_b2b && (
                      <Badge variant="tonal">
                        B2B: {extra.custo_creditos_b2b} créd.
                      </Badge>
                    )}
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2.5">
            <Package className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">
              Presets / Kits de Galeria (Básico & Completo)
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
                        <Badge variant="warning">Preset Kit Completo</Badge>
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
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => onEditarPacote(pkg)}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar Preset</span>
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
