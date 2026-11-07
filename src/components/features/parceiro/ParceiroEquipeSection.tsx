import { Edit3, Plus, Trash2, Users } from "lucide-react";
import { Banner } from "@/components/ui/Banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FestaUsuario } from "@/types/festa.types";

interface ParceiroEquipeSectionProps {
  operadores: FestaUsuario[];
  onNovoOperador: () => void;
  onEditarOperador: (operador: FestaUsuario) => void;
  onExcluirOperador: (operador: FestaUsuario) => void;
}

export function ParceiroEquipeSection({
  operadores,
  onNovoOperador,
  onEditarOperador,
  onExcluirOperador,
}: ParceiroEquipeSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="w-5 h-5 text-primary" />
          <span>Equipe & Operadores ({operadores.length})</span>
        </CardTitle>
        <Button type="button" size="sm" onClick={onNovoOperador}>
          <Plus className="w-4 h-4" />
          <span>Novo Operador</span>
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        <Banner
          variant="info"
          title="Acessos individuais para sua equipe"
          description="Cadastre recepcionistas, monitores ou fotógrafos com login próprio em /parceiro/login. Eles podem ativar álbuns e moderar fotos sem alterar dados da empresa."
        />

        {operadores.length === 0 ? (
          <Banner
            variant="neutral"
            title="Nenhum operador adicional cadastrado"
            description="Clique em 'Novo Operador' para criar um login individual para um membro da sua equipe."
          />
        ) : (
          <div className="space-y-3">
            {operadores.map((op) => (
              <div
                key={op.id}
                className="rounded-2xl border border-border/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-display text-sm font-bold">
                      {op.nome}
                    </h4>
                    <Badge variant={op.ativo ? "success" : "secondary"}>
                      {op.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                    <Badge variant="outline">Operador</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Login: <strong>{op.email ?? "Sem e-mail"}</strong>
                    {op.telefone ? ` • WhatsApp: ${op.telefone}` : ""}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onEditarOperador(op)}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar / Senha</span>
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8 rounded-lg"
                    title="Remover operador"
                    onClick={() => onExcluirOperador(op)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
