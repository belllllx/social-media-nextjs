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
}

export function Post({ 
  post,
  socket,
  queryClient,
}: PostProps) {
  const { user } = useUserStore((state) => state);

  useCommentLikeSocket(post.id, socket, queryClient);

  return (
    <Stack
      gapY="3"
      borderRadius="lg"
      width="full"
      backgroundColor="white"
      p="4"
      mb="4"
    >
      <PostHeader post={post} activeUser={user}>
        <PostUserHeader post={post} />
      </PostHeader>

      {post.parentId && post.parent ? (
        <SharePost parentPost={post.parent} post={post} />
      ) : (
        <PostBody post={post} />
      )}

      <PostAction post={post} activeUser={user} />

      <ToggleViewComments post={post} />

      <Comments post={post} activeUser={user} />

      <CommentOverview post={post} />
    </Stack>
  );
}
