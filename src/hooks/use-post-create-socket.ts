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
  queryClient: QueryClient,
) {
  useEffect(() => {
    socket?.on("newPost", (newPost) => {
      queryClient.setQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts"], (oldPosts) => {
        if (!oldPosts) {
          return undefined;
        }
        const firstPage = oldPosts.pages[0];

        const isExist = firstPage.posts.some((prevPost) => prevPost.id === newPost.id);

        const newFirstPage = {
          ...firstPage,
          posts: !isExist ? [newPost, ...firstPage.posts] : firstPage.posts,
        };

        return {
          ...oldPosts,
          pages: [newFirstPage, ...oldPosts.pages.slice(1)],
        };
      });

      queryClient.setQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts", newPost.userId], (oldPosts) => {
        if (!oldPosts) {
          return undefined;
        }
        const firstPage = oldPosts.pages[0];

        const isExist = firstPage.posts.some((prevPost) => prevPost.id === newPost.id);

        const newFirstPage = {
          ...firstPage,
          posts: !isExist ? [newPost, ...firstPage.posts] : firstPage.posts,
        };

        return {
          ...oldPosts,
          pages: [newFirstPage, ...oldPosts.pages.slice(1)],
        };
      });
    });

    return () => {
      socket?.off("newPost");
    };
  }, [socket, queryClient]);
}
