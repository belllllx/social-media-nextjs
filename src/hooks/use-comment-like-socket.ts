import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/providers/socket-io-provider";
import { IComment } from "@/utils/types";
import { InfiniteData, QueryClient } from "@tanstack/react-query";
import { isEqual } from "lodash";
import { useEffect } from "react";
import { Socket } from "socket.io-client";

export function useCommentLikeSocket(
  postId: string,
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null,
  queryClient: QueryClient,
) {
  useEffect(() => {
    socket?.on("newLikeComment", (like) => {
      queryClient.setQueryData<
        InfiniteData<{ comments: IComment[]; nextCursor: string | null }>
      >(["comments", postId], (oldComments) => {
        if (!oldComments) {
          return undefined;
        }

        return {
          ...oldComments,
          pages: oldComments.pages.map((page) => {
            // ถ้าไม่ใข่ page ที่กด like comment และ reply ข้าม
            if (
              !page.comments.some(
                (prevComment) => prevComment.id === like.commentId,
              ) &&
              !page.comments.some((prevComment) =>
                prevComment.replies.some(
                  (reply) => reply.id === like.commentId,
                ),
              )
            ) {
              return page;
            }

            return {
              ...page,
              comments: page.comments.map((comment) => {
                // กรณี reply
                // ถ้าเป็น comment ของ reply ที่ like
                if (
                  comment.replies.some((reply) => reply.id === like.commentId)
                ) {
                  const updateReplyCommentLike: IComment = {
                    ...comment,
                    replies: comment.replies.map((reply) => {
                      // ถ้าไม่ใช่ reply ที่ like ข้าม
                      if (reply.id !== like.commentId) {
                        return reply;
                      }

                      const copyReply: IComment = {
                        ...reply,
                        likes: [...reply.likes],
                      };
                      const index = copyReply.likes.findIndex(
                        (prevLike) => prevLike.id === like.id,
                      );
                      if (index !== -1) {
                        copyReply.likes.splice(index, 1);
                      } else {
                        copyReply.likes.unshift(like);
                      }

                      return copyReply;
                    }),
                  };

                  return updateReplyCommentLike;
                }

                // กรณี comment ปกติ
                // ไม่ใข่ comment target ข้าม
                if (comment.id !== like.commentId) {
                  return comment;
                }

                // แก้เฉพาะ target
                const copyComment = {
                  ...comment,
                  likes: [...comment.likes],
                };
                const index = copyComment.likes.findIndex((prevLike) =>
                  isEqual(prevLike, like),
                );
                if (index !== -1) {
                  copyComment.likes.splice(index, 1);
                } else {
                  copyComment.likes.unshift(like);
                }

                return copyComment;
              }),
            };
          }),
        };
      });
    });

    return () => {
      socket?.off("newLikeComment");
    };
  }, [socket, queryClient]);
}
