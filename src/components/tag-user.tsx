"use client";

import { useNavigateUser } from "@/hooks/use-navigate-user";
import { IUser } from "@/utils/types";
import { Text } from "@chakra-ui/react";
import React from "react";

interface TagUserProps {
  replyToUser: IUser;
}

export function TagUser({ replyToUser }: TagUserProps) {
  const handleUserClick = useNavigateUser(replyToUser);

  return (
    <Text
      onClick={handleUserClick}
      as="span"
      display="inline-block"
      cursor="pointer"
      fontWeight="semibold"
      color="blue.600"
      maxW="200px"
      overflow="hidden"
      textOverflow="ellipsis"
      whiteSpace="nowrap"
      verticalAlign="bottom"
    >
      @{replyToUser.fullname}
    </Text>
  );
}
