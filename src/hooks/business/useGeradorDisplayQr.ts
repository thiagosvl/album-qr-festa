import QRCode from "qrcode";
import { CORES_ARTE, FESTA_CORES_PADRAO } from "@/constants";

export interface DadosDisplayQrEvento {
  slug: string;
  titulo: string;
  subtitulo?: string | null;
  cor_primaria: string;
  cor_secundaria: string;
  urlPublica: string;
}

function desenharRetanguloArredondado(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  largura: number,
  altura: number,
  raio: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + raio, y);
  ctx.lineTo(x + largura - raio, y);
  ctx.quadraticCurveTo(x + largura, y, x + largura, y + raio);
  ctx.lineTo(x + largura, y + altura - raio);
  ctx.quadraticCurveTo(
    x + largura,
    y + altura,
    x + largura - raio,
    y + altura
  );
  ctx.lineTo(x + raio, y + altura);
  ctx.quadraticCurveTo(x, y + altura, x, y + altura - raio);
  ctx.lineTo(x, y + raio);
  ctx.quadraticCurveTo(x, y, x + raio, y);
  ctx.closePath();
}

function carregarImagemDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Falha ao renderizar QR Code"));
    img.src = dataUrl;
  });
}

export async function baixarPlaquinhaQrCodePng(
  dados: DadosDisplayQrEvento
): Promise<void> {
  const largura = 1200;
  const altura = 1800;
  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Contexto 2D indisponível");
  }

  const gradFundo = ctx.createLinearGradient(0, 0, largura, altura);
  gradFundo.addColorStop(0, dados.cor_primaria || FESTA_CORES_PADRAO.PRIMARIA);
  gradFundo.addColorStop(1, dados.cor_secundaria || FESTA_CORES_PADRAO.SECUNDARIA);
  ctx.fillStyle = gradFundo;
  ctx.fillRect(0, 0, largura, altura);

  ctx.fillStyle = CORES_ARTE.PLAQUINHA_CIRCULO;
  ctx.beginPath();
  ctx.arc(160, 180, 260, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(1060, 1620, 310, 0, Math.PI * 2);
  ctx.fill();

  const cardX = 84;
  const cardY = 90;
  const cardW = largura - cardX * 2;
  const cardH = altura - cardY * 2;

  ctx.save();
  ctx.shadowColor = CORES_ARTE.PLAQUINHA_SOMBRA;
  ctx.shadowBlur = 48;
  ctx.shadowOffsetY = 20;
  desenharRetanguloArredondado(ctx, cardX, cardY, cardW, cardH, 56);
  ctx.fillStyle = CORES_ARTE.PLAQUINHA_CARTAO;
  ctx.fill();
  ctx.restore();

  const pillW = 460;
  const pillH = 64;
  const pillX = (largura - pillW) / 2;
  const pillY = 165;
  desenharRetanguloArredondado(ctx, pillX, pillY, pillW, pillH, 32);
  ctx.fillStyle = dados.cor_primaria || FESTA_CORES_PADRAO.PRIMARIA;
  ctx.fill();

  ctx.fillStyle = CORES_ARTE.PLAQUINHA_TEXTO_SELO;
  ctx.font = "800 24px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("ÁLBUM DIGITAL AO VIVO", largura / 2, pillY + 41);

  ctx.fillStyle = CORES_ARTE.PLAQUINHA_TITULO;
  ctx.font = "800 68px 'Bricolage Grotesque', Inter, sans-serif";
  const tituloCurto =
    dados.titulo.length > 26
      ? `${dados.titulo.slice(0, 25)}…`
      : dados.titulo;
  ctx.fillText(tituloCurto, largura / 2, 330);

  if (dados.subtitulo) {
    ctx.fillStyle = dados.cor_secundaria || FESTA_CORES_PADRAO.SECUNDARIA;
    ctx.font = "700 34px Inter, sans-serif";
    ctx.fillText(dados.subtitulo.slice(0, 42), largura / 2, 392);
  }

  ctx.fillStyle = CORES_ARTE.PLAQUINHA_TEXTO_SUAVE;
  ctx.font = "600 30px Inter, sans-serif";
  ctx.fillText(
    "Aponte a câmera do celular para o QR Code abaixo:",
    largura / 2,
    470
  );

  const qrBoxSize = 620;
  const qrBoxX = (largura - qrBoxSize) / 2;
  const qrBoxY = 520;

  desenharRetanguloArredondado(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 44);
  ctx.fillStyle = CORES_ARTE.QR_FUNDO;
  ctx.fill();
  ctx.lineWidth = 8;
  ctx.strokeStyle = dados.cor_primaria || FESTA_CORES_PADRAO.PRIMARIA;
  ctx.stroke();

  const qrDataUrl = await QRCode.toDataURL(dados.urlPublica, {
    width: 540,
    margin: 1,
    errorCorrectionLevel: "H",
    color: {
      dark: CORES_ARTE.QR_TINTA,
      light: CORES_ARTE.QR_FUNDO,
    },
  });
  const qrImg = await carregarImagemDataUrl(qrDataUrl);
  ctx.drawImage(qrImg, qrBoxX + 40, qrBoxY + 40, 540, 540);

  const passos = [
    "1. Escaneie o QR Code (não precisa baixar aplicativo)",
    "2. Escolha sua moldura personalizada da festa",
    "3. Tire sua foto e veja ela aparecer no mural e no telão!",
  ];

  let passoY = 1235;
  for (const textoPasso of passos) {
    desenharRetanguloArredondado(ctx, 150, passoY - 46, largura - 300, 74, 24);
    ctx.fillStyle = CORES_ARTE.PLAQUINHA_PASSO;
    ctx.fill();

    ctx.fillStyle = CORES_ARTE.PLAQUINHA_TITULO;
    ctx.font = "700 27px Inter, sans-serif";
    ctx.fillText(textoPasso, largura / 2, passoY);
    passoY += 96;
  }

  ctx.fillStyle = CORES_ARTE.PLAQUINHA_URL;
  ctx.font = "600 24px monospace";
  ctx.fillText(dados.urlPublica, largura / 2, 1620);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (!b) {
        reject(new Error("Erro ao gerar PNG da plaquinha QR Code"));
        return;
      }
      resolve(b);
    }, "image/png");
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `display-qr-${dados.slug}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
