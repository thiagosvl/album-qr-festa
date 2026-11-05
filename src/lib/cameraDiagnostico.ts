import { VERSAO_APP } from "@/lib/versaoApp";

const PARAMETRO_DIAGNOSTICO = "diagcamera";

type CapacidadesComZoom = MediaTrackCapabilities & { zoom?: { min: number; max: number } };

/** Com `?diagcamera=1` na URL a câmera mostra o que o aparelho realmente entregou. */
export function diagnosticoAtivo(): boolean {
  return new URLSearchParams(window.location.search).has(PARAMETRO_DIAGNOSTICO);
}

export function descreverCamera(
  track: MediaStreamTrack | undefined,
  cameras: MediaDeviceInfo[]
): string {
  if (!track) return `sem câmera · ${VERSAO_APP}`;
  const { width, height, facingMode } = track.getSettings();
  const zoom = (track.getCapabilities?.() as CapacidadesComZoom | undefined)?.zoom;
  const faixaZoom = zoom ? `zoom ${zoom.min}–${zoom.max}` : "sem zoom";
  const lentes = cameras.map((c) => c.label || "?").join(" | ");
  return `${width}×${height} · ${facingMode ?? "?"} · ${faixaZoom} · ${VERSAO_APP}\n${track.label}\n${cameras.length} câmeras: ${lentes}`;
}
