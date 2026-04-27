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
  isDisabled: boolean;
};

export type FocusAction = {
  setFocusPostId: (focusPostId: string | null) => void;
  setShowCommentOnPostId: (showCommentOnPostId: showCommentOnPostId) => void;
  setShowReplyOnCommentId: (showReplyOnCommentId: showReplyOnCommentId) => void;
  setDisabled: () => void;
  clearDisabled: () => void;
};

export type ActionStore = ActionState & FocusAction;

export const defaultInitState: ActionState = {
  focusPostId: null,
  showCommentOnPostId: [],
  showReplyOnCommentId: [],
  isDisabled: false,
};

export function createActionStore(initState: ActionState = defaultInitState) {
  return createStore<ActionStore>()((set) => ({
    ...initState,
    setFocusPostId: (focusPostId) => set({ focusPostId }),
    setShowCommentOnPostId: (showCommentOnPostId) =>
      set((state) => ({
        showCommentOnPostId: !state.showCommentOnPostId.some(
          (showComment) => showComment.postId === showCommentOnPostId.postId,
        )
          ? [...state.showCommentOnPostId, showCommentOnPostId]
          : [
              ...state.showCommentOnPostId.map((showComment) => {
                if (showComment.postId !== showCommentOnPostId.postId) {
                  return showComment;
                }

                return {
                  ...showCommentOnPostId,
                };
              }),
            ],
      })),
    setShowReplyOnCommentId: (showReplyOnCommentId) =>
      set((state) => ({
        showReplyOnCommentId: !state.showReplyOnCommentId.some(
          (showReply) => showReply.commentId === showReplyOnCommentId.commentId,
        )
          ? [...state.showReplyOnCommentId, showReplyOnCommentId]
          : [
              ...state.showReplyOnCommentId.map((showReply) => {
                if (showReply.commentId !== showReplyOnCommentId.commentId) {
                  return showReply;
                }

                return {
                  ...showReplyOnCommentId,
                };
              }),
            ],
      })),
      setDisabled: () => set({ isDisabled: true }),
      clearDisabled: () => set({ isDisabled: false }),
  }));
}
