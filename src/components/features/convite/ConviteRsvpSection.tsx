import { Link } from "react-router-dom";
import {
  Camera,
  CheckCircle2,
  Loader2,
  Minus,
  Plus,
  Send,
  Users,
} from "lucide-react";
import { Banner } from "@/components/ui/Banner";
import { Input } from "@/components/ui/input";
import type { useConfirmacaoRsvpForm } from "@/hooks/form/useConfirmacaoRsvpForm";
import type { ConvitePublicoDto } from "@/types/festa.types";

interface ConviteRsvpSectionProps {
  convite: ConvitePublicoDto;
  rsvpForm: ReturnType<typeof useConfirmacaoRsvpForm>;
  confirmacaoRealizada: {
    nome: string;
    totalPessoas: number;
    confirmadoEm: string;
  } | null;
  onNovaConfirmacao: () => void;
}

export function ConviteRsvpSection({
  convite,
  rsvpForm,
  confirmacaoRealizada,
  onNovaConfirmacao,
}: ConviteRsvpSectionProps) {
  return (
    <section className="rounded-3xl border border-ameixa/10 bg-white p-6 shadow-xl sm:p-7">
      <div className="text-center">
        <div
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm"
          style={{ backgroundColor: convite.cor_primaria }}
        >
          <Users className="h-6 w-6" />
        </div>
        <h2
          className="mt-3 font-display text-2xl font-extrabold"
          style={{ color: convite.cor_primaria }}
        >
          Confirme sua Presença
        </h2>
        <p className="mt-1 text-xs font-medium text-ameixa/70">
          {convite.convite_texto_prazo_rsvp ||
            "Informe quantos adultos e crianças irão com você para prepararmos tudo com carinho!"}
        </p>
      </div>

      {confirmacaoRealizada ? (
        <div className="mt-6 space-y-4 text-center">
          <div
            className="rounded-2xl border p-5"
            style={{
              borderColor: `${convite.cor_primaria}33`,
              backgroundColor: "#FDFBF7",
            }}
          >
            <CheckCircle2
              className="mx-auto h-12 w-12"
              style={{ color: convite.cor_primaria }}
            />
            <h3 className="mt-2 font-display text-lg font-extrabold text-ameixa">
              Presença Confirmada, {confirmacaoRealizada.nome}!
            </h3>
            <p className="mt-1 text-xs text-ameixa/75">
              Registramos {confirmacaoRealizada.totalPessoas} pessoa(s) na lista
              oficial da festa. Mal podemos esperar para comemorar juntos!
            </p>
          </div>

          {convite.inclui_galeria && (
            <Link
              to={`/e/${convite.slug}`}
              className="flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.01]"
              style={{ backgroundColor: convite.cor_primaria }}
            >
              <Camera className="h-4 w-4" />
              Acessar Galeria de Fotos da Festa
            </Link>
          )}

          <button
            type="button"
            onClick={onNovaConfirmacao}
            className="text-xs font-semibold text-ameixa/60 underline hover:text-ameixa"
          >
            Precisa confirmar outra família? Clique aqui
          </button>
        </div>
      ) : (
        <form onSubmit={rsvpForm.handleSubmit} className="mt-6 space-y-5">
          {rsvpForm.erroValidacao && (
            <Banner variant="danger" title={rsvpForm.erroValidacao} />
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-ameixa/10 bg-papel p-3.5 text-center">
              <p className="text-xs font-bold text-ameixa">Adultos</p>
              <p className="text-[10px] text-ameixa/60">Incluindo você</p>
              <div className="mt-2.5 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    rsvpForm.alterarQuantidadeAdultos(rsvpForm.adultos - 1)
                  }
                  disabled={rsvpForm.adultos <= 1}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-ameixa/20 bg-white text-ameixa disabled:opacity-40"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span
                  className="w-6 font-display text-lg font-extrabold"
                  style={{ color: convite.cor_primaria }}
                >
                  {rsvpForm.adultos}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    rsvpForm.alterarQuantidadeAdultos(rsvpForm.adultos + 1)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm"
                  style={{ backgroundColor: convite.cor_primaria }}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-ameixa/10 bg-papel p-3.5 text-center">
              <p className="text-xs font-bold text-ameixa">Crianças</p>
              <p className="text-[10px] text-ameixa/60">Até 12 anos</p>
              <div className="mt-2.5 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    rsvpForm.alterarQuantidadeCriancas(rsvpForm.criancas - 1)
                  }
                  disabled={rsvpForm.criancas <= 0}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-ameixa/20 bg-white text-ameixa disabled:opacity-40"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span
                  className="w-6 font-display text-lg font-extrabold"
                  style={{ color: convite.cor_primaria }}
                >
                  {rsvpForm.criancas}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    rsvpForm.alterarQuantidadeCriancas(rsvpForm.criancas + 1)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm"
                  style={{ backgroundColor: convite.cor_primaria }}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-ameixa/60">
              Nome dos Adultos ({rsvpForm.adultos})
            </p>
            {rsvpForm.nomesAdultos.map((nome, idx) => (
              <Input
                key={`adulto-${idx}`}
                value={nome}
                onChange={(e) =>
                  rsvpForm.atualizarNomeAdulto(idx, e.target.value)
                }
                placeholder={
                  idx === 0
                    ? "Seu nome completo (Responsável) *"
                    : `Nome do ${idx + 1}º adulto`
                }
                required={idx === 0}
                className="h-11 rounded-xl border-ameixa/15 bg-papel"
              />
            ))}
          </div>

          {rsvpForm.criancas > 0 && (
            <div className="space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-ameixa/60">
                Nome das Crianças ({rsvpForm.criancas})
              </p>
              {rsvpForm.nomesCriancas.map((nome, idx) => (
                <Input
                  key={`crianca-${idx}`}
                  value={nome}
                  onChange={(e) =>
                    rsvpForm.atualizarNomeCrianca(idx, e.target.value)
                  }
                  placeholder={`Nome e idade da ${idx + 1}ª criança`}
                  className="h-11 rounded-xl border-ameixa/15 bg-papel"
                />
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={rsvpForm.isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 font-display text-base font-extrabold text-white shadow-lg transition-transform hover:scale-[1.01] active:scale-95 disabled:opacity-60"
            style={{
              background: `linear-gradient(135deg, ${convite.cor_primaria}, ${convite.cor_secundaria})`,
            }}
          >
            {rsvpForm.isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Confirmando presença...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Confirmar Presença
              </>
            )}
          </button>
        </form>
      )}
    </section>
  );
}
