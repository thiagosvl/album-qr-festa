import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { notificarErrosFormulario } from "@/components/ui/form";
import {
  useAtualizarOperadorParceiroMutation,
  useCriarOperadorParceiroMutation,
} from "@/hooks/api/useParceiroB2bApi";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import type { FestaUsuario } from "@/types/festa.types";

const operadorParceiroFormSchema = z.object({
  nome: z.string().min(2, "Informe o nome do operador"),
  email: z.string().email("Informe um e-mail válido"),
  telefone: z.string().optional(),
  senha_acesso: z.string().optional(),
  ativo: z.boolean().default(true),
});

export type OperadorParceiroFormValues = z.infer<
  typeof operadorParceiroFormSchema
>;

export function useOperadorParceiroForm(
  open: boolean,
  operadorEdicao: FestaUsuario | null,
  onClose: () => void
) {
  const criarMutation = useCriarOperadorParceiroMutation();
  const atualizarMutation = useAtualizarOperadorParceiroMutation();

  const form = useForm<OperadorParceiroFormValues>({
    resolver: zodResolver(operadorParceiroFormSchema),
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      senha_acesso: "",
      ativo: true,
    },
  });

  const { reset } = form;
  const operadorId = operadorEdicao?.id ?? null;

  useEffect(() => {
    if (!open) return;
    if (operadorEdicao) {
      reset({
        nome: operadorEdicao.nome,
        email: operadorEdicao.email ?? "",
        telefone: operadorEdicao.telefone ?? "",
        senha_acesso: "",
        ativo: operadorEdicao.ativo,
      });
      return;
    }

    reset({
      nome: "",
      email: "",
      telefone: "",
      senha_acesso: "",
      ativo: true,
    });
  }, [open, operadorId, reset]);

  const onSubmit = form.handleSubmit(async (values) => {
    const senhaLimpa = values.senha_acesso?.trim() || "";

    if (!operadorEdicao && senhaLimpa.length < 6) {
      form.setError("senha_acesso", {
        type: "manual",
        message: "A senha inicial deve ter no mínimo 6 caracteres",
      });
      notificarErrosFormulario();
      return;
    }

    if (operadorEdicao && senhaLimpa.length > 0 && senhaLimpa.length < 6) {
      form.setError("senha_acesso", {
        type: "manual",
        message: "A nova senha deve ter no mínimo 6 caracteres",
      });
      notificarErrosFormulario();
      return;
    }

    try {
      if (operadorEdicao) {
        await atualizarMutation.mutateAsync({
          operadorId: operadorEdicao.id,
          payload: {
            nome: values.nome.trim(),
            email: values.email.trim().toLowerCase(),
            telefone: values.telefone?.trim() || null,
            senha_acesso: senhaLimpa || null,
            ativo: values.ativo,
          },
        });
        toast.success("Operador atualizado com sucesso!");
      } else {
        await criarMutation.mutateAsync({
          nome: values.nome.trim(),
          email: values.email.trim().toLowerCase(),
          telefone: values.telefone?.trim() || null,
          senha_acesso: senhaLimpa,
          ativo: values.ativo,
        });
        toast.success("Operador cadastrado com acesso ao portal!");
      }
      safeCloseDialog(onClose);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao salvar operador"
      );
    }
  }, notificarErrosFormulario);

  return {
    form,
    onSubmit,
    isSubmitting: criarMutation.isPending || atualizarMutation.isPending,
  };
}
