export type ModoCamera = "user" | "environment";

const RESOLUCAO_IDEAL = { width: 1080, height: 1920 } as const;

/**
 * Não forçamos proporção: com aspectRatio 9:16 muitos aparelhos recortam o
 * sensor e o preview parece "com zoom". Pedimos só a resolução e deixamos o
 * navegador entregar o campo de visão natural; o recorte 9:16 é feito na
 * exibição (object-cover) e na composição da foto.
 */
export function montarRestricoesVideo(modo: ModoCamera): MediaTrackConstraints {
  return {
    facingMode: { ideal: modo },
    width: { ideal: RESOLUCAO_IDEAL.width },
    height: { ideal: RESOLUCAO_IDEAL.height },
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
