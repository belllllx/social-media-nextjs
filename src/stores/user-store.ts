import { IUser } from "@/utils/types";
import { createStore } from "zustand/vanilla";

export type IsUpdatedProfileStatus = "EDIT" | "DELETE";

export type UserState = {
  user: IUser | null;
  isLoading: boolean;
  isUpdatedProfileStatus: IsUpdatedProfileStatus | boolean;
}

export type UserAction = {
  setUser: (user: IUser) => void;
  clearUser: () => void;
  setLoading: (isLoading: boolean) => void;
  setUpdatedProfile: (isUpdated: IsUpdatedProfileStatus) => void;
}

export type UserStore = UserState & UserAction;

export const defaultInitState: UserState = {
  user: null,
  isLoading: false,
  isUpdatedProfileStatus: false,
}

export function createUserStore(
  initState: UserState = defaultInitState,
) {
  return createStore<UserStore>()((set) => ({
    ...initState,
    setUser: (user) => set({ user }),
    clearUser: () => set({ user: null }),
    setLoading: (isLoading) => set({ isLoading }),
    setUpdatedProfile: (isUpdated) => set({ isUpdatedProfileStatus: isUpdated }),
  }));
}