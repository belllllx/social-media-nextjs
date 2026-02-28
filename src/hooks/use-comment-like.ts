import { callApi } from "@/utils/helpers/call-api";
import { IComment, ICommonResponse, ILike, IUser } from "@/utils/types";
import { InfiniteData, QueryClient, useMutation } from "@tanstack/react-query";

interface MutationType {
  user: IUser;
  postId: string;
  commentId: string;
}

export function useCommentLike(queryClient: QueryClient) {
  return useMutation<
    ICommonResponse,
    Error,
    MutationType,
    InfiniteData<{ comments: IComment[]; nextCursor: string | null }>
  >({
    mutationFn: async ({
      user,
      postId,
      commentId,
    }) => {
      const res = await callApi(
        "post",
        `comment/like/${user.id}/${postId}/${commentId}`,
      );
      return res;
    },
    onMutate: async ({ user, postId, commentId }) => {
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
            // ถ้าไม่ใข่ page ที่กด like comment reply or tag ข้าม
            if (
              !page.comments.some(
                (prevComment) => prevComment.id === commentId,
              ) &&
              !page.comments.some((prevComment) =>
                prevComment.replies.some(
                  (reply) => reply.id === commentId,
                ),
              )
            ) {
              return page;
            }

            return {
              ...page,
              comments: page.comments.map((comment) => {
                const newLike: ILike = {
                  id: -1,
                  userId: user.id,
                  postId,
                  commentId,
                  user,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                }

                // กรณี reply or tag
                // ถ้าเป็น like reply or tag of comment
                if (
                  comment.replies.some((reply) => reply.id === commentId)
                ) {
                  const updateReplyCommentLike: IComment = {
                    ...comment,
                    replies: comment.replies.map((reply) => {
                      // ถ้าไม่ใช่ reply or tag ที่ like ข้าม
                      if (reply.id !== commentId) {
                        return reply;
                      }

                      const copyReply: IComment = {
                        ...reply,
                        likes: [...reply.likes],
                      };
                      const index = copyReply.likes.findIndex(
                        (prevLike) => prevLike.userId === user.id,
                      );
                      if (index !== -1) {
                        copyReply.likes.splice(index, 1);
                      } else {
                        copyReply.likes.unshift(newLike);
                      }

                      return copyReply;
                    }),
                  };

                  return updateReplyCommentLike;
                }

                // กรณี comment ปกติ
                // ไม่ใข่ comment target ข้าม
                if (comment.id !== commentId) {
                  return comment;
                }

                // แก้เฉพาะ target
                const copyComment = {
                  ...comment,
                  likes: [...comment.likes],
                };
                const index = copyComment.likes.findIndex((prevLike) =>
                  prevLike.userId === user.id
                );
                if (index !== -1) {
                  copyComment.likes.splice(index, 1);
                } else {
                  copyComment.likes.unshift(newLike);
                }

                return copyComment;
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
    onSettled: (data, error, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });
}