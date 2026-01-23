"use client";

import { useLoadingComponent } from "@/hooks/use-loading-component";
import { useNavigateUser } from "@/hooks/use-navigate-user";
import { useUserStore } from "@/providers/user-store-provider";
import {
  Avatar,
  Box,
  Button,
  HStack,
  Icon,
  IconButton,
  Image,
  Input,
  SkeletonCircle,
  Text,
} from "@chakra-ui/react";
import { EmojiPicker } from "./emoji-picker";
import { useForm } from "react-hook-form";
import {
  createContentSchema,
  CreateContentSchema,
} from "@/utils/validations/create-content";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangeEvent, RefObject, useCallback, useRef, useState } from "react";
import { MdAddPhotoAlternate } from "react-icons/md";
import { FaPlayCircle } from "react-icons/fa";
import { callApi } from "@/utils/helpers/call-api";
import { toast } from "react-toastify";
import { formatToastMessages } from "@/utils/helpers/format-toast-messages";
import NextImage from "next/image";
import { getFileDir } from "@/utils/helpers/get-file-dir";
import { SocialVideoPlayer } from "@/components/social-video-player";
import { FaXmark } from "react-icons/fa6";
import { ICreatePostPayload, IDeleteFilePayload } from "@/utils/types";

export function CreatePost() {
  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [filesUrl, setFilesUrl] = useState<string[]>([]);
  const [disabled, setDisabled] = useState(false);

  const { user, isLoading } = useUserStore((state) => state);

  const handleUserClick = useNavigateUser(user);

  const loadingComponent = useLoadingComponent(isLoading);

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

  const onSubmit = useCallback(
    handleSubmit(async ({ message }) => {
      if (!(filesUrl.length || message)) {
        return;
      }

      try {
        setDisabled(true);
        const res = await callApi<ICreatePostPayload>(
          "post",
          `post/create/${user?.id}`,
          {
            message: !message ? undefined : message,
            filesUrl,
          },
        ).finally(() => setDisabled(false));
        if (!res.success) {
          toast.error(formatToastMessages(res.message));
          return;
        }

        toast.success(formatToastMessages(res.message));
        form.reset();
        setFilesUrl([]);
      } catch (error) {
        console.log(error);
        toast.error("Failed to create post");
      }
    }),
    [content, filesUrl, user?.id],
  );

  const handleInputFilesClick = useCallback(
    (ref: RefObject<HTMLInputElement | null>) => {
      ref.current?.click();
    },
    [],
  );

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
        }
      } catch (error) {
        toast.error("Failed to upload files");
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
        "post/delete/file",
        {
          data: { fileUrl },
        },
      ).finally(() => setDisabled(false));
      if (!res.success) {
        toast.error(formatToastMessages(res.message));
        return;
      }

      toast.success(formatToastMessages(res.message));
      setFilesUrl((prevFiles) => prevFiles.filter((file) => file !== fileUrl));
    } catch (error) {
      toast.error("Failed to delete file");
      setDisabled(false);
    }
  }, []);

  return (
    <Box
      borderRadius="lg"
      width="full"
      backgroundColor="white"
      p="4"
      display="flex"
      flexDirection="column"
      gap="4"
    >
      <form
        onSubmit={onSubmit}
        className="flex flex-col justify-center gap-y-4"
      >
        <HStack gapX="3">
          {loadingComponent || isLoading ? (
            <SkeletonCircle size="12" />
          ) : (
            user && (
              <Box onClick={handleUserClick} cursor="pointer">
                {user.profileUrl ? (
                  <Avatar.Root size="xl">
                    <Avatar.Fallback name={user.fullname} />
                    <Avatar.Image src={user.profileUrl} />
                  </Avatar.Root>
                ) : (
                  <Avatar.Root size="xl">
                    <Avatar.Fallback name={user.fullname} />
                  </Avatar.Root>
                )}
              </Box>
            )
          )}
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
          <EmojiPicker
            inputRef={inputRef}
            useFormReturn={form}
            valueKey="message"
          />
        </HStack>
        <HStack justifyContent="space-around" flex="1">
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

          <Button
            onClick={() => handleInputFilesClick(photoRef)}
            disabled={disabled}
            variant="ghost"
            width="25%"
            type="button"
          >
            <Icon size="lg" color="green.500">
              <MdAddPhotoAlternate size="24" />
            </Icon>
            <Text color="green.500" textStyle="md">
              Photo
            </Text>
          </Button>

          <Button
            onClick={() => handleInputFilesClick(videoRef)}
            disabled={disabled}
            variant="ghost"
            width="25%"
            type="button"
          >
            <Icon size="md" color="purple.500">
              <FaPlayCircle size="24" />
            </Icon>
            <Text color="purple.500" textStyle="md">
              Video
            </Text>
          </Button>

          <Button
            loading={isSubmitting || disabled}
            disabled={isSubmitting || disabled}
            type="submit"
            width="25%"
          >
            Submit
          </Button>
        </HStack>
      </form>

      {filesUrl.length > 0 && (
        <Box display="flex" alignItems="center" gapX="4" overflowX="auto">
          {filesUrl.map((fileUrl) => (
            <Box
              key={fileUrl}
              width="300px"
              height="300px"
              backgroundColor="grey.500"
              flexShrink="0"
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
              {getFileDir(fileUrl) === "image" ? (
                <Image asChild>
                  <NextImage src={fileUrl} alt={fileUrl} fill />
                </Image>
              ) : (
                <SocialVideoPlayer src={fileUrl} />
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
