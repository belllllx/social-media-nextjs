"use client";

import React from "react";
import { UserProfileSettings } from "./user-profile-settings";
import { UserContents } from "./user-contents";
import { useUserById } from "@/hooks/use-user-by-id";
import { toast } from "react-toastify";
import { ICommonResponse } from "@/utils/types";
import { Stack } from "@chakra-ui/react";
import { useSocketIo } from "@/providers/socket-io-provider";
import { useQueryClient } from "@tanstack/react-query";
import { useFollowUserSocket } from "@/hooks/use-follow-user-socket";

interface ProfileOverviewProps {
  id: string;
}

export function ProfileOverview({ id }: ProfileOverviewProps) {
  const queryClient = useQueryClient();

  const { socket } = useSocketIo();

  useFollowUserSocket(socket, queryClient);

  const result = useUserById(id);

  const {
    isError,
    error,
  } = result;

  if (isError) {
    toast.error((error as unknown as ICommonResponse).message);
  }

  return (
    <Stack gapY="4" minH="100vh">
      <UserProfileSettings id={id} result={result} />
      <UserContents result={result} />
    </Stack>
  );
}