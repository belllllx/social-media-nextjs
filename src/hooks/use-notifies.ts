import { callApi } from "@/utils/helpers/call-api";
import { INotify } from "@/utils/types";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useNotifies(limit: number, activeUserId?: string) {
  return useInfiniteQuery({
    queryKey: ["notifies"],
    queryFn: async ({ pageParam }: { pageParam: string | null }) => {
      const url =
        pageParam && activeUserId
          ? `notification/finds?cursor=${pageParam}&limit=${limit}`
          : `notification/finds?limit=${limit}`;

      await new Promise((resolve) => setTimeout(() => resolve(undefined), 300));     
      const res = await callApi("get", url);
      if (!res.success) {
        return Promise.reject(res);
      }

      return res.data as { notifications: INotify[]; nextCursor: string | null };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? null,
    enabled: !!activeUserId,
  });
}
