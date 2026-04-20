"use client";

import React, { useState } from "react";
import { IUser } from "@/utils/types";
import { CloseButton, Dialog, Flex, Portal, Text } from "@chakra-ui/react";
import { UserFollowers } from "./user-followers";

interface ActiveUserFollowerProps {
  user: IUser;
}

export function ActiveUserFollower({ user }: ActiveUserFollowerProps) {
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <Dialog.Root
      open={openDialog}
      onOpenChange={(e) => setOpenDialog(e.open)}
      placement="center"
      motionPreset="slide-in-bottom"
    >
      <Dialog.Trigger asChild>
        <Flex
          textStyle="md"
          fontWeight="semibold"
          display="flex"
          gapX="2"
          cursor="pointer"
        >
          Follower{user.followers.length > 1 ? "s" : ""}:
          <Text
            textStyle="md"
            fontWeight="bold"
            truncate
          >
            {user.followers.length > 0 ? user.followers.length : "-"}
          </Text>
        </Flex>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title textAlign="center" width="full">
                Follower{user.followers.length > 1 ? "s" : ""}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <UserFollowers user={user} />
            </Dialog.Body>
            <Dialog.CloseTrigger asChild rounded="full">
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}