import { callApi } from "@/utils/helpers/call-api";
import { IComment, ICommonResponse, CreateCommentPayload, IPost, IUser } from "@/utils/types";
import { InfiniteData, QueryClient, useMutation } from "@tanstack/react-query";

interface MutationType {
  user: IUser;
  postId: string;
  comment?: IComment;
  payload: CreateCommentPayload;
}

export function useCommentCreate(queryClient: QueryClient) {
  return useMutation<
    ICommonResponse,
    Error,
    MutationType,
    {
      prevPosts?: InfiniteData<{ posts: IPost[]; nextCursor: string | null }>,
      prevPost?: IPost,
      prevComments?: InfiniteData<{ comments: IComment[]; nextCursor: string | null }>,
    }
  >({
    mutationFn: async ({
      postId,
      comment,
      payload,
    }) => {
      const res: ICommonResponse = !comment
        ?
        await callApi<CreateCommentPayload>(
          "post",
          `comment/create/${postId}`,
          payload,
        )
        :
        comment.parentId
          ?
          await callApi<CreateCommentPayload>(
            "post",
            `comment/tag/create/${postId}/${comment.parentId}/${comment.id}`,
            payload,
          )
          :
          await callApi<CreateCommentPayload>(
            "post",
            `comment/reply/create/${postId}/${comment.id}`,
            payload,
          );

      return res;
    },
    onMutate: async ({
      postId,
    }) => {
      await queryClient.cancelQueries({ queryKey: ["comments", postId] });

      const prevPosts = queryClient.getQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts"]);

      const prevPost = queryClient.getQueryData<IPost>(["post", postId]);

      const prevComments = queryClient.getQueryData<
        InfiniteData<{ comments: IComment[]; nextCursor: string | null }>
      >(["comments", postId]);

      return {
        prevPosts,
        prevPost,
        prevComments,
      };
    },
    onError: (error, { postId }, context) => {
      if (
        !context
        ||
        !context.prevPosts
        ||
        !context.prevPost
        ||
        !context.prevComments
      ) {
        return;
      }

      queryClient.setQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts"], context.prevPosts);

      queryClient.setQueryData<IPost>(["post", postId], context.prevPost);

      queryClient.setQueryData<
        InfiniteData<{ comments: IComment[]; nextCursor: string | null }>
      >(["comments", postId], context.prevComments);
    },
  });
}