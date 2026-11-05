export type ModoCamera = "user" | "environment";

const RESOLUCAO_IDEAL = { width: 1080, height: 1920 } as const;
const PROPORCAO_RETRATO = 9 / 16;

/**
 * A câmera frontal de muitos aparelhos recorta o sensor quando forçamos a
 * proporção 9:16, e o preview parece "com zoom". Por isso só a traseira recebe
 * a proporção; a frontal usa o campo de visão natural e o recorte 9:16 é feito
 * na exibição (object-cover) e na composição da foto.
 */
export function montarRestricoesVideo(modo: ModoCamera): MediaTrackConstraints {
  return {
    facingMode: { ideal: modo },
    width: { ideal: RESOLUCAO_IDEAL.width },
    height: { ideal: RESOLUCAO_IDEAL.height },
    ...(modo === "environment" ? { aspectRatio: { ideal: PROPORCAO_RETRATO } } : {}),
  };
}

type CapacidadesComZoom = MediaTrackCapabilities & {
  zoom?: { min: number; max: number };
};

/** Volta o zoom da câmera ao mínimo (campo de visão mais aberto), quando o aparelho expõe esse controle. */
export async function aplicarZoomMinimo(track: MediaStreamTrack): Promise<void> {
  if (!("getCapabilities" in track)) return;
  const zoom = (track.getCapabilities() as CapacidadesComZoom).zoom;
  if (!zoom) return;
  try {
    await track.applyConstraints({
      advanced: [{ zoom: zoom.min } as MediaTrackConstraintSet],
    });
  } catch {
    // Sem suporte a zoom neste aparelho: mantém o padrão da câmera.
  }
}
