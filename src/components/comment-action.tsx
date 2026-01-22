"use client";

import {
  Avatar,
  Box,
  HStack,
  IconButton,
  Image,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { CommentLikeBtn } from "./comment-like-btn";
import { IComment, IDeleteFilePayload, IUser } from "@/utils/types";
import { EmojiPicker } from "./emoji-picker";
import { FiPaperclip } from "react-icons/fi";
import { useForm } from "react-hook-form";
import {
  createContentSchema,
  CreateContentSchema,
} from "@/utils/validations/create-content";
import { zodResolver } from "@hookform/resolvers/zod";
import { callApi } from "@/utils/helpers/call-api";
import { formatToastMessages } from "@/utils/helpers/format-toast-messages";
import { toast } from "react-toastify";
import { FaXmark } from "react-icons/fa6";
import NextImage from "next/image";

interface CommentActionProps {
  comment: IComment;
  activeUser: IUser | null;
}

export function CommentAction({ comment, activeUser }: CommentActionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  const [openEditReply, setOpenEditReply] = useState(false);
  const [openReply, setOpenReply] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  const [shouldDeleteCurrentFile, setShouldDeleteCurrentFile] = useState(false);

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

  const onSubmit = handleSubmit(async ({ message }) => {
    // TODO: Create reply comment
    console.log(message);
  });

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
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
        setShouldDeleteCurrentFile(true);
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

  useEffect(() => {
    if (!openEditReply) {
      reset();
      setFileUrl("");
      setShouldDeleteCurrentFile(false);
      return;
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
  }, [openEditReply]);

  return (
    <Stack gapY="0">
      <HStack gapX="3">
        <CommentLikeBtn comment={comment} />
        <Text
          onClick={() => setOpenReply(true)}
          cursor="pointer"
          textStyle="sm"
        >
          Reply
        </Text>
        <Text
          cursor="pointer"
          textStyle="sm"
        >
          View replys
        </Text>
      </HStack>

      {openReply && (
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
              onClick={() => setOpenReply(false)}
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
    </Stack>
  );
}
