import { useRef } from "react";
import { Camera, ChevronRight, ImagePlus, Images, Info } from "lucide-react";
import { ConvidadoCtaOrcamento } from "@/components/features/convidado/ConvidadoCtaOrcamento";
import {
  SeletorMolduras,
  VARIANTE_SELETOR,
} from "@/components/features/convidado/SeletorMolduras";
import type { EventoPublicoDto, MolduraDto } from "@/types/festa.types";

/** Capas costumam ter rostos na parte de cima: ancora o recorte perto do topo. */
const CAPA_POSICAO_FOCO = "center 12%";

interface ConvidadoHeroMoldurasProps {
  evento: EventoPublicoDto;
  molduras: MolduraDto[];
  molduraSelecionadaId: string | null;
  onSelectMoldura: (id: string | null) => void;
  onAbrirCamera: () => void;
  onSelecionarArquivo: (file: File) => void;
  onVerMural: () => void;
  podeEnviar: boolean;
  totalFotos: number;
  avisos: string[];
}

export function ConvidadoHeroMolduras({
  evento,
  molduras,
  molduraSelecionadaId,
  onSelectMoldura,
  onAbrirCamera,
  onSelecionarArquivo,
  onVerMural,
  podeEnviar,
  totalFotos,
  avisos,
}: ConvidadoHeroMoldurasProps) {
  const inputGaleriaRef = useRef<HTMLInputElement | null>(null);

  const selo =
    evento.subtitulo ||
    (evento.idade_aniversariante
      ? `${evento.nome_aniversariante ?? evento.titulo} faz ${evento.idade_aniversariante}`
      : null);

  const rotuloMural =
    totalFotos > 0 ? `Ver as fotos da festa (${totalFotos})` : "Ver as fotos da festa";

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-papel sm:shadow-palco">
      <section className="relative">
        <div
          className="h-[28dvh] min-h-[160px] max-h-[280px] bg-cover bg-center"
          style={
            evento.capa_url
              ? {
                  backgroundImage: `url(${evento.capa_url})`,
                  backgroundPosition: CAPA_POSICAO_FOCO,
                }
              : {
                  background: `linear-gradient(155deg, ${evento.cor_primaria}, ${evento.cor_secundaria})`,
                }
          }
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, #fdfbff 2%, rgba(253,251,255,0) 55%)",
          }}
          aria-hidden="true"
        />
        {evento.is_demo && (
          <span className="absolute left-4 top-4 rounded-full bg-gema px-3 py-1 text-xs font-bold text-ameixa shadow-suave">
            Demonstração
          </span>
        )}
      </section>

      <div className="relative -mt-10 px-5">
        {selo && (
          <p
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: evento.cor_primaria }}
          >
            {selo}
          </p>
        )}
        <h1 className="mt-1 font-display text-[32px] font-extrabold leading-[1.02] tracking-tight text-ameixa">
          {evento.titulo}
        </h1>
        <p className="mt-2 text-sm leading-snug text-ameixa-suave">
          {evento.boas_vindas ||
            "Escolha uma moldura, tire a foto e veja ela aparecer no mural da festa."}
        </p>
      </div>

      {podeEnviar && (
        <section className="mt-5 min-w-0">
          <h2 className="px-5 font-display text-base font-extrabold tracking-tight text-ameixa">
            Escolha sua moldura
          </h2>

          <div className="mt-1 px-4">
            <SeletorMolduras
              molduras={molduras}
              molduraSelecionadaId={molduraSelecionadaId}
              onSelectMoldura={onSelectMoldura}
              variante={VARIANTE_SELETOR.CLARO}
              corDestaque={evento.cor_primaria}
              grande
            />
          </div>

          <input
            ref={inputGaleriaRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) onSelecionarArquivo(file);
            }}
          />

          <div className="mt-3 grid grid-cols-2 gap-2.5 px-5">
            <button
              type="button"
              onClick={() => inputGaleriaRef.current?.click()}
              style={{ borderColor: evento.cor_secundaria, color: evento.cor_secundaria }}
              className="flex h-14 items-center justify-center gap-2 rounded-full border-2 bg-white font-display text-base font-extrabold transition active:scale-[0.98]"
            >
              <ImagePlus className="h-5 w-5 shrink-0" />
              Da galeria
            </button>
            <button
              type="button"
              onClick={onAbrirCamera}
              style={{ backgroundColor: evento.cor_primaria }}
              className="flex h-14 items-center justify-center gap-2 rounded-full font-display text-base font-extrabold text-white shadow-suave transition active:scale-[0.98]"
            >
              <Camera className="h-5 w-5 shrink-0" />
              Tirar foto
            </button>
          </div>
        </section>
      )}

      <div className="mt-2.5 px-5">
        <button
          type="button"
          onClick={onVerMural}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ameixa/[0.07] text-sm font-bold text-ameixa transition hover:bg-ameixa/10 active:scale-[0.98]"
        >
          <Images className="h-4 w-4 shrink-0" />
          {rotuloMural}
          <ChevronRight className="h-4 w-4 shrink-0" />
        </button>
      </div>

      {evento.is_demo && (
        <div className="mt-2.5 px-5">
          <ConvidadoCtaOrcamento />
        </div>
      )}

      {avisos.length > 0 ? (
        <ul className="mt-auto space-y-1.5 px-5 pb-6 pt-4">
          {avisos.map((aviso) => (
            <li
              key={aviso}
              className="flex items-start gap-2 text-xs leading-snug text-ameixa-suave"
            >
              <Info className="mt-px h-3.5 w-3.5 shrink-0" />
              {aviso}
            </li>
          ))}
        </ul>
      ) : (
        <div className="pb-6" />
      )}
    </div>
  );
}
