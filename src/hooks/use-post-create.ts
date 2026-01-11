import { IPost } from "@/utils/types";
import { InfiniteData, QueryClient } from "@tanstack/react-query";

export function usePostCreate(newPost: IPost, queryClient: QueryClient) {
  queryClient.setQueryData<
    InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
  >(["posts"], (oldPosts) => {
    if (!oldPosts || !oldPosts.pages.length) {
      return undefined;
    }
    const firstPage = oldPosts.pages[0];

    const newFirstPage = {
      ...firstPage,
      posts: [newPost, ...firstPage.posts],
    };

    return {
      ...oldPosts,
      pages: [newFirstPage, ...oldPosts.pages.slice(1)],
    };
  });
}
