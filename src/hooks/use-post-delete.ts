import { callApi } from "@/utils/helpers/call-api";
import { ICommonResponse, IPost } from "@/utils/types";
import { InfiniteData, QueryClient, useMutation } from "@tanstack/react-query";

interface MutateType {
  postId: string;
  activeUserId: string;
}

export function usePostDelete(queryClient: QueryClient) {
  return useMutation<
    ICommonResponse,
    Error,
    MutateType,
    {
      prevPosts?: InfiniteData<{ posts: IPost[]; nextCursor: string | null }>,
      prevPostsByUser?: InfiniteData<{ posts: IPost[]; nextCursor: string | null }>,
      prevPost?: IPost,
    }
  >({
    mutationFn: async ({ postId }) => {
      const res = await callApi("delete", `post/delete/${postId}`);
      return res;
    },
    onMutate: async ({ postId, activeUserId }) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      await queryClient.cancelQueries({ queryKey: ["posts", activeUserId] });
      await queryClient.cancelQueries({ queryKey: ["post", postId] });

      const prevPosts = queryClient.getQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts"]);

      const prevPostsByUser = queryClient.getQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts", activeUserId]);

      const prevPost = queryClient.getQueryData<IPost>(["post", postId]);

      queryClient.removeQueries({ queryKey: ["post", postId] });

      return {
        prevPosts,
        prevPostsByUser,
        prevPost,
      };
    },
    onError: (error, { postId, activeUserId }, context) => {
      if(
        !context
        ||
        !context.prevPosts
        ||
        !context.prevPostsByUser
        ||
        !context.prevPost
      ){
        return;
      }

      queryClient.setQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts"], context.prevPosts);

      queryClient.setQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts", activeUserId], context.prevPostsByUser);

      queryClient.setQueryData<IPost>(["post", postId], context.prevPost);
    },
    // onSettled: (data, error, postId) => {
    //   queryClient.invalidateQueries({ queryKey: ["posts"] });
    //   queryClient.invalidateQueries({ queryKey: ["post", postId] });
    // },
  });
}