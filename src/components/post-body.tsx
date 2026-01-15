import { IPost } from "@/utils/types";
import { Box } from "@chakra-ui/react";
import React from "react";
import { PostFiles } from "./post-files";

interface PostBodyProps {
  post: IPost;
  isSharePost?: boolean;
}

export function PostBody({ post, isSharePost }: PostBodyProps) {
  return (
    <>
      {post.message && <Box>{post.message}</Box>}
      {!isSharePost && (
        <>
          {post.filesUrl && post.filesUrl.length ? (
            <PostFiles fileUrls={post.filesUrl} />
          ) : null }
        </>
      )}
    </>
  );
}
