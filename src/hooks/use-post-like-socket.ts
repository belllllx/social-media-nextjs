import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/providers/socket-io-provider";
import { IPost } from "@/utils/types";
import { InfiniteData, QueryClient } from "@tanstack/react-query";
import { isEqual } from "lodash";
import { useEffect } from "react";
import { Socket } from "socket.io-client";

export function usePostLikeSocket(
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null,
  queryClient: QueryClient,
) {
  useEffect(() => {
    socket?.on("newLike", (like) => {
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
            if(!page.posts.some((prevPost) => prevPost.id === like.postId)){
              return page;
            }

            return {
              ...page,
              posts: page.posts.map((post) => {
                // ไม่ใข่ post target ข้าม
                if(post.id !== like.postId){
                  return post;
                }

                // แก้เฉพาะ target
                const copyPost = {
                  ...post,
                  likes: [...post.likes],
                }
                const index = copyPost.likes.findIndex((prevLike) =>
                  isEqual(prevLike, like)
                );
                if (index !== -1) {
                  copyPost.likes.splice(index, 1);
                } else {
                  copyPost.likes.unshift(like);
                }

                return copyPost;
              }),
            };
          }),
        };
      });
    });

    return () => {
      socket?.off("newLike");
    };
  }, [socket, queryClient]);
}
