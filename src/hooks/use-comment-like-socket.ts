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
            // ไม่ใข่ page target ข้าม
            if(!page.comments.some((prevComment) => prevComment.id === like.commentId)){
              return page;
            }

            return {
              ...page,
              comments: page.comments.map((comment) => {
                // ไม่ใข่ post target ข้าม
                if(comment.id !== like.commentId){
                  return comment;
                }

                // แก้เฉพาะ target
                const copyComment = {
                  ...comment,
                  likes: [...comment.likes],
                }
                const index = copyComment.likes.findIndex((prevLike) =>
                  isEqual(prevLike, like)
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
