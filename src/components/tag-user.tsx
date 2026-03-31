"use client";

import { IComment } from "@/utils/types";
import { Text } from "@chakra-ui/react";
import React from "react";

interface TagUserProps {
  comment: IComment;
}

export function TagUser({ comment }: TagUserProps) {
  return (
    <Text
      fontWeight="semibold"
      color="blue.600"
    >
      @{comment.replyToUser?.fullname}
    </Text>
  );
}
