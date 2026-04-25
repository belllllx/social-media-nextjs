import { IPost } from "@/utils/types";
import { Text } from "@chakra-ui/react";
import React from "react";
import { PostFiles } from "./post-files";
import Linkify from "linkify-react";

interface PostBodyProps {
  post: IPost;
  isSharePost?: boolean;
}

export function PostBody({ post, isSharePost }: PostBodyProps) {
  return (
    <>
      {post.message && (
        <Linkify
          options={{
            target: "_blank",
            rel: "noopener noreferrer",
            className: "text-blue-500 underline",
          }}
        >
          <Text wordBreak="break-word">{post.message}</Text>
        </Linkify>
      )}
      {!isSharePost && (
        <>
          {post.filesUrl && post.filesUrl.length ? (
            <PostFiles fileUrls={post.filesUrl} />
          ) : null}
        </>
      )}
    </>
  );
}
