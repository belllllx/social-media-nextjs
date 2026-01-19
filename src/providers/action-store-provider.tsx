"use client";

import { type ReactNode, createContext, useRef, useContext } from "react";
import { useStore } from "zustand";
import { ActionStore, createActionStore } from "@/stores/action-store";

export type ActionStoreApi = ReturnType<typeof createActionStore>;

export const ActionStoreContext = createContext<ActionStoreApi | undefined>(
  undefined,
);

export interface ActionStoreProviderProps {
  children: ReactNode;
}

export function ActionStoreProvider({ children }: ActionStoreProviderProps) {
  const storeRef = useRef<ActionStoreApi | null>(null);
  if (!storeRef.current) {
    storeRef.current = createActionStore();
  }

  return (
    <ActionStoreContext.Provider value={storeRef.current}>
      {children}
    </ActionStoreContext.Provider>
  );
}

export function useActionStore<T>(selector: (store: ActionStore) => T): T {
  const actionStoreContext = useContext(ActionStoreContext);

  if (!actionStoreContext) {
    throw new Error(`useActionStore must be used within ActionStoreProvider`);
  }

  return useStore(actionStoreContext, selector);
}
