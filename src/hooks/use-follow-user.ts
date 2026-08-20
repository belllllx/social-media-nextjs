import { callApi } from "@/utils/helpers/call-api";
import { formatToastMessages } from "@/utils/helpers/format-toast-messages";
import { ICommonResponse, IUser } from "@/utils/types";
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";

interface MutationType {
  activeUser: IUser;
  targetUser: IUser;
}

export function useFollowUser() {
  const queryClient = useQueryClient();

  const [disabled, setDisabled] = useState(false);

  const handleFollowUser = useMutation<
    ICommonResponse,
    Error,
    MutationType,
    {
      prevUsersSuggest?: InfiniteData<{ users: IUser[]; nextCursor: string | null; }>;
      prevProfile?: IUser;
      prevUserTarget?: IUser;
      prevUserActive?: IUser;
    }
  >({
    mutationFn: async ({ targetUser }) => {
      setDisabled(true);
      await new Promise((resolve) => setTimeout(() => resolve(undefined), 500));
      const res = await callApi(
        "post",
        `user/toggle-follow/${targetUser.id}`
      ).finally(() => setDisabled(false));
      if (!res.success) {
        toast.error(formatToastMessages(res.message));
        return res;
      }

      toast.success(formatToastMessages(res.message));
      return res;
    },
    onMutate: async ({ activeUser, targetUser }) => {
      await queryClient.cancelQueries({ queryKey: ["usersSuggest"] });
      await queryClient.cancelQueries({ queryKey: ["profile"] });
      await queryClient.cancelQueries({ queryKey: ["user", targetUser.id] });
      await queryClient.cancelQueries({ queryKey: ["user", activeUser.id] });

      const prevUsersSuggest = queryClient.getQueryData<
        InfiniteData<{ users: IUser[]; nextCursor: string | null; }>
      >(["usersSuggest"]);
      const prevProfile = queryClient.getQueryData<IUser>(["profile"]);
      const prevUserTarget = queryClient.getQueryData<IUser>(["user", targetUser.id]);
      const prevUserActive = queryClient.getQueryData<IUser>(["user", activeUser.id]);

      return {
        prevUsersSuggest,
        prevProfile,
        prevUserTarget,
        prevUserActive,
      }
    },
    onError: (error, { activeUser, targetUser }, context) => {
      if (
        !context
        ||
        !context.prevUsersSuggest
        ||
        !context.prevProfile
        ||
        !context.prevUserTarget
        ||
        !context.prevUserActive
      ) {
        return;
      }

      queryClient.setQueryData<
        InfiniteData<{ users: IUser[]; nextCursor: string | null; }>
      >(["usersSuggest"], context.prevUsersSuggest);
      queryClient.setQueryData<IUser>(["profile"], context.prevProfile);
      queryClient.setQueryData<IUser>(["user", targetUser.id], context.prevUserTarget);
      queryClient.setQueryData<IUser>(["user", activeUser.id], context.prevUserActive);
    },
    // onSettled: (data) => {
    //   if (!data) {
    //     return;
    //   }

    //   const followerData = data.data as {
    //     follower: {
    //       follower: IUser;
    //       following: IUser;
    //     } & IFollower
    //   }

    //   queryClient.invalidateQueries({ queryKey: ["usersSuggest"] });
    //   queryClient.invalidateQueries({ queryKey: ["profile"] });
    //   queryClient.invalidateQueries({ queryKey: ["user", followerData.follower.followingId] });
    //   queryClient.invalidateQueries({ queryKey: ["user", followerData.follower.followerId] });
    // },
  });

  return {
    handleFollowUser,
    disabled,
  }
}