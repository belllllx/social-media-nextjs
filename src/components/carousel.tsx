"use client";

import React, { useCallback } from "react";
import {
  Box,
  IconButton,
  Image,
} from "@chakra-ui/react";
import { SocialVideoPlayer } from "./social-video-player";
import { getFileDir } from "@/utils/helpers/get-file-dir";
import NextImage from "next/image";
import { callApi } from "@/utils/helpers/call-api";
import { toast } from "react-toastify";
import { formatToastMessages } from "@/utils/helpers/format-toast-messages";
import { DeleteFilePayload } from "@/utils/types";
import { FaXmark } from "react-icons/fa6";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

interface CarouselProps {
  fileUrls: string[];
  isDisabled?: boolean;
  onSetDisabled?: (status: boolean) => void;
  onSetFilesUrl?: (fileUrl: string) => void;
  onSetIsDeletePostFile?: (isDeleted: boolean, deletedPostFile: string) => void;
  onSetDeletingFile?: (isDeleting: boolean) => void
  itemsHeight?: string;
  isShowCloseBtn?: boolean;
}

export function Carousel({
  fileUrls,
  isDisabled,
  onSetDisabled,
  onSetFilesUrl,
  onSetIsDeletePostFile,
  onSetDeletingFile,
  itemsHeight,
  isShowCloseBtn = false,
}: CarouselProps) {
  const handleDeleteFile = useCallback(async (fileUrl: string) => {
    if (
      !onSetDisabled
      ||
      !onSetFilesUrl
      ||
      !isShowCloseBtn
      ||
      !onSetIsDeletePostFile
      ||
      !onSetDeletingFile
    ) {
      return;
    }

    try {
      onSetDeletingFile(true);
      onSetDisabled(true);
      const res = await callApi<{ data: DeleteFilePayload }>(
        "delete",
        "post/delete/file",
        {
          data: { fileUrl },
        }
      );
      if (!res.success) {
        toast.error(formatToastMessages(res.message));
        return;
      }

      toast.success(formatToastMessages(res.message));
      onSetFilesUrl(fileUrl);
      onSetIsDeletePostFile(true, fileUrl);
    } catch (error) {
      toast.error("Failed to delete file");
      console.error("Failed to delete file", error);
    } finally {
      onSetDeletingFile(false);
      onSetDisabled(false);
    }
  }, [isShowCloseBtn, onSetDisabled, onSetFilesUrl, onSetIsDeletePostFile, onSetDeletingFile]);

  return (
    <Swiper
      pagination={{
        dynamicBullets: true,
      }}
      modules={[Pagination]}
      grabCursor
      className="mySwiper w-full"
    >
      {fileUrls.map((file) => (
        <SwiperSlide key={file} className="w-full">
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
              <Image alt="carousel-image" asChild>
                <NextImage
                  priority
                  src={file}
                  alt={file}
                  fill
                  unoptimized
                  style={{
                    objectFit: "cover"
                  }}
                />
              </Image>
            </Box>
          ) : (
            <Box width="full" height={itemsHeight ?? "450px"}>
              <SocialVideoPlayer src={file} />
            </Box>
          )}
        </SwiperSlide>
      ))}
    </Swiper>
  );
}