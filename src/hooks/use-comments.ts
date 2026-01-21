import { callApi } from "@/utils/helpers/call-api";
import { IComment } from "@/utils/types";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useComments(postId: string, limit: number) {
  return useInfiniteQuery({
    queryKey: ["comments", postId],
    queryFn: async ({ pageParam }: { pageParam: string | null }) => {
      const url = pageParam
        ? `comment/find/${postId}?&cursor=${pageParam}&limit=${limit}`
        : `comment/find/${postId}?&limit=${limit}`;

      await new Promise((resolve) => setTimeout(() => resolve(undefined), 300));
      const res = await callApi("get", url);
      if (!res.success) {
        return Promise.reject(res);
      }

      return res.data as { comments: IComment[]; nextCursor: string | null };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? null,
  });
}
