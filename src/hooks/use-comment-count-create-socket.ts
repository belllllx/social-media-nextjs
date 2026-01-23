import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/providers/socket-io-provider";
import { IComment, IPost } from "@/utils/types";
import { InfiniteData, QueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Socket } from "socket.io-client";

export function useCommentCountCreateSocket(
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null,
  queryClient: QueryClient,
) {
  useEffect(() => {
    socket?.on("createComment", (newComment) => {
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
                if (post.id !== newComment.postId) {
                  return post;
                }

                // ถ้าเป็น create reply มา ไม่ count
                if(newComment.parentId){
                  return post;
                }

                const updatePost = {
                  ...post,
                  commentsCount: post.commentsCount + 1,
                };

                return updatePost;
              }),
            };
          }),
        };
      });

      queryClient.setQueryData<
        InfiniteData<{ comments: IComment[]; nextCursor: string | null }>
      >(["comments", newComment.postId], (oldComments) => {
        if (!oldComments) {
          return undefined;
        }

        return {
          ...oldComments,
          pages: oldComments.pages.map((page) => {
            return {
              ...page,
              comments: page.comments.map((comment) => {
                // ถ้าไม่ใช่ comment ที่ reply ข้าม
                if (comment.id !== newComment.parentId) {
                  return comment;
                }

                const updateComment = {
                  ...comment,
                  replysCount: comment.replysCount + 1,
                };

                return updateComment;
              }),
            };
          }),
        };
      });
    });

    return () => {
      socket?.off("createComment");
    };
  }, [socket, queryClient]);
}
