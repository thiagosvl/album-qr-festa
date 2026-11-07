import { Save, Sparkles, Upload } from "lucide-react";
import { GestaoBriefingSidebar } from "@/components/features/gestao/GestaoBriefingSidebar";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { useBriefingPaiForm } from "@/hooks/form/useBriefingPaiForm";
import type {
  EventoGestaoDto,
  FestaTemaCatalogo,
} from "@/types/festa.types";

interface GestaoBriefingSectionProps {
  token: string;
  gestao: EventoGestaoDto;
  temasCatalogo: FestaTemaCatalogo[];
  onGerenciarMolduras?: () => void;
}

export function GestaoBriefingSection({
  token,
  gestao,
  temasCatalogo,
  onGerenciarMolduras,
}: GestaoBriefingSectionProps) {
  const { form, enviandoCapa, enviarFotoCapa, onSubmit, isSaving } =
    useBriefingPaiForm(token, gestao);

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
          <Form {...form}>
            <form onSubmit={onSubmit} noValidate className="space-y-4">
              <Banner
                variant="neutral"
                title="Deixe o álbum com a cara da festa"
                description="O que você mudar aqui aparece na hora para os convidados: título, cores, capa, boas-vindas e privacidade."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="titulo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-ameixa-suave">
                        Título da festa *
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subtitulo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-ameixa-suave">
                        Subtítulo
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Jardim Encantado da Helena"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="nome_aniversariante"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-ameixa-suave">
                        Nome do aniversariante
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="idade_aniversariante"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-ameixa-suave">
                        Idade
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="data_evento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-ameixa-suave">
                        Data da festa
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <FormField
                    control={form.control}
                    name="tema_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-ameixa-suave">
                          Tema
                        </FormLabel>
                        <FormControl>
                          <NativeSelect
                            {...field}
                            onChange={(e) => {
                              const id = e.target.value;
                              field.onChange(id);
                              const temaEscolhido = temasCatalogo.find(
                                (t) => t.id === id
                              );
                              if (temaEscolhido) {
                                form.setValue(
                                  "cor_primaria",
                                  temaEscolhido.cor_primaria_padrao
                                );
                                form.setValue(
                                  "cor_secundaria",
                                  temaEscolhido.cor_secundaria_padrao
                                );
                              }
                            }}
                          >
                            <option value="">Tema exclusivo</option>
                            {temasCatalogo.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.nome} ({t.categoria})
                              </option>
                            ))}
                          </NativeSelect>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="cor_primaria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-ameixa-suave">
                        Cor principal
                      </FormLabel>
                      <FormControl>
                        <Input type="color" className="h-10 p-1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cor_secundaria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-ameixa-suave">
                        Cor secundária
                      </FormLabel>
                      <FormControl>
                        <Input type="color" className="h-10 p-1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
                <div className="sm:col-span-2">
                  <FormField
                    control={form.control}
                    name="capa_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-ameixa-suave">
                          Foto de capa (opcional)
                        </FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input
                              placeholder="https://... ou envie uma foto ao lado"
                              {...field}
                            />
                          </FormControl>
                          <label className="shrink-0 inline-flex items-center gap-1.5 px-3.5 h-10 rounded-full bg-uva-claro text-uva text-sm font-semibold cursor-pointer transition hover:bg-uva hover:text-white">
                            <Upload className="w-3.5 h-3.5" />
                            <span>
                              {enviandoCapa ? "Enviando..." : "Enviar foto"}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={enviandoCapa}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                e.target.value = "";
                                if (file) enviarFotoCapa(file);
                              }}
                            />
                          </label>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="tempo_slideshow_segundos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-ameixa-suave">
                        Segundos por foto no telão
                      </FormLabel>
                      <FormControl>
                        <Input type="number" min={3} max={30} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="boas_vindas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-ameixa-suave">
                      Frase de boas-vindas
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Ex: Registre seu carinho no 1º aninho da Helena! Escolha sua moldura favorita..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                <Button
                  type="submit"
                  loading={isSaving}
                  disabled={enviandoCapa}
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? "Salvando..." : "Salvar alterações"}</span>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <GestaoBriefingSidebar
        gestao={gestao}
        onGerenciarMolduras={onGerenciarMolduras}
      />
    </div>
  );
}
