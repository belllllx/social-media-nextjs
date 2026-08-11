import { callApi } from "@/utils/helpers/call-api";
import { ICommonResponse, IPost, IUser } from "@/utils/types";
import { InfiniteData, QueryClient, useMutation } from "@tanstack/react-query";

interface MutationType {
  activeUser: IUser;
  postId: string;
  userId?: string;
}

export function usePostLike(queryClient: QueryClient) {
  return useMutation<
    ICommonResponse,
    Error,
    MutationType,
    {
      prevPosts?: InfiniteData<{ posts: IPost[]; nextCursor: string | null }>,
      prevPostsByUser?: InfiniteData<{ posts: IPost[]; nextCursor: string | null }>,
      prevPost?: IPost,
    }
  >({
    mutationFn: async ({
      postId,
    }) => {
      const res = await callApi(
        "post",
        `post/toggle-like/${postId}`,
      );
      return res;
    },
    onMutate: async ({
      postId,
      userId,
    }) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      await queryClient.cancelQueries({ queryKey: ["posts", userId] });
      await queryClient.cancelQueries({ queryKey: ["post", postId] });

      const prevPosts = queryClient.getQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts"]);

      const prevPostsByUser = queryClient.getQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts", userId]);

      const prevPost = queryClient.getQueryData<IPost>(["post", postId]);

      return {
        prevPosts,
        prevPostsByUser,
        prevPost,
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
    },
    // onSettled: (data, error, { postId }) => {
    //   queryClient.invalidateQueries({ queryKey: ["posts"] });
    //   queryClient.invalidateQueries({ queryKey: ["post", postId] });
    // },
  });
}