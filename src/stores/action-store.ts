import { createStore } from "zustand";

interface showCommentOnPostId {
  postId: string;
  open: boolean;
}

interface showReplyOnCommentId {
  commentId: string;
  open: boolean;
}

export type ActionState = {
  focusPostId: string | null;
  showCommentOnPostId: showCommentOnPostId[];
  showReplyOnCommentId: showReplyOnCommentId[];
};

export type FocusAction = {
  setFocusPostId: (focusPostId: string | null) => void;
  setShowCommentOnPostId: (showCommentOnPostId: showCommentOnPostId) => void;
  setShowReplyOnCommentId: (showReplyOnCommentId: showReplyOnCommentId) => void;
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
        showCommentOnPostId: !state.showCommentOnPostId.includes(
          showCommentOnPostId,
        )
          ? [...state.showCommentOnPostId, showCommentOnPostId]
          : state.showCommentOnPostId.filter(
              (showComment) =>
                showComment.postId !== showCommentOnPostId.postId,
            ),
      })),
    setShowReplyOnCommentId: (showReplyOnCommentId) =>
      set((state) => ({
        showReplyOnCommentId: !state.showReplyOnCommentId.includes(
          showReplyOnCommentId,
        )
          ? [...state.showReplyOnCommentId, showReplyOnCommentId]
          : state.showReplyOnCommentId.filter(
              (showReply) =>
                showReply.commentId !== showReplyOnCommentId.commentId,
            ),
      })),
  }));
}
