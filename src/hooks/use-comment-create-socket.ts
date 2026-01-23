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

        // ถ้าเป็น reply comment
        if (newComment.parent && newComment.parentId) {
          return {
            ...oldComments,
            pages: oldComments.pages.map((page) => {
              // ไม่ใช่ page ที่ reply comment ข้าม
              if (
                !page.comments.some(
                  (comment) => comment.id === newComment.parentId,
                )
              ) {
                return page;
              }

              return {
                ...page,
                comments: page.comments.map((comment) => {
                  // ไม่ใช่ comment ที่ reply ข้าม
                  if (comment.id !== newComment.parentId) {
                    return comment;
                  }

                  const copyReplies = [...comment.replies];
                  copyReplies.unshift(newComment);

                  const updateCommentReply: IComment = {
                    ...comment,
                    replies: copyReplies,
                  };

                  return updateCommentReply;
                }),
              };
            }),
          };
        }

        // เป็น comment ปกติ
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
