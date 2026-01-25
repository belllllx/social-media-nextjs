import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/providers/socket-io-provider";
import { IComment } from "@/utils/types";
import { InfiniteData, QueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Socket } from "socket.io-client";

export function useReplyCountDeleteSocket(
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null,
  queryClient: QueryClient,
) {
  useEffect(() => {
    socket?.on("deleteReplyComment", (deleteComment) => {
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
      socket?.off("deleteReplyComment");
    };
  }, [socket, queryClient]);
}
