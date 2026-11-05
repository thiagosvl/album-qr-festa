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
        dark: "#1F1D2B",
        light: "#FFFFFF",
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
