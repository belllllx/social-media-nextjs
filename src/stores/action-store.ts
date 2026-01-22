import { createStore } from "zustand";

export type ActionState = {
  focusPostId: string | null;
  showCommentOnPostId: string | null;
}

export type FocusAction = {
  setFocusPostId: (focusPostId: string | null) => void;
  setShowCommentOnPostId: (showCommentOnPostId: string | null) => void;
}

export type ActionStore = ActionState & FocusAction;

export const defaultInitState: ActionState = {
  focusPostId: null,
  showCommentOnPostId: null,
}

export function createActionStore(
  initState: ActionState = defaultInitState,
) {
  return createStore<ActionStore>()((set) => ({
    ...initState,
    setFocusPostId: (focusPostId) => set({ focusPostId }),
    setShowCommentOnPostId: (showCommentOnPostId) => set({ showCommentOnPostId }),
  }));
}