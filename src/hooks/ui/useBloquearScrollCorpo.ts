import { useEffect } from "react";

export function useBloquearScrollCorpo(ativo = true): void {
  useEffect(() => {
    if (!ativo) return;

    const { body, documentElement } = document;
    const overflowCorpo = body.style.overflow;
    const overflowRaiz = documentElement.style.overflow;

    body.style.overflow = "hidden";
    documentElement.style.overflow = "hidden";

    return () => {
      body.style.overflow = overflowCorpo;
      documentElement.style.overflow = overflowRaiz;
    };
  }, [ativo]);
}
