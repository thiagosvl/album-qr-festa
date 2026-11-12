import type { ReactNode } from "react";

interface TituloPaginaProps {
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
}

/** Título de seção das telas internas (admin e parceiro). */
export function TituloPagina({ titulo, descricao, acao }: TituloPaginaProps) {
  return (
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
          {titulo}
        </h1>
        {descricao && (
          <p className="mt-0.5 text-sm text-muted-foreground">{descricao}</p>
        )}
      </div>
      {acao}
    </div>
  );
}
