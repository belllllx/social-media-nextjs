import { IComment, IPost, IUser } from "@/utils/types";
import { Stack } from "@chakra-ui/react";
import React from "react";
import { CommentUserHeader } from "./comment-user-header";

interface CommentProps {
  comment: IComment;
  post: IPost;
  activeUser: IUser | null;
}

export function Comment({ comment, post, activeUser }: CommentProps) {
  return (
    <Stack gapY="2">
      <CommentUserHeader
        comment={comment}
        post={post}
        activeUser={activeUser}
      />
    </Stack>
  );
}
