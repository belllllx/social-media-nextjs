"use client";

import { useNavigateUser } from "@/hooks/use-navigate-user";
import { useUserStore } from "@/providers/user-store-provider";
import { IDeleteFilePayload, IPost } from "@/utils/types";
import {
  createContentSchema,
  CreateContentSchema,
} from "@/utils/validations/create-content";
import {
  Avatar,
  Box,
  HStack,
  IconButton,
  Image,
  Input,
  Stack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { EmojiPicker } from "./emoji-picker";
import { FiPaperclip } from "react-icons/fi";
import { callApi } from "@/utils/helpers/call-api";
import { formatToastMessages } from "@/utils/helpers/format-toast-messages";
import { toast } from "react-toastify";
import { FaXmark } from "react-icons/fa6";
import NextImage from "next/image";
import { useActionStore } from "@/providers/action-store-provider";

interface CreateCommentProps {
  post: IPost;
}

export function CreateComment({ post }: CreateCommentProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  const [disabled, setDisabled] = useState(false);
  const [fileUrl, setFileUrl] = useState("");

  const { user } = useUserStore((state) => state);
  const { focusPostId, setFocusPostId } = useActionStore((state) => state);

  const handleUserClick = useNavigateUser(user);

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

  async function handleFilesChange(event: ChangeEvent<HTMLInputElement>) {
    try {
      const file = event.target.files?.[0];
      if (file) {
        const formData = new FormData();

        formData.append("files", file);

        setDisabled(true);
        const res = await callApi(
          "post",
          "comment/file/create",
          formData
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
        }
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
    if(focusPostId === post.id){
      inputRef.current?.focus();
      setFocusPostId(null);
    }
  }, [focusPostId]);

  return (
    <Stack gapY="3">
      <HStack gapX="3">
        {user?.profileUrl ? (
          <Avatar.Root onClick={handleUserClick} size="md" cursor="pointer">
            <Avatar.Fallback name={user?.fullname} />
            <Avatar.Image src={user?.profileUrl} />
          </Avatar.Root>
        ) : (
          <Avatar.Root onClick={handleUserClick} size="md" cursor="pointer">
            <Avatar.Fallback name={user?.fullname} />
          </Avatar.Root>
        )}

        <form onSubmit={onSubmit} className="w-full">
          <Input
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
          disabled={disabled}
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
            <NextImage 
              src={fileUrl} 
              alt={fileUrl} 
              fill 
            />
          </Image>
        </Box>
      )}
    </Stack>
  );
}
