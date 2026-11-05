import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatarMoedaCentavos(centavos: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format((centavos || 0) / 100);
}

export function formatarDataBr(isoDate: string | null | undefined): string {
  if (!isoDate) return "Data a definir";
  const partes = isoDate.slice(0, 10).split("-");
  if (partes.length !== 3) return isoDate;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

export function gerarUuidLocal(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
