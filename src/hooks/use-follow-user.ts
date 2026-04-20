import { callApi } from "@/utils/helpers/call-api";
import { formatToastMessages } from "@/utils/helpers/format-toast-messages";
import { IFollower, IUser } from "@/utils/types";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";

export function useFollowUser() {
  const queryClient = useQueryClient();

  const [disabled, setDisabled] = useState(false);

  const handleFollowUser = useCallback(
    async (
      activeUserId: string,
      targetUserId: string,
    ) => {
      setDisabled(true);
      try {
        await new Promise((resolve) => setTimeout(() => resolve(undefined), 300));
        const res = await callApi(
          "post",
          `user/follow/${activeUserId}/${targetUserId}`
        ).finally(() => {
          setDisabled(false);
        });
        if (!res.success) {
          toast.error(formatToastMessages(res.message));
        } else {
          toast.success(formatToastMessages(res.message));

          const followerData = res.data as {
            follower: {
              follower: IUser;
              following: IUser;
            } & IFollower
          };

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
                      if (oldUserSuggest.id !== followerData.follower.followingId) {
                        return oldUserSuggest;
                      }

                      // UnFollow
                      if (
                        oldUserSuggest.followers.some((follower) =>
                          follower.followerId === followerData.follower.followerId
                        )
                      ) {
                        return {
                          ...oldUserSuggest,
                          followers: oldUserSuggest.followers.filter(
                            (follower) =>
                              follower.followerId !== followerData.follower.followerId
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
              followings: oldUser.followings.some((following) => following.followingId === followerData.follower.followingId)
                ?
                oldUser.followings.filter((following) => following.followingId !== followerData.follower.followingId)
                :
                [followerData.follower, ...oldUser.followings],
            }

            return updateFollowingUser;
          });

          queryClient.setQueryData<IUser>(["user", targetUserId], (oldUser) => {
            if (!oldUser) {
              return undefined;
            }

            return {
              ...oldUser,
              followers: oldUser.followers.some(
                (follower) => follower.followerId === activeUserId
              )
                ?
                oldUser.followers.filter((follower) => follower.followerId !== activeUserId)
                :
                [followerData.follower, ...oldUser.followers],
            }
          });

          queryClient.setQueryData<IUser>(["user", activeUserId], (oldUser) => {
            if (!oldUser) {
              return undefined;
            }

            return {
              ...oldUser,
              followers: oldUser.followers.map((follower) => {
                // แก้เฉพาะคนที่เรากำลังกด follow or unfollow
                if (
                  follower.followingId === activeUserId
                  &&
                  follower.followerId === targetUserId
                ) {
                  const { follower: f } = follower;

                  return {
                    ...follower,
                    follower: {
                      ...f,
                      followers:
                        f.followers.some((follower) => follower.followerId === activeUserId)
                          ?
                          f.followers.filter((follower) => follower.followerId !== activeUserId)
                          :
                          [followerData.follower, ...f.followers],
                    },
                  }
                }

                return follower;
              }),
              followings: oldUser.followings.some((following) => following.followingId === targetUserId)
                ?
                oldUser.followings.filter((following) => following.followingId !== targetUserId)
                :
                [followerData.follower, ...oldUser.followings],
            }
          });
        }
      } catch (error) {
        console.error("Failed to follow or unfollow", error);
      }
    },
    [queryClient]
  );

  return {
    handleFollowUser,
    disabled,
  }
}