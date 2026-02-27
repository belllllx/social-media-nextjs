import React from "react";
import { CreateComment } from "./create-comment";
import { IPost } from "@/utils/types";
import { QueryClient } from "@tanstack/react-query";

interface CommentOverviewProps {
  post: IPost;
  queryClient: QueryClient;
}

export function CommentOverview({ post, queryClient }: CommentOverviewProps) {
  return (
    <CreateComment post={post} queryClient={queryClient} />
  );
}
