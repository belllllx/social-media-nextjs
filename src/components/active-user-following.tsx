"use client";

import React, { useState } from "react";
import { IUser } from "@/utils/types";
import { CloseButton, Dialog, Flex, Portal, Text } from "@chakra-ui/react";
import { UserFollowings } from "./user-followings";

interface ActiveUserFollowingProps {
  user: IUser;
}

export function ActiveUserFollowing({ user }: ActiveUserFollowingProps) {
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
          Following{user.followings.length > 1 ? "s" : ""}:
          <Text
            textStyle="md"
            fontWeight="bold"
            truncate
          >
            {user.followings.length > 0 ? user.followings.length : "-"}
          </Text>
        </Flex>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title textAlign="center" width="full">
                Following{user.followings.length > 1 ? "s" : ""}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <UserFollowings user={user} />
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