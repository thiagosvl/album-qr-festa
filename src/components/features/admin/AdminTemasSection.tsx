import { Edit3, Palette, Plus } from "lucide-react";
import { Banner } from "@/components/ui/Banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FestaTemaCatalogo } from "@/types/festa.types";

interface AdminTemasSectionProps {
  temas: FestaTemaCatalogo[];
  onNovoTema: () => void;
  onEditarTema: (tema: FestaTemaCatalogo) => void;
}

export function AdminTemasSection({
  temas,
  onNovoTema,
  onEditarTema,
}: AdminTemasSectionProps) {
  return (
    <div className="space-y-6">
      <Banner
        variant="info"
        title="Vitrine de Temas e Molduras Comemorativas"
        description="Cadastre temas prontos (Infantil, 15 Anos, Casamento, Adulto) com paleta de cores sugerida e preview de moldura PNG para agilizar novos pedidos."
      />

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
          <div className="flex items-center gap-2.5">
            <Palette className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">
              Temas Cadastrados ({temas.length})
            </CardTitle>
          </div>

          <Button type="button" size="sm" onClick={onNovoTema}>
            <Plus className="w-4 h-4" />
            <span>Novo Tema da Vitrine</span>
          </Button>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {temas.map((tema) => (
              <div
                key={tema.id}
                className="rounded-2xl border border-border/70 p-4 flex flex-col justify-between gap-4 bg-card"
              >
                <div className="flex items-start gap-3.5">
                  <div className="xadrez w-16 h-24 rounded-xl border border-border overflow-hidden shrink-0 flex items-center justify-center">
                    {tema.moldura_preview_url ? (
                      <img
                        src={tema.moldura_preview_url}
                        alt={tema.nome}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Palette className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="tonal">{tema.categoria}</Badge>
                      <Badge variant={tema.ativo ? "success" : "secondary"}>
                        {tema.ativo ? "Ativo" : "Oculto"}
                      </Badge>
                    </div>

                    <h4 className="font-display text-base font-bold truncate">
                      {tema.nome}
                    </h4>

                    <p className="text-xs text-muted-foreground line-clamp-2">
                      Slug: {tema.slug}
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <span
                        className="w-5 h-5 rounded-full border border-foreground/15"
                        style={{ backgroundColor: tema.cor_primaria_padrao }}
                        title={`Primária: ${tema.cor_primaria_padrao}`}
                      />
                      <span
                        className="w-5 h-5 rounded-full border border-foreground/15"
                        style={{
                          backgroundColor: tema.cor_secundaria_padrao,
                        }}
                        title={`Secundária: ${tema.cor_secundaria_padrao}`}
                      />
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {tema.cor_primaria_padrao}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => onEditarTema(tema)}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar Tema</span>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
