import React from "react";
import { CreateComment } from "./create-comment";
import { IPost } from "@/utils/types";

interface CommentOverviewProps {
  post: IPost;
}

export function CommentOverview({ post }: CommentOverviewProps) {
  return (
    <CreateComment post={post} />
  );
}
