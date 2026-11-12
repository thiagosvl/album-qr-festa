import type { ReactNode } from "react";
import { AlternadorTema } from "@/components/ui/AlternadorTema";

/** Fundo das telas de login (admin e parceiro): brilho de marca discreto e botão de tema. */
export function TelaLogin({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-gema/20 blur-3xl"
      />
      <div className="absolute right-4 top-4 z-10">
        <AlternadorTema />
      </div>
      <div className="relative z-10 flex w-full justify-center">{children}</div>
    </div>
  );
}
