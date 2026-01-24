"use client";

import { useActionStore } from "@/providers/action-store-provider";
import { IPost } from "@/utils/types";
import { Text } from "@chakra-ui/react";
import React, { useMemo } from "react";

interface ToggleViewCommentsProps {
  post: IPost;
}

export function ToggleViewComments({ post }: ToggleViewCommentsProps) {
  const { showCommentOnPostId, setShowCommentOnPostId } = useActionStore(
    (state) => state,
  );

  const showCommentData = useMemo(
    () =>
      showCommentOnPostId.find((showComment) => showComment.postId === post.id),
    [showCommentOnPostId],
  );

  return (
    <>
      {post.commentsCount ? (
        <Text
          onClick={() =>
            setShowCommentOnPostId({ postId: post.id, open: !showCommentData?.open })
          }
          fontWeight="semibold"
          cursor="pointer"
        >
          {!showCommentData?.open ? (
            <>
              View {post.commentsCount} comment
              {post.commentsCount > 1 ? "s" : ""}
            </>
          ) : (
            <>
              Hidden Comment
              {post.commentsCount > 1 ? "s" : ""}
            </>
          )}
        </Text>
      ) : null}
    </>
  );
}
