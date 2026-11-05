import { useEffect, useRef, useState } from "react";

const CHAVE_ESTADO_HISTORICO = "festaNavegacao";

/**
 * Faz o botão "voltar" do navegador/celular desfazer um nível de tela do app
 * (revisão, câmera, mural) em vez de sair da página.
 *
 * `profundidade` é o número de telas empilhadas sobre o início (0 = início).
 * O hook mantém o histórico do navegador com o mesmo número de entradas:
 * - a profundidade sobe: empilha entradas;
 * - a profundidade desce por ação do app: desempilha com history.go;
 * - o usuário aperta voltar: chama `aoVoltar`, que deve reduzir a profundidade.
 * Com profundidade 0 o voltar sai da página normalmente.
 */
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
