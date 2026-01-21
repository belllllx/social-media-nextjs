"use client";

import { formatDate } from "@/utils/helpers/format-date";
import { IComment, IDeleteFilePayload, IPost, IUser } from "@/utils/types";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  HStack,
  IconButton,
  Image,
  Input,
  Popover,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import React, { ChangeEvent, useRef, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { EmojiPicker } from "./emoji-picker";
import { FiPaperclip } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateContentSchema,
  createContentSchema,
} from "@/utils/validations/create-content";
import { callApi } from "@/utils/helpers/call-api";
import { toast } from "react-toastify";
import { formatToastMessages } from "@/utils/helpers/format-toast-messages";
import { FaXmark } from "react-icons/fa6";
import NextImage from "next/image";
import { useNotifyDelete } from "@/hooks/use-notify-delete";
import { useQueryClient } from "@tanstack/react-query";
import { CommentFile } from "./comment-file";
import { CommentAction } from "./comment-action";

interface CommentUserHeaderProps {
  comment: IComment;
  post: IPost;
  activeUser: IUser | null;
}

export function CommentUserHeader({
  comment,
  post,
  activeUser,
}: CommentUserHeaderProps) {
  const queryClient = useQueryClient();

  const inputRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  const [disabledDeleteComment, setDisabledDeleteComment] = useState(false);
  const [openPopover, setOpenPopover] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditComment, setOpenEditComment] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [fileUrl, setFileUrl] = useState("");

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
    reset,
  } = form;

  const content = watch("message");

  const onSubmit = handleSubmit(async ({ message }) => {});

  async function handleFilesChange(event: ChangeEvent<HTMLInputElement>) {
    try {
      const file = event.target.files?.[0];
      if (file) {
        const formData = new FormData();

        formData.append("file", file);

        setDisabled(true);
        const res = await callApi(
          "post",
          "comment/file/create",
          formData,
        ).finally(() => setDisabled(false));
        if (!res.success) {
          toast.error(formatToastMessages(res.message));
          return;
        }

        const files = (res.data as { fileUrl: string }).fileUrl;
        setFileUrl(files);
      }
    } catch (error) {
      toast.error("Failed to upload file");
      setDisabled(false);
    }
  }

  async function handleDeleteFile(fileUrl: string) {
    try {
      setDisabled(true);
      const res = await callApi<{ data: IDeleteFilePayload }>(
        "delete",
        "comment/delete/file",
        {
          data: { fileUrl },
        },
      ).finally(() => setDisabled(false));
      if (!res.success) {
        toast.error(formatToastMessages(res.message));
        return;
      }

      toast.success(formatToastMessages(res.message));
      setFileUrl("");
    } catch (error) {
      toast.error("Failed to delete file");
      setDisabled(false);
    }
  }

  function handleOpenDeleteDialog(open: boolean) {
    setOpenPopover(false);
    setOpenDeleteDialog(open);
  }

  function handleOpenEditComment() {
    setOpenPopover(false);
    setOpenEditComment(true);
  }

  async function handleDeleteComment() {
    try {
      if (!activeUser) {
        return;
      }

      setDisabledDeleteComment(true);
      const res = await callApi(
        "delete",
        `comment/delete/${post.id}/${comment.id}`,
      ).finally(() => setDisabledDeleteComment(false));
      if (!res.success) {
        toast.error(formatToastMessages(res.message));
        return;
      }

      const deletedComment = res.data as IComment;
      useNotifyDelete(queryClient, post.id, activeUser.id, deletedComment.id);
      setOpenDeleteDialog(false);
      toast.success(formatToastMessages(res.message));
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Stack gapY="3">
      <HStack gapX="3" alignItems="flex-start" mb="2">
        {comment.user.profileUrl ? (
          <Avatar.Root size="lg">
            <Avatar.Fallback name={comment.user.fullname} />
            <Avatar.Image src={comment.user.profileUrl} />
          </Avatar.Root>
        ) : (
          <Avatar.Root size="lg">
            <Avatar.Fallback name={comment.user.fullname} />
          </Avatar.Root>
        )}

        <>
          {!openEditComment ? (
            <>
              <Stack gapY="3">
                <Stack gapY="2">
                  <Stack
                    backgroundColor={comment.message ? "gray.100" : "transparent"}
                    gapY={comment.message ? "0" : "2"}
                    rounded="2xl"
                    p={comment.message ? "2" : "0"}
                  >
                    <HStack alignItems="center" justifyContent="space-between">
                      <Text fontWeight="semibold">{comment.user.fullname}</Text>
                      <Text color="fg.muted" textStyle="sm">
                        {formatDate(comment.createdAt)}
                      </Text>
                    </HStack>
                    {comment.message && (
                      <Text wordBreak="break-word">{comment.message}</Text>
                    )}

                    {!comment.message && comment.fileUrl && (
                      <CommentFile comment={comment} />
                    )}
                  </Stack>

                  {comment.message && comment.fileUrl && (
                    <CommentFile comment={comment} />
                  )}

                  <CommentAction />
                </Stack>

                <div>reply</div>
              </Stack>

              {comment.userId === activeUser?.id && (
                <Popover.Root
                  open={openPopover}
                  onOpenChange={(e) => setOpenPopover(e.open)}
                  positioning={{ placement: "right-start" }}
                >
                  <Popover.Trigger asChild>
                    <IconButton rounded="full" variant="ghost">
                      <BsThreeDotsVertical />
                    </IconButton>
                  </Popover.Trigger>
                  <Portal>
                    <Popover.Positioner>
                      <Popover.Content width="150px">
                        <Popover.Arrow />
                        <Popover.Body>
                          <Stack>
                            <Button
                              onClick={handleOpenEditComment}
                              variant="ghost"
                              justifyContent="start"
                              type="button"
                            >
                              Edit
                            </Button>

                            <Dialog.Root
                              open={openDeleteDialog}
                              onOpenChange={(e) =>
                                handleOpenDeleteDialog(e.open)
                              }
                              placement="center"
                              motionPreset="slide-in-bottom"
                            >
                              <Dialog.Trigger asChild>
                                <Button
                                  variant="ghost"
                                  justifyContent="start"
                                  type="button"
                                >
                                  Delete
                                </Button>
                              </Dialog.Trigger>
                              <Portal>
                                <Dialog.Backdrop />
                                <Dialog.Positioner>
                                  <Dialog.Content>
                                    <Dialog.Header>
                                      <Dialog.Title
                                        textAlign="center"
                                        width="full"
                                      >
                                        Delete comment
                                      </Dialog.Title>
                                    </Dialog.Header>
                                    <Dialog.Body>
                                      <Text
                                        textAlign="center"
                                        textStyle="md"
                                        color="red.600"
                                        fontWeight="semibold"
                                      >
                                        Are you sure to delete a comment?
                                      </Text>
                                    </Dialog.Body>
                                    <Dialog.Footer>
                                      <Dialog.ActionTrigger asChild>
                                        <Button variant="outline">
                                          Cancel
                                        </Button>
                                      </Dialog.ActionTrigger>
                                      <Button
                                        onClick={handleDeleteComment}
                                        disabled={disabledDeleteComment}
                                        loading={disabledDeleteComment}
                                        type="button"
                                      >
                                        Delete
                                      </Button>
                                    </Dialog.Footer>
                                  </Dialog.Content>
                                </Dialog.Positioner>
                              </Portal>
                            </Dialog.Root>
                          </Stack>
                        </Popover.Body>
                      </Popover.Content>
                    </Popover.Positioner>
                  </Portal>
                </Popover.Root>
              )}
            </>
          ) : (
            <>
              <form onSubmit={onSubmit} className="w-full">
                <Input
                  disabled={disabled || isSubmitting}
                  value={content}
                  {...register("message")}
                  ref={(e) => {
                    register("message").ref(e);
                    inputRef.current = e;
                  }}
                  size="lg"
                  borderRadius="full"
                  placeholder="Write something..."
                  variant="subtle"
                />
              </form>
              <EmojiPicker
                inputRef={inputRef}
                useFormReturn={form}
                valueKey="message"
              />
              <IconButton
                disabled={disabled || isSubmitting}
                onClick={() => photoRef.current?.click()}
                rounded="full"
                variant="surface"
                color="red.500"
              >
                <FiPaperclip />
              </IconButton>
              <input
                onChange={handleFilesChange}
                ref={photoRef}
                type="file"
                className="hidden"
                name="photo"
                accept=".jpg,.jpeg,.png,.webp"
              />
              <Text
                onClick={() => setOpenEditComment(false)}
                cursor="pointer"
                color="fg.muted"
                py="2"
                textStyle="sm"
              >
                Cancel
              </Text>
            </>
          )}
        </>
      </HStack>

      {fileUrl && (
        <Box
          width="200px"
          height="200px"
          backgroundColor="grey.500"
          position="relative"
          rounded="2xl"
          overflow="hidden"
        >
          <IconButton
            onClick={() => handleDeleteFile(fileUrl)}
            disabled={disabled}
            aria-label="Remove file"
            position="absolute"
            top="2"
            right="2"
            color="white"
            rounded="full"
            zIndex="10"
            backgroundColor="red.500"
            size="xs"
          >
            <FaXmark />
          </IconButton>
          <Image asChild>
            <NextImage src={fileUrl} alt={fileUrl} fill />
          </Image>
        </Box>
      )}
    </Stack>
  );
}
