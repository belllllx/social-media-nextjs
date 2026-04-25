import React from "react";
import { HStack, Separator, Stack } from "@chakra-ui/react";
import { PostLikeBtn } from "./post-like-btn";
import { IPost, IUser } from "@/utils/types";
import { PostShareBtn } from "./post-share-btn";
import { PostCommentBtn } from "./post-comment-btn";
import { QueryClient } from "@tanstack/react-query";

interface PostActionProps {
  post: IPost;
  activeUser: IUser;
  queryClient: QueryClient;
  userId?: string;
}

export function PostAction({
  post,
  activeUser,
  queryClient,
  userId,
}: PostActionProps) {
  return (
    <Stack>
      <Separator />
      <HStack
        alignItems="center"
        justifyContent="space-between"
        px="8"
        mdDown={{
          px: "0",
        }}
      >
        <PostLikeBtn
          post={post}
          activeUser={activeUser}
          queryClient={queryClient}
          userId={userId}
        />
        <PostCommentBtn postId={post.id} />
        <PostShareBtn post={post} activeUser={activeUser} />
      </HStack>
      <Separator />
    </Stack>
  );
}
