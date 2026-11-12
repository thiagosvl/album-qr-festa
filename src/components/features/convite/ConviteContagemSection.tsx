import { Clock, PartyPopper } from "lucide-react";
import type { ContagemRegressivaConvite } from "@/hooks/business/useConviteCalculosBusiness";

interface ConviteContagemSectionProps {
  contagem: ContagemRegressivaConvite;
  corPrimaria: string;
  corSecundaria: string;
  possuiData: boolean;
}

export function ConviteContagemSection({
  contagem,
  corPrimaria,
  corSecundaria,
  possuiData,
}: ConviteContagemSectionProps) {
  if (!possuiData) return null;

  const blocos = [
    { valor: contagem.dias, rotulo: "Dias" },
    { valor: contagem.horas, rotulo: "Horas" },
    { valor: contagem.minutos, rotulo: "Min" },
    { valor: contagem.segundos, rotulo: "Seg" },
  ];

  return (
    <section className="rounded-3xl border border-ameixa/10 bg-white p-6 text-center shadow-lg">
      <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-ameixa/60">
        <Clock className="h-3.5 w-3.5" style={{ color: corPrimaria }} />
        Contagem Regressiva
      </div>

      {contagem.jaComecou ? (
        <div
          className="mt-4 flex items-center justify-center gap-2 rounded-2xl p-4 font-display text-lg font-extrabold text-white shadow-sm"
          style={{
            background: `linear-gradient(135deg, ${corPrimaria}, ${corSecundaria})`,
          }}
        >
          <PartyPopper className="h-5 w-5" />
          Chegou o grande dia da festa!
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-4 gap-2.5 sm:gap-3">
          {blocos.map((bloco) => (
            <div
              key={bloco.rotulo}
              className="flex flex-col items-center justify-center rounded-2xl border bg-papel px-2 py-3.5 shadow-sm"
              style={{ borderColor: `${corPrimaria}22` }}
            >
              <span
                className="font-display text-2xl font-extrabold tabular-nums sm:text-3xl"
                style={{ color: corPrimaria }}
              >
                {String(bloco.valor).padStart(2, "0")}
              </span>
              <span className="mt-1 text-[11px] font-bold uppercase tracking-wider text-ameixa/60">
                {bloco.rotulo}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
