import { IsUpdatedProfileStatus } from "@/stores/user-store";
import { QueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useUpdatePostEditProfile(
  queryClient: QueryClient,
  postId: string,
  isUpdatedProfileStatus: IsUpdatedProfileStatus | boolean,
) {
  useEffect(() => {
    if (
      isUpdatedProfileStatus === "EDIT"
      ||
      isUpdatedProfileStatus === "DELETE"
    ) {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    }
  }, [queryClient, postId, isUpdatedProfileStatus]);
}