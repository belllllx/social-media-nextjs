import React from "react";
import { Stack, Text } from "@chakra-ui/react";
import { CreateComment } from "./create-comment";
import { IPost } from "@/utils/types";

interface CommentOverviewProps {
  post: IPost;
}

export function CommentOverview({ post }: CommentOverviewProps) {
  return (
    <Stack gapY="2">
      {post.commentsCount ? (
        <Text fontWeight="semibold" cursor="pointer">
          View {post.commentsCount} comment{post.commentsCount > 1 ? "s" : ""}
        </Text>
      ) : null }
      <CreateComment post={post} />
    </Stack>
  );
}
