import { VERSAO_APP } from "@/lib/versaoApp";

/** Rodapé discreto com a versão do build, para conferir o que está no ar. */
export function VersaoApp() {
  return (
    <p className="pb-3 text-center text-[10px] text-ameixa-suave/70">
      {VERSAO_APP}
    </p>
  );
}
