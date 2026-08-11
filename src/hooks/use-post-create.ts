import { callApi } from "@/utils/helpers/call-api";
import { ICommonResponse, CreatePostPayload, IPost, IUser } from "@/utils/types";
import { InfiniteData, QueryClient, useMutation } from "@tanstack/react-query";

interface MutationType {
  activeUser: IUser;
  payload: CreatePostPayload;
}

export function usePostCreate(queryClient: QueryClient) {
  return useMutation<
    ICommonResponse,
    Error,
    MutationType,
    {
      prevPosts?: InfiniteData<{ posts: IPost[]; nextCursor: string | null }>;
      prevPostsByUser?: InfiniteData<{ posts: IPost[]; nextCursor: string | null }>;
    }
  >({
    mutationFn: async ({
      payload,
    }) => {
      const res = await callApi<CreatePostPayload>(
        "post",
        "post/create",
        payload,
      );
      return res;
    },
    onMutate: async ({
      activeUser,
    }) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      await queryClient.cancelQueries({ queryKey: ["posts", activeUser.id] });

      const prevPosts = queryClient.getQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts"]);

      const prevPostsByUser = queryClient.getQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts", activeUser.id]);

      return {
        prevPosts,
        prevPostsByUser,
      };
    },
    onError: (error, { activeUser }, context) => {
      if (
        !context
        ||
        !context.prevPosts
        ||
        !context.prevPostsByUser
      ) {
        return;
      }

      queryClient.setQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts"], context.prevPosts);

      queryClient.setQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts", activeUser.id], context.prevPostsByUser);
    },
  });
}