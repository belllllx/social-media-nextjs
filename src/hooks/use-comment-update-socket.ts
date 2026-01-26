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
          pages: oldComments.pages.map((page) => {
            // ถ้า page นั้น ไม่มี comment หรือ reply ที่ update ให้ข้าม
            if (
              !page.comments.some(
                (comment) => comment.id === updatedComment.id,
              ) &&
              !page.comments.some((comment) =>
                comment.replies.some((reply) => reply.id === updatedComment.id),
              )
            ) {
              return page;
            }

            // page target
            return {
              ...page,
              comments: page.comments.map((comment) => {
                // กรณีเป็น reply
                if (updatedComment.parent && updatedComment.parentId) {
                  // ไม่ใช่ comment ที่ reply ข้าม
                  if (
                    !comment.replies.some(
                      (reply) => reply.id === updatedComment.id,
                    )
                  ) {
                    return comment;
                  }

                  const updatedReplyComment: IComment = {
                    ...comment,
                    replies: [
                      ...comment.replies.map((reply) =>
                        reply.id === updatedComment.id ? updatedComment : reply,
                      ),
                    ],
                  };

                  return updatedReplyComment;
                }

                // กรณีเป็น comment ปกติ
                // ไม่ใช้ comment target ข้าม
                if (comment.id !== updatedComment.id) {
                  return comment;
                }

                const newUpdateComment: IComment = {
                  ...updatedComment,
                };

                return newUpdateComment;
              }),
            };
          }),
        };
      });
    });

    return () => {
      socket?.off("updateComment");
    };
  }, [socket, queryClient]);
}
