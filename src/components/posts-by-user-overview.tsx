"use client";

import { Stack } from "@chakra-ui/react";
import React from "react";
import { CreatePost } from "./create-post";
import { PostsByUser } from "./posts-by-user";
import { useUserStore } from "@/providers/user-store-provider";

interface PostsByUserOverviewProps {
  userId: string;
}

export function PostsByUserOverview({ userId }: PostsByUserOverviewProps) {
  const { user: activeUser } = useUserStore((state) => state);

  return (
    <Stack
      width="full"
      flex="1"
      gapY="4"
    >
      {activeUser && activeUser.id === userId && (<CreatePost />)}
      <PostsByUser userId={userId} />
    </Stack>
  );
}