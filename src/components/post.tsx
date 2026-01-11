"use client";

import { useNavigateUser } from "@/hooks/use-navigate-user";
import { useUserStore } from "@/providers/user-store-provider";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  HStack,
  IconButton,
  Popover,
  Portal,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { BsThreeDots } from "react-icons/bs";
import { HiMiniXMark } from "react-icons/hi2";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  createContentSchema,
  CreateContentSchema,
} from "@/utils/validations/create-content";
import { zodResolver } from "@hookform/resolvers/zod";
import { EmojiPicker } from "./emoji-picker";
import { Carousels } from "./carousels";
import { IPost } from "@/utils/types";

interface PostProps {
  post: IPost;
}

export function Post({ post }: PostProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { user } = useUserStore((state) => state);

  const [openPopover, setOpenPopover] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  // const handleUserClick = useNavigateUser(user);

  const form = useForm<CreateContentSchema>({
    resolver: zodResolver(createContentSchema),
    defaultValues: {
      message: "",
    },
  });

  const {
    watch,
    handleSubmit,
    register,
    formState: { isSubmitting },
  } = form;

  const content = watch("message");

  const onSubmit = handleSubmit(async ({ message }) => {});

  function handleClosePopover() {
    setOpenPopover(false);
    setOpenDialog(true);
  }

  return (
    <Box 
      borderRadius="lg" 
      width="full" 
      backgroundColor="white" 
      p="4"
      mb="4"
    >
      <HStack>
        <HStack gap="4">
          <Avatar.Root onClick={() => {}} size="xl">
            <Avatar.Fallback name={"belllllx"} />
            <Avatar.Image src="https://bit.ly/sage-adebayo" />
          </Avatar.Root>
          <Stack gap="0">
            <Text onClick={() => {}} fontWeight="medium">
              {"belllllx"}
            </Text>
            <Text color="fg.muted" textStyle="sm">
              {"user.email"}
            </Text>
          </Stack>
        </HStack>

        <Popover.Root
          open={openPopover}
          onOpenChange={(e) => setOpenPopover(e.open)}
          positioning={{ placement: "left-start" }}
        >
          <Popover.Trigger asChild>
            <IconButton rounded="full" variant="ghost" ml="auto">
              <BsThreeDots />
            </IconButton>
          </Popover.Trigger>
          <Portal>
            <Popover.Positioner>
              <Popover.Content width="150px">
                <Popover.Arrow />
                <Popover.Body>
                  <Stack>
                    <Dialog.Root
                      open={openDialog}
                      onOpenChange={(e) => setOpenDialog(e.open)}
                      placement="center"
                      motionPreset="slide-in-bottom"
                    >
                      <Dialog.Trigger asChild>
                        <Button
                          onClick={handleClosePopover}
                          variant="ghost"
                          justifyContent="start"
                          type="button"
                        >
                          Edit
                        </Button>
                      </Dialog.Trigger>
                      <Portal>
                        <Dialog.Backdrop />
                        <Dialog.Positioner>
                          <Dialog.Content>
                            <Dialog.Header>
                              <Dialog.Title textAlign="center" width="full">
                                Edit post
                              </Dialog.Title>
                              <IconButton
                                onClick={() => setOpenDialog(false)}
                                variant="subtle"
                                rounded="full"
                              >
                                <HiMiniXMark />
                              </IconButton>
                            </Dialog.Header>
                            <Dialog.Body>
                              <Stack gapY="4">
                                <HStack gap="4">
                                  <Avatar.Root onClick={() => {}} size="xl">
                                    <Avatar.Fallback name={"belllllx"} />
                                    <Avatar.Image src="https://bit.ly/sage-adebayo" />
                                  </Avatar.Root>
                                  <Text
                                    onClick={() => {}}
                                    fontWeight="medium"
                                    fontSize="md"
                                  >
                                    {"belllllx"}
                                  </Text>
                                </HStack>

                                <form
                                  onSubmit={onSubmit}
                                  className="flex justify-between w-full gap-x-2"
                                >
                                  <Textarea
                                    value={content}
                                    {...register("message")}
                                    ref={(e) => {
                                      register("message").ref(e);
                                      inputRef.current = e;
                                    }}
                                    variant="flushed"
                                    border="none"
                                    resize="none"
                                    placeholder="Write something..."
                                  />
                                  <EmojiPicker
                                    inputRef={inputRef}
                                    useFormReturn={form}
                                    valueKey="message"
                                  />
                                </form>
                              </Stack>
                            </Dialog.Body>
                          </Dialog.Content>
                        </Dialog.Positioner>
                      </Portal>
                    </Dialog.Root>

                    <Button
                      variant="ghost"
                      justifyContent="start"
                      type="button"
                    >
                      Delete
                    </Button>
                  </Stack>
                </Popover.Body>
              </Popover.Content>
            </Popover.Positioner>
          </Portal>
        </Popover.Root>
      </HStack>

      {/* <Carousels /> */}
      
    </Box>
  );
}