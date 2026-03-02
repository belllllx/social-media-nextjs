import { callApi } from "@/utils/helpers/call-api";
import { IPost } from "@/utils/types";
import { useQuery } from "@tanstack/react-query";

export function usePost(postId: string) {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(() => resolve(undefined), 300));
      const res = await callApi("get", `post/find/${postId}`);
      if (!res.success) {
        return Promise.reject(res);
      }

      return res.data as IPost;
    },
    enabled: !!postId,
  });
}