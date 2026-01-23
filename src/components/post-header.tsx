"use client";

import React, {
  ChangeEvent,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Avatar,
  Button,
  CloseButton,
  Dialog,
  HStack,
  Icon,
  IconButton,
  Popover,
  Portal,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { IPost, IUpdatePostPayload, IUser } from "@/utils/types";
import { BsThreeDots } from "react-icons/bs";
import { EmojiPicker } from "./emoji-picker";
import { useForm } from "react-hook-form";
import {
  createContentSchema,
  CreateContentSchema,
} from "@/utils/validations/create-content";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigateUser } from "@/hooks/use-navigate-user";
import { FaPaperclip } from "react-icons/fa6";
import { MdAddPhotoAlternate } from "react-icons/md";
import { callApi } from "@/utils/helpers/call-api";
import { formatToastMessages } from "@/utils/helpers/format-toast-messages";
import { toast } from "react-toastify";
import { Carousel } from "./carousel";
import { useQueryClient } from "@tanstack/react-query";
import { useNotifyDelete } from "@/hooks/use-notify-delete";

interface PostHeaderProps {
  children: React.ReactNode;
  post: IPost;
  activeUser: IUser | null;
}

export function PostHeader({ children, post, activeUser }: PostHeaderProps) {
  const queryClient = useQueryClient();

  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [openPopover, setOpenPopover] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [disabledDeletePost, setDisabledDeletePost] = useState(false);
  const [filesUrl, setFilesUrl] = useState<string[]>([]);
  const [shouldDeleteCurrentFiles, setShouldDeleteCurrentFiles] =
    useState(false);

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
    setValue,
    reset,
    formState: { isSubmitting },
  } = form;

  const content = watch("message");

  const initialMessage = post.message ?? "";
  const initialFilesUrl = post.filesUrl ?? [];

  const onSubmit = useCallback(
    handleSubmit(async ({ message }) => {
      if (!message && !filesUrl.length) {
        return;
      }

      try {
        const res = await callApi<IUpdatePostPayload>(
          "patch",
          `post/update/${post.id}`,
          {
            message: !message ? "" : message,
            filesUrl,
            shouldDeleteCurrentFiles,
          },
        );
        if (!res.success) {
          toast.error(formatToastMessages(res.message));
          return;
        }

        toast.success(formatToastMessages(res.message));
        setOpenEditDialog(false);
        reset();
        setFilesUrl([]);
        setShouldDeleteCurrentFiles(false);
      } catch (error) {
        console.log(error);
      }
    }),
    [post.id, content, filesUrl, shouldDeleteCurrentFiles],
  );

  const handleUserClick = useNavigateUser(post.user);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(false);
    setOpenEditDialog(true);
  }, []);

  const handleOpenEditDialog = useCallback(
    (open: boolean) => {
      if (!open) {
        const isMessageChanged = content !== initialMessage;
        const isFilesChanged =
          filesUrl.length !== initialFilesUrl.length ||
          filesUrl.some((f, i) => f !== initialFilesUrl[i]);

        // ไม่ได้แก้ไขอะไรเลย → ปิดได้
        if (!isMessageChanged && !isFilesChanged) {
          setOpenEditDialog(false);
          return;
        }

        // แก้แล้วแต่ลบหมด → ไม่ให้ปิด
        if (!content && !filesUrl.length) {
          return;
        }
      }

      setOpenDeleteDialog(false);
      setOpenEditDialog(open);
    },
    [content, filesUrl, initialMessage, initialFilesUrl],
  );

  const handleOpenDeleteDialog = useCallback((open: boolean) => {
    setOpenPopover(false);
    setOpenEditDialog(false);
    setOpenDeleteDialog(open);
  }, []);

  const handleFilesChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      try {
        if (event.target.files) {
          const formData = new FormData();

          const filesArray = Array.from(event.target.files);
          filesArray.forEach((file) => {
            formData.append("files", file);
          });

          setDisabled(true);
          const res = await callApi(
            "post",
            "post/files/create",
            formData,
          ).finally(() => setDisabled(false));
          if (!res.success) {
            toast.error(formatToastMessages(res.message));
            return;
          }

          const files = (res.data as { filesUrl: string[] }).filesUrl;
          setFilesUrl(files);
          setShouldDeleteCurrentFiles(true);
        }
      } catch (error) {
        toast.error("Failed to upload files");
        setDisabled(false);
      }
    },
    [],
  );

  const handleDeletePost = useCallback(async () => {
    try {
      if (!activeUser) {
        return;
      }

      setDisabledDeletePost(true);
      const res = await callApi("delete", `post/delete/${post.id}`).finally(
        () => setDisabledDeletePost(false),
      );
      if (!res.success) {
        toast.error(formatToastMessages(res.message));
        return;
      }

      const deletedPost = res.data as IPost;
      useNotifyDelete(queryClient, deletedPost.id, activeUser.id);
      setOpenDeleteDialog(false);
      toast.success(formatToastMessages(res.message));
    } catch (error) {
      console.log(error);
    }
  }, [activeUser, post.id, queryClient]);

  const handleInputFilesClick = useCallback(
    (ref: RefObject<HTMLInputElement | null>) => {
      ref.current?.click();
    },
    [],
  );

  const handleSetDisabled = useCallback((status: boolean) => {
    setDisabled(status);
  }, []);

  const handleSetFilesUrl = useCallback((fileUrl: string) => {
    setFilesUrl((prevFiles) => prevFiles.filter((file) => file !== fileUrl));
  }, []);

  useEffect(() => {
    if (!openEditDialog) {
      reset();
      setShouldDeleteCurrentFiles(false);
      setFilesUrl([]);
      return;
    }

    if (post.message) {
      setValue("message", post.message);
    }

    requestAnimationFrame(() => {
      const input = inputRef.current;
      if (!input) {
        return;
      }

      const len = post.message?.length ?? 0;
      input.focus();
      input.setSelectionRange(len, len);
    });

    if (post.filesUrl && post.filesUrl.length) {
      setFilesUrl(post.filesUrl);
      setShouldDeleteCurrentFiles(false);
    }
  }, [openEditDialog]);

  return (
    <HStack>
      {children}
      {post.userId === activeUser?.id && (
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
                      open={openEditDialog}
                      onOpenChange={(e) => handleOpenEditDialog(e.open)}
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
                            </Dialog.Header>
                            <Dialog.Body>
                              <Stack gapY="4">
                                <HStack gap="4">
                                  {post.user.profileUrl ? (
                                    <Avatar.Root
                                      onClick={handleUserClick}
                                      size="xl"
                                      cursor="pointer"
                                    >
                                      <Avatar.Fallback
                                        name={post.user.fullname}
                                      />
                                      <Avatar.Image
                                        src={post.user.profileUrl}
                                      />
                                    </Avatar.Root>
                                  ) : (
                                    <Avatar.Root
                                      onClick={handleUserClick}
                                      size="xl"
                                      cursor="pointer"
                                    >
                                      <Avatar.Fallback
                                        name={post.user.fullname}
                                      />
                                    </Avatar.Root>
                                  )}
                                  <Text
                                    onClick={handleUserClick}
                                    fontWeight="medium"
                                    fontSize="md"
                                    cursor="pointer"
                                  >
                                    {post.user.fullname}
                                  </Text>
                                </HStack>

                                <form
                                  onSubmit={onSubmit}
                                  className="w-full flex flex-col gap-y-3"
                                >
                                  <HStack
                                    gapX="2"
                                    justifyContent="space-between"
                                  >
                                    <Textarea
                                      disabled={disabled || isSubmitting}
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

                                  <Carousel
                                    fileUrls={filesUrl}
                                    inDialog={true}
                                    isDisabled={disabled}
                                    onSetDisabled={handleSetDisabled}
                                    onSetFilesUrl={handleSetFilesUrl}
                                    itemsHeight="300px"
                                    isShowCloseBtn
                                  />

                                  {!post.parentId && (
                                    <HStack
                                      borderWidth="1px"
                                      borderColor="gray.300"
                                      rounded="lg"
                                      alignItems="center"
                                      justifyContent="space-between"
                                      p="3"
                                    >
                                      <Text>Add to your post</Text>
                                      <HStack alignItems="center" gapX="2">
                                        <input
                                          onChange={handleFilesChange}
                                          ref={photoRef}
                                          type="file"
                                          className="hidden"
                                          name="photo"
                                          accept=".jpg,.jpeg,.png,.webp"
                                          multiple
                                        />
                                        <input
                                          onChange={handleFilesChange}
                                          ref={videoRef}
                                          type="file"
                                          className="hidden"
                                          name="video"
                                          accept="video/*"
                                          multiple
                                        />
                                        <button
                                          onClick={() =>
                                            handleInputFilesClick(photoRef)
                                          }
                                          disabled={disabled || isSubmitting}
                                          type="button"
                                          className="disabled:cursor-not-allowed cursor-pointer"
                                        >
                                          <Icon
                                            size="lg"
                                            color="red.500"
                                            cursor="pointer"
                                          >
                                            <MdAddPhotoAlternate />
                                          </Icon>
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleInputFilesClick(videoRef)
                                          }
                                          disabled={disabled || isSubmitting}
                                          type="button"
                                          className="disabled:cursor-not-allowed cursor-pointer"
                                        >
                                          <Icon
                                            cursor="pointer"
                                            size="md"
                                            color="red.500"
                                          >
                                            <FaPaperclip />
                                          </Icon>
                                        </button>
                                      </HStack>
                                    </HStack>
                                  )}

                                  <Button
                                    loading={disabled || isSubmitting}
                                    disabled={disabled || isSubmitting}
                                    type="submit"
                                  >
                                    Edit
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

                    <Dialog.Root
                      open={openDeleteDialog}
                      onOpenChange={(e) => handleOpenDeleteDialog(e.open)}
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
                              <Dialog.Title textAlign="center" width="full">
                                Delete post
                              </Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                              <Text
                                textAlign="center"
                                textStyle="md"
                                color="red.600"
                                fontWeight="semibold"
                              >
                                Are you sure to delete a post?
                              </Text>
                            </Dialog.Body>
                            <Dialog.Footer>
                              <Dialog.ActionTrigger asChild>
                                <Button variant="outline">Cancel</Button>
                              </Dialog.ActionTrigger>
                              <Button
                                onClick={handleDeletePost}
                                disabled={disabledDeletePost}
                                loading={disabledDeletePost}
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
  );
}
