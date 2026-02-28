import { callApi } from "@/utils/helpers/call-api";
import { IComment, ICommonResponse, ICreateCommentPayload, IPost, IUser } from "@/utils/types";
import { InfiniteData, QueryClient, useMutation } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";

interface MutationType {
  user: IUser;
  postId: string;
  comment?: IComment;
  payload: ICreateCommentPayload;
}

export function useCommentCreate(queryClient: QueryClient) {
  return useMutation<
    ICommonResponse,
    Error,
    MutationType,
    {
      prevComments?: InfiniteData<{ comments: IComment[]; nextCursor: string | null }>,
      optimisticId: string,
    }
  >({
    mutationFn: async ({
      user,
      postId,
      comment,
      payload,
    }) => {
      const res: ICommonResponse = !comment
        ?
        await callApi<ICreateCommentPayload>(
          "post",
          `comment/create/${user.id}/${postId}`,
          payload,
        )
        :
        comment.parentId
          ?
          await callApi<ICreateCommentPayload>(
            "post",
            `comment/tag/create/${user.id}/${comment.parentId}/${comment.id}/${postId}`,
            payload,
          )
          :
          await callApi<ICreateCommentPayload>(
            "post",
            `comment/reply/create/${user.id}/${comment.id}/${postId}`,
            payload,
          );

      return res;
    },
    onMutate: async ({
      user,
      postId,
      comment,
      payload,
    }) => {
      await queryClient.cancelQueries({ queryKey: ["comments", postId] });

      const optimisticId = uuidv4();

      const prevComments = queryClient.getQueryData<
        InfiniteData<{ comments: IComment[]; nextCursor: string | null }>
      >(["comments", postId]);

      queryClient.setQueryData<
        InfiniteData<{ comments: IComment[]; nextCursor: string | null }>
      >(["comments", postId], (oldComments) => {
        if (!oldComments) {
          return undefined;
        }

        // ถ้าเป็น reply or tag comment
        if (comment) {
          return {
            ...oldComments,
            pages: oldComments.pages.map((page) => {
              // ไม่ใช่ page ที่ reply or tag comment ข้าม
              if (
                !page.comments.some(
                  (prevComment) =>
                    prevComment.id === comment.id
                    ||
                    prevComment.id === comment.parentId
                )
              ) {
                return page;
              }

              return {
                ...page,
                comments: page.comments.map((prevComment) => {
                  // ไม่ใช่ comment ที่ reply และ tag ข้าม
                  if (
                    prevComment.id !== comment.id
                    &&
                    prevComment.id !== comment.parentId
                  ) {
                    return prevComment;
                  }

                  const newReplyOrTagComment: IComment = {
                    id: optimisticId,
                    message: payload.message,
                    postId,
                    userId: user.id,
                    user,
                    fileUrl: payload.fileUrl,
                    likes: [],
                    replysCount: 0,
                    replies: [],
                    replyToUserId: comment.parentId ? comment.userId : null,
                    replyToUser: comment.parentId ? comment.user : null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  }

                  const updateCommentReply: IComment = {
                    ...prevComment,
                    replysCount: prevComment.replies.length + 1,
                    replies: [newReplyOrTagComment, ...prevComment.replies],
                  };

                  return updateCommentReply;
                }),
              };
            }),
          };
        }

        // เป็น comment ปกติ
        const firstPage = oldComments.pages[0];

        const newComment: IComment = {
          id: optimisticId,
          message: payload.message,
          postId,
          userId: user.id,
          user,
          fileUrl: payload.fileUrl,
          likes: [],
          replysCount: 0,
          replies: [],
          replyToUserId: null,
          replyToUser: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const newFirstPage = {
          ...firstPage,
          comments: [newComment, ...firstPage.comments],
        };

        queryClient.setQueryData<
          InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
        >(["posts"], (oldPosts) => {
          if(!oldPosts){
            return undefined;
          }

          return {
            ...oldPosts,
            pages: oldPosts.pages.map((page) => {
              // ไม่ใช่เพจ target ข้าม
              if(!page.posts.some((post) => post.id === postId)){
                return page;
              }

              return {
                ...page,
                posts: page.posts.map((post) => {
                  // ไม่ใข่ post target ข้าม
                  if(post.id !== postId){
                    return post;
                  }

                  return {
                    ...post,
                    commentsCount: post.commentsCount + 1,
                  }
                }),
              }
            }),
          }
        });

        return {
          ...oldComments,
          pages: [newFirstPage, ...oldComments.pages.slice(1)],
        };
      });

      return {
        prevComments,
        optimisticId,
      };
    },
    onError: (error, { postId }, context) => {
      queryClient.setQueryData<
        InfiniteData<{ comments: IComment[]; nextCursor: string | null }>
      >(["comments", postId], context?.prevComments);
    },
    onSuccess: ({ data }, variables, context) => {
      const createdComment = data as IComment;
      queryClient.setQueryData<
        InfiniteData<{ comments: IComment[]; nextCursor: string | null }>
      >(["comments", createdComment.postId], (oldComments) => {
        if (!oldComments) {
          return undefined;
        }

        return {
          ...oldComments,
          pages: oldComments.pages.map((page) => {
            // ไม่ใช่ page target ข้าม
            if (!page.comments.some((comment) =>
              comment.id === context.optimisticId
              ||
              comment.replies.some((reply) => reply.id === context.optimisticId)
            )) {
              return page;
            }

            return {
              ...page,
              comments: page.comments.map((comment) => {
                // ไม่ใช่ comment และ reply or tag target ข้าม
                if (
                  comment.id !== context.optimisticId
                  &&
                  !comment.replies.some((reply) => reply.id === context.optimisticId)
                ) {
                  return comment;
                }

                // กรณีเป็น reply or tag
                if (comment.replies.some((reply) => reply.id === context.optimisticId)) {
                  const updatedReplyComment: IComment = {
                    ...comment,
                    replies: comment.replies.map((reply) => {
                      if (reply.id === context.optimisticId) {
                        return createdComment;
                      }
                      return reply;
                    }),
                  }

                  return updatedReplyComment;
                }

                const updatedComment: IComment = {
                  ...createdComment
                }
                return updatedComment;
              }),
            }
          }),
        }
      });
    },
  });
}