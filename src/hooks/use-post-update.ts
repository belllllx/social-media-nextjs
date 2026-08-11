import { callApi } from "@/utils/helpers/call-api";
import { ICommonResponse, IPost, UpdatePostPayload } from "@/utils/types";
import { InfiniteData, QueryClient, useMutation } from "@tanstack/react-query";

interface MutateType {
  currentPost: IPost;
  payload: UpdatePostPayload;
}

export function usePostUpdate(queryClient: QueryClient) {
  return useMutation<
    ICommonResponse,
    Error,
    MutateType,
    {
      prevPosts?: InfiniteData<{ posts: IPost[]; nextCursor: string | null }>;
      prevPostsByUser?: InfiniteData<{ posts: IPost[]; nextCursor: string | null }>;
      prevPost?: IPost;
    }
  >({
    mutationFn: async ({
      currentPost,
      payload
    }) => {
      const res = await callApi<UpdatePostPayload>(
        "patch",
        `post/update/${currentPost.id}`,
        payload,
      );
      return res;
    },
    onMutate: async ({
      currentPost,
    }) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      await queryClient.cancelQueries({ queryKey: ["posts", currentPost.userId] });
      await queryClient.cancelQueries({ queryKey: ["post", currentPost.id] });

      const prevPosts = queryClient.getQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts"]);

      const prevPostsByUser = queryClient.getQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts", currentPost.userId]);

      const prevPost = queryClient.getQueryData<IPost>(["post", currentPost.id]);

      return {
        prevPosts,
        prevPostsByUser,
        prevPost,
      };
    },
    onError: (error, { currentPost }, context) => {
      if (
        !context
        ||
        !context.prevPosts
        ||
        !context.prevPostsByUser
        ||
        !context.prevPost
      ) {
        return;
      }

      queryClient.setQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts"], context.prevPosts);

      queryClient.setQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts", currentPost.userId], context.prevPostsByUser);

      queryClient.setQueryData<IPost>(["post", currentPost.id], context.prevPost);
    },
  });
}