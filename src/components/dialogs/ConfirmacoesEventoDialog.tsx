import {
  Baby,
  ExternalLink,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { gerarUrlConviteEvento } from "@/hooks/business/useCalculosPedido";
import { useConfirmacoesEventoViewModel } from "@/hooks/ui/useConfirmacoesEventoViewModel";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import type { EventoAdminDto } from "@/types/festa.types";

export interface ConfirmacoesEventoDialogPayload {
  evento: EventoAdminDto;
}

interface ConfirmacoesEventoDialogProps {
  open: boolean;
  onClose: () => void;
  payload: ConfirmacoesEventoDialogPayload | null;
}

export function ConfirmacoesEventoDialog({
  open,
  onClose,
  payload,
}: ConfirmacoesEventoDialogProps) {
  const evento = payload?.evento ?? null;
  const vm = useConfirmacoesEventoViewModel({
    eventoId: evento?.id ?? "",
    enabled: open && Boolean(evento?.id),
  });

  if (!evento) return null;

  const urlConvite = gerarUrlConviteEvento(evento.slug);

  return (
    <BaseDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) safeCloseDialog(onClose);
      }}
      className="sm:max-w-[720px]"
    >
      <BaseDialog.Header
        title="Lista de Presença (RSVP)"
        subtitle={`${evento.titulo} • /convite/${evento.slug}`}
        icon={UserCheck}
        onClose={onClose}
      />
      <BaseDialog.Body className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl border border-border/70 bg-primary/5">
            <p className="text-[11px] font-semibold text-muted-foreground">
              Total Confirmados
            </p>
            <p className="text-xl font-extrabold text-primary">
              {vm.totalPessoas}
            </p>
          </div>
          <div className="p-3 rounded-xl border border-border/70 bg-card">
            <p className="text-[11px] font-semibold text-muted-foreground">
              Adultos
            </p>
            <p className="text-xl font-extrabold text-foreground">
              {vm.totalAdultos}
            </p>
          </div>
          <div className="p-3 rounded-xl border border-border/70 bg-card">
            <p className="text-[11px] font-semibold text-muted-foreground">
              Crianças
            </p>
            <p className="text-xl font-extrabold text-foreground">
              {vm.totalCriancas}
            </p>
          </div>
          <div className="p-3 rounded-xl border border-border/70 bg-card">
            <p className="text-[11px] font-semibold text-muted-foreground">
              Famílias / Grupos
            </p>
            <p className="text-xl font-extrabold text-foreground">
              {vm.totalGrupos}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={vm.busca}
              onChange={(e) => vm.setBusca(e.target.value)}
              placeholder="Buscar convidado por nome..."
              className="pl-9 h-9 text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" asChild>
              <a href={urlConvite} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Ver Convite</span>
              </a>
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={vm.abrirNovaConfirmacaoDialog}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Convidado</span>
            </Button>
          </div>
        </div>

        {vm.isLoading ? (
          <div className="py-10 text-center text-xs text-muted-foreground">
            Carregando confirmações de presença...
          </div>
        ) : vm.confirmacoesFiltradas.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed text-center space-y-2">
            <Users className="w-8 h-8 text-muted-foreground mx-auto opacity-60" />
            <p className="text-sm font-bold text-foreground">
              Nenhuma confirmação encontrada
            </p>
            <p className="text-xs text-muted-foreground">
              Compartilhe o link do convite ou adicione convidados manualmente.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {vm.confirmacoesFiltradas.map((conf) => (
              <div
                key={conf.id}
                className="p-3.5 rounded-xl border border-border/80 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-foreground">
                      {conf.nome}
                    </p>
                    <Badge variant="secondary" className="text-[10px]">
                      {conf.adultos} adulto(s)
                    </Badge>
                    {conf.criancas > 0 && (
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <Baby className="w-3 h-3" />
                        {conf.criancas} criança(s)
                      </Badge>
                    )}
                  </div>

                  {conf.nomes_adultos.length > 1 && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground/80">
                        Adultos:{" "}
                      </span>
                      {conf.nomes_adultos.filter(Boolean).join(", ")}
                    </p>
                  )}

                  {conf.nomes_criancas.filter(Boolean).length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground/80">
                        Crianças:{" "}
                      </span>
                      {conf.nomes_criancas.filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 px-2.5 text-xs"
                    onClick={() => vm.abrirEditarConfirmacaoDialog(conf)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => vm.confirmarExclusaoConfirmacao(conf)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </BaseDialog.Body>
      <BaseDialog.Footer>
        <Button
          type="button"
          variant="outline"
          onClick={() => safeCloseDialog(onClose)}
        >
          Fechar
        </Button>
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
