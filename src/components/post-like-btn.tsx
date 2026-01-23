"use client";

import React, { useCallback, useState } from "react";
import {
  Box,
  Button,
  CloseButton,
  Dialog,
  HStack,
  Portal,
  Text,
} from "@chakra-ui/react";
import { BiLike, BiSolidLike } from "react-icons/bi";
import { IPost } from "@/utils/types";
import { LikeUser } from "./like-user";
import { ItemsNotFound } from "./items-not-found";
import { callApi } from "@/utils/helpers/call-api";
import { toast } from "react-toastify";
import { formatToastMessages } from "@/utils/helpers/format-toast-messages";

interface PostLikeBtnProps {
  post: IPost;
  activeUserId?: string;
}

export function PostLikeBtn({ post, activeUserId }: PostLikeBtnProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePostLike = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await callApi(
        "post",
        `post/like/${activeUserId}/${post.id}`,
      ).finally(() => setIsLoading(false));
      if (!res.success) {
        toast.error(formatToastMessages(res.message));
        return;
      }

      toast.success(formatToastMessages(res.message));
    } catch (error) {
      console.log(error);
    }
  }, [activeUserId, post.id]);

  return (
    <Dialog.Root placement="center" motionPreset="scale">
      <HStack gapX="1">
        <Button
          onClick={handlePostLike}
          disabled={isLoading}
          type="button"
          variant="plain"
          p="0"
          justifyContent="flex-end"
        >
          {post.likes.some((like) => like.userId === activeUserId) ? (
            <BiSolidLike />
          ) : (
            <BiLike />
          )}
        </Button>
        <Dialog.Trigger asChild>
          <Text cursor="pointer">
            {post.likes.length > 0 ? post.likes.length : ""} Like
          </Text>
        </Dialog.Trigger>
      </HStack>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title textAlign="center" width="full">
                Post like
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Box overflowY="auto" flex="1" width="full">
                {!post.likes.length ? (
                  <ItemsNotFound title="like" />
                ) : (
                  post.likes.map((like) => (
                    <LikeUser key={like.userId} like={like} />
                  ))
                )}
              </Box>
            </Dialog.Body>
            <Dialog.CloseTrigger asChild rounded="full">
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
