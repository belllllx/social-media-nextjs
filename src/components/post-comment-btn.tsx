"use client";

import { useActionStore } from "@/providers/action-store-provider";
import { Button } from "@chakra-ui/react";
import React from "react";
import { FaRegComment } from "react-icons/fa6";

interface PostCommentBtnProps {
  postId: string;
}

export function PostCommentBtn({ postId }: PostCommentBtnProps) {
  const { setFocusPostId } = useActionStore((state) => state);

  return (
    <Button 
      onClick={() => setFocusPostId(postId)}
      type="button" 
      variant="plain"
      >
        <FaRegComment /> Comment
    </Button>
  );
}
