import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Frame,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import {
  FESTA_BUCKET_MIDIAS,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
} from "@/constants";
import { Banner } from "@/components/ui/Banner";
import { Badge } from "@/components/ui/badge";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useAtualizarMolduraMutation,
  useCriarMolduraMutation,
  useExcluirMolduraMutation,
  useMoldurasEventoQuery,
  useReordenarMoldurasMutation,
} from "@/hooks/api/useMoldurasApi";
import { uploadBlobComProgresso } from "@/hooks/business/useComposicaoCanvas";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { gerarUuidLocal } from "@/lib/utils";
import type { EventoAdminDto, MolduraDto } from "@/types/festa.types";

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
  const [nomeNova, setNomeNova] = useState("");
  const [arquivoPng, setArquivoPng] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);

  const moldurasQuery = useMoldurasEventoQuery(evento?.id);
  const criarMutation = useCriarMolduraMutation(evento?.id ?? "");
  const atualizarMutation = useAtualizarMolduraMutation(evento?.id ?? "");
  const excluirMutation = useExcluirMolduraMutation(evento?.id ?? "");
  const reordenarMutation = useReordenarMoldurasMutation(evento?.id ?? "");

  if (!evento) return null;

  const molduras = moldurasQuery.data ?? [];
  const ativasCount = molduras.filter((m) => m.ativa).length;

  const handleUploadMoldura = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arquivoPng || !nomeNova.trim()) {
      toast.error("Informe o título da moldura e selecione um arquivo PNG.");
      return;
    }

    setEnviando(true);
    try {
      const idUnico = gerarUuidLocal();
      const storagePath = `${evento.slug}/midias/molduras/${idUnico}.png`;
      await uploadBlobComProgresso(
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        FESTA_BUCKET_MIDIAS,
        storagePath,
        arquivoPng
      );

      await criarMutation.mutateAsync({
        nome: nomeNova.trim(),
        arquivo_path: storagePath,
        ordem: molduras.length + 1,
        ativa: ativasCount < evento.limite_molduras,
      });

      setNomeNova("");
      setArquivoPng(null);
      toast.success("Moldura PNG 1080x1920 adicionada com sucesso!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao adicionar moldura"
      );
    } finally {
      setEnviando(false);
    }
  };

  const moverOrdem = async (indexAtual: number, direcao: -1 | 1) => {
    const novoIndex = indexAtual + direcao;
    if (novoIndex < 0 || novoIndex >= molduras.length) return;
    const copia: MolduraDto[] = [...molduras];
    const [removida] = copia.splice(indexAtual, 1);
    copia.splice(novoIndex, 0, removida);

    try {
      await reordenarMutation.mutateAsync(
        copia.map((item, idx) => ({ id: item.id, ordem: idx + 1 }))
      );
      toast.success("Ordem das molduras atualizada!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao reordenar molduras"
      );
    }
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) safeCloseDialog(onClose);
      }}
      lockClose={enviando}
      className="sm:max-w-[660px]"
    >
      <BaseDialog.Header
        title="Molduras do Evento (PNG 1080x1920)"
        subtitle={`${evento.titulo} • ${ativasCount}/${evento.limite_molduras} molduras ativas`}
        icon={Frame}
        onClose={onClose}
        lockClose={enviando}
      />
      <BaseDialog.Body className="space-y-4">
        <Banner
          variant={ativasCount >= evento.limite_molduras ? "warning" : "info"}
          title={`Limite do pacote + extras: ${evento.limite_molduras} moldura(s) ativa(s)`}
          description="Envie artes em PNG transparente na proporção vertical 9:16 (1080x1920). A opção 'Sem moldura' já fica ativa automaticamente em 1º lugar na câmera."
        />

        <form
          onSubmit={handleUploadMoldura}
          className="p-4 rounded-2xl border border-border/80 bg-muted/20 space-y-3"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Adicionar Nova Moldura Transparente
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              placeholder="Ex: Jardim da Helena - Floral"
              value={nomeNova}
              onChange={(e) => setNomeNova(e.target.value)}
            />
            <Input
              type="file"
              accept="image/png"
              onChange={(e) => setArquivoPng(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={enviando}>
              {enviando ? (
                <>
                  <Upload className="w-4 h-4 animate-bounce" />
                  <span>Enviando PNG...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Enviar e Salvar Moldura</span>
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {molduras.map((moldura, idx) => (
            <div
              key={moldura.id}
              className="rounded-2xl border border-border/80 bg-background p-2.5 flex flex-col gap-2"
            >
              <div
                className="aspect-[9/16] rounded-xl overflow-hidden relative flex items-center justify-center"
                style={{
                  backgroundImage:
                    "repeating-conic-gradient(#e9e3f0 0% 25%, #f6f2fa 0% 50%)",
                  backgroundSize: "14px 14px",
                }}
              >
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
                  disabled={idx === 0 || reordenarMutation.isPending}
                  onClick={() => moverOrdem(idx, -1)}
                  className="h-7 w-7"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={
                    idx === molduras.length - 1 || reordenarMutation.isPending
                  }
                  onClick={() => moverOrdem(idx, 1)}
                  className="h-7 w-7"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 h-7 text-[11px] px-2"
                  onClick={() =>
                    atualizarMutation
                      .mutateAsync({
                        molduraId: moldura.id,
                        payload: { ativa: !moldura.ativa },
                      })
                      .catch((err: Error) => toast.error(err.message))
                  }
                >
                  {moldura.ativa ? "Desativar" : "Ativar"}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-7 w-7 rounded-lg"
                  onClick={() =>
                    excluirMutation
                      .mutateAsync(moldura.id)
                      .then(() => toast.success("Moldura excluída"))
                      .catch((err: Error) => toast.error(err.message))
                  }
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
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
