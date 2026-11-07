import { useRef } from "react";
import { cn } from "@/lib/utils";

interface RecuperarSenhaOtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  hasError?: boolean;
}

export function RecuperarSenhaOtpInput({
  value,
  onChange,
  disabled = false,
  hasError = false,
}: RecuperarSenhaOtpInputProps) {
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const atualizarDigitoOtp = (index: number, novoCaractere: string) => {
    const digitoLimpo = novoCaractere.replace(/\D/g, "").slice(-1);
    const chars = value.padEnd(6, " ").split("");
    chars[index] = digitoLimpo || " ";
    const atualizado = chars.join("").replace(/\s+$/g, "");
    onChange(atualizado.replace(/\s/g, ""));

    if (digitoLimpo && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const tratarPasteOtp = (textoColado: string) => {
    const digitos = textoColado.replace(/\D/g, "").slice(0, 6);
    if (!digitos) return;
    onChange(digitos);
    const proximoIndice = Math.min(digitos.length, 5);
    otpRefs.current[proximoIndice]?.focus();
  };

  return (
    <div
      className="flex items-center justify-center gap-2 pt-1"
      onPaste={(e) => {
        e.preventDefault();
        tratarPasteOtp(e.clipboardData.getData("text"));
      }}
    >
      {Array.from({ length: 6 }).map((_, index) => {
        const char = value[index] || "";
        return (
          <input
            key={index}
            ref={(el) => {
              otpRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            disabled={disabled}
            value={char}
            aria-invalid={hasError}
            onChange={(e) => atualizarDigitoOtp(index, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !char && index > 0) {
                otpRefs.current[index - 1]?.focus();
              }
            }}
            className={cn(
              "w-11 h-12 sm:w-12 sm:h-14 rounded-xl border bg-background text-center text-lg font-bold font-mono transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:border-primary",
              hasError
                ? "border-destructive text-destructive"
                : "border-input text-foreground"
            )}
          />
        );
      })}
    </div>
  );
}
