import { FESTA_CANVAS_CONFIG } from "@/constants";

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
  const clampedScale = Math.max(1, Math.min(3, scale));

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
  const clampedScale = Math.max(1, Math.min(3, transformacao.scale));
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

export async function renderizarPreviewComMoldura(
  fonteFoto: ImageBitmap | HTMLImageElement,
  molduraUrl: string | null,
  transformacao: TransformacaoFoto,
  escala = 0.4
): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(FESTA_CANVAS_CONFIG.FULL_WIDTH * escala);
  canvas.height = Math.round(FESTA_CANVAS_CONFIG.FULL_HEIGHT * escala);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Contexto 2D indisponível neste dispositivo");
  }
  ctx.fillStyle = "#111111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.scale(escala, escala);
  desenharFoto(ctx, fonteFoto, fonteFoto.width, fonteFoto.height, transformacao);
  if (molduraUrl) {
    const molduraImg = await carregarImagemCors(molduraUrl);
    ctx.drawImage(
      molduraImg,
      0,
      0,
      FESTA_CANVAS_CONFIG.FULL_WIDTH,
      FESTA_CANVAS_CONFIG.FULL_HEIGHT
    );
  }
  ctx.restore();
  const blob = await converterCanvasParaBlob(canvas, "image/jpeg", 0.8);
  return URL.createObjectURL(blob);
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

  ctxFull.fillStyle = "#111111";
  ctxFull.fillRect(0, 0, targetW, targetH);

  desenharFoto(ctxFull, fonteFoto, sourceWidth, sourceHeight, transformacao);

  if (molduraUrl) {
    const molduraImg = await carregarImagemCors(molduraUrl);
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

export function uploadBlobComProgresso(
  supabaseUrl: string,
  anonKey: string,
  bucket: string,
  storagePath: string,
  blob: Blob,
  onProgress?: (percent: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const encodedPath = storagePath
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
    const endpoint = `${supabaseUrl}/storage/v1/object/${bucket}/${encodedPath}`;

    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint, true);
    xhr.setRequestHeader("Authorization", `Bearer ${anonKey}`);
    xhr.setRequestHeader("apikey", anonKey);
    xhr.setRequestHeader("Content-Type", blob.type || "image/jpeg");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const pct = Math.round((event.loaded / event.total) * 100);
        onProgress(pct);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${encodedPath}`;
        resolve(publicUrl);
      } else {
        reject(
          new Error(`Falha ao enviar imagem para o servidor (${xhr.status})`)
        );
      }
    };

    xhr.onerror = () => {
      reject(new Error("Erro de conexão durante o envio da foto"));
    };

    xhr.send(blob);
  });
}

export async function prepararArquivoCompartilhamento(
  urlImagem: string,
  nomeArquivo = "lembranca-festa.jpg"
): Promise<File | null> {
  try {
    const response = await fetch(urlImagem, { mode: "cors" });
    const blob = await response.blob();
    return new File([blob], nomeArquivo, { type: blob.type || "image/jpeg" });
  } catch {
    return null;
  }
}
