import React from "react";
import {
  Dialog,
  Portal,
  Box,
  CloseButton,
} from "@chakra-ui/react";
import { Carousel } from "./carousel";

interface PostFilesProps {
  fileUrls: string[];
}

export function PostFiles({ fileUrls }: PostFilesProps) {
  return (
    <Dialog.Root
      size="lg" 
      placement="center" 
      motionPreset="scale"
    >
      <Dialog.Trigger asChild>
        <Box>
          <Carousel fileUrls={fileUrls} inDialog={false} />
        </Box>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Body p="4">
              <Carousel fileUrls={fileUrls} inDialog />
            </Dialog.Body>
            <Dialog.CloseTrigger 
              asChild 
              backgroundColor="gray.100"
              rounded="full"
              _hover={{
                backgroundColor: "gray.200",
              }}
            >
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}