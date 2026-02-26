import { callApi } from "@/utils/helpers/call-api";
import { ICommonResponse, IPost } from "@/utils/types";
import { InfiniteData, QueryClient, useMutation } from "@tanstack/react-query";

export function usePostDelete(queryClient: QueryClient) {
  return useMutation<
    ICommonResponse,
    Error,
    string,
    InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
  >({
    mutationFn: async (postId) => {
      const res = await callApi("delete", `post/delete/${postId}`);
      return res;
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      const prevPosts = queryClient.getQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts"]);

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

      return prevPosts;
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts"], context);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}