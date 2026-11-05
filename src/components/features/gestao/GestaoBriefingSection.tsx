import { useState } from "react";
import { CheckCircle2, Clock, Save, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  FESTA_BUCKET_MIDIAS,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
} from "@/constants";
import { Banner } from "@/components/ui/Banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { uploadBlobComProgresso } from "@/hooks/business/useComposicaoCanvas";
import { useBriefingPaiForm } from "@/hooks/form/useBriefingPaiForm";
import { formatarMoedaCentavos, gerarUuidLocal } from "@/lib/utils";
import type {
  EventoGestaoDto,
  FestaTemaCatalogo,
} from "@/types/festa.types";

interface GestaoBriefingSectionProps {
  token: string;
  gestao: EventoGestaoDto;
  temasCatalogo: FestaTemaCatalogo[];
}

export function GestaoBriefingSection({
  token,
  gestao,
  temasCatalogo,
}: GestaoBriefingSectionProps) {
  const { form, onSubmit, isSaving } = useBriefingPaiForm(token, gestao);
  const [enviandoCapa, setEnviandoCapa] = useState(false);
  const { evento, molduras, extras, valor_restante_centavos } = gestao;

  const handleUploadCapa = async (file: File) => {
    setEnviandoCapa(true);
    try {
      const storagePath = `${evento.slug}/midias/capa-${gerarUuidLocal()}.jpg`;
      const publicUrl = await uploadBlobComProgresso(
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        FESTA_BUCKET_MIDIAS,
        storagePath,
        file
      );
      form.setValue("capa_url", publicUrl);
      toast.success("Foto de capa enviada! Clique em Salvar Preferências.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao enviar foto de capa"
      );
    } finally {
      setEnviandoCapa(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>Dados e visual da festa</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <Banner
              variant="neutral"
              title="Deixe o álbum com a cara da festa"
              description="O que você mudar aqui aparece na hora para os convidados: título, cores, capa, boas-vindas e privacidade."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-ameixa-suave">Título da festa</label>
                <Input {...form.register("titulo")} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-ameixa-suave">
                  Subtítulo
                </label>
                <Input
                  placeholder="Ex: Jardim Encantado da Helena"
                  {...form.register("subtitulo")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-ameixa-suave">
                  Nome do aniversariante
                </label>
                <Input {...form.register("nome_aniversariante")} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-ameixa-suave">Idade</label>
                <Input {...form.register("idade_aniversariante")} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-ameixa-suave">Data da festa</label>
                <Input type="date" {...form.register("data_evento")} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-sm font-semibold text-ameixa-suave">
                  Tema
                </label>
                <select
                  className="flex h-10 w-full rounded-[18px] border border-input bg-background px-3 py-2 text-sm"
                  {...form.register("tema_id")}
                >
                  <option value="">Tema exclusivo</option>
                  {temasCatalogo.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome} ({t.categoria})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-ameixa-suave">Cor principal</label>
                <Input
                  type="color"
                  className="h-10 p-1"
                  {...form.register("cor_primaria")}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-ameixa-suave">Cor secundária</label>
                <Input
                  type="color"
                  className="h-10 p-1"
                  {...form.register("cor_secundaria")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-sm font-semibold text-ameixa-suave">
                  Foto de capa (opcional)
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://... ou envie uma foto ao lado"
                    {...form.register("capa_url")}
                  />
                  <label className="shrink-0 inline-flex items-center gap-1.5 px-3.5 h-10 rounded-full bg-uva-claro text-uva text-sm font-semibold cursor-pointer transition hover:bg-uva hover:text-white">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{enviandoCapa ? "Enviando..." : "Enviar foto"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={enviandoCapa}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (file) handleUploadCapa(file);
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-ameixa-suave">
                  Segundos por foto no telão
                </label>
                <Input
                  type="number"
                  min={3}
                  max={30}
                  {...form.register("tempo_slideshow_segundos")}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-ameixa-suave">
                Frase de boas-vindas
              </label>
              <textarea
                rows={3}
                placeholder="Ex: Registre seu carinho no 1º aninho da Helena! Escolha sua moldura favorita..."
                className="flex w-full rounded-[22px] border border-input bg-background p-3.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...form.register("boas_vindas")}
              />
            </div>

            <div className="flex flex-wrap gap-6 pt-1">
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded accent-uva"
                  {...form.register("galeria_publica")}
                />
                <span>
                  Galeria pública: os convidados veem as fotos uns dos outros
                </span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded accent-uva"
                  {...form.register("moderacao_previa")}
                />
                <span>
                  Aprovar as fotos antes de aparecerem no mural e no telão
                </span>
              </label>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                <Save className="w-4 h-4" />
                <span>
                  {isSaving ? "Salvando..." : "Salvar alterações"}
                </span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Molduras da festa ({molduras.length}/{evento.limite_molduras})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {molduras.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Suas molduras aparecem aqui quando a arte ficar pronta.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {molduras.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-xl border border-border/60 p-2 bg-muted/20 space-y-1.5"
                  >
                    <div
                      className="xadrez aspect-[9/16] rounded-lg overflow-hidden"
                    >
                      <img
                        src={m.arquivo_url}
                        alt={m.nome}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-[11px] font-bold truncate text-center">
                      {m.nome}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Pedido e extras
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Valor total</span>
              <span className="font-bold">
                {formatarMoedaCentavos(evento.valor_total_centavos)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Valor pago</span>
              <span className="font-bold text-emerald-700">
                {formatarMoedaCentavos(evento.valor_pago_centavos)}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="text-muted-foreground">Saldo em aberto</span>
              <span className="font-bold">
                {formatarMoedaCentavos(valor_restante_centavos)}
              </span>
            </div>

            {extras.length > 0 && (
              <div className="space-y-2 pt-1">
                <p className="font-bold text-foreground">
                  Extras contratados
                </p>
                {extras.map((ex) => (
                  <div
                    key={ex.id}
                    className="flex items-center justify-between gap-2 p-2 rounded-xl bg-muted/40"
                  >
                    <span className="truncate">
                      {ex.quantidade}x {ex.nome}
                    </span>
                    <Badge variant={ex.entregue ? "success" : "warning"}>
                      {ex.entregue ? (
                        <span className="inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Entregue
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Em produção
                        </span>
                      )}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
