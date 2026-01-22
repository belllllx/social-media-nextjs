"use client";

import { Box, Button, Flex, Stack } from "@chakra-ui/react";
import React, { Fragment } from "react";
import { Comment } from "./comment";
import { IPost, IUser } from "@/utils/types";
import { useComments } from "@/hooks/use-comments";
import { Error } from "./error";
import { Spinner } from "./spinner";
import { useActionStore } from "@/providers/action-store-provider";

interface CommentsProps {
  post: IPost;
  activeUser: IUser | null;
}

export function Comments({ post, activeUser }: CommentsProps) {
  const { showCommentOnPostId } = useActionStore((state) => state);

  const {
    data: comments,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    isError,
    status,
    error,
    refetch,
  } = useComments(post.id, 10);

  if (isError) {
    return <Error error={error} refetch={refetch} />;
  }

  return (
    <>
      {showCommentOnPostId && showCommentOnPostId === post.id && (
        <Box>
          {status === "pending" ? (
            <div>skeleton...</div>
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
            comments &&
            comments.pages.map((group, i) => (
              <Fragment key={i}>
                {group.comments.map((comment) => (
                  <Stack key={comment.id} gapY="4">
                    <Comment
                      comment={comment}
                      post={post}
                      activeUser={activeUser}
                    />
                  </Stack>
                ))}
              </Fragment>
            ))
          )}

          {hasNextPage && (
            <Button
              onClick={() => fetchNextPage()}
              disabled={!hasNextPage || isFetching}
              type="button"
              variant="plain"
              fontWeight="semibold"
              px="0"
            >
              Load more comments
            </Button>
          )}

          {isFetchingNextPage && <Spinner />}
        </Box>
      )}
    </>
  );
}
