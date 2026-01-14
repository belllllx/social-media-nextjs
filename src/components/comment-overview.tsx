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
      <Text fontWeight="semibold" cursor="pointer">View 2 comments</Text>
      <CreateComment post={post} />
    </Stack>
  );
}
