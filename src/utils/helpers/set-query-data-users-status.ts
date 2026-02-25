import { QueryClient } from "@tanstack/react-query";
import { OnlineUsers } from "../types";

export function setQueryDataUsersStatus(queryClient: QueryClient, users: OnlineUsers[]) {
  queryClient.setQueryData<OnlineUsers[]>(["onlineUsers"], (oldOnlineUsers) => {
    if (!oldOnlineUsers) {
      return undefined;
    }

    return oldOnlineUsers.map((oldOnlineUser) => {
      if(users.includes(oldOnlineUser)){
        const index = users.indexOf(oldOnlineUser);
        return index !== -1 ? users[index] : oldOnlineUser;
      }
      return oldOnlineUser;
    });
  });
}
