"use client";

import { useNavigateUser } from "@/hooks/use-navigate-user";
import { IComment } from "@/utils/types";
import { Text } from "@chakra-ui/react";
import React from "react";

interface TagUserProps {
  comment: IComment;
}

export function TagUser({ comment }: TagUserProps) {
  const handleUserClick = useNavigateUser(comment.replyToUser);

  return (
    <Text
      onClick={handleUserClick}
      fontWeight="semibold"
      color="blue.600"
      cursor="pointer"
    >
      @{comment.replyToUser?.fullname}
    </Text>
  );
}
