import { ExternalLink, KeyRound } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { ParceiroB2bFormValues } from "@/hooks/form/useParceiroB2bForm";
import type { ParceiroB2bAdminDto } from "@/types/festa.types";

interface ParceiroCredenciaisAdminSectionProps {
  form: UseFormReturn<ParceiroB2bFormValues>;
  parceiroEdicao: ParceiroB2bAdminDto | null;
  gerandoLinkAcesso: boolean;
  onCopiarLinkAcesso: () => void;
}

export function ParceiroCredenciaisAdminSection({
  form,
  parceiroEdicao,
  gerandoLinkAcesso,
  onCopiarLinkAcesso,
}: ParceiroCredenciaisAdminSectionProps) {
  return (
    <div className="p-3.5 rounded-2xl border border-border/80 bg-muted/25 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold flex items-center gap-1.5 text-foreground">
          <KeyRound className="w-4 h-4 text-primary" />
          <span>Credenciais de Acesso ao Portal (/parceiro/login)</span>
        </p>
        {parceiroEdicao && (
          <div className="flex items-center gap-2">
            <Badge
              variant={parceiroEdicao.possui_login ? "success" : "warning"}
            >
              {parceiroEdicao.possui_login
                ? "Login Ativo"
                : "Sem Senha Definida"}
            </Badge>
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={gerandoLinkAcesso}
              onClick={onCopiarLinkAcesso}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>
                {gerandoLinkAcesso ? "Gerando..." : "Gerar Link de Acesso"}
              </span>
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail de Login do Parceiro *</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="contato@buffet.com.br"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="senha_acesso"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {parceiroEdicao
                  ? "Redefinir Senha (Opcional)"
                  : "Senha Inicial de Acesso *"}
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={
                    parceiroEdicao
                      ? "Em branco mantém a atual"
                      : "Mínimo 6 caracteres"
                  }
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
