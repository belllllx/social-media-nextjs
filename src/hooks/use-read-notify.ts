import { callApi } from "@/utils/helpers/call-api";
import { INotify, ReadNotifiesSchema } from "@/utils/types";
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

export function useReadNotify() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notifiesId: string[]) => {
      const res = await callApi<ReadNotifiesSchema>(
        "patch",
        `notification/read-all`,
        {
          notificationsId: notifiesId,
        },
      );

      if (!res.success) {
        return Promise.reject(res);
      }

      return res;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifies"] });

      const prevNoifies = queryClient.getQueryData<
        InfiniteData<{ notifications: INotify[]; nextCursor: string | null }>
      >(["notifies"]);

      queryClient.setQueryData<
        InfiniteData<{ notifications: INotify[]; nextCursor: string | null }>
      >(["notifies"], (oldNotifies) => {
        if (!oldNotifies) {
          return undefined;
        }

        return {
          ...oldNotifies,
          pages: oldNotifies.pages.map((page) => ({
            ...page,
            notifications: page.notifications.map((notification) => ({
              ...notification,
              isRead: true,
            })
            ),
          })),
        };
      });

      return prevNoifies;
    },
    onError: (error, notifyId, prevNoifies) => {
      if (!prevNoifies) {
        return;
      }

      queryClient.setQueryData<
        InfiniteData<{ notifications: INotify[]; nextCursor: string | null }>
      >(["notifies"], prevNoifies);
    },
    onSuccess: (res) => {
      const notifyData = res.data as unknown as INotify[];

      queryClient.setQueryData<
        InfiniteData<{ notifications: INotify[]; nextCursor: string | null }>
      >(["notifies"], (oldNotifies) => {
        if (!oldNotifies) {
          return undefined;
        }

        const updatedIds = new Set(notifyData.map((notify) => notify.id));

        return {
          ...oldNotifies,
          pages: oldNotifies.pages.map((page) => ({
            ...page,
            notifications: page.notifications.map((notification) =>
              updatedIds.has(notification.id)
                ? {
                  ...notification,
                  isRead: notification.isRead,
                }
                : notification,
            ),
          })),
        };
      });
    },
  });
}
