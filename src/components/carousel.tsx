"use client";

import React, { forwardRef, useCallback } from "react";
import {
  Box,
  Carousel as ChakraCarousel,
  IconButton,
  IconButtonProps,
  Image,
} from "@chakra-ui/react";
import { LuArrowLeft, LuArrowRight } from "react-icons/lu";
import { SocialVideoPlayer } from "./social-video-player";
import { getFileDir } from "@/utils/helpers/get-file-dir";
import NextImage from "next/image";
import { callApi } from "@/utils/helpers/call-api";
import { toast } from "react-toastify";
import { formatToastMessages } from "@/utils/helpers/format-toast-messages";
import { IDeleteFilePayload } from "@/utils/types";
import { FaXmark } from "react-icons/fa6";

interface CarouselProps {
  fileUrls: string[];
  inDialog: boolean;
  isDisabled?: boolean;
  onSetDisabled?: (status: boolean) => void;
  onSetFilesUrl?: (fileUrl: string) => void;
  itemsHeight?: string;
  isShowCloseBtn?: boolean;
}

export function Carousel({
  fileUrls,
  inDialog,
  isDisabled,
  onSetDisabled,
  onSetFilesUrl,
  itemsHeight,
  isShowCloseBtn = false,
}: CarouselProps) {
  const handleDeleteFile = useCallback(async (fileUrl: string) => {
    if (!(onSetDisabled && onSetFilesUrl && isShowCloseBtn)) {
      return;
    }

    try {
      onSetDisabled(true);
      const res = await callApi<{ data: IDeleteFilePayload }>(
        "delete",
        "post/delete/file",
        {
          data: { fileUrl },
        }
      ).finally(() => onSetDisabled(false));
      if (!res.success) {
        toast.error(formatToastMessages(res.message));
        return;
      }

      toast.success(formatToastMessages(res.message));
      onSetFilesUrl(fileUrl);
    } catch (error) {
      toast.error("Failed to delete file");
      onSetDisabled(false);
    }
  }, [onSetDisabled, onSetFilesUrl]);

  return (
    <ChakraCarousel.Root
      allowMouseDrag
      slideCount={fileUrls.length}
      cursor="pointer"
      width="full"
      mx="auto"
      gap="4"
      position="relative"
      colorPalette="white"
      rounded="2xl"
      overflow="hidden"
    >
      <ChakraCarousel.Control gap="4" width="full" position="relative">
        {inDialog && (
          <ChakraCarousel.PrevTrigger asChild>
            <ActionButton insetStart="4">
              <LuArrowLeft />
            </ActionButton>
          </ChakraCarousel.PrevTrigger>
        )}

        <ChakraCarousel.ItemGroup width="full">
          {fileUrls.map((file, index) => (
            <ChakraCarousel.Item key={file} index={index}>
              {isShowCloseBtn && (
                <IconButton
                  onClick={() => handleDeleteFile(file)}
                  disabled={isDisabled}
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
              )}
              {getFileDir(file) === "image" ? (
                <Box
                  width="full"
                  height={itemsHeight ?? "450px"}
                  position="relative"
                  rounded="2xl"
                  overflow="hidden"
                >
                  <Image asChild>
                    <NextImage
                      priority
                      src={file}
                      alt={file}
                      fill
                      unoptimized
                      style={{ objectFit: inDialog ? "fill" : "cover" }}
                    />
                  </Image>
                </Box>
              ) : (
                <Box width="full" height={itemsHeight ?? "450px"}>
                  <SocialVideoPlayer src={file} />
                </Box>
              )}
            </ChakraCarousel.Item>
          ))}
        </ChakraCarousel.ItemGroup>

        {inDialog && (
          <ChakraCarousel.NextTrigger asChild>
            <ActionButton insetEnd="4">
              <LuArrowRight />
            </ActionButton>
          </ChakraCarousel.NextTrigger>
        )}

        <Box position="absolute" bottom="6" width="full">
          <ChakraCarousel.Indicators
            transition="width 0.2s ease-in-out"
            transformOrigin="center"
            opacity="0.5"
            boxSize="2"
            _current={{
              width: "10",
              bg: "colorPalette.subtle",
              opacity: 1,
            }}
          />
        </Box>
      </ChakraCarousel.Control>
    </ChakraCarousel.Root>
  );
}

const ActionButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function ActionButton(props, ref) {
    return (
      <IconButton
        {...props}
        ref={ref}
        size="xs"
        variant="outline"
        rounded="full"
        position="absolute"
        zIndex="1"
        bg="bg"
      />
    );
  }
);
