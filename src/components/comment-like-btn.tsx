"use client";

import React, { useCallback, useState } from "react";
import {
  Box,
  CloseButton,
  Dialog,
  HStack,
  IconButton,
  Portal,
  Text,
} from "@chakra-ui/react";
import { BiLike, BiSolidLike } from "react-icons/bi";
import { IComment, IPost, IUser } from "@/utils/types";
import { LikeUser } from "./like-user";
import { ItemsNotFound } from "./items-not-found";
import { callApi } from "@/utils/helpers/call-api";
import { toast } from "react-toastify";
import { formatToastMessages } from "@/utils/helpers/format-toast-messages";

interface CommentLikeBtnProps {
  post: IPost;
  comment: IComment;
  activeUser: IUser | null;
}

export function CommentLikeBtn({
  post,
  comment,
  activeUser,
}: CommentLikeBtnProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCommentLike = useCallback(async () => {
    if (!activeUser) {
      return;
    }

    try {
      setIsLoading(true);
      const res = await callApi(
        "post",
        `comment/like/${activeUser?.id}/${post.id}/${comment.id}`,
      ).finally(() => setIsLoading(false));
      if (!res.success) {
        toast.error(formatToastMessages(res.message));
        return;
      }

      toast.success(formatToastMessages(res.message));
    } catch (error) {
      console.log(error);
    }
  }, [activeUser?.id, post.id, comment.id]);

  return (
    <Dialog.Root placement="center" motionPreset="scale">
      <HStack gapX="1">
        <IconButton
          onClick={handleCommentLike}
          disabled={isLoading}
          type="button"
          variant="plain"
          p="0"
          justifyContent="flex-end"
          size="md"
        >
          {comment.likes.some((like) => like.userId === activeUser?.id) ? (
            <BiSolidLike />
          ) : (
            <BiLike />
          )}
        </IconButton>
        <Dialog.Trigger asChild>
          <Text cursor="pointer" textStyle="sm">
            {comment.likes.length > 0 ? comment.likes.length : ""} Like
          </Text>
        </Dialog.Trigger>
      </HStack>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title textAlign="center" width="full">
                Comment like
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Box overflowY="auto" flex="1" width="full">
                {!comment.likes.length ? (
                  <ItemsNotFound title="like" />
                ) : (
                  comment.likes.map((like) => (
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
