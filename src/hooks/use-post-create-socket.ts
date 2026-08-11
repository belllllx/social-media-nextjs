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
    socket?.on("newPost", async (newPost) => {
      const updateNewPost: IPost = {
        ...newPost,
        commentsCount: 0,
        likes: [],
      }

      queryClient.setQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts"], (oldPosts) => {
        if (!oldPosts) {
          return undefined;
        }
        const firstPage = oldPosts.pages[0];

        const newFirstPage = {
          ...firstPage,
          posts: [updateNewPost, ...firstPage.posts],
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

        const newFirstPage = {
          ...firstPage,
          posts: [updateNewPost, ...firstPage.posts],
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
