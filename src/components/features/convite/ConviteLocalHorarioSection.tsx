import { Calendar, Clock, MapPin, Navigation } from "lucide-react";
import type {
  DataFormatadaConvite,
  LinksMapaConvite,
} from "@/hooks/business/useConviteCalculosBusiness";
import type { ConvitePublicoDto } from "@/types/festa.types";

interface ConviteLocalHorarioSectionProps {
  convite: ConvitePublicoDto;
  dataFormatada: DataFormatadaConvite | null;
  linksMapa: LinksMapaConvite;
}

export function ConviteLocalHorarioSection({
  convite,
  dataFormatada,
  linksMapa,
}: ConviteLocalHorarioSectionProps) {
  const horarioExibicao =
    convite.convite_horario_texto ||
    (convite.convite_horario_inicio
      ? `Às ${convite.convite_horario_inicio}`
      : null);

  const possuiLocal = Boolean(
    convite.convite_nome_local || convite.convite_endereco
  );

  return (
    <section className="space-y-4">
      {(dataFormatada || horarioExibicao) && (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {dataFormatada && (
            <div className="flex items-center gap-4 rounded-3xl border border-ameixa/10 bg-white p-5 shadow-md">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
                style={{ backgroundColor: convite.cor_primaria }}
              >
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-ameixa/50">
                  Data
                </p>
                <p
                  className="font-display text-lg font-extrabold leading-tight"
                  style={{ color: convite.cor_primaria }}
                >
                  {dataFormatada.diaMes}
                </p>
                <p className="text-xs font-medium text-ameixa/70">
                  {dataFormatada.diaSemana} · {dataFormatada.ano}
                </p>
              </div>
            </div>
          )}

          {horarioExibicao && (
            <div className="flex items-center gap-4 rounded-3xl border border-ameixa/10 bg-white p-5 shadow-md">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
                style={{ backgroundColor: convite.cor_secundaria }}
              >
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-ameixa/50">
                  Horário
                </p>
                <p
                  className="font-display text-lg font-extrabold leading-tight"
                  style={{ color: convite.cor_primaria }}
                >
                  {horarioExibicao}
                </p>
                <p className="text-xs font-medium text-ameixa/70">
                  Esperamos por você!
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {possuiLocal && (
        <div className="rounded-3xl border border-ameixa/10 bg-white p-6 text-center shadow-lg">
          <div
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm"
            style={{ backgroundColor: convite.cor_primaria }}
          >
            <MapPin className="h-6 w-6" />
          </div>

          <p className="mt-3 text-xs font-bold uppercase tracking-widest text-ameixa/50">
            Local da Festa
          </p>

          {convite.convite_nome_local && (
            <h2
              className="mt-1 font-display text-xl font-extrabold"
              style={{ color: convite.cor_primaria }}
            >
              {convite.convite_nome_local}
            </h2>
          )}

          {convite.convite_endereco && (
            <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-ameixa/75">
              {convite.convite_endereco}
            </p>
          )}

          <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <a
              href={linksMapa.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.01] active:scale-95"
              style={{ backgroundColor: convite.cor_primaria }}
            >
              <MapPin className="h-4 w-4" />
              Google Maps
            </a>
            <a
              href={linksMapa.wazeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 bg-papel px-4 py-3 text-sm font-bold transition-transform hover:scale-[1.01] active:scale-95"
              style={{
                borderColor: convite.cor_primaria,
                color: convite.cor_primaria,
              }}
            >
              <Navigation className="h-4 w-4" />
              Ir com Waze
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
