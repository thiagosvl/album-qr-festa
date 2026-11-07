import {
  CAMERA_CONFIG,
  ENQUADRAMENTO_CAMERA,
  FESTA_CANVAS_CONFIG,
} from "@/constants";

export const ESCALA_MAXIMA_FOTO = 3;
const ESCALA_MINIMA_PERMITIDA = 0.75;

export function calcularEscalaAjusteLargura(
  larguraFonte: number,
  alturaFonte: number
): number {
  const { FULL_WIDTH, FULL_HEIGHT } = FESTA_CANVAS_CONFIG;
  const ajusteLargura = FULL_WIDTH / larguraFonte;
  const preencher = Math.max(ajusteLargura, FULL_HEIGHT / alturaFonte);
  return Math.min(1, ajusteLargura / preencher);
}

export function calcularEscalaMinima(
  larguraFonte: number,
  alturaFonte: number
): number {
  return Math.max(
    ESCALA_MINIMA_PERMITIDA,
    calcularEscalaAjusteLargura(larguraFonte, alturaFonte)
  );
}

export function limitarEscala(
  escala: number,
  larguraFonte: number,
  alturaFonte: number
): number {
  return Math.max(
    calcularEscalaMinima(larguraFonte, alturaFonte),
    Math.min(ESCALA_MAXIMA_FOTO, escala)
  );
}

export function calcularEscalaInicialCaptura(
  larguraFonte: number,
  alturaFonte: number
): number {
  return CAMERA_CONFIG.ENQUADRAMENTO === ENQUADRAMENTO_CAMERA.QUADRO_INTEIRO
    ? calcularEscalaAjusteLargura(larguraFonte, alturaFonte)
    : 1;
}
