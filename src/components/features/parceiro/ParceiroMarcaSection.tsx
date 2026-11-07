import { Save, Upload } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
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
import type { ParceiroMarcaFormValues } from "@/hooks/ui/useParceiroPortalViewModel";
import { cpfCnpjMask, phoneMask } from "@/lib/masks";

interface ParceiroMarcaSectionProps {
  form: UseFormReturn<ParceiroMarcaFormValues>;
  enviandoLogo: boolean;
  onUploadLogo: (file: File) => void;
  salvandoMarca: boolean;
  onSalvarMarca: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

export function ParceiroMarcaSection({
  form,
  enviandoLogo,
  onUploadLogo,
  salvandoMarca,
  onSalvarMarca,
}: ParceiroMarcaSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Identidade visual do parceiro</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={onSalvarMarca} noValidate className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="nome_empresa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">
                      Nome Fantasia do Buffet / Estúdio *
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
                name="documento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">
                      CNPJ / CPF
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="00.000.000/0001-00"
                        {...field}
                        onChange={(e) =>
                          field.onChange(cpfCnpjMask(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cor_marca"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">
                      Cor Primária da Marca
                    </FormLabel>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="w-12 h-10 p-1 shrink-0 cursor-pointer"
                      />
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">
                      WhatsApp Comercial
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(11) 99999-9999"
                        {...field}
                        onChange={(e) =>
                          field.onChange(phoneMask(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">
                      E-mail Comercial
                    </FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="sm:col-span-2">
                <FormField
                  control={form.control}
                  name="logo_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">
                        Logotipo do Buffet / Estúdio (PNG ou JPG)
                      </FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            placeholder="https://... ou envie o arquivo ao lado"
                            {...field}
                          />
                        </FormControl>
                        <label className="shrink-0 inline-flex items-center gap-1.5 px-3.5 h-10 rounded-[18px] border border-border bg-muted/60 text-xs font-bold cursor-pointer hover:bg-muted">
                          <Upload className="w-3.5 h-3.5" />
                          <span>
                            {enviandoLogo ? "Enviando..." : "Subir Logo"}
                          </span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="hidden"
                            disabled={enviandoLogo}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              e.target.value = "";
                              if (f) onUploadLogo(f);
                            }}
                          />
                        </label>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                loading={salvandoMarca}
                disabled={enviandoLogo}
              >
                <Save className="w-4 h-4" />
                <span>
                  {salvandoMarca ? "Salvando..." : "Salvar identidade visual"}
                </span>
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
