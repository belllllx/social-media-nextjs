import { ClientToServerEvents, ServerToClientEvents } from "@/providers/socket-io-provider";
import { IUser } from "@/utils/types";
import { QueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Socket } from "socket.io-client";

export function useFollowUserSocket(
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null,
  queryClient: QueryClient,
) {
  useEffect(() => {
    socket?.on("follow", (follow) => {
      queryClient.setQueryData<IUser>(["profile"], (oldUser) => {
        if (!oldUser) {
          return undefined;
        }

        const updateFollowingUser: IUser = {
          ...oldUser,
          followings: oldUser.followings.some((following) => following.followingId === follow.followingId)
            ?
            oldUser.followings.filter((following) => following.followingId !== follow.followingId)
            :
            [follow, ...oldUser.followings],
        }

        return updateFollowingUser;
      });

      queryClient.setQueryData<IUser>(["user", follow.followingId], (oldUser) => {
        if (!oldUser) {
          return undefined;
        }

        return {
          ...oldUser,
          followers: oldUser.followers.some(
            (follower) => follower.followerId === follow.followerId
          )
            ?
            oldUser.followers.filter((follower) => follower.followerId !== follow.followerId)
            :
            [follow, ...oldUser.followers],
        }
      });

      queryClient.setQueryData<IUser>(["user", follow.followerId], (oldUser) => {
        if (!oldUser) {
          return undefined;
        }

        return {
          ...oldUser,
          followers: oldUser.followers.map((follower) => {
            // แก้เฉพาะคนที่เรากำลังกด follow or unfollow
            if (
              follower.followingId === follow.followerId
              &&
              follower.followerId === follow.followingId
            ) {
              const { follower: f } = follower;

              return {
                ...follower,
                follower: {
                  ...f,
                  followers:
                    f.followers.some((follower) => follower.followerId === follow.followerId)
                      ?
                      f.followers.filter((follower) => follower.followerId !== follow.followerId)
                      :
                      [follow, ...f.followers],
                },
              }
            }

            return follower;
          }),
          followings: oldUser.followings.some((following) => following.followingId === follow.followingId)
            ?
            oldUser.followings.filter((following) => following.followingId !== follow.followingId)
            :
            [follow, ...oldUser.followings],
        }
      });
    });

    return () => {
      socket?.off("follow");
    };
  }, [socket, queryClient]);
}