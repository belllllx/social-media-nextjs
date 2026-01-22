import { IComment, IPost, IUser } from "@/utils/types";
import React from "react";
import { CommentUser } from "./comment-user";

interface CommentProps {
  comment: IComment;
  post: IPost;
  activeUser: IUser | null;
}

export function Comment({ comment, post, activeUser }: CommentProps) {
  return (
    <CommentUser
      comment={comment}
      post={post}
      activeUser={activeUser}
    /> 
  );
}
