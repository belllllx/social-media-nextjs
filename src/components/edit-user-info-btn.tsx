"use client";

import React, { useCallback, useState } from "react"; 
import { Button, CloseButton, Dialog, Portal } from "@chakra-ui/react";
import { FaUserEdit } from "react-icons/fa";
import { EditUserInfoForm } from "./edit-user-info-form";
import { IUser } from "@/utils/types";

interface EditUserInfoBtnProps {
  activeUser: IUser | null;
  user: IUser;
}

export function EditUserInfoBtn({ activeUser, user }: EditUserInfoBtnProps) {
  const [openDialog, setOpenDialog] = useState(false);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
  }, []);

  return (
    <Dialog.Root
      open={openDialog}
      onOpenChange={(e) => setOpenDialog(e.open)}
      placement="center"
      motionPreset="slide-in-bottom"
    >
      <Dialog.Trigger asChild>
        <Button>
          <FaUserEdit />
          Edit info
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title textAlign="center" width="full">
                Edit info
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <EditUserInfoForm 
                activeUser={activeUser} 
                user={user} 
                onCloseDialog={handleCloseDialog}
              />
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