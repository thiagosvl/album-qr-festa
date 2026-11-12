import type { FestaEventoConfirmacao } from "@/types/festa.types";

export interface ContagemRegressivaConvite {
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
  jaComecou: boolean;
}

export interface DataFormatadaConvite {
  diaMes: string;
  ano: string;
  diaSemana: string;
  dataCompletaCurta: string;
}

export interface LinksMapaConvite {
  googleMapsUrl: string;
  wazeUrl: string;
}

const MESES_EXTENSO = [
  "de Janeiro",
  "de Fevereiro",
  "de Março",
  "de Abril",
  "de Maio",
  "de Junho",
  "de Julho",
  "de Agosto",
  "de Setembro",
  "de Outubro",
  "de Novembro",
  "de Dezembro",
] as const;

const DIAS_SEMANA_EXTENSO = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
] as const;

export function calcularContagemRegressivaConvite(
  dataEvento: string | null | undefined,
  horarioInicio: string | null | undefined,
  agoraMs = Date.now()
): ContagemRegressivaConvite {
  if (!dataEvento) {
    return { dias: 0, horas: 0, minutos: 0, segundos: 0, jaComecou: false };
  }

  const horaNormalizada =
    horarioInicio && /^\d{2}:\d{2}/.test(horarioInicio.trim())
      ? horarioInicio.trim().slice(0, 5)
      : "15:00";

  const alvoMs = new Date(`${dataEvento}T${horaNormalizada}:00-03:00`).getTime();
  if (Number.isNaN(alvoMs)) {
    return { dias: 0, horas: 0, minutos: 0, segundos: 0, jaComecou: false };
  }

  const diff = alvoMs - agoraMs;
  if (diff <= 0) {
    return { dias: 0, horas: 0, minutos: 0, segundos: 0, jaComecou: true };
  }

  const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
  const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const segundos = Math.floor((diff % (1000 * 60)) / 1000);

  return { dias, horas, minutos, segundos, jaComecou: false };
}

export function formatarDataExtensoConvite(
  dataEvento: string | null | undefined
): DataFormatadaConvite | null {
  if (!dataEvento) return null;
  const partes = dataEvento.split("-").map(Number);
  if (partes.length !== 3 || partes.some((n) => Number.isNaN(n))) return null;

  const [ano, mes, dia] = partes;
  const dt = new Date(Date.UTC(ano, mes - 1, dia, 12, 0, 0));
  const nomeMes = MESES_EXTENSO[mes - 1] ?? "";
  const diaSemana = DIAS_SEMANA_EXTENSO[dt.getUTCDay()] ?? "";
  const diaStr = String(dia).padStart(2, "0");
  const mesStr = String(mes).padStart(2, "0");

  return {
    diaMes: `${diaStr} ${nomeMes}`,
    ano: String(ano),
    diaSemana,
    dataCompletaCurta: `${diaStr}/${mesStr}/${ano}`,
  };
}

export function gerarLinksMapaConvite(
  nomeLocal: string | null | undefined,
  endereco: string | null | undefined
): LinksMapaConvite {
  const termo = [nomeLocal, endereco]
    .filter((v): v is string => Boolean(v && v.trim().length > 0))
    .join(", ");
  const query = encodeURIComponent(termo || "Brasil");

  return {
    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${query}`,
    wazeUrl: `https://waze.com/ul?q=${query}&navigate=yes`,
  };
}

export function filtrarConfirmacoesRsvp(
  confirmacoes: FestaEventoConfirmacao[],
  busca: string
): FestaEventoConfirmacao[] {
  const termo = busca.trim().toLowerCase();
  if (!termo) return confirmacoes;

  return confirmacoes.filter((item) => {
    if (item.nome.toLowerCase().includes(termo)) return true;
    if (item.nomes_adultos.some((n) => n.toLowerCase().includes(termo))) {
      return true;
    }
    if (item.nomes_criancas.some((n) => n.toLowerCase().includes(termo))) {
      return true;
    }
    return false;
  });
}
