import React from "react";
import { HStack, Separator, Stack } from "@chakra-ui/react";
import { PostLikeBtn } from "./post-like-btn";
import { IPost, IUser } from "@/utils/types";
import { PostShareBtn } from "./post-share-btn";
import { PostCommentBtn } from "./post-comment-btn";

interface PostActionProps {
  post: IPost;
  activeUser: IUser | null;
}

export function PostAction({
  post,
  activeUser,
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
          activeUserId={activeUser?.id}
        />
        <PostCommentBtn postId={post.id} />
        <PostShareBtn post={post} activeUser={activeUser} />
      </HStack>
      <Separator />
    </Stack>
  );
}
