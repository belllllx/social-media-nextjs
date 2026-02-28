import { IComment, IPost, IUser } from "@/utils/types";
import React from "react";
import { CommentUser } from "./comment-user";
import { QueryClient } from "@tanstack/react-query";

interface CommentProps {
  comment: IComment;
  post: IPost;
  activeUser: IUser | null;
  queryClient: QueryClient;
}

export function Comment({ 
  comment, 
  post, 
  activeUser,
  queryClient,
}: CommentProps) {
  return (
    <CommentUser
      comment={comment}
      post={post}
      activeUser={activeUser}
      queryClient={queryClient}
    /> 
  );
}
