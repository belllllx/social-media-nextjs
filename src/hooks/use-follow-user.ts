import { callApi } from "@/utils/helpers/call-api";
import { formatToastMessages } from "@/utils/helpers/format-toast-messages";
import { ICommonResponse, IFollower, IUser } from "@/utils/types";
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
    mutationFn: async ({ activeUser, targetUser }) => {
      setDisabled(true);
      await new Promise((resolve) => setTimeout(() => resolve(undefined), 300));
      const res = await callApi(
        "post",
        `user/follow/${activeUser.id}/${targetUser.id}`
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

      const followerData: {
        follower: {
          follower: IUser;
          following: IUser;
        } & IFollower;
      } = {
        follower: {
          id: -1,
          createdAt: new Date(),
          updatedAt: new Date(),
          followerId: activeUser.id,
          followingId: targetUser.id,
          follower: activeUser,
          following: {
            ...targetUser,
            followers: [{
              id: -1,
              createdAt: new Date(),
              updatedAt: new Date(),
              followerId: activeUser.id,
              followingId: targetUser.id,
              follower: activeUser,
            }],
          },
        },
      }

      queryClient.setQueryData<
        InfiniteData<{
          users: IUser[];
          nextCursor: string | null;
        }>
      >(["usersSuggest"], (oldUsersSuggest) => {
        if (!oldUsersSuggest) {
          return undefined;
        }

        return {
          ...oldUsersSuggest,
          pages: oldUsersSuggest.pages.map((page) => {
            return {
              ...page,
              users: page.users.map(
                (oldUserSuggest) => {
                  // Ignore user not target
                  if (oldUserSuggest.id !== targetUser.id) {
                    return oldUserSuggest;
                  }

                  // UnFollow
                  if (
                    oldUserSuggest.followers.some((follower) =>
                      follower.followerId === activeUser.id
                    )
                  ) {
                    return {
                      ...oldUserSuggest,
                      followers: oldUserSuggest.followers.filter(
                        (follower) =>
                          follower.followerId !== activeUser.id
                      ),
                    };
                  }

                  // Follow
                  return {
                    ...oldUserSuggest,
                    followers: [
                      followerData.follower, ...oldUserSuggest.followers
                    ],
                  };
                }
              ),
            };
          }),
        };
      });

      queryClient.setQueryData<IUser>(["profile"], (oldUser) => {
        if (!oldUser) {
          return undefined;
        }

        const updateFollowingUser: IUser = {
          ...oldUser,
          followings: oldUser.followings.some((following) => following.followingId === targetUser.id)
            ?
            oldUser.followings.filter((following) => following.followingId !== targetUser.id)
            :
            [followerData.follower, ...oldUser.followings],
        }

        return updateFollowingUser;
      });

      queryClient.setQueryData<IUser>(["user", targetUser.id], (oldUser) => {
        if (!oldUser) {
          return undefined;
        }

        return {
          ...oldUser,
          followers: oldUser.followers.some(
            (follower) => follower.followerId === activeUser.id
          )
            ?
            oldUser.followers.filter((follower) => follower.followerId !== activeUser.id)
            :
            [followerData.follower, ...oldUser.followers],
        }
      });

      queryClient.setQueryData<IUser>(["user", activeUser.id], (oldUser) => {
        if (!oldUser) {
          return undefined;
        }

        return {
          ...oldUser,
          followers: oldUser.followers.map((follower) => {
            // แก้เฉพาะคนที่เรากำลังกด follow or unfollow
            if (
              follower.followingId === activeUser.id
              &&
              follower.followerId === targetUser.id
            ) {
              const { follower: f } = follower;

              return {
                ...follower,
                follower: {
                  ...f,
                  followers:
                    f.followers.some((follower) => follower.followerId === activeUser.id)
                      ?
                      f.followers.filter((follower) => follower.followerId !== activeUser.id)
                      :
                      [followerData.follower, ...f.followers],
                },
              }
            }

            return follower;
          }),
          followings: oldUser.followings.some((following) => following.followingId === targetUser.id)
            ?
            oldUser.followings.filter((following) => following.followingId !== targetUser.id)
            :
            [followerData.follower, ...oldUser.followings],
        }
      });

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
    onSettled: (data) => {
      if (!data) {
        return;
      }

      const followerData = data.data as {
        follower: {
          follower: IUser;
          following: IUser;
        } & IFollower
      }

      queryClient.invalidateQueries({ queryKey: ["usersSuggest"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["user", followerData.follower.followingId] });
      queryClient.invalidateQueries({ queryKey: ["user", followerData.follower.followerId] });
    },
  });

  return {
    handleFollowUser,
    disabled,
  }
}