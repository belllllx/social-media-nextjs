import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/providers/socket-io-provider";
import { IComment, IPost } from "@/utils/types";
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
            if (
              page.comments.some(
                (comment) => comment.id === deleteComment.id,
              )
            ) {
              return {
                ...page,
                comments: page.comments.filter(
                  (comment) => comment.id !== deleteComment.id,
                ),
              };
            }

            // กรณี reply or tag
            // ถ้าไม่ใช่ page ที่มี reply or tag ที่จะลบให้ข้าม
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

                const idsToDelete = new Set<string>([deleteComment.id]);

                let changed = true;

                while (changed) {
                  changed = false;

                  for (const reply of comment.replies) {
                    if (reply.replyId && idsToDelete.has(reply.replyId)) {
                      if (!idsToDelete.has(reply.id)) {
                        idsToDelete.add(reply.id);
                        changed = true;
                      }
                    }
                  }
                }

                const newReplies = comment.replies.filter(
                  (reply) => !idsToDelete.has(reply.id)
                );
                const deletedReplyComment: IComment = {
                  ...comment,
                  replies: newReplies,
                  repliesCount: newReplies.length,
                };

                return deletedReplyComment;
              }),
            };
          }),
        };
      });

      // count comment of post
      if (!deleteComment.parentId) {
        queryClient.setQueryData<
          InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
        >(["posts"], (oldPosts) => {
          if (!oldPosts) {
            return undefined;
          }

          return {
            ...oldPosts,
            pages: oldPosts.pages.map((page) => {
              // ถ้าไม่ใช้ post target ข้าม
              if (!page.posts.some((post) => post.id === deleteComment.postId)) {
                return page;
              }

              return {
                ...page,
                posts: page.posts.map((post) => {
                  // ถ้าไม่ใช่ post ที่ comment ให้ข้าม
                  if (post.id !== deleteComment.postId) {
                    return post;
                  }

                  const updatePost = {
                    ...post,
                    commentsCount: post.commentsCount - 1,
                  };

                  return updatePost;
                }),
              };
            }),
          };
        });

        queryClient.setQueryData<
          InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
        >(["posts", deleteComment.post.userId], (oldPosts) => {
          if (!oldPosts) {
            return undefined;
          }

          return {
            ...oldPosts,
            pages: oldPosts.pages.map((page) => {
              // ถ้าไม่ใช้ post target ข้าม
              if (!page.posts.some((post) => post.id === deleteComment.postId)) {
                return page;
              }

              return {
                ...page,
                posts: page.posts.map((post) => {
                  // ถ้าไม่ใช่ post ที่ comment ให้ข้าม
                  if (post.id !== deleteComment.postId) {
                    return post;
                  }

                  const updatePost = {
                    ...post,
                    commentsCount: post.commentsCount - 1,
                  };

                  return updatePost;
                }),
              };
            }),
          };
        });

        queryClient.setQueryData<IPost>(["post", deleteComment.postId], (oldPost) => {
          if (!oldPost) {
            return undefined;
          }

          const updatePost = {
            ...oldPost,
            commentsCount: oldPost.commentsCount - 1,
          };

          return updatePost;
        });
      }
    });

    return () => {
      socket?.off("deleteComment");
    };
  }, [socket, queryClient]);
}
