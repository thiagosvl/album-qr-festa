import { Link, useParams } from "react-router-dom";
import { Loader2, Sparkles } from "lucide-react";
import { LogoFestalgia } from "@/components/ui/LogoFestalgia";
import { ConviteContagemSection } from "@/components/features/convite/ConviteContagemSection";
import { ConviteEnvelopeIntro } from "@/components/features/convite/ConviteEnvelopeIntro";
import { ConviteHeroSection } from "@/components/features/convite/ConviteHeroSection";
import { ConviteLocalHorarioSection } from "@/components/features/convite/ConviteLocalHorarioSection";
import { ConvitePresentesSection } from "@/components/features/convite/ConvitePresentesSection";
import { ConviteRsvpSection } from "@/components/features/convite/ConviteRsvpSection";
import { FESTA_ROUTES } from "@/constants";
import { useConvitePublicoViewModel } from "@/hooks/ui/useConvitePublicoViewModel";

export default function ConvitePublicoPage() {
  const { codigoUrl, slug = "demo" } = useParams<{
    codigoUrl?: string;
    slug?: string;
  }>();
  const identificador = codigoUrl ?? slug;
  const vm = useConvitePublicoViewModel(identificador);

  if (vm.isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-papel p-6 text-center">
        <Loader2 className="h-9 w-9 animate-spin text-ameixa" />
        <p className="mt-3 font-display text-sm font-bold text-ameixa/70">
          Preparando o seu convite...
        </p>
      </div>
    );
  }

  if (vm.erro || !vm.convite) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-papel p-6 text-center">
        <LogoFestalgia className="mb-6 h-8" />
        <div className="max-w-md rounded-3xl border border-ameixa/10 bg-white p-8 shadow-lg">
          <Sparkles className="mx-auto h-10 w-10 text-gema" />
          <h1 className="mt-3 font-display text-xl font-extrabold text-ameixa">
            Convite indisponível
          </h1>
          <p className="mt-2 text-sm text-ameixa/70">
            {vm.erro instanceof Error
              ? vm.erro.message
              : "Este convite não foi encontrado ou não está habilitado para este evento."}
          </p>
          <Link
            to={FESTA_ROUTES.HOME}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-ameixa px-5 py-2.5 text-xs font-bold text-white"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  const { convite } = vm;

  return (
    <div
      className="min-h-screen bg-papel pb-16 pt-6 text-ameixa"
      style={{
        backgroundImage: `radial-gradient(circle at 50% 0%, ${convite.cor_secundaria}22 0%, transparent 55%)`,
      }}
    >
      {convite.convite_musica_url && (
        <audio
          ref={vm.audioMusicaRef}
          src={convite.convite_musica_url}
          loop
          preload="auto"
        />
      )}

      {convite.convite_audio_obrigado_url && (
        <audio
          ref={vm.audioObrigadoRef}
          src={convite.convite_audio_obrigado_url}
          preload="auto"
        />
      )}

      <ConviteEnvelopeIntro
        convite={convite}
        aberto={vm.envelopeAberto}
        possuiMusica={vm.possuiMusica}
        musicaTocando={vm.musicaTocando}
        onAbrir={vm.abrirEnvelope}
        onAlternarMusica={vm.alternarMusica}
      />

      <main className="mx-auto max-w-[480px] space-y-5 px-4">
        <ConviteHeroSection convite={convite} />

        <ConviteContagemSection
          contagem={vm.contagem}
          corPrimaria={convite.cor_primaria}
          corSecundaria={convite.cor_secundaria}
          possuiData={Boolean(convite.data_evento)}
        />

        <ConviteLocalHorarioSection
          convite={convite}
          dataFormatada={vm.dataFormatada}
          linksMapa={vm.linksMapa}
        />

        <ConvitePresentesSection convite={convite} />

        <ConviteRsvpSection
          convite={convite}
          rsvpForm={vm.rsvpForm}
          confirmacaoRealizada={vm.confirmacaoRealizada}
          onNovaConfirmacao={vm.novaConfirmacao}
        />

        <footer className="pt-6 text-center">
          <div className="inline-flex flex-col items-center gap-1 opacity-75">
            <LogoFestalgia className="h-6" />
            <p className="text-[11px] text-ameixa/60">
              Convite interativo oficial
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
