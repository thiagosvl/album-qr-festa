import {
  STORAGE_KEYS,
  TEMA,
  TEMA_CLASSE_ESCURO,
  TEMA_COR_BARRA,
  TEMA_ROTAS_PREFIXOS,
  type Tema,
} from "@/constants";

const MEDIA_ESCURO = "(prefers-color-scheme: dark)";

export function rotaAceitaTema(pathname: string): boolean {
  return TEMA_ROTAS_PREFIXOS.some(
    (prefixo) => pathname === prefixo || pathname.startsWith(`${prefixo}/`)
  );
}

export function lerTemaSalvo(): Tema {
  try {
    const salvo = localStorage.getItem(STORAGE_KEYS.TEMA);
    if (salvo === TEMA.CLARO || salvo === TEMA.ESCURO) return salvo;
  } catch {
    /* storage indisponível: segue o sistema */
  }
  return TEMA.SISTEMA;
}

export function salvarTema(tema: Tema): void {
  try {
    if (tema === TEMA.SISTEMA) localStorage.removeItem(STORAGE_KEYS.TEMA);
    else localStorage.setItem(STORAGE_KEYS.TEMA, tema);
  } catch {
    /* storage indisponível: vale só nesta sessão */
  }
}

export function sistemaPrefereEscuro(): boolean {
  return window.matchMedia(MEDIA_ESCURO).matches;
}

export function resolverTemaEscuro(tema: Tema): boolean {
  if (tema === TEMA.SISTEMA) return sistemaPrefereEscuro();
  return tema === TEMA.ESCURO;
}

export function observarSistema(callback: () => void): () => void {
  const media = window.matchMedia(MEDIA_ESCURO);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

/** Aplica ou remove o tema escuro no <html>. Fora das rotas internas sempre remove. */
export function aplicarTemaNoDocumento(escuro: boolean): void {
  const raiz = document.documentElement;
  raiz.classList.toggle(TEMA_CLASSE_ESCURO, escuro);
  raiz.style.colorScheme = escuro ? "dark" : "light";
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", escuro ? TEMA_COR_BARRA.ESCURO : TEMA_COR_BARRA.CLARO);
}
