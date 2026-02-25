import { OnlineUsers } from "@/utils/types";
import { useQuery } from "@tanstack/react-query";

export function useUsersOnline() {
  return useQuery<OnlineUsers[]>({
    queryKey: ["onlineUsers"],
    queryFn: () => [],
  });
}