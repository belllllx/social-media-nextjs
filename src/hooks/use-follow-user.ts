import { callApi } from "@/utils/helpers/call-api";
import { formatToastMessages } from "@/utils/helpers/format-toast-messages";
import { IFollower, IUser } from "@/utils/types";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { isEqual } from "lodash";
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

          const followerData = res.data as { follower: IFollower };

          queryClient.setQueryData<
            InfiniteData<{
              users: (IUser & { followers: IFollower[] })[];
              nextCursor: string | null;
            }>
          >(["usersSuggest"], (oldUsersSuggest) => {
            if (!oldUsersSuggest) {
              return undefined;
            }

            return {
              ...oldUsersSuggest,
              pages: oldUsersSuggest.pages.map((group) => {
                return {
                  ...group,
                  users: group.users.map(
                    (
                      userSuggest: IUser & {
                        followers: IFollower[];
                      }
                    ) => {
                      // Ignore user not target
                      if (userSuggest.id !== followerData.follower.followingId) {
                        return userSuggest;
                      }

                      // UnFollow
                      if (
                        userSuggest.followers.some((follower) =>
                          isEqual(follower, followerData.follower)
                        )
                      ) {
                        return {
                          ...userSuggest,
                          followers: userSuggest.followers.filter(
                            (follower) =>
                              !isEqual(follower, followerData.follower)
                          ),
                        };
                      }

                      // Follow
                      if (
                        userSuggest.followers.every(
                          (follower) => !isEqual(follower, followerData.follower)
                        )
                      ) {
                        return {
                          ...userSuggest,
                          followers: [
                            ...userSuggest.followers,
                            followerData.follower,
                          ],
                        };
                      }

                      return userSuggest;
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
              followings: oldUser.followings.some((following) => isEqual(following, followerData.follower))
                ?
                oldUser.followings.filter((following) => !isEqual(following, followerData.follower))
                :
                [...oldUser.followings, followerData.follower],
            }

            return updateFollowingUser;
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