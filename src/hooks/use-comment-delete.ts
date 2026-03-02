import { callApi } from "@/utils/helpers/call-api";
import { IComment, ICommonResponse, IPost } from "@/utils/types";
import { InfiniteData, QueryClient, useMutation } from "@tanstack/react-query";

interface MutationType {
  postId: string;
  comment: IComment;
}

export function useCommentDelete(queryClient: QueryClient) {
  return useMutation<
    ICommonResponse,
    Error,
    MutationType,
    {
      prevComments?: InfiniteData<{ comments: IComment[]; nextCursor: string | null }>,
      prevPosts?: InfiniteData<{ posts: IPost[]; nextCursor: string | null }>,
      prevPost?: IPost,
    }
  >({
    mutationFn: async ({ postId, comment }) => {
      const res = await callApi(
        "delete",
        `comment/delete/${postId}/${comment.id}`,
      );
      return res;
    },
    onMutate: async ({ postId, comment: currentComment }) => {
      await queryClient.cancelQueries({ queryKey: ["comments", postId] });

      const prevPosts = queryClient.getQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts"]);

      const prevPost = queryClient.getQueryData<IPost>(["post", postId]);

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
            // กรณี comment ปกติ
            if (!currentComment.parent && !currentComment.parentId) {
              // ถ้าไม่ใช่ page ที่มี comment ที่จะลบให้ข้าม
              if (
                !page.comments.some(
                  (comment) => comment.id === currentComment.id,
                )
              ) {
                return page;
              }

              queryClient.setQueryData<
                InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
              >(["posts"], (oldPosts) => {
                if (!oldPosts) {
                  return undefined;
                }

                return {
                  ...oldPosts,
                  pages: oldPosts.pages.map((page) => {
                    // ไม่ใช่เพจ target ข้าม
                    if (!page.posts.some((post) => post.id === postId)) {
                      return page;
                    }

                    return {
                      ...page,
                      posts: page.posts.map((post) => {
                        // ไม่ใข่ post target ข้าม
                        if (post.id !== postId) {
                          return post;
                        }

                        return {
                          ...post,
                          commentsCount: post.commentsCount - 1,
                        }
                      }),
                    }
                  }),
                }
              });

              queryClient.setQueryData<IPost>(["post", postId], (oldPost) => {
                if (!oldPost) {
                  return undefined;
                }

                return {
                  ...oldPost,
                  commentsCount: oldPost.commentsCount - 1,
                }
              });

              return {
                ...page,
                comments: page.comments.filter(
                  (comment) => comment.id !== currentComment.id,
                ),
              };
            }

            // กรณี reply or tag
            // ถ้าไม่ใช่ page ที่มี reply or tag ที่จะลบให้ข้าม
            if (
              !page.comments.some((comment) => comment.replies.some((reply) => reply.id === currentComment.id))
            ) {
              return page;
            }

            return {
              ...page,
              comments: page.comments.map((comment) => {
                // ถ้าไม่ใช่ comment ที่ reply or tag ข้าม
                if (
                  !comment.replies.some(
                    (reply) => reply.id === currentComment.id,
                  )
                ) {
                  return comment;
                }

                const newReplies = comment.replies.filter(
                  (reply) => reply.id !== currentComment.id && reply.replyId !== currentComment.id,
                );

                const deletedReplyComment: IComment = {
                  ...comment,
                  replies: newReplies,
                  replysCount: newReplies.length,
                };

                return deletedReplyComment;
              }),
            };
          }),
        };
      });

      return {
        prevPosts,
        prevPost,
        prevComments,
      };
    },
    onError: (error, { postId }, context) => {
      queryClient.setQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts"], context?.prevPosts);

      queryClient.setQueryData<IPost>(["post", postId], context?.prevPost);

      queryClient.setQueryData<
        InfiniteData<{ comments: IComment[]; nextCursor: string | null }>
      >(["comments", postId], context?.prevComments);
    },
    onSettled: (data, error, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });
}