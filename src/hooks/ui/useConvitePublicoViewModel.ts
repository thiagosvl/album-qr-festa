import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { STORAGE_KEYS } from "@/constants";
import {
  useConvitePublicoQuery,
  useRegistrarConfirmacaoPublicaMutation,
} from "@/hooks/api/useConviteApi";
import {
  calcularContagemRegressivaConvite,
  formatarDataExtensoConvite,
  gerarLinksMapaConvite,
} from "@/hooks/business/useConviteCalculosBusiness";
import { useConfirmacaoRsvpForm } from "@/hooks/form/useConfirmacaoRsvpForm";

interface MapaConfirmadosStorage {
  [slug: string]: {
    nome: string;
    totalPessoas: number;
    confirmadoEm: string;
  };
}

function lerConfirmacaoSalvaSlug(slug: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONVITE_CONFIRMADO_POR_SLUG);
    if (!raw) return null;
    const mapa = JSON.parse(raw) as MapaConfirmadosStorage;
    return mapa[slug] ?? null;
  } catch {
    return null;
  }
}

function salvarConfirmacaoNoStorage(
  slug: string,
  nome: string,
  totalPessoas: number
) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONVITE_CONFIRMADO_POR_SLUG);
    const mapa: MapaConfirmadosStorage = raw ? JSON.parse(raw) : {};
    mapa[slug] = {
      nome,
      totalPessoas,
      confirmadoEm: new Date().toISOString(),
    };
    localStorage.setItem(
      STORAGE_KEYS.CONVITE_CONFIRMADO_POR_SLUG,
      JSON.stringify(mapa)
    );
  } catch {
    return;
  }
}

export function useConvitePublicoViewModel(slug: string) {
  const conviteQuery = useConvitePublicoQuery(slug);
  const registrarMutation = useRegistrarConfirmacaoPublicaMutation(slug);

  const convite = conviteQuery.data;
  const [envelopeAberto, setEnvelopeAberto] = useState(false);
  const [musicaTocando, setMusicaTocando] = useState(false);
  const [agoraMs, setAgoraMs] = useState(() => Date.now());
  const [confirmacaoRealizada, setConfirmacaoRealizada] = useState(() =>
    lerConfirmacaoSalvaSlug(slug)
  );

  const audioMusicaRef = useRef<HTMLAudioElement | null>(null);
  const audioObrigadoRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setConfirmacaoRealizada(lerConfirmacaoSalvaSlug(slug));
  }, [slug]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setAgoraMs(Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const possuiMusica = Boolean(
    convite?.convite_musica_url && convite.convite_musica_url.trim().length > 0
  );

  const abrirEnvelope = () => {
    if (envelopeAberto) return;
    setEnvelopeAberto(true);
    if (possuiMusica && audioMusicaRef.current) {
      audioMusicaRef.current
        .play()
        .then(() => setMusicaTocando(true))
        .catch(() => setMusicaTocando(false));
    }
  };

  const alternarMusica = () => {
    if (!possuiMusica || !audioMusicaRef.current) return;
    if (audioMusicaRef.current.paused) {
      audioMusicaRef.current
        .play()
        .then(() => setMusicaTocando(true))
        .catch(() => setMusicaTocando(false));
    } else {
      audioMusicaRef.current.pause();
      setMusicaTocando(false);
    }
  };

  const tocarAudioAgradecimento = () => {
    if (!convite?.convite_audio_obrigado_url || !audioObrigadoRef.current) {
      return;
    }
    const estavaTocandoFundo =
      possuiMusica && audioMusicaRef.current && !audioMusicaRef.current.paused;
    if (estavaTocandoFundo && audioMusicaRef.current) {
      audioMusicaRef.current.volume = 0.15;
    }

    const restaurarVolume = () => {
      if (estavaTocandoFundo && audioMusicaRef.current) {
        audioMusicaRef.current.volume = 1;
      }
    };

    audioObrigadoRef.current.currentTime = 0;
    audioObrigadoRef.current.onended = restaurarVolume;
    audioObrigadoRef.current.onerror = restaurarVolume;
    audioObrigadoRef.current.play().catch(restaurarVolume);
  };

  const rsvpForm = useConfirmacaoRsvpForm(
    true,
    null,
    async (payload) => {
      const criado = await registrarMutation.mutateAsync(payload);
      const total = criado.adultos + criado.criancas;
      salvarConfirmacaoNoStorage(slug, criado.nome, total);
      setConfirmacaoRealizada({
        nome: criado.nome,
        totalPessoas: total,
        confirmadoEm: criado.created_at,
      });
      tocarAudioAgradecimento();
      toast.success("Presença confirmada com alegria! Nos vemos na festa!");
      return criado;
    }
  );

  const novaConfirmacao = () => {
    setConfirmacaoRealizada(null);
  };

  const contagem = useMemo(
    () =>
      calcularContagemRegressivaConvite(
        convite?.data_evento,
        convite?.convite_horario_inicio,
        agoraMs
      ),
    [convite?.data_evento, convite?.convite_horario_inicio, agoraMs]
  );

  const dataFormatada = useMemo(
    () => formatarDataExtensoConvite(convite?.data_evento),
    [convite?.data_evento]
  );

  const linksMapa = useMemo(
    () =>
      gerarLinksMapaConvite(
        convite?.convite_nome_local,
        convite?.convite_endereco
      ),
    [convite?.convite_nome_local, convite?.convite_endereco]
  );

  return {
    convite,
    isLoading: conviteQuery.isLoading,
    erro: conviteQuery.error,
    envelopeAberto,
    abrirEnvelope,
    possuiMusica,
    musicaTocando,
    alternarMusica,
    audioMusicaRef,
    audioObrigadoRef,
    contagem,
    dataFormatada,
    linksMapa,
    confirmacaoRealizada,
    novaConfirmacao,
    rsvpForm,
  };
}
