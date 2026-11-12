import {
  STORAGE_KEYS,
} from "@/constants";
import {
  renderizarFotoComMoldura,
  type TransformacaoFoto,
  uploadBlobComProgresso,
} from "@/hooks/business/useComposicaoCanvas";
import { gerarUuidLocal } from "@/lib/utils";
import type { EventoPublicoDto, MolduraDto } from "@/types/festa.types";

const TAMANHO_MAXIMO_VIDEO_BYTES = 26214400;
const DURACAO_MAXIMA_VIDEO_SEGUNDOS = 16;

export interface ResultadoUploadMidiaConvidado {
  pathFull: string;
  pathThumb: string | null;
  duracaoSegundos?: number;
  tamanhoBytes: number;
  molduraUsadaId: string | null;
  molduraFalhou?: boolean;
}

interface MetadadosVideoLocal {
  duracaoSegundos: number;
  thumbBlob: Blob | null;
}

export function lerOuCriarSessaoId(): string {
  const existente = localStorage.getItem(STORAGE_KEYS.CONVIDADO_SESSAO_ID);
  if (existente) return existente;
  const novo = gerarUuidLocal();
  localStorage.setItem(STORAGE_KEYS.CONVIDADO_SESSAO_ID, novo);
  return novo;
}

export function lerSetStorage(chave: string): Set<string> {
  try {
    const raw = localStorage.getItem(chave);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? new Set(parsed.map(String)) : new Set();
  } catch {
    return new Set();
  }
}

export function salvarSetStorage(chave: string, conjunto: Set<string>): void {
  localStorage.setItem(chave, JSON.stringify(Array.from(conjunto)));
}

export function obterMensagemSucessoEnvioConvidado(
  evento: EventoPublicoDto,
  ehVideo = false
): string {
  const rotulo = ehVideo ? "Vídeo enviado" : "Foto enviada";
  if (evento.moderacao_previa) {
    return `${rotulo}! Aparecerá no mural assim que os anfitriões aprovarem.`;
  }
  if (!evento.galeria_publica) {
    return "Sua lembrança foi enviada para os anfitriões e salva em Minhas fotos!";
  }
  return "Sua lembrança foi publicada no mural da festa!";
}

function extrairMetadadosEMiniaturaVideo(
  file: File
): Promise<MetadadosVideoLocal> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.src = url;

    const limpar = () => {
      URL.revokeObjectURL(url);
    };

    video.onerror = () => {
      limpar();
      reject(new Error("Não foi possível ler o arquivo de vídeo."));
    };

    video.onloadedmetadata = () => {
      const duracaoBruta = Number.isFinite(video.duration) ? video.duration : 0;
      if (duracaoBruta > DURACAO_MAXIMA_VIDEO_SEGUNDOS) {
        limpar();
        reject(
          new Error("O vídeo deve ter no máximo 15 segundos de duração.")
        );
        return;
      }

      video.currentTime = Math.min(0.2, duracaoBruta / 2 || 0);
    };

    video.onseeked = () => {
      try {
        const largura = video.videoWidth || 720;
        const altura = video.videoHeight || 1280;
        const canvas = document.createElement("canvas");
        canvas.width = 540;
        canvas.height = Math.round((540 / largura) * altura);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          limpar();
          resolve({
            duracaoSegundos: Math.max(1, Math.round(video.duration || 5)),
            thumbBlob: null,
          });
          return;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            limpar();
            resolve({
              duracaoSegundos: Math.max(1, Math.round(video.duration || 5)),
              thumbBlob: blob,
            });
          },
          "image/jpeg",
          0.8
        );
      } catch {
        limpar();
        resolve({
          duracaoSegundos: Math.max(1, Math.round(video.duration || 5)),
          thumbBlob: null,
        });
      }
    };
  });
}

export async function validarEEnviarVideoCurto(
  slugEvento: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<ResultadoUploadMidiaConvidado> {
  if (file.size > TAMANHO_MAXIMO_VIDEO_BYTES) {
    throw new Error("O vídeo excede o limite máximo de 25 MB.");
  }

  const { duracaoSegundos, thumbBlob } =
    await extrairMetadadosEMiniaturaVideo(file);

  const ext =
    file.type === "video/webm"
      ? "webm"
      : file.type === "video/quicktime"
        ? "mov"
        : "mp4";
  const arquivoId = gerarUuidLocal();
  const pathFull = `${slugEvento}/midias/${arquivoId}.${ext}`;
  const pathThumb = thumbBlob
    ? `${slugEvento}/midias/thumbs/${arquivoId}.jpg`
    : null;

  await uploadBlobComProgresso(
    pathFull,
    file,
    (pct) => onProgress?.(Math.max(10, Math.round(pct * 0.85)))
  );

  if (thumbBlob && pathThumb) {
    await uploadBlobComProgresso(
      pathThumb,
      thumbBlob
    );
  }

  return {
    pathFull,
    pathThumb,
    duracaoSegundos,
    tamanhoBytes: file.size,
    molduraUsadaId: null,
  };
}

export async function comporEEnviarFotoConvidado(params: {
  slugEvento: string;
  fonteCapturada: ImageBitmap | HTMLImageElement;
  molduraSelecionada: MolduraDto | null;
  transformacao: TransformacaoFoto;
  espelharCaptura: boolean;
  onProgress?: (percent: number) => void;
}): Promise<ResultadoUploadMidiaConvidado> {
  const transformacaoFinal = {
    ...params.transformacao,
    espelharHorizontal: params.espelharCaptura,
  };
  let molduraUsada = params.molduraSelecionada;
  let molduraFalhou = false;
  let composicao;
  try {
    composicao = await renderizarFotoComMoldura(
      params.fonteCapturada,
      molduraUsada?.arquivo_url ?? null,
      transformacaoFinal
    );
  } catch (erroMoldura) {
    if (!molduraUsada) throw erroMoldura;
    molduraFalhou = true;
    molduraUsada = null;
    composicao = await renderizarFotoComMoldura(
      params.fonteCapturada,
      null,
      transformacaoFinal
    );
  }

  const arquivoId = gerarUuidLocal();
  const pathFull = `${params.slugEvento}/midias/${arquivoId}.jpg`;
  const pathThumb = `${params.slugEvento}/midias/thumbs/${arquivoId}.jpg`;

  await Promise.all([
    uploadBlobComProgresso(
      pathFull,
      composicao.fullBlob,
      (pct) => params.onProgress?.(Math.max(10, Math.round(pct * 0.85)))
    ),
    uploadBlobComProgresso(
      pathThumb,
      composicao.thumbBlob
    ),
  ]);

  URL.revokeObjectURL(composicao.previewUrl);

  return {
    pathFull,
    pathThumb,
    tamanhoBytes: composicao.fullBlob.size,
    molduraUsadaId: molduraUsada?.id ?? null,
    molduraFalhou,
  };
}
