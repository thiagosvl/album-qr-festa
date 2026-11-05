import { Building2, Coins, Edit3, ExternalLink, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { FESTA_ROUTES } from "@/constants";
import { Banner } from "@/components/ui/Banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatarMoedaCentavos } from "@/lib/utils";
import type {
  FestaCatalogoPlanoB2b,
  ParceiroB2bAdminDto,
} from "@/types/festa.types";

interface AdminParceirosB2bSectionProps {
  parceiros: ParceiroB2bAdminDto[];
  planosB2b: FestaCatalogoPlanoB2b[];
  isLoading: boolean;
  onNovoParceiro: () => void;
  onEditarParceiro: (parceiro: ParceiroB2bAdminDto) => void;
}

export function AdminParceirosB2bSection({
  parceiros,
  planosB2b,
  isLoading,
  onNovoParceiro,
  onEditarParceiro,
}: AdminParceirosB2bSectionProps) {
  return (
    <div className="space-y-6">
      <Banner
        variant="info"
        title="Gestão de Parceiros B2B (Buffets, Fotógrafos e Casas de Festas)"
        description="Cadastre parceiros White-Label, acompanhe o saldo de créditos de eventos e realize recargas avulsas ou mensais."
      />

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">
              Parceiros B2B Ativos ({parceiros.length})
            </CardTitle>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={FESTA_ROUTES.PARCEIRO_PORTAL}>
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir Portal do Parceiro</span>
              </Link>
            </Button>

            <Button type="button" size="sm" onClick={onNovoParceiro}>
              <Plus className="w-4 h-4" />
              <span>Novo Parceiro B2B</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-xl bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : parceiros.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Nenhum parceiro B2B cadastrado ainda.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parceiros.map((parceiro) => (
                <div
                  key={parceiro.id}
                  className="rounded-2xl border border-border/70 p-4 flex flex-col justify-between gap-4 bg-card"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full"
                          style={{
                            backgroundColor: parceiro.cor_marca ?? "#7c3aed",
                          }}
                        />
                        <Badge variant={parceiro.ativo ? "success" : "secondary"}>
                          {parceiro.ativo ? "Parceiro Ativo" : "Inativo"}
                        </Badge>
                        {parceiro.plano && (
                          <Badge variant="tonal">{parceiro.plano.nome}</Badge>
                        )}
                      </div>

                      <Badge variant="warning">
                        {parceiro.saldo_creditos} créditos
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-display text-lg font-bold">
                        {parceiro.nome_empresa}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {parceiro.email || "Sem e-mail"} •{" "}
                        {parceiro.telefone || "Sem WhatsApp"} •{" "}
                        {parceiro.documento || "Sem CNPJ"}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                      <span>
                        Eventos ativados:{" "}
                        <strong className="text-foreground">
                          {parceiro.total_eventos}
                        </strong>
                      </span>
                      <span>
                        Movimentações:{" "}
                        <strong className="text-foreground">
                          {parceiro.transacoes.length}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="tonal"
                      size="sm"
                      className="flex-1"
                      onClick={() => onEditarParceiro(parceiro)}
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>Recarregar Créditos / Editar</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onEditarParceiro(parceiro)}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Planos B2B de Referência (Catálogo Comercial)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {planosB2b.map((pl) => (
              <div
                key={pl.id}
                className="rounded-xl border border-border/60 p-3.5 space-y-1.5 bg-muted/20"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm">
                    {pl.nome}
                  </span>
                  <Badge variant="tonal">{pl.creditos_mensais} créditos</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{pl.descricao}</p>
                <p className="font-display text-lg font-extrabold text-primary">
                  {formatarMoedaCentavos(pl.preco_mensal_centavos)}/ciclo
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
