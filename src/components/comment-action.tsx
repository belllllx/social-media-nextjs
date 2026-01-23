"use client";

import { HStack, Stack, Text } from "@chakra-ui/react";
import React, { useCallback, useState } from "react";
import { CommentLikeBtn } from "./comment-like-btn";
import { IComment, IPost, IUser } from "@/utils/types";
import { ToggleViewReplys } from "./toggle-view-replys";
import { CreateReplyComment } from "./create-reply-comment";

interface CommentActionProps {
  post: IPost;
  comment: IComment;
  activeUser: IUser | null;
}

export function CommentAction({
  post,
  comment,
  activeUser,
}: CommentActionProps) {
  const [openReply, setOpenReply] = useState(false);

  const handleOpenReply = useCallback((open: boolean) => {
    setOpenReply(open);
  }, []);

  return (
    <Stack gapY="0">
      <HStack gapX="3">
        <CommentLikeBtn 
          post={post} 
          comment={comment} 
          activeUser={activeUser} 
        />
        <Text
          onClick={() => handleOpenReply(true)}
          cursor="pointer"
          textStyle="sm"
        >
          Reply
        </Text>
        <ToggleViewReplys comment={comment} />
      </HStack>

      <CreateReplyComment
        activeUser={activeUser}
        comment={comment}
        isOpenReply={openReply}
        onOpenReply={handleOpenReply}
        post={post}
      />
    </Stack>
  );
}
