import { callApi } from "@/utils/helpers/call-api";
import { IUser } from "@/utils/types";
import { useQuery } from "@tanstack/react-query";

export function useUserById(userId: string) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const res = await callApi("get", `user/find/${userId}`);
      if (!res.success) {
        return Promise.reject(res);
      }

      return res.data as unknown as IUser;
    },
  });
}