import React from "react";
import { Button, HStack, Separator, Stack } from "@chakra-ui/react";
import { FaRegComment } from "react-icons/fa6";
import { IoShareSocialOutline } from "react-icons/io5";
import { PostLikeBtn } from "./post-like-btn";
import { IPost } from "@/utils/types";

interface PostActionProps {
  post: IPost;
  activeUserId?: string;
}

export function PostAction({
  post,
  activeUserId,
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
          activeUserId={activeUserId}
        />
        <Button
          type="button"
          variant="plain"
        >
          <FaRegComment /> Comment
        </Button>
        <Button
          type="button"
          variant="plain"
        >
          <IoShareSocialOutline /> Share
        </Button>
      </HStack>
      <Separator />
    </Stack>
  );
}
