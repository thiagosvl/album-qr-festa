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
  getDialogPayload: <T = unknown>(name: FestaDialogName) => T | null;
}

const LayoutContext = createContext<LayoutContextValue | undefined>(undefined);

export function LayoutContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dialogStack, setDialogStack] = useState<ActiveDialogState[]>([]);

  const openDialog = useCallback(
    <T = unknown>(name: FestaDialogName, payload?: T) => {
      setDialogStack((prev) => {
        const filtered = prev.filter((d) => d.name !== name);
        return [...filtered, { name, payload: payload ?? null }];
      });
    },
    []
  );

  const closeDialog = useCallback((name?: FestaDialogName) => {
    setDialogStack((prev) => {
      if (prev.length === 0) return prev;
      if (!name) return prev.slice(0, -1);
      return prev.filter((d) => d.name !== name);
    });
  }, []);

  const isDialogOpen = useCallback(
    (name: FestaDialogName) => dialogStack.some((d) => d.name === name),
    [dialogStack]
  );

  const getDialogPayload = useCallback(
    <T = unknown>(name: FestaDialogName): T | null => {
      const found = dialogStack.find((d) => d.name === name);
      return (found?.payload as T) ?? null;
    },
    [dialogStack]
  );

  const activeDialog: ActiveDialogState =
    dialogStack[dialogStack.length - 1] ?? { name: null, payload: null };

  return (
    <LayoutContext.Provider
      value={{
        activeDialog,
        openDialog,
        closeDialog,
        isDialogOpen,
        getDialogPayload,
      }}
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
