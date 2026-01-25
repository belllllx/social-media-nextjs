import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/providers/socket-io-provider";
import { IComment } from "@/utils/types";
import { InfiniteData, QueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Socket } from "socket.io-client";

export function useCommentDeleteSocket(
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null,
  queryClient: QueryClient,
) {
  useEffect(() => {
    socket?.on("deleteComment", (deleteComment) => {
      queryClient.setQueryData<
        InfiniteData<{ comments: IComment[]; nextCursor: string | null }>
      >(["comments", deleteComment.postId], (oldComments) => {
        if (!oldComments) {
          return undefined;
        }

        return {
          ...oldComments,
          pages: oldComments.pages.map((page) => {
            // กรณี comment ปกติ
            if (!deleteComment.parent && !deleteComment.parentId) {
              // ถ้าไม่ใช่ page ที่มี comment ที่จะลบให้ข้าม
              if (
                !page.comments.some(
                  (comment) => comment.id === deleteComment.id,
                )
              ) {
                return page;
              }

              return {
                ...page,
                comments: page.comments.filter(
                  (comment) => comment.id !== deleteComment.id,
                ),
              };
            }

            // กรณี reply
            // ถ้าไม่ใช่ page ที่มี reply ที่จะลบให้ข้าม
            if (
              !page.comments.some((comment) => comment.replies.some((reply) => reply.id === deleteComment.id))
            ) {
              return page;
            }

            return {
              ...page,
              comments: page.comments.map((comment) => {
                // ถ้าไม่ใช่ comment ที่ reply ข้าม
                if (
                  !comment.replies.some(
                    (reply) => reply.id === deleteComment.id,
                  )
                ) {
                  return comment;
                }

                const deletedReplyComment: IComment = {
                  ...comment,
                  replies: [
                    ...comment.replies.filter(
                      (reply) => reply.id !== deleteComment.id,
                    ),
                  ],
                };

                return deletedReplyComment;
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
