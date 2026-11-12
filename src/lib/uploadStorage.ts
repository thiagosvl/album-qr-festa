import { apiRequest } from "@/lib/api";

interface UploadAssinadoDto {
  upload_url: string;
  public_url: string;
  path: string;
  content_type: string;
}

const PREFIXOS_UPLOAD_AUTENTICADO = [
  "parceiros/",
  "catalogo/",
  "convite-rascunho/",
];

const MIME_POR_EXTENSAO: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  pdf: "application/pdf",
  mp4: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  m4a: "audio/mp4",
};

function resolverContentTypeArquivo(storagePath: string, blob: Blob): string {
  const ext = storagePath.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "mp3" && (blob.type === "audio/mp3" || !blob.type)) {
    return "audio/mpeg";
  }
  if (
    ext === "m4a" &&
    (blob.type === "audio/x-m4a" || blob.type === "audio/m4a" || !blob.type)
  ) {
    return "audio/mp4";
  }
  return blob.type || MIME_POR_EXTENSAO[ext] || "image/jpeg";
}

function solicitarUploadAssinado(
  storagePath: string,
  blob: Blob,
  contentType: string
): Promise<UploadAssinadoDto> {
  const autenticado = PREFIXOS_UPLOAD_AUTENTICADO.some((prefixo) =>
    storagePath.startsWith(prefixo)
  );

  return apiRequest<UploadAssinadoDto>(
    autenticado ? "/api/uploads/presign" : "/api/public/uploads/presign",
    {
      method: "POST",
      requireAuth: autenticado,
      body: {
        path: storagePath,
        content_type: contentType,
        tamanho_bytes: blob.size,
      },
    }
  );
}

export async function uploadBlobComProgresso(
  storagePath: string,
  blob: Blob,
  onProgress?: (percent: number) => void
): Promise<string> {
  const contentType = resolverContentTypeArquivo(storagePath, blob);
  const upload = await solicitarUploadAssinado(storagePath, blob, contentType);

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", upload.upload_url, true);
    xhr.setRequestHeader("Content-Type", contentType);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const pct = Math.round((event.loaded / event.total) * 100);
        onProgress(pct);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(
          new Error(`Falha ao enviar arquivo para o servidor (${xhr.status})`)
        );
      }
    };

    xhr.onerror = () => {
      reject(new Error("Erro de conexão durante o envio do arquivo"));
    };

    xhr.send(blob);
  });

  return upload.public_url;
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
