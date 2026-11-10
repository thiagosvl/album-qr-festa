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
