import {
  ArrowDown,
  ArrowUp,
  Frame,
  Plus,
  Trash2,
} from "lucide-react";
import { FESTA_ACAO_MOLDURA } from "@/constants";
import { Banner } from "@/components/ui/Banner";
import { Badge } from "@/components/ui/badge";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { useMoldurasEventoViewModel } from "@/hooks/ui/useMoldurasEventoViewModel";
import type { EventoAdminDto } from "@/types/festa.types";

export interface MoldurasEventoDialogPayload {
  evento: EventoAdminDto;
}

interface MoldurasEventoDialogProps {
  open: boolean;
  onClose: () => void;
  payload: MoldurasEventoDialogPayload | null;
}

export function MoldurasEventoDialog({
  open,
  onClose,
  payload,
}: MoldurasEventoDialogProps) {
  const evento = payload?.evento ?? null;
  const vm = useMoldurasEventoViewModel(evento);

  if (!evento) return null;

  return (
    <BaseDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) safeCloseDialog(onClose);
      }}
      lockClose={vm.enviando}
      className="sm:max-w-[660px]"
    >
      <BaseDialog.Header
        title="Molduras do Evento (PNG 1080x1920)"
        subtitle={`${evento.titulo} • ${vm.ativasCount}/${evento.limite_molduras} molduras ativas`}
        icon={Frame}
        onClose={onClose}
        lockClose={vm.enviando}
      />
      <BaseDialog.Body className="space-y-4">
        <Banner
          variant={vm.ativasCount >= evento.limite_molduras ? "warning" : "info"}
          title={`Limite do pacote + extras: ${evento.limite_molduras} moldura(s) ativa(s)`}
          description="Envie artes em PNG transparente na proporção vertical 9:16 (1080x1920). A opção 'Sem moldura' já fica ativa automaticamente em 1º lugar na câmera."
        />

        <Form {...vm.form}>
          <form
            onSubmit={vm.handleUploadMoldura}
            noValidate
            className="p-4 rounded-2xl border border-border/80 bg-muted/20 space-y-3"
          >
            <p className="text-sm font-semibold text-muted-foreground">
              Adicionar nova moldura transparente
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                control={vm.form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título da Moldura *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Jardim da Helena - Floral"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={vm.form.control}
                name="arquivo"
                render={({ field: { onChange } }) => (
                  <FormItem>
                    <FormLabel>Arquivo PNG (1080x1920) *</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) onChange(file);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" size="sm" loading={vm.enviando}>
                <Plus className="w-4 h-4" />
                <span>
                  {vm.enviando ? "Enviando PNG..." : "Enviar e Salvar Moldura"}
                </span>
              </Button>
            </div>
          </form>
        </Form>

        {vm.isLoadingMolduras ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="aspect-[9/16] rounded-2xl bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {vm.molduras.map((moldura, idx) => (
              <div
                key={moldura.id}
                className="rounded-2xl border border-border/80 bg-background p-2.5 flex flex-col gap-2"
              >
                <div className="xadrez aspect-[9/16] rounded-xl overflow-hidden relative flex items-center justify-center">
                  <img
                    src={moldura.arquivo_url}
                    alt={moldura.nome}
                    className="w-full h-full object-contain"
                  />
                  <Badge
                    variant={moldura.ativa ? "success" : "secondary"}
                    className="absolute top-2 right-2"
                  >
                    {moldura.ativa ? `#${idx + 1} Ativa` : "Inativa"}
                  </Badge>
                </div>
                <p className="text-xs font-bold truncate">{moldura.nome}</p>

                <div className="flex items-center justify-between gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={idx === 0 || vm.reordenando}
                    onClick={() => vm.moverOrdem(idx, -1)}
                    className="h-7 w-7"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={idx === vm.molduras.length - 1 || vm.reordenando}
                    onClick={() => vm.moverOrdem(idx, 1)}
                    className="h-7 w-7"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    loading={
                      vm.acaoMoldura?.id === moldura.id &&
                      vm.acaoMoldura?.tipo === FESTA_ACAO_MOLDURA.ATIVA
                    }
                    disabled={vm.acaoMoldura?.id === moldura.id}
                    className="flex-1 h-7 text-[11px] px-2"
                    onClick={() => vm.alternarAtivaMoldura(moldura)}
                  >
                    {moldura.ativa ? "Desativar" : "Ativar"}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    loading={
                      vm.acaoMoldura?.id === moldura.id &&
                      vm.acaoMoldura?.tipo === FESTA_ACAO_MOLDURA.EXCLUIR
                    }
                    disabled={vm.acaoMoldura?.id === moldura.id}
                    className="h-7 w-7 rounded-lg"
                    onClick={() => vm.excluirMoldura(moldura.id)}
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
          Concluir
        </Button>
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
