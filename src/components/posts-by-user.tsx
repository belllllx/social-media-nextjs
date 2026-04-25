"use client";

import { Box, Flex, Stack } from "@chakra-ui/react";
import React, { Fragment, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Spinner } from "./spinner";
import { ItemsNotFound } from "./items-not-found";
import { Post } from "./post";
import { usePostCreateSocket } from "@/hooks/use-post-create-socket";
import { usePostLikeSocket } from "@/hooks/use-post-like-socket";
import { useSocketIo } from "@/providers/socket-io-provider";
import { useQueryClient } from "@tanstack/react-query";
import { PostsSkeleton } from "./posts-skeleton";
import { Error } from "./error";
import { usePostUpdateSocket } from "@/hooks/use-post-update-socket";
import { usePostDeleteSocket } from "@/hooks/use-post-delete-socket";
import { useCommentCountCreateSocket } from "@/hooks/use-comment-count-create-socket";
import { useCommentCreateSocket } from "@/hooks/use-comment-create-socket";
import { useCommentDeleteSocket } from "@/hooks/use-comment-delete-socket";
import { useCommentCountDeleteSocket } from "@/hooks/use-comment-count-delete-socket";
import { useCommentUpdateSocket } from "@/hooks/use-comment-update-socket";
import { useReplyCountDeleteSocket } from "@/hooks/use-reply-count-delete-socket";
import { useReplyDeleteSocket } from "@/hooks/use-reply-delete-socket";
import { usePostsByUser } from "@/hooks/use-posts-by-user";

interface PostsByUserProps {
  userId: string;
}

export function PostsByUser({ userId }: PostsByUserProps) {
  const { socket } = useSocketIo();

  const queryClient = useQueryClient();

  usePostCreateSocket(socket, queryClient);
  usePostLikeSocket(
    socket,
    queryClient,
    userId,
  );
  usePostUpdateSocket(socket, queryClient);
  usePostDeleteSocket(socket, queryClient);

  useCommentCountCreateSocket(socket, queryClient);
  useCommentCountDeleteSocket(socket, queryClient);
  useCommentCreateSocket(socket, queryClient);
  useCommentUpdateSocket(socket, queryClient);
  useCommentDeleteSocket(socket, queryClient);

  useReplyCountDeleteSocket(socket, queryClient);
  useReplyDeleteSocket(socket, queryClient);

  const {
    data: posts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    status,
    error,
    refetch,
  } = usePostsByUser(10, userId);
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (isError) {
    return <Error error={error} refetch={refetch} />;
  }

  return (
    <Box
      width="full"
      height="full"
      position="relative"
    >
      <Stack gapY="4">
        {status === "pending" ? (
          <PostsSkeleton amount={3} />
        ) : isLoading ? (
          <Flex
            width="full"
            height="full"
            justifyContent="center"
            alignItems="center"
          >
            <Spinner size="lg" />
          </Flex>
        ) : (
          posts &&
          posts.pages.map((group, i) => (
            <Fragment key={i}>
              {group.posts.length ? (
                group.posts.map((post) => <Post
                  key={post.id}
                  post={post}
                  socket={socket}
                  queryClient={queryClient}
                  userId={userId}
                />)
              ) : (
                <ItemsNotFound title="post" />
              )}
            </Fragment>
          ))
        )}

        {isFetchingNextPage && <Spinner />}
      </Stack>
      
      <Box ref={ref} />
    </Box>
  );
}
