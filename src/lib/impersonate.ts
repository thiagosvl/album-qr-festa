import { STORAGE_KEYS } from "@/constants";

export function marcarComoImpersonating(): void {
  try {
    sessionStorage.setItem(STORAGE_KEYS.PARCEIRO_IMPERSONATING, "true");
  } catch {
    return;
  }
}

export function estaEmModoImpersonating(): boolean {
  try {
    return (
      sessionStorage.getItem(STORAGE_KEYS.PARCEIRO_IMPERSONATING) === "true"
    );
  } catch {
    return false;
  }
}

export function limparModoImpersonating(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.PARCEIRO_IMPERSONATING);
  } catch {
    return;
  }
}
