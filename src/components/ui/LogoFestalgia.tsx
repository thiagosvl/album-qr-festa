import iconeClaro from "@/assets/marca/icone.svg";
import iconeEscuro from "@/assets/marca/icone-fundo-escuro.svg";
import horizontalClaro from "@/assets/marca/logo-horizontal.svg";
import horizontalEscuro from "@/assets/marca/logo-horizontal-fundo-escuro.svg";
import {
  LOGO_FUNDO,
  LOGO_VARIANTE,
  NOME_MARCA,
  type LogoFundo,
  type LogoVariante,
} from "@/constants";
import { cn } from "@/lib/utils";

const LOGO_ARQUIVO: Record<LogoVariante, Record<LogoFundo, string>> = {
  [LOGO_VARIANTE.HORIZONTAL]: {
    [LOGO_FUNDO.CLARO]: horizontalClaro,
    [LOGO_FUNDO.ESCURO]: horizontalEscuro,
  },
  [LOGO_VARIANTE.ICONE]: {
    [LOGO_FUNDO.CLARO]: iconeClaro,
    [LOGO_FUNDO.ESCURO]: iconeEscuro,
  },
};

interface LogoFestalgiaProps {
  variante?: LogoVariante;
  fundo?: LogoFundo;
  className?: string;
}

/**
 * Logo oficial da marca. `fundo` indica o fundo onde o logo será exibido:
 * CLARO usa roxo e dourado; ESCURO usa branco e dourado.
 * Defina a altura (ou largura) por `className`; a outra dimensão é automática.
 */
export function LogoFestalgia({
  variante = LOGO_VARIANTE.HORIZONTAL,
  fundo = LOGO_FUNDO.CLARO,
  className,
}: LogoFestalgiaProps) {
  return (
    <img
      src={LOGO_ARQUIVO[variante][fundo]}
      alt={NOME_MARCA}
      draggable={false}
      className={cn("select-none", className)}
    />
  );
}
