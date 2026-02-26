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
import { IPost, IUser } from "@/utils/types";
import { LikeUser } from "./like-user";
import { ItemsNotFound } from "./items-not-found";
import { toast } from "react-toastify";
import { formatToastMessages } from "@/utils/helpers/format-toast-messages";
import { QueryClient } from "@tanstack/react-query";
import { usePostLike } from "@/hooks/use-post-like";

interface PostLikeBtnProps {
  post: IPost;
  activeUser: IUser | null;
  queryClient: QueryClient;
}

export function PostLikeBtn({
  post,
  activeUser,
  queryClient,
}: PostLikeBtnProps) {
  const postLikeMutation = usePostLike(queryClient);

  const [isLoading, setIsLoading] = useState(false);

  const handlePostLike = useCallback(async () => {
    if (!activeUser) {
      return;
    }

    try {
      setIsLoading(true);
      const res = await postLikeMutation.mutateAsync({
        user: activeUser,
        postId: post.id,
      });
      if (!res.success) {
        toast.error(formatToastMessages(res.message));
        return;
      }

      toast.success(formatToastMessages(res.message));
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [postLikeMutation, activeUser, post.id]);

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
          {post.likes.some((like) => like.userId === activeUser?.id) ? (
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
