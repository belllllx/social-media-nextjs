import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/providers/socket-io-provider";
import { IPost } from "@/utils/types";
import { InfiniteData, QueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Socket } from "socket.io-client";

export function usePostCreateSocket(
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null,
  queryClient: QueryClient
) {
  useEffect(() => {
    socket?.on("createPost", (newPost) => {
      queryClient.setQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts"], (oldPosts) => {
        if (!oldPosts || !oldPosts.pages.length) {
          return undefined;
        }
        const firstPage = oldPosts.pages[0];

        const newFirstPage = {
          ...firstPage,
          posts: [newPost, ...firstPage.posts],
        };

        return {
          ...oldPosts,
          pages: [newFirstPage, ...oldPosts.pages.slice(1)],
        };
      });
    });

    return () => {
      socket?.off("createPost");
    };
  }, [socket, queryClient]);
}
