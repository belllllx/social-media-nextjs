import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/providers/socket-io-provider";
import { IComment } from "@/utils/types";
import { InfiniteData, QueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Socket } from "socket.io-client";

export function useCommentCreateSocket(
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null,
  queryClient: QueryClient,
) {
  useEffect(() => {
    socket?.on("createComment", (newComment) => {
      queryClient.setQueryData<
        InfiniteData<{ comments: IComment[]; nextCursor: string | null }>
      >(["comments", newComment.postId], (oldComments) => {
        if (!oldComments) {
          return undefined;
        }

        const firstPage = oldComments.pages[0];

        const newFirstPage = {
          ...firstPage,
          comments: [newComment, ...firstPage.comments],
        };

        return {
          ...oldComments,
          pages: [newFirstPage, ...oldComments.pages.slice(1)],
        };
      });
    });

    return () => {
      socket?.off("createComment");
    };
  }, [socket, queryClient]);
}
