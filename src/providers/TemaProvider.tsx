import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import { TEMA, type Tema } from "@/constants";
import {
  aplicarTemaNoDocumento,
  lerTemaSalvo,
  observarSistema,
  resolverTemaEscuro,
  rotaAceitaTema,
  salvarTema,
} from "@/lib/tema";

interface TemaContextValue {
  tema: Tema;
  escuro: boolean;
  definirTema: (tema: Tema) => void;
}

const TemaContext = createContext<TemaContextValue | undefined>(undefined);

export function TemaProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [tema, setTema] = useState<Tema>(lerTemaSalvo);
  const [escuroSistema, setEscuroSistema] = useState(() =>
    resolverTemaEscuro(TEMA.SISTEMA)
  );

  useEffect(
    () => observarSistema(() => setEscuroSistema(resolverTemaEscuro(TEMA.SISTEMA))),
    []
  );

  const escuro = tema === TEMA.SISTEMA ? escuroSistema : tema === TEMA.ESCURO;
  const aceitaTema = rotaAceitaTema(pathname);

  useEffect(() => {
    aplicarTemaNoDocumento(aceitaTema && escuro);
  }, [aceitaTema, escuro]);

  const definirTema = useCallback((proximo: Tema) => {
    salvarTema(proximo);
    setTema(proximo);
  }, []);

  const valor = useMemo(
    () => ({ tema, escuro, definirTema }),
    [tema, escuro, definirTema]
  );

  return <TemaContext.Provider value={valor}>{children}</TemaContext.Provider>;
}

export function useTema(): TemaContextValue {
  const contexto = useContext(TemaContext);
  if (!contexto) {
    throw new Error("useTema deve ser utilizado dentro de TemaProvider");
  }
  return contexto;
}
