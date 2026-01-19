import { INotify } from "@/utils/types";
import { InfiniteData, QueryClient } from "@tanstack/react-query";

export function useNotifyDelete(
  queryClient: QueryClient,
  deletedPostId: string,
  activeUserId: string,
) {
  queryClient.setQueryData<
    InfiniteData<{ notifies: INotify[]; nextCursor: string | null }>
  >(["notifies"], (oldNotifies) => {
    if (!oldNotifies) {
      return undefined;
    }

    return {
      ...oldNotifies,
      pages: oldNotifies.pages.map((page) => {
        // ไม่ใข่ page target ข้าม
        if (
          !page.notifies.some(
            (prevNotify) =>
              prevNotify.receiverId === activeUserId &&
              prevNotify.postId === deletedPostId,
          )
        ) {
          return page;
        }

        return {
          ...page,
          notifies: page.notifies.filter(
            (notify) =>
              notify.postId !== deletedPostId
          ),
        };
      }),
    };
  });
}
