import { useEffect, useRef, useState } from "react";

const CHAVE_ESTADO_HISTORICO = "festaNavegacao";

export function useHistoricoNavegacao(
  profundidade: number,
  aoVoltar: () => void
): void {
  const entradasRef = useRef(0);
  const popstatesIgnoradosRef = useRef(0);
  const aoVoltarRef = useRef(aoVoltar);
  const [versaoHistorico, setVersaoHistorico] = useState(0);

  useEffect(() => {
    aoVoltarRef.current = aoVoltar;
  });

  useEffect(() => {
    const aoNavegar = () => {
      if (popstatesIgnoradosRef.current > 0) {
        popstatesIgnoradosRef.current -= 1;
        return;
      }
      if (entradasRef.current === 0) return;
      entradasRef.current -= 1;
      aoVoltarRef.current();
      setVersaoHistorico((v) => v + 1);
    };
    window.addEventListener("popstate", aoNavegar);
    return () => window.removeEventListener("popstate", aoNavegar);
  }, []);

  useEffect(() => {
    const diferenca = profundidade - entradasRef.current;
    if (diferenca > 0) {
      for (let i = 0; i < diferenca; i += 1) {
        window.history.pushState({ [CHAVE_ESTADO_HISTORICO]: true }, "");
      }
    } else if (diferenca < 0) {
      popstatesIgnoradosRef.current += 1;
      window.history.go(diferenca);
    }
    entradasRef.current = profundidade;
  }, [profundidade, versaoHistorico]);
}
