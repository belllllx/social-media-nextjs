"use client";

import React from "react";
import { formatDate } from "@/utils/helpers/format-date";
import { IPost } from "@/utils/types";
import { Avatar, HStack, Stack, Text } from "@chakra-ui/react";
import { useNavigateUser } from "@/hooks/use-navigate-user";

interface PostHeaderProps {
  post: IPost;
}

export function PostUserHeader({ post }: PostHeaderProps) {
  const handleUserClick = useNavigateUser(post.user);

  return (
    <HStack gapX="3">
      {post.user.profileUrl ? (
        <Avatar.Root
          onClick={handleUserClick}
          cursor="pointer"
          size="xl"
        >
          <Avatar.Fallback name={post.user.fullname} />
          <Avatar.Image src={post.user.profileUrl} />
        </Avatar.Root>
      ) : (
        <Avatar.Root
          onClick={handleUserClick}
          cursor="pointer"
          size="xl"
        >
          <Avatar.Fallback name={post.user.fullname} />
        </Avatar.Root>
      )}
      <Stack gap="0">
        <Text 
          onClick={handleUserClick}
          cursor="pointer"
          fontWeight="medium"
        >
          {post.user.fullname}
        </Text>
        <Text color="fg.muted" textStyle="sm">
          {formatDate(post.createdAt)}
        </Text>
      </Stack>
    </HStack>
  );
}
