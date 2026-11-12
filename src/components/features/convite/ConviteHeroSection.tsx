import { Sparkles } from "lucide-react";
import type { ConvitePublicoDto } from "@/types/festa.types";

interface ConviteHeroSectionProps {
  convite: ConvitePublicoDto;
}

export function ConviteHeroSection({ convite }: ConviteHeroSectionProps) {
  const fotoHero = convite.convite_foto_url || convite.capa_url;
  const nomePrincipal = convite.nome_aniversariante || convite.titulo;
  const textoChamada =
    convite.convite_texto_chamada ||
    convite.boas_vindas ||
    "Prepare o coração e o sorriso! Vai ser um dia cheio de alegria, brincadeiras e momentos especiais ao lado de quem mais amamos!";

  return (
    <section className="relative overflow-hidden rounded-3xl border border-ameixa/10 bg-white p-6 text-center shadow-xl sm:p-8">
      {convite.convite_banner_topo_url && (
        <div className="-mx-6 -mt-6 mb-5 overflow-hidden sm:-mx-8 sm:-mt-8">
          <img
            src={convite.convite_banner_topo_url}
            alt=""
            className="h-24 w-full object-cover sm:h-28"
          />
        </div>
      )}

      <div className="inline-flex items-center gap-1.5 rounded-full bg-papel px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-ameixa/70">
        <Sparkles
          className="h-3.5 w-3.5"
          style={{ color: convite.cor_secundaria }}
        />
        {convite.subtitulo || "Convite Especial"}
      </div>

      <h1
        className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl"
        style={{ color: convite.cor_primaria }}
      >
        {nomePrincipal}
      </h1>

      {convite.idade_aniversariante && (
        <div className="mt-3 flex justify-center">
          <span
            className="inline-flex items-center rounded-full px-5 py-1.5 font-display text-sm font-extrabold uppercase tracking-wider text-white shadow-md"
            style={{
              background: `linear-gradient(135deg, ${convite.cor_primaria}, ${convite.cor_secundaria})`,
            }}
          >
            {convite.idade_aniversariante}
          </span>
        </div>
      )}

      {fotoHero && (
        <div className="mx-auto mt-6 max-w-[290px]">
          <div
            className="overflow-hidden rounded-[28px] border-4 bg-papel p-1.5 shadow-lg"
            style={{ borderColor: convite.cor_secundaria }}
          >
            <img
              src={fotoHero}
              alt={nomePrincipal}
              className="aspect-[4/4.3] w-full rounded-[22px] object-cover"
            />
          </div>
        </div>
      )}

      <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-ameixa/80 sm:text-base">
        {textoChamada}
      </p>
    </section>
  );
}
