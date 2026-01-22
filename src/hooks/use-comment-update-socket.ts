import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/providers/socket-io-provider";
import { IComment } from "@/utils/types";
import { InfiniteData, QueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Socket } from "socket.io-client";

export function useCommentUpdateSocket(
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null,
  queryClient: QueryClient,
) {
  useEffect(() => {
    socket?.on("updateComment", (updatedComment) => {
      queryClient.setQueryData<
        InfiniteData<{ comments: IComment[]; nextCursor: string | null }>
      >(["comments", updatedComment.postId], (oldComments) => {
        if (!oldComments) {
          return undefined;
        }

        return {
          ...oldComments,
          pages: oldComments.pages.map((page) => ({
            ...page,
            comments: page.comments.map((comment) => {
              // ไม่ใช้ comment target ข้าม
              if(comment.id !== updatedComment.id){
                return comment;
              }

              const newUpdateComment: IComment = {
                ...updatedComment,
              }

              return newUpdateComment;
            }),
          })),
        };
      });
    });

    return () => {
      socket?.off("updateComment");
    };
  }, [socket, queryClient]);
}
