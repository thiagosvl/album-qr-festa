import { CORES_ARTE, FESTA_CANVAS_CONFIG } from "@/constants";
import { limitarEscala } from "@/lib/escalaFoto";

export {
  prepararArquivoCompartilhamento,
  uploadBlobComProgresso,
} from "@/lib/uploadStorage";

export interface TransformacaoFoto {
  scale: number;
  offsetX: number;
  offsetY: number;
  espelharHorizontal?: boolean;
}

export interface ResultadoComposicao {
  fullBlob: Blob;
  thumbBlob: Blob;
  previewUrl: string;
  largura: number;
  altura: number;
}

function carregarImagemCors(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Falha ao carregar imagem: ${url}`));
    img.src = url;
  });
}

function converterCanvasParaBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Falha ao converter canvas em arquivo de imagem"));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality
    );
  });
}

export function limitarDeslocamentoCanvas(
  imgWidth: number,
  imgHeight: number,
  scale: number,
  offsetX: number,
  offsetY: number
): { offsetX: number; offsetY: number } {
  const targetW = FESTA_CANVAS_CONFIG.FULL_WIDTH;
  const targetH = FESTA_CANVAS_CONFIG.FULL_HEIGHT;
  const baseScale = Math.max(targetW / imgWidth, targetH / imgHeight);
  const clampedScale = limitarEscala(scale, imgWidth, imgHeight);

  const drawnW = imgWidth * baseScale * clampedScale;
  const drawnH = imgHeight * baseScale * clampedScale;

  const maxOffsetX = Math.max(0, (drawnW - targetW) / 2);
  const maxOffsetY = Math.max(0, (drawnH - targetH) / 2);

  return {
    offsetX: Math.max(-maxOffsetX, Math.min(maxOffsetX, offsetX)),
    offsetY: Math.max(-maxOffsetY, Math.min(maxOffsetY, offsetY)),
  };
}

type FonteFoto = ImageBitmap | HTMLImageElement | HTMLVideoElement;

function desenharFoto(
  ctx: CanvasRenderingContext2D,
  fonteFoto: FonteFoto,
  sourceWidth: number,
  sourceHeight: number,
  transformacao: TransformacaoFoto
): void {
  const targetW = FESTA_CANVAS_CONFIG.FULL_WIDTH;
  const targetH = FESTA_CANVAS_CONFIG.FULL_HEIGHT;
  const clampedScale = limitarEscala(
    transformacao.scale,
    sourceWidth,
    sourceHeight
  );
  const baseScale = Math.max(targetW / sourceWidth, targetH / sourceHeight);
  const drawnW = sourceWidth * baseScale * clampedScale;
  const drawnH = sourceHeight * baseScale * clampedScale;

  const { offsetX, offsetY } = limitarDeslocamentoCanvas(
    sourceWidth,
    sourceHeight,
    clampedScale,
    transformacao.offsetX,
    transformacao.offsetY
  );

  ctx.save();
  ctx.translate(targetW / 2 + offsetX, targetH / 2 + offsetY);
  if (transformacao.espelharHorizontal) {
    ctx.scale(-1, 1);
  }
  ctx.drawImage(fonteFoto, -drawnW / 2, -drawnH / 2, drawnW, drawnH);
  ctx.restore();
}

const LARGURA_FUNDO_DESFOCADO = 24;
const ESCURECER_FUNDO = CORES_ARTE.ESCURECER_FUNDO_FOTO;
const cacheFundos = new WeakMap<object, HTMLCanvasElement>();

function obterFundoReduzido(
  fonteFoto: FonteFoto,
  sourceWidth: number,
  sourceHeight: number
): HTMLCanvasElement {
  const emCache =
    fonteFoto instanceof HTMLVideoElement
      ? undefined
      : cacheFundos.get(fonteFoto);
  if (emCache) return emCache;
  const { FULL_WIDTH, FULL_HEIGHT } = FESTA_CANVAS_CONFIG;
  const reduzido = document.createElement("canvas");
  reduzido.width = LARGURA_FUNDO_DESFOCADO;
  reduzido.height = Math.round(
    (LARGURA_FUNDO_DESFOCADO * FULL_HEIGHT) / FULL_WIDTH
  );
  const ctx = reduzido.getContext("2d");
  if (ctx) {
    const escala = Math.max(
      reduzido.width / sourceWidth,
      reduzido.height / sourceHeight
    );
    const w = sourceWidth * escala;
    const h = sourceHeight * escala;
    ctx.drawImage(
      fonteFoto,
      (reduzido.width - w) / 2,
      (reduzido.height - h) / 2,
      w,
      h
    );
  }
  if (!(fonteFoto instanceof HTMLVideoElement)) {
    cacheFundos.set(fonteFoto, reduzido);
  }
  return reduzido;
}

function desenharFundoDesfocado(
  ctx: CanvasRenderingContext2D,
  fonteFoto: FonteFoto,
  sourceWidth: number,
  sourceHeight: number,
  espelhar: boolean | undefined
): void {
  const { FULL_WIDTH, FULL_HEIGHT } = FESTA_CANVAS_CONFIG;
  const reduzido = obterFundoReduzido(fonteFoto, sourceWidth, sourceHeight);
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  if (espelhar) {
    ctx.translate(FULL_WIDTH, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(reduzido, 0, 0, FULL_WIDTH, FULL_HEIGHT);
  ctx.restore();
  ctx.fillStyle = ESCURECER_FUNDO;
  ctx.fillRect(0, 0, FULL_WIDTH, FULL_HEIGHT);
}

const cacheMolduras = new Map<string, Promise<HTMLImageElement>>();

export function carregarMoldura(url: string): Promise<HTMLImageElement> {
  const emCache = cacheMolduras.get(url);
  if (emCache) return emCache;
  const promessa = carregarImagemCors(url).catch((erro: unknown) => {
    cacheMolduras.delete(url);
    throw erro;
  });
  cacheMolduras.set(url, promessa);
  return promessa;
}

export function desenharPreviewNoCanvas(
  canvas: HTMLCanvasElement,
  fonteFoto: ImageBitmap | HTMLImageElement,
  moldura: HTMLImageElement | null,
  transformacao: TransformacaoFoto
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const escala = canvas.width / FESTA_CANVAS_CONFIG.FULL_WIDTH;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = CORES_ARTE.FUNDO_FOTO;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.scale(escala, escala);
  desenharFundoDesfocado(
    ctx,
    fonteFoto,
    fonteFoto.width,
    fonteFoto.height,
    transformacao.espelharHorizontal
  );
  desenharFoto(ctx, fonteFoto, fonteFoto.width, fonteFoto.height, transformacao);
  if (moldura) {
    ctx.drawImage(
      moldura,
      0,
      0,
      FESTA_CANVAS_CONFIG.FULL_WIDTH,
      FESTA_CANVAS_CONFIG.FULL_HEIGHT
    );
  }
  ctx.restore();
}

export async function renderizarFotoComMoldura(
  fonteFoto: ImageBitmap | HTMLImageElement | HTMLVideoElement,
  molduraUrl: string | null,
  transformacao: TransformacaoFoto
): Promise<ResultadoComposicao> {
  const targetW = FESTA_CANVAS_CONFIG.FULL_WIDTH;
  const targetH = FESTA_CANVAS_CONFIG.FULL_HEIGHT;

  const sourceWidth =
    "videoWidth" in fonteFoto ? fonteFoto.videoWidth : fonteFoto.width;
  const sourceHeight =
    "videoHeight" in fonteFoto ? fonteFoto.videoHeight : fonteFoto.height;

  const canvasFull = document.createElement("canvas");
  canvasFull.width = targetW;
  canvasFull.height = targetH;
  const ctxFull = canvasFull.getContext("2d");

  if (!ctxFull) {
    throw new Error("Contexto 2D indisponível neste dispositivo");
  }

  ctxFull.fillStyle = CORES_ARTE.FUNDO_FOTO;
  ctxFull.fillRect(0, 0, targetW, targetH);

  desenharFundoDesfocado(
    ctxFull,
    fonteFoto,
    sourceWidth,
    sourceHeight,
    transformacao.espelharHorizontal
  );
  desenharFoto(ctxFull, fonteFoto, sourceWidth, sourceHeight, transformacao);

  if (molduraUrl) {
    const molduraImg = await carregarMoldura(molduraUrl);
    ctxFull.drawImage(molduraImg, 0, 0, targetW, targetH);
  }

  const canvasThumb = document.createElement("canvas");
  canvasThumb.width = FESTA_CANVAS_CONFIG.THUMB_WIDTH;
  canvasThumb.height = FESTA_CANVAS_CONFIG.THUMB_HEIGHT;
  const ctxThumb = canvasThumb.getContext("2d");

  if (!ctxThumb) {
    throw new Error("Contexto 2D para miniatura indisponível");
  }

  ctxThumb.drawImage(
    canvasFull,
    0,
    0,
    FESTA_CANVAS_CONFIG.THUMB_WIDTH,
    FESTA_CANVAS_CONFIG.THUMB_HEIGHT
  );

  const [fullBlob, thumbBlob] = await Promise.all([
    converterCanvasParaBlob(
      canvasFull,
      "image/jpeg",
      FESTA_CANVAS_CONFIG.FULL_QUALITY
    ),
    converterCanvasParaBlob(
      canvasThumb,
      "image/jpeg",
      FESTA_CANVAS_CONFIG.THUMB_QUALITY
    ),
  ]);

  const previewUrl = URL.createObjectURL(fullBlob);

  return {
    fullBlob,
    thumbBlob,
    previewUrl,
    largura: targetW,
    altura: targetH,
  };
}

export async function carregarArquivoComExifCorrigido(
  file: File
): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, {
        imageOrientation: "from-image",
      });
    } catch {
      return await createImageBitmap(file);
    }
  }
  const objectUrl = URL.createObjectURL(file);
  try {
    return await carregarImagemCors(objectUrl);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
