"use client";

import { formatDate } from "@/utils/helpers/format-date";
import {
  IComment,
  DeleteFilePayload,
  IPost,
  IUser,
} from "@/utils/types";
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
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { notifyDelete } from "@/utils/helpers/notify-delete";
import { InfiniteData, QueryClient } from "@tanstack/react-query";
import { CommentFile } from "./comment-file";
import { CommentAction } from "./comment-action";
import { useActionStore } from "@/providers/action-store-provider";
import { TagUser } from "./tag-user";
import { useCommentUpdate } from "@/hooks/use-comment-update";
import { useCommentDelete } from "@/hooks/use-comment-delete";
import { useNavigateUser } from "@/hooks/use-navigate-user";
import Linkify from "linkify-react";

interface CommentProps {
  comment: IComment;
  post: IPost;
  activeUser: IUser;
  queryClient: QueryClient;
  userId?: string;
}

export function Comment({
  comment,
  post,
  activeUser,
  queryClient,
  userId,
}: CommentProps) {
  const { showReplyOnCommentId } = useActionStore((state) => state);

  const inputRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  const [shouldDeleteCurrentFile, setShouldDeleteCurrentFile] = useState(false);
  const [disabledDeleteComment, setDisabledDeleteComment] = useState(false);
  const [openPopover, setOpenPopover] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditComment, setOpenEditComment] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  const [isDeleteCommentFile, setIsDeleteCommentFile] = useState(false);

  const handleUserClick = useNavigateUser(comment.user);

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
    setValue,
    reset,
  } = form;

  const content = watch("message");

  const initialMessage = comment.message ?? "";
  const initialFileUrl = comment.fileUrl ?? null;

  const updateCommentMutation = useCommentUpdate(queryClient);
  const deleteCommentMutation = useCommentDelete(queryClient);

  const handleUpdateComment = useCallback(async ({ message }: { message?: string }) => {
    if (!message && !fileUrl) {
      return;
    }

    try {
      const res = await updateCommentMutation.mutateAsync({
        postId: post.id,
        comment,
        payload: {
          message: !message ? "" : message,
          fileUrl: !fileUrl ? undefined : fileUrl,
          shouldDeleteCurrentFile,
        },
      });
      if (!res.success) {
        toast.error(formatToastMessages(res.message));
        return;
      }

      toast.success(formatToastMessages(res.message));
      setOpenEditComment(false);
      reset();
      setFileUrl("");
      setShouldDeleteCurrentFile(false);
      setIsDeleteCommentFile(false);
    } catch (error) {
      toast.error("Failed to update comment");
      console.error("Failed to update comment", error);
    }
  }, [updateCommentMutation, post, comment, fileUrl, shouldDeleteCurrentFile, reset]);

  const onSubmit = handleSubmit(handleUpdateComment);

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
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
          );
          if (!res.success) {
            toast.error(formatToastMessages(res.message));
            return;
          }

          const files = (res.data as { fileUrl: string }).fileUrl;
          setFileUrl(files);
          setShouldDeleteCurrentFile(true);
        }
      } catch (error) {
        toast.error("Failed to upload file");
        console.error("Failed to upload file", error);
      } finally {
        setDisabled(false);
      }
    },
    [],
  );

  const handleDeleteFile = useCallback(async (fileUrl: string) => {
    try {
      setDisabled(true);
      const res = await callApi<{ data: DeleteFilePayload }>(
        "delete",
        "comment/delete/file",
        {
          data: { fileUrl },
        },
      );
      if (!res.success) {
        toast.error(formatToastMessages(res.message));
        return;
      }

      toast.success(formatToastMessages(res.message));
      setFileUrl("");
      setIsDeleteCommentFile(true);
    } catch (error) {
      toast.error("Failed to delete file");
      console.error("Failed to delete file", error);
    } finally {
      setDisabled(false);
    }
  }, []);

  const handleOpenDeleteDialog = useCallback((open: boolean) => {
    setOpenPopover(false);
    setOpenDeleteDialog(open);
  }, []);

  const handleOpenEditComment = useCallback(() => {
    setOpenPopover(false);
    setOpenEditComment(true);
  }, []);

  const handleCloseEditComment = useCallback(() => {
    const isMessageChanged = content !== initialMessage;
    const isFileChanged = fileUrl !== initialFileUrl;

    // ถ้าไม่เปลี่ยนอะไรเลย -> ออกได้
    if (!isMessageChanged && !isFileChanged) {
      setOpenEditComment(false);
      return;
    }

    // ถ้ามีการแก้ แต่ดันลบหมด
    if (!content && !fileUrl) {
      return;
    }

    if (isDeleteCommentFile) {
      queryClient.setQueryData<
        InfiniteData<{ comments: IComment[]; nextCursor: string | null }>
      >(["comments", post.id], (oldComments) => {
        if (!oldComments) {
          return undefined;
        }

        return {
          ...oldComments,
          pages: oldComments.pages.map((page) => {
            // ถ้า page นั้น ไม่มี comment หรือ reply or tag ที่ update ให้ข้าม
            if (
              !page.comments.some(
                (prevComment) => prevComment.id === comment.id,
              ) &&
              !page.comments.some((prevComment) =>
                prevComment.replies.some((reply) => reply.id === comment.id),
              )
            ) {
              return page;
            }

            // page target
            return {
              ...page,
              comments: page.comments.map((prevComment) => {
                // กรณีเป็น reply or tag
                if (comment.parent && comment.parentId) {
                  // ไม่ใช่ comment ที่ reply or tag ข้าม
                  if (
                    !prevComment.replies.some(
                      (reply) => reply.id === comment.id,
                    )
                  ) {
                    return prevComment;
                  }

                  const updatedReplyComment: IComment = {
                    ...prevComment,
                    replies: [
                      ...prevComment.replies.map((reply) => {
                        // ไม่ใช่ reply or tag ที่ลบไฟล์ข้าม
                        if (reply.id !== comment.id) {
                          return reply;
                        }

                        return {
                          ...reply,
                          fileUrl: "",
                        }
                      }),
                    ],
                  };

                  return updatedReplyComment;
                }

                // กรณีเป็น comment ปกติ
                // ไม่ใช้ comment target ข้าม
                if (prevComment.id !== comment.id) {
                  return prevComment;
                }

                return {
                  ...prevComment,
                  fileUrl: "",
                };
              }),
            };
          }),
        };
      });
    }

    setOpenEditComment(false);
  }, [content, fileUrl, initialMessage, initialFileUrl, isDeleteCommentFile, queryClient, comment]);

  const handleDeleteComment = useCallback(async () => {
    try {
      setDisabledDeleteComment(true);
      const res = await deleteCommentMutation.mutateAsync({
        postId: post.id,
        comment,
        userId,
      });
      if (!res.success) {
        toast.error(formatToastMessages(res.message));
        return;
      }

      notifyDelete(queryClient);

      setOpenDeleteDialog(false);
      toast.success(formatToastMessages(res.message));
    } catch (error) {
      toast.error("Failed to delete comment");
      console.error("Failed to delete comment", error);
    } finally {
      setDisabledDeleteComment(false);
    }
  }, [deleteCommentMutation, post.id, comment, queryClient]);

  useEffect(() => {
    if (!openEditComment) {
      reset();
      setFileUrl("");
      setShouldDeleteCurrentFile(false);
      return;
    }

    if (comment.message) {
      setValue("message", comment.message);
    }

    const input = inputRef.current;
    if (!input) {
      return;
    }

    const len = comment.message?.length ?? 0;
    input.focus();
    input.setSelectionRange(len, len);

    if (comment.fileUrl) {
      setFileUrl(comment.fileUrl);
      setShouldDeleteCurrentFile(false);
    }
  }, [reset, setValue, openEditComment, comment]);

  const showReplyData = useMemo(
    () =>
      showReplyOnCommentId.find(
        (showReply) => showReply.commentId === comment.id,
      ),
    [showReplyOnCommentId, comment.id],
  );

  return (
    <Stack gapY="1">
      <HStack gapX="3" alignItems="flex-start" mb="2">
        {comment.user.profileUrl ? (
          <Avatar.Root
            onClick={handleUserClick}
            cursor="pointer"
            size="lg"
          >
            <Avatar.Fallback name={comment.user.fullname} />
            <Avatar.Image src={comment.user.profileUrl} />
          </Avatar.Root>
        ) : (
          <Avatar.Root
            onClick={handleUserClick}
            cursor="pointer"
            size="lg"
          >
            <Avatar.Fallback name={comment.user.fullname} />
          </Avatar.Root>
        )}

        <Stack gapY="0" width="full">
          {!openEditComment ? (
            <HStack gapX="3" alignItems="flex-start">
              <Stack gapY="2">
                <Stack
                  backgroundColor={
                    comment.message ? "gray.100" : "transparent"
                  }
                  gapY={
                    comment.message
                      &&
                      !comment.replyToUser
                      ?
                      "0"
                      :
                      !comment.replyToUser
                        ?
                        "2"
                        :
                        "0"
                  }
                  rounded="2xl"
                  p={comment.message ? "2" : "0"}
                >
                  <HStack alignItems="flex-start" gapX="2">
                    <Text
                      onClick={handleUserClick}
                      cursor="pointer"
                      fontWeight="semibold"
                      maxW="200px"
                      overflow="hidden"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                    >
                      {comment.user.fullname}
                    </Text>
                    <Text color="fg.muted" textStyle="sm">
                      {formatDate(comment.createdAt)}
                    </Text>
                  </HStack>

                  {!comment.replyToUser && !comment.replyToUserId && comment.message ? (
                    <Linkify
                      options={{
                        target: "_blank",
                        rel: "noopener noreferrer",
                        className: "text-blue-500 underline",
                      }}
                    >
                      <Text wordBreak="break-word">{comment.message}</Text>
                    </Linkify>
                  ) : null}

                  {comment.replyToUser && comment.replyToUserId && comment.message ? (
                    <Text as="span" wordBreak="break-word">
                      <TagUser replyToUser={comment.replyToUser} />{" "}
                      <Linkify
                        options={{
                          target: "_blank",
                          rel: "noopener noreferrer",
                          className: "text-blue-500 underline",
                        }}
                      >
                        {comment.message}
                      </Linkify>
                    </Text>
                  ) : null}

                  {!comment.replyToUser && !comment.replyToUserId && !comment.message && comment.fileUrl ? (
                    <CommentFile comment={comment} />
                  ) : null}

                  {comment.replyToUser && comment.replyToUserId && !comment.message && comment.fileUrl ? (
                    <Stack gapY="2">
                      <TagUser replyToUser={comment.replyToUser} />
                      <CommentFile comment={comment} />
                    </Stack>
                  ) : null}
                </Stack>

                {comment.message && comment.fileUrl && (
                  <CommentFile comment={comment} />
                )}
              </Stack>

              {comment.userId === activeUser.id && (
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
                                        <Button
                                          type="button"
                                          variant="outline"
                                        >
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
            </HStack>
          ) : (
            <HStack>
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
                onChange={handleFileChange}
                ref={photoRef}
                type="file"
                className="hidden"
                name="photo"
                accept=".jpg,.jpeg,.png,.webp"
              />
              <Button
                onClick={handleCloseEditComment}
                disabled={isSubmitting || disabled}
                type="button"
                variant="ghost"
                px="0"
                textStyle="sm"
                _hover={{
                  background: "none",
                }}
              >
                Cancel
              </Button>
            </HStack>
          )}

          <CommentAction
            post={post}
            comment={comment}
            activeUser={activeUser}
            queryClient={queryClient}
          />

          {fileUrl && (
            <Box
              mb="3"
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
              <Image alt="upload-comment-image" asChild>
                <NextImage
                  src={fileUrl}
                  alt={fileUrl}
                  fill
                  style={{
                    objectFit: "cover"
                  }}
                />
              </Image>
            </Box>
          )}

          {showReplyData?.open &&
            comment.replies &&
            comment.replies.length ?
            comment.replies.map((reply) => (
              <Comment
                key={reply.id}
                comment={reply}
                post={post}
                activeUser={activeUser}
                queryClient={queryClient}
              />
            )) : null}
        </Stack>
      </HStack>
    </Stack>
  );
}
