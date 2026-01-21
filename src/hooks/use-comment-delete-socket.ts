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
  queryClient: QueryClient
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
            return {
              ...page,
              comments: page.comments.filter((comment) => comment.id !== deleteComment.id && comment.parentId !== deleteComment.id),
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
