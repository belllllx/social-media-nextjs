import { callApi } from "@/utils/helpers/call-api";
import { replace } from "@/utils/helpers/router";
import { ICommonResponse, IPost } from "@/utils/types";
import { InfiniteData, QueryClient, useMutation } from "@tanstack/react-query";

export function usePostDelete(queryClient: QueryClient) {
  return useMutation<
    ICommonResponse,
    Error,
    string,
    {
      prevPosts?: InfiniteData<{ posts: IPost[]; nextCursor: string | null }>,
      prevPost?: IPost,
    }
  >({
    mutationFn: async (postId) => {
      const res = await callApi("delete", `post/delete/${postId}`);
      return res;
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      await queryClient.cancelQueries({ queryKey: ["post", postId] });

      const prevPosts = queryClient.getQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts"]);

      const prevPost = queryClient.getQueryData<IPost>(["post", postId]);

      queryClient.setQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts"], (oldPosts) => {
        if (!oldPosts) {
          return undefined;
        }

        return {
          ...oldPosts,
          pages: oldPosts.pages.map((page) => {
            // ไม่ใข่ page target ข้าม
            if (!page.posts.some((prevPost) => prevPost.id === postId)) {
              return page;
            }

            return {
              ...page,
              posts: page.posts.filter((post) => post.id !== postId && post.parentId !== postId),
            };
          }),
        };
      });

      queryClient.removeQueries({ queryKey: ["post", postId] });
      replace("/feed");

      return {
        prevPosts,
        prevPost,
      };
    },
    onError: (error, postId, context) => {
      queryClient.setQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts"], context?.prevPosts);

      queryClient.setQueryData<IPost>(["post", postId], context?.prevPost);
    },
    onSettled: (data, error, postId) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });
}