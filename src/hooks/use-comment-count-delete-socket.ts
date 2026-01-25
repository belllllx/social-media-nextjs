import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/providers/socket-io-provider";
import { IComment, IPost } from "@/utils/types";
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
            // ถ้าไม่ใช้ post target ข้าม
            if (!page.posts.some((post) => post.id === deleteComment.postId)) {
              return page;
            }

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

      queryClient.setQueryData<
        InfiniteData<{ comments: IComment[]; nextCursor: string | null }>
      >(["comments", deleteComment.postId], (oldComments) => {
        if (!oldComments) {
          return undefined;
        }

        return {
          ...oldComments,
          pages: oldComments.pages.map((page) => {
            // ไม่ใช่ page target ข้าม
            if (
              !page.comments.some(
                (comment) => comment.id === deleteComment.parentId,
              )
            ) {
              return page;
            }

            return {
              ...page,
              comments: page.comments.map((comment) => {
                // ถ้าไม่ใช่ comment ที่ reply ข้าม
                if (comment.id !== deleteComment.parentId) {
                  return comment;
                }

                const updateComment = {
                  ...comment,
                  replysCount: comment.replysCount - 1,
                };

                return updateComment;
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
