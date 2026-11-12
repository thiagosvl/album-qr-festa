import { Gift, Shirt, Footprints } from "lucide-react";
import type { ConvitePublicoDto } from "@/types/festa.types";

interface ConvitePresentesSectionProps {
  convite: ConvitePublicoDto;
}

export function ConvitePresentesSection({
  convite,
}: ConvitePresentesSectionProps) {
  if (!convite.convite_exibir_presentes) return null;

  const temCalcado = Boolean(convite.convite_tamanho_calcado?.trim());
  const temRoupa = Boolean(convite.convite_tamanho_roupa?.trim());
  const ideias = convite.convite_ideias_presentes ?? [];

  if (!temCalcado && !temRoupa && ideias.length === 0) return null;

  return (
    <section className="rounded-3xl border border-ameixa/10 bg-white p-6 text-center shadow-lg">
      <div
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm"
        style={{ backgroundColor: convite.cor_secundaria }}
      >
        <Gift className="h-6 w-6" />
      </div>

      <h2
        className="mt-3 font-display text-xl font-extrabold"
        style={{ color: convite.cor_primaria }}
      >
        Sugestões de Presente
      </h2>
      <p className="mt-1 text-xs font-medium text-ameixa/70">
        Sua presença é o nosso maior presente! Mas se quiser nos mimar:
      </p>

      {(temCalcado || temRoupa) && (
        <div className="mt-4">
          {convite.convite_titulo_tamanhos && (
            <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-ameixa/60">
              {convite.convite_titulo_tamanhos}
            </p>
          )}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {temCalcado && (
              <div className="flex items-center justify-center gap-3 rounded-2xl border border-ameixa/10 bg-papel p-3.5">
                <Footprints
                  className="h-5 w-5 shrink-0"
                  style={{ color: convite.cor_primaria }}
                />
                <div className="text-left">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ameixa/50">
                    Calçado
                  </p>
                  <p className="font-display text-sm font-extrabold text-ameixa">
                    Nº {convite.convite_tamanho_calcado}
                  </p>
                </div>
              </div>
            )}
            {temRoupa && (
              <div className="flex items-center justify-center gap-3 rounded-2xl border border-ameixa/10 bg-papel p-3.5">
                <Shirt
                  className="h-5 w-5 shrink-0"
                  style={{ color: convite.cor_primaria }}
                />
                <div className="text-left">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ameixa/50">
                    Roupa
                  </p>
                  <p className="font-display text-sm font-extrabold text-ameixa">
                    Tam. {convite.convite_tamanho_roupa}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {ideias.length > 0 && (
        <div className="mt-5">
          <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-ameixa/60">
            O que gostamos de brincar e ganhar
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {ideias.map((ideia, idx) => (
              <span
                key={`${ideia}-${idx}`}
                className="rounded-full border px-3.5 py-1.5 text-xs font-semibold text-ameixa shadow-sm"
                style={{
                  borderColor: `${convite.cor_secundaria}88`,
                  backgroundColor: "hsl(var(--convite-papel))",
                }}
              >
                {ideia}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
