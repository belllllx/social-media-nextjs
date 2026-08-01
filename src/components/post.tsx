"use client";

import React from "react";
import { useUserStore } from "@/providers/user-store-provider";
import { Stack } from "@chakra-ui/react";
import { IPost } from "@/utils/types";
import { PostAction } from "./post-action";
import { PostUserHeader } from "./post-user-header";
import { PostBody } from "./post-body";
import { PostHeader } from "./post-header";
import { SharePost } from "./share-post";
import { CommentOverview } from "./comment-overview";
import { Comments } from "./comments";
import { ToggleViewComments } from "./toggle-view-comments";
import { Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "@/providers/socket-io-provider";
import { QueryClient } from "@tanstack/react-query";
import { useCommentLikeSocket } from "@/hooks/use-comment-like-socket";

interface PostProps {
  post: IPost;
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  queryClient: QueryClient;
  userId?: string;
}

export function Post({
  post,
  socket,
  queryClient,
  userId,
}: PostProps) {
  const { user: activeUser } = useUserStore((state) => state);

  useCommentLikeSocket(post.id, socket, queryClient);

  return (
    <Stack
      gapY="3"
      borderRadius="lg"
      width="full"
      backgroundColor="white"
      p="4"
    >
      {activeUser && (
        <PostHeader post={post} activeUser={activeUser}>
          <PostUserHeader post={post} />
        </PostHeader>
      )}

      {post.parentId && post.parent ? (
        <SharePost parentPost={post.parent} post={post} />
      ) : (
        <PostBody post={post} />
      )}

      {activeUser && (
        <PostAction
          post={post}
          activeUser={activeUser}
        />
      )}

      <ToggleViewComments post={post} />

      {activeUser && (
        <Comments
          post={post}
          activeUser={activeUser}
          queryClient={queryClient}
          userId={userId}
        />
      )}

      <CommentOverview post={post} queryClient={queryClient} />
    </Stack>
  );
}
