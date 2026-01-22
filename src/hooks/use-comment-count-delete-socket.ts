import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/providers/socket-io-provider";
import { IPost } from "@/utils/types";
import { InfiniteData, QueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Socket } from "socket.io-client";

export function useCommentCountDeleteSocket(
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null,
  queryClient: QueryClient,
) {
  useEffect(() => {
    socket?.on("deleteComment", (deleteComment) => {
      queryClient.setQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts"], (oldPosts) => {
        if (!oldPosts) {
          return undefined;
        }

        return {
          ...oldPosts,
          pages: oldPosts.pages.map((page) => {
            return {
              ...page,
              posts: page.posts.map((post) => {
                // ถ้าไม่ใช่ post ที่ comment ให้ข้าม
                if (post.id !== deleteComment.postId) {
                  return post;
                }

                const updatePost = {
                  ...post,
                  commentsCount: post.commentsCount - 1,
                };

                return updatePost;
              }),
            };
          }),
        };
      });
    });

    return () => {
      socket?.off("deleteComment");
    };
  }, [socket, queryClient]);
}
