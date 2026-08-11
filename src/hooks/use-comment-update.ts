import { callApi } from "@/utils/helpers/call-api";
import { IComment, ICommonResponse, UpdateCommentPayload } from "@/utils/types";
import { InfiniteData, QueryClient, useMutation } from "@tanstack/react-query";

interface MutationType {
  postId: string;
  comment: IComment;
  payload: UpdateCommentPayload;
}

export function useCommentUpdate(queryClient: QueryClient) {
  return useMutation<
    ICommonResponse,
    Error,
    MutationType,
    InfiniteData<{ comments: IComment[]; nextCursor: string | null }>
  >({
    mutationFn: async ({ comment, payload }) => {
      const res = await callApi<UpdateCommentPayload>(
        "patch",
        `comment/update/${comment.id}`,
        payload,
      );
      return res;
    },
    onMutate: async ({
      postId,
    }) => {
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
  });
}