"use client";

import { useActionStore } from "@/providers/action-store-provider";
import { IPost } from "@/utils/types";
import { Text } from "@chakra-ui/react";
import React from "react";

interface ToggleViewCommentsProps {
  post: IPost;
}

export function ToggleViewComments({ post }: ToggleViewCommentsProps) {
  const { showCommentOnPostId, setShowCommentOnPostId } = useActionStore(
    (state) => state,
  );

  return (
    <>
      {post.commentsCount ? (
        <Text
          onClick={() => setShowCommentOnPostId({ postId: post.id, open: true })}
          fontWeight="semibold"
          cursor="pointer"
        >
          {!showCommentOnPostId.find((showComment) => showComment.postId === post.id)?.open ? (
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
