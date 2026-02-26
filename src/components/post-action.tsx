import React from "react";
import { HStack, Separator, Stack } from "@chakra-ui/react";
import { PostLikeBtn } from "./post-like-btn";
import { IPost, IUser } from "@/utils/types";
import { PostShareBtn } from "./post-share-btn";
import { PostCommentBtn } from "./post-comment-btn";
import { QueryClient } from "@tanstack/react-query";

interface PostActionProps {
  post: IPost;
  activeUser: IUser | null;
  queryClient: QueryClient;
}

export function PostAction({
  post,
  activeUser,
  queryClient,
}: PostActionProps) {
  return (
    <Stack>
      <Separator />
      <HStack 
        alignItems="center" 
        justifyContent="space-between"
        px="8"
      >
        <PostLikeBtn 
          post={post} 
          activeUser={activeUser}
          queryClient={queryClient}
        />
        <PostCommentBtn postId={post.id} />
        <PostShareBtn post={post} activeUser={activeUser} />
      </HStack>
      <Separator />
    </Stack>
  );
}
