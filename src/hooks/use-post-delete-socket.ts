import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/providers/socket-io-provider";
import { replace } from "@/utils/helpers/router";
import { IPost } from "@/utils/types";
import { InfiniteData, QueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Socket } from "socket.io-client";

export function usePostDeleteSocket(
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null,
  queryClient: QueryClient,
) {
  const pathname = usePathname();

  useEffect(() => {
    socket?.on("deletePost", (deletePost) => {
      queryClient.setQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts"], (oldPosts) => {
        if (!oldPosts) {
          return undefined;
        }

        return {
          ...oldPosts,
          pages: oldPosts.pages.map((page) => {
            // ไม่ใข่ page target ข้าม
            if (!page.posts.some((prevPost) => prevPost.id === deletePost.id)) {
              return page;
            }

            return {
              ...page,
              posts: page.posts.filter((post) => post.id !== deletePost.id && post.parentId !== deletePost.id),
            };
          }),
        };
      });

      queryClient.setQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts", deletePost.userId], (oldPosts) => {
        if (!oldPosts) {
          return undefined;
        }

        return {
          ...oldPosts,
          pages: oldPosts.pages.map((page) => {
            // ไม่ใข่ page target ข้าม
            if (!page.posts.some((prevPost) => prevPost.id === deletePost.id)) {
              return page;
            }

            return {
              ...page,
              posts: page.posts.filter((post) => post.id !== deletePost.id && post.parentId !== deletePost.id),
            };
          }),
        };
      });

      queryClient.removeQueries({ queryKey: ["post", deletePost.id] });
      if (pathname.startsWith("/post")) {
        replace("/feed");
      }
    });

    return () => {
      socket?.off("deletePost");
    };
  }, [socket, queryClient, pathname]);
}
