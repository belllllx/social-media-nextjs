import React from "react";
import { Box, Stack } from "@chakra-ui/react";
import { IPost } from "@/utils/types";
import { PostUserHeader } from "./post-user-header";
import { PostBody } from "./post-body";
import { PostFiles } from "./post-files";

interface SharePostProps {
  parentPost?: IPost;
  post: IPost;
  inCreateSharePost?: boolean;
}

export function SharePost({
  parentPost,
  post,
  inCreateSharePost,
}: SharePostProps) {
  return (
    <Stack gapY="3">
      {!inCreateSharePost && post.message && <Box>{post.message}</Box>}
      {parentPost ? (
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
          <Stack
            gapY="3"
            px={parentPost.filesUrl && parentPost.filesUrl.length ? "4" : "0"}
            paddingBottom={
              parentPost.filesUrl && parentPost.filesUrl.length ? "4" : "0"
            }
          >
            <PostUserHeader post={parentPost} />
            <PostBody post={parentPost} isSharePost />
          </Stack>
        </Stack>
      ) : (
        <Stack
          borderWidth="1px"
          borderColor="gray.300"
          rounded="2xl"
          p={post.filesUrl && post.filesUrl.length ? "0" : "4"}
          gapY="3"
        >
          {post.filesUrl && post.filesUrl.length ? (
            <PostFiles fileUrls={post.filesUrl} />
          ) : null}
          <Stack
            px={post.filesUrl && post.filesUrl.length ? "4" : "0"}
            gapY="3"
          >
            <PostUserHeader post={post} />
            <PostBody post={post} isSharePost />
            {post.filesUrl && post.filesUrl.length ? (<Box />) : null}
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}
