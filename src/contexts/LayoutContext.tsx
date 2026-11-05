import React, { createContext, useCallback, useContext, useState } from "react";
import type { FestaDialogName } from "@/constants";

export type DialogPayloadMap = Record<FestaDialogName, unknown>;

interface ActiveDialogState {
  name: FestaDialogName | null;
  payload: unknown;
}

interface LayoutContextValue {
  activeDialog: ActiveDialogState;
  openDialog: <T = unknown>(name: FestaDialogName, payload?: T) => void;
  closeDialog: (name?: FestaDialogName) => void;
  isDialogOpen: (name: FestaDialogName) => boolean;
}

const LayoutContext = createContext<LayoutContextValue | undefined>(undefined);

export function LayoutContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeDialog, setActiveDialog] = useState<ActiveDialogState>({
    name: null,
    payload: null,
  });

  const openDialog = useCallback(
    <T = unknown>(name: FestaDialogName, payload?: T) => {
      setActiveDialog({ name, payload: payload ?? null });
    },
    []
  );

  const closeDialog = useCallback((name?: FestaDialogName) => {
    setActiveDialog((prev) => {
      if (name && prev.name !== name) return prev;
      return { name: null, payload: null };
    });
  }, []);

  const isDialogOpen = useCallback(
    (name: FestaDialogName) => activeDialog.name === name,
    [activeDialog.name]
  );

  return (
    <LayoutContext.Provider
      value={{ activeDialog, openDialog, closeDialog, isDialogOpen }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout(): LayoutContextValue {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout deve ser utilizado dentro de LayoutContextProvider");
  }
  return context;
}
