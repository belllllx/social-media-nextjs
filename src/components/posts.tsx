"use client";

import { Box, Flex } from "@chakra-ui/react";
import React, { Fragment, useEffect, useRef } from "react";
import { usePosts } from "@/hooks/use-posts";
import { useInView } from "react-intersection-observer";
import { Spinner } from "./spinner";
import { ItemsNotFound } from "./items-not-found";
import { Post } from "./post";
import { usePostCreateSocket } from "@/hooks/use-post-create-socket";
import { usePostLikeSocket } from "@/hooks/use-post-like-socket";
import { useSocketIo } from "@/providers/socket-io-provider";
import { useQueryClient } from "@tanstack/react-query";
import { PostsSkeleton } from "./posts-skeleton";
import { useScroll } from "@/hooks/use-scroll";
import { ScrollBtn } from "./scroll-btn";
import { Error } from "./error";
import { usePostUpdateSocket } from "@/hooks/use-post-update-socket";
import { usePostDeleteSocket } from "@/hooks/use-post-delete-socket";

export function Posts() {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const { socket } = useSocketIo();

  const queryClient = useQueryClient();

  usePostCreateSocket(socket, queryClient);
  usePostLikeSocket(socket, queryClient);
  usePostUpdateSocket(socket, queryClient);
  usePostDeleteSocket(socket, queryClient);

  const showButton = useScroll(scrollRef);

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
  } = usePosts(10);
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
      ref={scrollRef}
      height="full"
      overflowY="auto"
      pr="2"
      position="relative"
    >
      {showButton && <ScrollBtn scrollRef={scrollRef} />}

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
              group.posts.map((post) => <Post key={post.id} post={post} />)
            ) : (
              <ItemsNotFound title="post" />
            )}
          </Fragment>
        ))
      )}

      {isFetchingNextPage && <Spinner />}
      <Box ref={ref} />
    </Box>
  );
}
