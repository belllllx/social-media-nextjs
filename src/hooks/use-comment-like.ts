import { callApi } from "@/utils/helpers/call-api";
import { IComment, ICommonResponse, IUser } from "@/utils/types";
import { InfiniteData, QueryClient, useMutation } from "@tanstack/react-query";

interface MutationType {
  user: IUser;
  postId: string;
  commentId: string;
}

export function useCommentLike(queryClient: QueryClient) {
  return useMutation<
    ICommonResponse,
    Error,
    MutationType,
    InfiniteData<{ comments: IComment[]; nextCursor: string | null }>
  >({
    mutationFn: async ({
      commentId,
    }) => {
      const res = await callApi(
        "post",
        `comment/toggle-like/${commentId}`,
      );
      return res;
    },
    onMutate: async ({ postId }) => {
      await queryClient.cancelQueries({ queryKey: ["comments", postId] });

      const prevComments = queryClient.getQueryData<
        InfiniteData<{ comments: IComment[]; nextCursor: string | null }>
      >(["comments", postId]);

      return prevComments;
    },
    onError: (error, { postId }, prevComments) => {
      if (!prevComments) {
        return;
      }

      queryClient.setQueryData<
        InfiniteData<{ comments: IComment[]; nextCursor: string | null }>
      >(["comments", postId], prevComments);
    },
    // onSettled: (data, error, { postId }) => {
    //   queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    // },
  });
}