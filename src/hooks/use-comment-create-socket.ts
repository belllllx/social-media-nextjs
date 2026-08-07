import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/providers/socket-io-provider";
import { IComment, IPost } from "@/utils/types";
import { InfiniteData, QueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Socket } from "socket.io-client";

export function useCommentCreateSocket(
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null,
  queryClient: QueryClient,
) {
  useEffect(() => {
    socket?.on("newComment", (newComment) => {
      queryClient.setQueryData<
        InfiniteData<{ comments: IComment[]; nextCursor: string | null }>
      >(["comments", newComment.postId], (oldComments) => {
        if (!oldComments) {
          return undefined;
        }

        // ถ้าเป็น reply comment
        if (newComment.parentId) {
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

                  const isExistReply = comment.replies.some((prevReply) => prevReply.id === newComment.id)

                  const copyReplies = [...comment.replies];
                  copyReplies.unshift({
                    ...newComment,
                    likes: [],
                  });

                  const updateCommentReply: IComment = {
                    ...comment,
                    replies: copyReplies,
                  };

                  return !isExistReply ? updateCommentReply : { ...comment };
                }),
              };
            }),
          };
        }

        // เป็น comment ปกติ
        const firstPage = oldComments.pages[0];

        const isExistComment = firstPage.comments.some((prevComment) => prevComment.id === newComment.id)

        const updateNewComment: IComment & {
          post: IPost;
        } = {
          ...newComment,
          likes: [],
        }
        const newFirstPage = {
          ...firstPage,
          comments: [updateNewComment, ...firstPage.comments],
        };

        return {
          ...oldComments,
          pages: !isExistComment ? [newFirstPage, ...oldComments.pages.slice(1)] : [...oldComments.pages],
        };
      });
    });

    return () => {
      socket?.off("newComment");
    };
  }, [socket, queryClient]);
}
