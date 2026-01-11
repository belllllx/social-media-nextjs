import { useQueryClient, InfiniteData } from "@tanstack/react-query";
import { useSocketIo } from "@/providers/socket-io-provider";
import { useEffect } from "react";
import { INotify } from "@/utils/types";
import { isEqual } from "lodash";

export function useNotifySocket(activeUserId?: string) {
  const { socket } = useSocketIo();
  const queryClient = useQueryClient();

  useEffect(() => {
    socket?.on(`notification:${activeUserId}`, (newNotify) => {
      queryClient.setQueryData<
        InfiniteData<{ notifies: INotify[]; nextCursor: string | null }>
      >(["notifies"], (oldNotifies) => {
        if (!oldNotifies) {
          return undefined;
        }

        let found = false;

        const newNotifyPages = oldNotifies.pages.map((group, pageIndex) => {
          const index = group.notifies.findIndex((oldNotify) =>
            isEqual(oldNotify, newNotify)
          );

          // เจอ notify เดิม → แก้ page นี้
          if (index !== -1) {
            found = true;

            const copyNotifies = [...group.notifies];
            copyNotifies.splice(index, 1);

            return {
              ...group,
              notifies: copyNotifies,
            };
          }

          // ยังไม่เจอ และเป็น page แรก → เพิ่มเข้า page แรกเท่านั้น
          if (!found && pageIndex === 0) {
            found = true;

            return {
              ...group,
              notifies: [newNotify, ...group.notifies],
            };
          }

          // page อื่น ๆ ไม่แตะ
          return group;
        });

        return {
          ...oldNotifies,
          pages: newNotifyPages,
        };
      });
    });

    return () => {
      socket?.off(`notification:${activeUserId}`);
    };
  }, [socket, queryClient, activeUserId]);
}
