"use client";

import React, {
  ChangeEvent,
  RefObject,
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

interface PostHeaderProps {
  children: React.ReactNode;
  post: IPost;
  activeUser: IUser | null;
}

export function PostHeader({ children, post, activeUser }: PostHeaderProps) {
  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [openPopover, setOpenPopover] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [filesUrl, setFilesUrl] = useState<string[]>([]);
  const [shouldDeleteCurrentFiles, setShouldDeleteCurrentFiles] = useState(false);

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

  const onSubmit = handleSubmit(async ({ message }) => {
    try {
      const res = await callApi<IUpdatePostPayload>(
        "patch",
        `post/update/${post.id}`,
        {
          message: !message ? undefined : message,
          filesUrl,
          shouldDeleteCurrentFiles,
        },
      );
      if (!res.success) {
        toast.error(formatToastMessages(res.message));
        return;
      }

      toast.success(formatToastMessages(res.message));
      setOpenDialog(false);
      reset();
      setFilesUrl([]);
    } catch (error) {
      console.log(error);
    }
  });

  const handleUserClick = useNavigateUser(post.user);

  function handleClosePopover() {
    setOpenPopover(false);
    setOpenDialog(true);
  }

  function handleOpenDialog(open: boolean) {
    if (open && post.message) {
      setValue("message", post.message);
    }

    setOpenDialog(open);

    if (!open) {
      reset();
    }
  }

  async function handleFilesChange(event: ChangeEvent<HTMLInputElement>) {
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
          formData
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
  }

  function handleInputFilesClick(ref: RefObject<HTMLInputElement | null>) {
    ref.current?.click();
  }

  function handleSetDisabled(status: boolean) {
    setDisabled(status);
  }

  function handleSetFilesUrl(fileUrl: string) {
    setFilesUrl((prevFiles) => prevFiles.filter((file) => file !== fileUrl));
  }

  useEffect(() => {
    if (!openDialog) {
      return;
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
  }, [openDialog]);

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
                      open={openDialog}
                      onOpenChange={(e) => handleOpenDialog(e.open)}
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
      )}
    </HStack>
  );
}
