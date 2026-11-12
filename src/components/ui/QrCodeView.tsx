import { CORES_ARTE } from "@/constants";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QrCodeViewProps {
  value: string;
  size?: number;
  className?: string;
}

export function QrCodeView({
  value,
  size = 180,
  className = "",
}: QrCodeViewProps) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    let ativo = true;
    QRCode.toDataURL(value, {
      width: size * 2,
      margin: 1,
      errorCorrectionLevel: "H",
      color: {
        dark: CORES_ARTE.QR_TINTA,
        light: CORES_ARTE.QR_FUNDO,
      },
    })
      .then((url) => {
        if (ativo) setDataUrl(url);
      })
      .catch(() => undefined);

    return () => {
      ativo = false;
    };
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`rounded-xl bg-muted animate-pulse ${className}`}
      />
    );
  }

  return (
    <img
      src={dataUrl}
      alt="QR Code da Festa"
      style={{ width: size, height: size }}
      className={`select-none ${className}`}
    />
  );
}
