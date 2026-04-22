import { callApi } from "@/utils/helpers/call-api";
import { IPost } from "@/utils/types";
import { useInfiniteQuery } from "@tanstack/react-query";

export function usePostsByUser(limit: number, activeUserId: string) {
  return useInfiniteQuery({
    queryKey: ["posts", activeUserId],
    queryFn: async ({ pageParam }: { pageParam: string | null }) => {
      const url = pageParam
        ? `post/find/user/${activeUserId}?&cursor=${pageParam}&limit=${limit}`
        : `post/find/user/${activeUserId}?&limit=${limit}`;

      await new Promise((resolve) => setTimeout(() => resolve(undefined), 300));
      const res = await callApi("get", url);
      if (!res.success) {
        return Promise.reject(res);
      }

      return res.data as { posts: IPost[]; nextCursor: string | null };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? null,
    enabled: !!activeUserId,
  });
}
