import { callApi } from "@/utils/helpers/call-api";
import { IComment, ICommonResponse, UpdateCommentPayload } from "@/utils/types";
import { InfiniteData, QueryClient, useMutation } from "@tanstack/react-query";

interface MutationType {
  postId: string;
  comment: IComment;
  payload: UpdateCommentPayload;
}

export function useCommentUpdate(queryClient: QueryClient) {
  return useMutation<
    ICommonResponse,
    Error,
    MutationType,
    InfiniteData<{ comments: IComment[]; nextCursor: string | null }>
  >({
    mutationFn: async ({ comment, payload }) => {
      const res = await callApi<UpdateCommentPayload>(
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
                if (
                  comment.replies.some(
                    (reply) => reply.id === currentComment.id,
                  )
                ) {
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
    onError: (error, { postId }, prevComments) => {
      if (!prevComments) {
        return;
      }

      queryClient.setQueryData<
        InfiniteData<{ comments: IComment[]; nextCursor: string | null }>
      >(["comments", postId], prevComments);
    },
    onSuccess: ({ data }) => {
      const updatedComment = data as unknown as IComment;

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
                // กรณีเป็น reply or tag
                if (
                  comment.replies.some(
                    (reply) => reply.id === updatedComment.id,
                  )
                ) {
                  const updatedReplyComment: IComment = {
                    ...comment,
                    replies: [
                      ...comment.replies.map((reply) =>
                        reply.id === updatedComment.id ? {
                          ...reply,
                          message: updatedComment.message ?? reply.message,
                          fileUrl: updatedComment.fileUrl ?? reply.fileUrl,
                        } : reply,
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

                return {
                  ...comment,
                  message: updatedComment.message ?? comment.message,
                  fileUrl: updatedComment.fileUrl ?? comment.fileUrl,
                };
              }),
            };
          }),
        };
      });
    },
  });
}