import React from "react";
import { Button, HStack, Separator, Stack } from "@chakra-ui/react";
import { FaRegComment } from "react-icons/fa6";
import { PostLikeBtn } from "./post-like-btn";
import { IPost, IUser } from "@/utils/types";
import { PostShareBtn } from "./post-share-btn";

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
        <Button
          type="button"
          variant="plain"
        >
          <FaRegComment /> Comment
        </Button>
        <PostShareBtn post={post} activeUser={activeUser} />
      </HStack>
      <Separator />
    </Stack>
  );
}
