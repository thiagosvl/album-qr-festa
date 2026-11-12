import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { SalvarConfirmacaoRsvpPayload } from "@/hooks/api/useConviteApi";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import type { FestaEventoConfirmacao } from "@/types/festa.types";

function ajustarTamanhoArray(lista: string[], novoTamanho: number): string[] {
  return Array.from({ length: novoTamanho }, (_, idx) => lista[idx] ?? "");
}

export function useConfirmacaoRsvpForm(
  open: boolean,
  confirmacaoEdicao: FestaEventoConfirmacao | null,
  onSaveMutation: (payload: SalvarConfirmacaoRsvpPayload) => Promise<unknown>,
  onClose?: () => void
) {
  const [adultos, setAdultos] = useState(1);
  const [criancas, setCriancas] = useState(0);
  const [nomesAdultos, setNomesAdultos] = useState<string[]>([""]);
  const [nomesCriancas, setNomesCriancas] = useState<string[]>([]);
  const [erroValidacao, setErroValidacao] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const confirmacaoId = confirmacaoEdicao?.id ?? null;

  useEffect(() => {
    if (!open) return;
    setErroValidacao(null);
    if (confirmacaoEdicao) {
      const qtdAdultos = Math.max(1, confirmacaoEdicao.adultos);
      const qtdCriancas = Math.max(0, confirmacaoEdicao.criancas);
      setAdultos(qtdAdultos);
      setCriancas(qtdCriancas);
      setNomesAdultos(
        ajustarTamanhoArray(
          confirmacaoEdicao.nomes_adultos.length > 0
            ? confirmacaoEdicao.nomes_adultos
            : [confirmacaoEdicao.nome],
          qtdAdultos
        )
      );
      setNomesCriancas(
        ajustarTamanhoArray(confirmacaoEdicao.nomes_criancas, qtdCriancas)
      );
    } else {
      setAdultos(1);
      setCriancas(0);
      setNomesAdultos([""]);
      setNomesCriancas([]);
    }
  }, [open, confirmacaoId]);

  const alterarQuantidadeAdultos = (novoValor: number) => {
    const limitado = Math.max(1, Math.min(30, novoValor));
    setAdultos(limitado);
    setNomesAdultos((atual) => ajustarTamanhoArray(atual, limitado));
  };

  const alterarQuantidadeCriancas = (novoValor: number) => {
    const limitado = Math.max(0, Math.min(30, novoValor));
    setCriancas(limitado);
    setNomesCriancas((atual) => ajustarTamanhoArray(atual, limitado));
  };

  const atualizarNomeAdulto = (indice: number, valor: string) => {
    setErroValidacao(null);
    setNomesAdultos((atual) => {
      const copia = [...atual];
      copia[indice] = valor;
      return copia;
    });
  };

  const atualizarNomeCrianca = (indice: number, valor: string) => {
    setNomesCriancas((atual) => {
      const copia = [...atual];
      copia[indice] = valor;
      return copia;
    });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const primeiroNome = (nomesAdultos[0] ?? "").trim();
    if (primeiroNome.length < 2) {
      setErroValidacao("Informe o nome completo do 1º adulto responsável.");
      return false;
    }

    setIsSubmitting(true);
    setErroValidacao(null);
    try {
      await onSaveMutation({
        adultos,
        criancas,
        nomes_adultos: nomesAdultos.map((n) => n.trim()),
        nomes_criancas: nomesCriancas.map((n) => n.trim()),
      });
      if (onClose) {
        safeCloseDialog(onClose);
      }
      return true;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Erro ao salvar confirmação.";
      setErroValidacao(msg);
      toast.error(msg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    adultos,
    criancas,
    nomesAdultos,
    nomesCriancas,
    erroValidacao,
    isSubmitting,
    alterarQuantidadeAdultos,
    alterarQuantidadeCriancas,
    atualizarNomeAdulto,
    atualizarNomeCrianca,
    handleSubmit,
  };
}
