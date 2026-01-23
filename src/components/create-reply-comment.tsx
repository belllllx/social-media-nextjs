"use client";

import {
  IComment,
  ICreateCommentPayload,
  IDeleteFilePayload,
  IPost,
  IUser,
} from "@/utils/types";
import { Avatar, Box, HStack, IconButton, Input, Text } from "@chakra-ui/react";
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { EmojiPicker } from "./emoji-picker";
import { FiPaperclip } from "react-icons/fi";
import { useForm } from "react-hook-form";
import {
  createContentSchema,
  CreateContentSchema,
} from "@/utils/validations/create-content";
import { zodResolver } from "@hookform/resolvers/zod";
import { callApi } from "@/utils/helpers/call-api";
import { toast } from "react-toastify";
import { formatToastMessages } from "@/utils/helpers/format-toast-messages";
import { FaXmark } from "react-icons/fa6";
import { Image } from "@chakra-ui/react";
import NextImage from "next/image";
import { useActionStore } from "@/providers/action-store-provider";

interface CreateReplyCommentProps {
  isOpenReply: boolean;
  activeUser: IUser | null;
  onOpenReply: (open: boolean) => void;
  post: IPost;
  comment: IComment;
}

export function CreateReplyComment({
  isOpenReply,
  activeUser,
  onOpenReply,
  post,
  comment,
}: CreateReplyCommentProps) {
  const { setShowReplyOnCommentId } = useActionStore((state) => state);

  const inputRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);

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

  const onSubmit = useCallback(
    handleSubmit(async ({ message }) => {
      if (!activeUser || (!message && !fileUrl)) {
        return;
      }

      try {
        const res = await callApi<ICreateCommentPayload>(
          "post",
          `comment/reply/create/${activeUser?.id}/${comment.id}/${post.id}`,
          {
            message: !message ? undefined : message,
            fileUrl: !fileUrl ? undefined : fileUrl,
          },
        );

        if (!res.success) {
          toast.error(formatToastMessages(res.message));
          return;
        }

        setShowReplyOnCommentId({
          commentId: comment.id,
          open: true,
        });
        reset();
        setFileUrl("");
      } catch (error) {
        console.log(error);
      }
    }),
    [],
  );
  //   if (!activeUser || (!message && !fileUrl)) {
  //     return;
  //   }

  //   try {
  //     const res = await callApi<ICreateCommentPayload>(
  //       "post",
  //       `comment/reply/create/${activeUser?.id}/${comment.id}/${post.id}`,
  //       {
  //         message: !message ? undefined : message,
  //         fileUrl: !fileUrl ? undefined : fileUrl,
  //       },
  //     );

  //     if (!res.success) {
  //       toast.error(formatToastMessages(res.message));
  //       return;
  //     }

  //     reset();
  //     setFileUrl("");
  //   } catch (error) {
  //     console.log(error);
  //   }
  // });

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
    },
    [],
  );

  const handleDeleteFile = useCallback(async (fileUrl: string) => {
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
  }, []);

  useEffect(() => {
    if(!isOpenReply){
      reset();
    }
  }, [isOpenReply]);

  return (
    <>
      {isOpenReply && (
        <HStack gapX="3" alignItems="flex-start" mb="2">
          <>
            {activeUser?.profileUrl ? (
              <Avatar.Root size="lg">
                <Avatar.Fallback name={activeUser?.fullname} />
                <Avatar.Image src={activeUser?.profileUrl} />
              </Avatar.Root>
            ) : (
              <Avatar.Root size="lg">
                <Avatar.Fallback name={activeUser?.fullname} />
              </Avatar.Root>
            )}
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
            <Text
              onClick={() => onOpenReply(false)}
              cursor="pointer"
              color="fg.muted"
              py="2"
              textStyle="sm"
            >
              Cancel
            </Text>
          </>
        </HStack>
      )}

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
          <Image asChild>
            <NextImage src={fileUrl} alt={fileUrl} fill />
          </Image>
        </Box>
      )}
    </>
  );
}
