export type ModoCamera = "user" | "environment";

/** Proporção 3:4 em pé: o celular entrega o campo de visão inteiro do sensor, sem "zoom". */
const PROPORCAO_RETRATO = 3 / 4;

const RESOLUCOES_RETRATO = [
  { width: 1728, height: 2304 },
  { width: 2304, height: 3072 },
  { width: 1080, height: 1440 },
] as const;

/** Tempo para o Android liberar a câmera anterior antes de abrir outra. */
export const ESPERA_LIBERAR_CAMERA_MS = 300;
export const ESPERA_ENTRE_RODADAS_MS = 500;
export const RODADAS_TENTATIVA_CAMERA = 2;

/**
 * Lista de pedidos do mais exigente ao mais permissivo (mesma estratégia do
 * piloto): primeiro 3:4 exato; se o aparelho recusar, relaxa até aceitar
 * qualquer vídeo da câmera pedida.
 */
export function montarTentativasVideo(modo: ModoCamera): MediaTrackConstraints[] {
  const facingMode = { ideal: modo };
  const [padrao, ...alternativas] = RESOLUCOES_RETRATO;
  return [
    {
      facingMode,
      aspectRatio: { exact: PROPORCAO_RETRATO },
      width: { ideal: padrao.width },
      height: { ideal: padrao.height },
    },
    ...alternativas.map((resolucao) => ({
      facingMode,
      aspectRatio: { ideal: PROPORCAO_RETRATO },
      width: { ideal: resolucao.width },
      height: { ideal: resolucao.height },
    })),
    { facingMode },
    { facingMode: modo },
  ];
}

export function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Abre a câmera percorrendo as tentativas (em até 2 rodadas). Devolve `null`
 * se o pedido ficou obsoleto no meio do caminho (`foiCancelado`), fechando
 * qualquer stream que tenha chegado tarde. Lança o último erro se nada abrir.
 */
export async function abrirStreamComFallback(
  modo: ModoCamera,
  foiCancelado: () => boolean
): Promise<MediaStream | null> {
  let ultimoErro: unknown = new Error("Sem câmera disponível");
  for (let rodada = 0; rodada < RODADAS_TENTATIVA_CAMERA; rodada += 1) {
    for (const video of montarTentativasVideo(modo)) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video });
        if (foiCancelado()) {
          stream.getTracks().forEach((track) => track.stop());
          return null;
        }
        return stream;
      } catch (erro) {
        ultimoErro = erro;
        if (foiCancelado()) return null;
      }
    }
    await esperar(ESPERA_ENTRE_RODADAS_MS);
  }
  throw ultimoErro;
}
