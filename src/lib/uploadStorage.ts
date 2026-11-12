import { apiRequest } from "@/lib/api";

interface UploadAssinadoDto {
  upload_url: string;
  public_url: string;
  path: string;
  content_type: string;
}

const PREFIXOS_UPLOAD_AUTENTICADO = ["parceiros/", "catalogo/"];

function solicitarUploadAssinado(
  storagePath: string,
  blob: Blob
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
        content_type: blob.type || "image/jpeg",
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
  const contentType = blob.type || "image/jpeg";
  const upload = await solicitarUploadAssinado(storagePath, blob);

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
