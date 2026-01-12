import React from "react"
import { Box } from "@chakra-ui/react";
import { IPost } from "@/utils/types";
import { PostUserHeader } from "./post-user-header";
import { PostBody } from "./post-body";

interface SharePostProps {
  post: IPost;
}

export function SharePost({ post }: SharePostProps) {
  return (
    <Box
      border="1px"
      rounded="2xl"
    >
      <PostUserHeader post={post} />
      <PostBody post={post} />
    </Box>
  );
}
