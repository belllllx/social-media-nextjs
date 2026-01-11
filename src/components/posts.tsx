"use client";

import { Box, Flex } from "@chakra-ui/react";
import React, { Fragment, useEffect } from "react";
import { usePosts } from "@/hooks/use-posts";
import { useInView } from "react-intersection-observer";
import { Spinner } from "./spinner";
import { ItemsNotFound } from "./items-not-found";
import { Post } from "./post";
import { usePostSocket } from "@/hooks/use-post-socket";

export function Posts() {
  usePostSocket();

  const {
    data: posts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    status,
  } = usePosts(10);
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  return (
    <Box height="full" overflowY="auto" pr="2">
      {status === "pending" ? (
        <div>post skeleton</div>
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
              group.posts.map((post) => (
                <Post key={post.id} post={post} />
              ))
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
