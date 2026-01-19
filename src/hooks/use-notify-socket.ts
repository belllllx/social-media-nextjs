import {
  InfiniteData,
  QueryClient,
} from "@tanstack/react-query";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/providers/socket-io-provider";
import { useEffect } from "react";
import { INotify } from "@/utils/types";
import { Socket } from "socket.io-client";

export function useNotifySocket(
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null,
  queryClient: QueryClient,
  activeUserId?: string,
) {
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
          const index = group.notifies.findIndex((oldNotify) => oldNotify.id === newNotify.id);

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
