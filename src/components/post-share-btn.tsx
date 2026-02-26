"use client";

import {
  Avatar,
  Button,
  CloseButton,
  Dialog,
  HStack,
  Portal,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import React, { useCallback, useRef, useState } from "react";
import { EmojiPicker } from "./emoji-picker";
import { useNavigateUser } from "@/hooks/use-navigate-user";
import { IPost, IUser } from "@/utils/types";
import { useForm } from "react-hook-form";
import {
  createContentSchema,
  CreateContentSchema,
} from "@/utils/validations/create-content";
import { zodResolver } from "@hookform/resolvers/zod";
import { IoShareSocialOutline } from "react-icons/io5";
import { SharePost } from "./share-post";
import { toast } from "react-toastify";
import { formatToastMessages } from "@/utils/helpers/format-toast-messages";
import { useQueryClient } from "@tanstack/react-query";
import { useSharePostCreate } from "@/hooks/use-share-post-create";

interface PostShareBtnProps {
  post: IPost;
  activeUser: IUser | null;
}

export function PostShareBtn({ post, activeUser }: PostShareBtnProps) {
  const queryClient = useQueryClient();

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleUserClick = useNavigateUser(post.user);

  const [openDialog, setOpenDialog] = useState(false);

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
    reset,
    formState: { isSubmitting },
  } = form;

  const content = watch("message");

  const sharePostCreateMutation = useSharePostCreate(queryClient);

  const onSubmit = useCallback(
    handleSubmit(async ({ message }) => {
      if (!activeUser) {
        return;
      }

      try {
        const res = await sharePostCreateMutation.mutateAsync({
          user: activeUser,
          post,
          payload: {
            message: !message ? undefined : message,
          },
        });

        if (!res.success) {
          toast.error(formatToastMessages(res.message));
          return;
        }

        toast.success(formatToastMessages(res.message));
        setOpenDialog(false);
        reset();
      } catch (error) {
        console.log(error);
      }
    }),
    [sharePostCreateMutation, content, post, activeUser?.id],
  );

  const handleOpenDialog = useCallback((open: boolean) => {
    if (!open) {
      reset();
    }

    setOpenDialog(open);
  }, []);

  return (
    <Dialog.Root
      open={openDialog}
      onOpenChange={(e) => handleOpenDialog(e.open)}
      placement="center"
      motionPreset="slide-in-bottom"
    >
      <Dialog.Trigger asChild>
        <Button variant="plain" justifyContent="start" type="button">
          <IoShareSocialOutline /> Share
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title textAlign="center" width="full">
                Share post
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gapY="4">
                <HStack gap="4">
                  {activeUser?.profileUrl ? (
                    <Avatar.Root
                      onClick={handleUserClick}
                      size="xl"
                      cursor="pointer"
                    >
                      <Avatar.Fallback name={activeUser?.fullname} />
                      <Avatar.Image src={activeUser?.profileUrl} />
                    </Avatar.Root>
                  ) : (
                    <Avatar.Root
                      onClick={handleUserClick}
                      size="xl"
                      cursor="pointer"
                    >
                      <Avatar.Fallback name={activeUser?.fullname} />
                    </Avatar.Root>
                  )}
                  <Text
                    onClick={handleUserClick}
                    fontWeight="medium"
                    fontSize="md"
                    cursor="pointer"
                  >
                    {activeUser?.fullname}
                  </Text>
                </HStack>

                <form
                  onSubmit={onSubmit}
                  className="w-full flex flex-col gap-y-3"
                >
                  <HStack gapX="2" justifyContent="space-between">
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
                  </HStack>

                  <SharePost
                    parentPost={post.parent}
                    post={post}
                    inCreateSharePost
                  />

                  <Button
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    type="submit"
                  >
                    Share
                  </Button>
                </form>
              </Stack>
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
