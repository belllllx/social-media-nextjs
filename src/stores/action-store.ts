import { createStore } from "zustand";

export type ActionState = {
  focusPostId: string | null;
  showCommentOnPostId: string[];
  showReplyOnCommentId: string[];
};

export type FocusAction = {
  setFocusPostId: (focusPostId: string | null) => void;
  setShowCommentOnPostId: (showCommentOnPostId: string) => void;
  setShowReplyOnCommentId: (showReplyOnCommentId: string) => void;
};

export type ActionStore = ActionState & FocusAction;

export const defaultInitState: ActionState = {
  focusPostId: null,
  showCommentOnPostId: [],
  showReplyOnCommentId: [],
};

export function createActionStore(initState: ActionState = defaultInitState) {
  return createStore<ActionStore>()((set) => ({
    ...initState,
    setFocusPostId: (focusPostId) => set({ focusPostId }),
    setShowCommentOnPostId: (showCommentOnPostId) =>
      set((state) => ({
        showCommentOnPostId: state.showCommentOnPostId.includes(
          showCommentOnPostId,
        )
          ? state.showCommentOnPostId.filter(
              (postId) => postId !== showCommentOnPostId,
            )
          : [showCommentOnPostId, ...state.showCommentOnPostId],
      })),
    setShowReplyOnCommentId: (showReplyOnCommentId) =>
      set((state) => ({
        showReplyOnCommentId: state.showReplyOnCommentId.includes(
          showReplyOnCommentId,
        )
          ? state.showReplyOnCommentId.filter(
              (commentId) => commentId !== showReplyOnCommentId,
            )
          : [showReplyOnCommentId, ...state.showReplyOnCommentId],
      })),
  }));
}
