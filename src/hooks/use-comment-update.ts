import { callApi } from "@/utils/helpers/call-api";
import { IComment, ICommonResponse, IUpdateCommentPayload } from "@/utils/types";
import { InfiniteData, QueryClient, useMutation } from "@tanstack/react-query";

interface MutationType {
  postId: string;
  comment: IComment;
  payload: IUpdateCommentPayload;
}

export function useCommentUpdate(queryClient: QueryClient) {
  return useMutation<
    ICommonResponse,
    Error,
    MutationType,
    InfiniteData<{ comments: IComment[]; nextCursor: string | null }>
  >({
    mutationFn: async ({ comment, payload }) => {
      const res = await callApi<IUpdateCommentPayload>(
        "patch",
        `comment/update/${comment.id}`,
        payload,
      );
      return res;
    },
    onMutate: async ({
      postId,
      comment: currentComment,
      payload
    }) => {
      await queryClient.cancelQueries({ queryKey: ["comments", postId] });

      const prevComments = queryClient.getQueryData<
        InfiniteData<{ comments: IComment[]; nextCursor: string | null }>
      >(["comments", postId]);

      queryClient.setQueryData<
        InfiniteData<{ comments: IComment[]; nextCursor: string | null }>
      >(["comments", postId], (oldComments) => {
        if (!oldComments) {
          return undefined;
        }

        return {
          ...oldComments,
          pages: oldComments.pages.map((page) => {
            // ถ้า page นั้น ไม่มี comment หรือ reply or tag ที่ update ให้ข้าม
            if (
              !page.comments.some(
                (comment) => comment.id === currentComment.id,
              ) &&
              !page.comments.some((comment) =>
                comment.replies.some((reply) => reply.id === currentComment.id),
              )
            ) {
              return page;
            }

            // page target
            return {
              ...page,
              comments: page.comments.map((comment) => {
                const updateComment: IComment = {
                  ...currentComment,
                  message: payload.message,
                  fileUrl: payload.fileUrl,
                }

                // กรณีเป็น reply or tag
                if (currentComment.parent && currentComment.parentId) {
                  // ไม่ใช่ comment ที่ reply or tag ข้าม
                  if (
                    !comment.replies.some(
                      (reply) => reply.id === currentComment.id,
                    )
                  ) {
                    return comment;
                  }

                  const updatedReplyComment: IComment = {
                    ...comment,
                    replies: [
                      ...comment.replies.map((reply) =>
                        reply.id === currentComment.id ? updateComment : reply,
                      ),
                    ],
                  };

                  return updatedReplyComment;
                }

                // กรณีเป็น comment ปกติ
                // ไม่ใช้ comment target ข้าม
                if (comment.id !== currentComment.id) {
                  return comment;
                }

                return updateComment;
              }),
            };
          }),
        };
      });

      return prevComments;
    },
    onError: (error, { postId }, context) => {
      queryClient.setQueryData<
        InfiniteData<{ comments: IComment[]; nextCursor: string | null }>
      >(["comments", postId], context);
    },
    onSuccess: ({ data }, variables, context) => {
      const updatedComment = data as IComment;

      queryClient.setQueryData<
        InfiniteData<{ comments: IComment[]; nextCursor: string | null }>
      >(["comments", updatedComment.postId], (oldComments) => {
        if (!oldComments) {
          return undefined;
        }

        return {
          ...oldComments,
          pages: oldComments.pages.map((page) => {
            // ถ้า page นั้น ไม่มี comment หรือ reply ที่ update ให้ข้าม
            if (
              !page.comments.some(
                (comment) => comment.id === updatedComment.id,
              ) &&
              !page.comments.some((comment) =>
                comment.replies.some((reply) => reply.id === updatedComment.id),
              )
            ) {
              return page;
            }

            // page target
            return {
              ...page,
              comments: page.comments.map((comment) => {
                const updateComment: IComment = {
                  ...updatedComment,
                }

                // กรณีเป็น reply
                if (updatedComment.parent && updatedComment.parentId) {
                  // ไม่ใช่ comment ที่ reply ข้าม
                  if (
                    !comment.replies.some(
                      (reply) => reply.id === updatedComment.id,
                    )
                  ) {
                    return comment;
                  }

                  const updatedReplyComment: IComment = {
                    ...comment,
                    replies: [
                      ...comment.replies.map((reply) =>
                        reply.id === updatedComment.id ? updateComment : reply,
                      ),
                    ],
                  };

                  return updatedReplyComment;
                }

                // กรณีเป็น comment ปกติ
                // ไม่ใช้ comment target ข้าม
                if (comment.id !== updatedComment.id) {
                  return comment;
                }

                return updateComment;
              }),
            };
          }),
        };
      });
    },
  });
}