import React from "react";
import { Box, Stack } from "@chakra-ui/react";
import { IPost } from "@/utils/types";
import { PostUserHeader } from "./post-user-header";
import { PostBody } from "./post-body";
import { PostFiles } from "./post-files";

interface SharePostProps {
  parentPost: IPost;
  post: IPost;
}

export function SharePost({ parentPost, post }: SharePostProps) {
  return (
    <Stack gapY="3">
      {post.message && <Box>{post.message}</Box>}
      <Stack
        borderWidth="1px"
        borderColor="gray.300"
        rounded="2xl"
        p={parentPost.filesUrl && parentPost.filesUrl.length ? "0" : "4"}
        gapY="3"
      >
        {parentPost.filesUrl && parentPost.filesUrl.length ? (
          <PostFiles fileUrls={parentPost.filesUrl} />
        ) : null}
        <Box
          px={parentPost.filesUrl && parentPost.filesUrl.length ? "4" : "0"}
          paddingBottom={parentPost.filesUrl && parentPost.filesUrl.length ? "4" : "0"}
        >
          <PostUserHeader post={parentPost} />
        </Box>
        <PostBody post={parentPost} isSharePost />
      </Stack>
    </Stack>
  );
}
