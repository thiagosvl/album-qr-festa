import { Save, Sparkles } from "lucide-react";
import { GestaoBriefingSidebar } from "@/components/features/gestao/GestaoBriefingSidebar";
import { GestaoBriefingVisualFields } from "@/components/features/gestao/GestaoBriefingVisualFields";
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

              <GestaoBriefingVisualFields
                form={form}
                temasCatalogo={temasCatalogo}
                enviandoCapa={enviandoCapa}
                onEnviarFotoCapa={enviarFotoCapa}
              />

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
