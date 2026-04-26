import { create } from "zustand";
import { persist } from "zustand/middleware";

export type RegisterPayload = {
  fullname: string;
  username: string;
  password: string;
}

export type AuthUserState = {
  email: string;
  registerPayload: RegisterPayload | null;
}

export type AuthUserAction = {
  setEmail: (email: string) => void;
  setRegisterPayload: (registerPayload: RegisterPayload) => void;
}

export type AuthUserStore = AuthUserState & AuthUserAction;

export const defaultInitState: AuthUserState = {
  email: "",
  registerPayload: null,
}

export function createAuthUserStore(
  initState: AuthUserState = defaultInitState,
) {
  return create<AuthUserStore>()(
    persist(
      (set) => ({
        ...initState,
        setEmail: (email) => set({ email }),
        setRegisterPayload: (registerPayload) => set({ registerPayload }),
      }),
      {
        name: "auth-user-storage",
        partialize: (state) => ({ 
          email: state.email,
          registerPayload: state.registerPayload, 
        }),
      }
    ),
  );
}