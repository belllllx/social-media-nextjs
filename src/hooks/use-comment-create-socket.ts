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

        // ถ้าเป็น reply or tag
        if (newComment.parentId) {
          return {
            ...oldComments,
            pages: oldComments.pages.map((page) => {
              // ไม่ใช่ page ที่ reply comment ข้าม
              if (
                !page.comments.some(
                  (comment) => comment.id === newComment.parentId
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

                  const newReply: IComment = {
                    ...newComment,
                    likes: [],
                  }
                  const updateReplies = [newReply, ...comment.replies];
                  const updateCommentReply: IComment = {
                    ...comment,
                    repliesCount: comment.repliesCount + 1,
                    replies: updateReplies,
                  };

                  return updateCommentReply
                }),
              };
            }),
          };
        }

        // เป็น comment ปกติ
        const firstPage = oldComments.pages[0];

        const updateNewComment: IComment & {
          post: IPost;
        } = {
          ...newComment,
          repliesCount: 0,
          likes: [],
          replies: [],
        }
        const newFirstPage = {
          ...firstPage,
          comments: [updateNewComment, ...firstPage.comments],
        };

        return {
          ...oldComments,
          pages: [newFirstPage, ...oldComments.pages.slice(1)],
        };
      });

      // count comment of post
      if (!newComment.parentId) {
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
              if (!page.posts.some((post) => post.id === newComment.postId)) {
                return page;
              }

              return {
                ...page,
                posts: page.posts.map((post) => {
                  // ถ้าไม่ใช่ post ที่ comment ให้ข้าม
                  if (post.id !== newComment.postId) {
                    return post;
                  }

                  const updatePost = {
                    ...post,
                    commentsCount: post.commentsCount + 1,
                  };

                  return updatePost;
                }),
              };
            }),
          };
        });

        queryClient.setQueryData<
          InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
        >(["posts", newComment.post.userId], (oldPosts) => {
          if (!oldPosts) {
            return undefined;
          }

          return {
            ...oldPosts,
            pages: oldPosts.pages.map((page) => {
              // ถ้าไม่ใช้ post target ข้าม
              if (!page.posts.some((post) => post.id === newComment.postId)) {
                return page;
              }

              return {
                ...page,
                posts: page.posts.map((post) => {
                  // ถ้าไม่ใช่ post ที่ comment ให้ข้าม
                  if (post.id !== newComment.postId) {
                    return post;
                  }

                  const updatePost = {
                    ...post,
                    commentsCount: post.commentsCount + 1,
                  };

                  return updatePost;
                }),
              };
            }),
          };
        });

        queryClient.setQueryData<IPost>(["post", newComment.postId], (oldPost) => {
          if (!oldPost) {
            return undefined;
          }

          const updatePost = {
            ...oldPost,
            commentsCount: oldPost.commentsCount + 1,
          };

          return updatePost;
        });
      }
    });

    return () => {
      socket?.off("newComment");
    };
  }, [socket, queryClient]);
}
