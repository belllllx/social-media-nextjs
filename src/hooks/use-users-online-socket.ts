import { useSocketIo } from "@/providers/socket-io-provider";
import { OnlineUsers } from "@/utils/types";
import { QueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useUsersOnlineSocket(userId: string | undefined, queryClient: QueryClient) {
  const { socket } = useSocketIo();

  useEffect(() => {
    socket?.on("activeUsers", (users) => {
      if (!userId) {
        return;
      };
      const filterUsers = users.filter((user) => user.id !== userId);
      queryClient.setQueryData<OnlineUsers[]>(["onlineUsers"], filterUsers);
    });

    return () => {
      socket?.off("activeUsers");
    };
  }, [socket, queryClient, userId]);
}
