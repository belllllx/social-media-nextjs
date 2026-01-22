import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/providers/socket-io-provider";
import { IPost } from "@/utils/types";
import { InfiniteData, QueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Socket } from "socket.io-client";

export function usePostUpdateSocket(
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null,
  queryClient: QueryClient,
) {
  useEffect(() => {
    socket?.on("updatePost", (updatePost) => {
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
            if (!page.posts.some((prevPost) => prevPost.id === updatePost.id)) {
              return page;
            }

            return {
              ...page,
              posts: page.posts.map((post) => {
                // ไม่ใข่ post target ข้าม
                if (
                  post.id !== updatePost.id &&
                  post.parentId !== updatePost.id
                ) {
                  return post;
                }

                // แก้เฉพาะ target
                if (post.parentId === updatePost.id) {
                  const newUpdateParentPost: IPost = {
                    ...post,
                    parent: {
                      ...updatePost,
                      message: updatePost.message,
                      filesUrl: [...(updatePost.filesUrl ?? [])],
                    },
                  };

                  return newUpdateParentPost;
                }

                const newUpdatePost: IPost = {
                  ...updatePost,
                  message: updatePost.message,
                  filesUrl: [...(updatePost.filesUrl ?? [])],
                };

                return newUpdatePost;
              }),
            };
          }),
        };
      });
    });

    return () => {
      socket?.off("updatePost");
    };
  }, [socket, queryClient]);
}
