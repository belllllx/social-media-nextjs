import { callApi } from "@/utils/helpers/call-api";
import { IComment, ICommonResponse, IPost } from "@/utils/types";
import { InfiniteData, QueryClient, useMutation } from "@tanstack/react-query";

interface MutationType {
  postId: string;
  comment: IComment;
  userId?: string;
}

export function useCommentDelete(queryClient: QueryClient) {
  return useMutation<
    ICommonResponse,
    Error,
    MutationType,
    {
      prevComments?: InfiniteData<{ comments: IComment[]; nextCursor: string | null }>;
      prevPosts?: InfiniteData<{ posts: IPost[]; nextCursor: string | null }>;
      prevPostsByUser?: InfiniteData<{ posts: IPost[]; nextCursor: string | null }>;
      prevPost?: IPost;
    }
  >({
    mutationFn: async ({ comment }) => {
      const res = await callApi(
        "delete",
        `comment/delete/${comment.id}`,
      );
      return res;
    },
    onMutate: async ({
      postId,
      userId,
    }) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      await queryClient.cancelQueries({ queryKey: ["posts", userId] });
      await queryClient.cancelQueries({ queryKey: ["comments", postId] });

      const prevPosts = queryClient.getQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts"]);

      const prevPostsByUser = queryClient.getQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts", userId]);

      const prevPost = queryClient.getQueryData<IPost>(["post", postId]);

      const prevComments = queryClient.getQueryData<
        InfiniteData<{ comments: IComment[]; nextCursor: string | null }>
      >(["comments", postId]);

      return {
        prevPosts,
        prevPostsByUser,
        prevPost,
        prevComments,
      };
    },
    onError: (error, { postId, userId }, context) => {
      if (
        !context
        ||
        !context.prevPosts
        ||
        !context.prevPostsByUser
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

      queryClient.setQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts", userId], context.prevPostsByUser);

      queryClient.setQueryData<IPost>(["post", postId], context.prevPost);

      queryClient.setQueryData<
        InfiniteData<{ comments: IComment[]; nextCursor: string | null }>
      >(["comments", postId], context.prevComments);
    },
    // onSettled: (data, error, { postId }) => {
    //   queryClient.invalidateQueries({ queryKey: ["posts"] });
    //   queryClient.invalidateQueries({ queryKey: ["post", postId] });
    //   queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    // },
  });
}