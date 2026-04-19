"use client";

import React, { useMemo } from "react";
import { Box, Button, Flex, HStack, Image, Skeleton } from "@chakra-ui/react";
import { EditBackgroundBtn } from "./edit-background-btn";
import { EditUserInfoBtn } from "./edit-user-info-btn";
import { useUserStore } from "@/providers/user-store-provider";
import NextImage from "next/image";
import { EditUserProfile } from "./edit-user-profile";
import { FaUserCheck, FaUserPlus } from "react-icons/fa6";
import { useFollowUser } from "@/hooks/use-follow-user";
import { useUserById } from "@/hooks/use-user-by-id";
import { toast } from "react-toastify";
import { ICommonResponse } from "@/utils/types";

interface UserProfileSettingsProps {
  id: string;
}

export function UserProfileSettings({ id }: UserProfileSettingsProps) {
  const result = useUserById(id);

  const { user: activeUser } = useUserStore((state) => state);

  const { handleFollowUser, disabled } = useFollowUser();

  const isFolllowing = useMemo(() =>
    activeUser && activeUser.followings.some((following) => following.followingId === id),
    [activeUser, id]
  );

  const {
    data: user,
    isLoading,
    isError,
    error,
  } = result;

  if (isError) {
    toast.error((error as unknown as ICommonResponse).message);
  }

  return (
    <Box
      borderRadius="lg"
      width="full"
      display="flex"
      flexDirection="column"
      overflow="hidden"
      position="relative"
    >
      <EditUserProfile result={result} />
      {!user || isLoading ? (
        <Skeleton height="200px" position="relative" />
      ) : (
        <Box
          backgroundColor="blackAlpha.500"
          height="200px"
          position="relative"
        >
          {user && user.profileBackgroundUrl && (
            <Image alt="user-background-image" asChild>
              <NextImage src={user.profileBackgroundUrl} alt={"userBackgroundImage"} fill />
            </Image>
          )}
        </Box>
      )}
      <Flex
        p="4"
        justifyContent="flex-end"
        backgroundColor="white"
      >
        {!user || !activeUser ? (
          <HStack gapX="3">
            <Skeleton width="150px" height="40px" />
            <Skeleton width="150px" height="40px" />
          </HStack>
        ) : activeUser.id === id ? (
          <HStack gapX="3">
            <EditBackgroundBtn user={user} />
            <EditUserInfoBtn activeUser={activeUser} user={user} />
          </HStack>
        ) : (
          <Button
            onClick={() => handleFollowUser(activeUser.id, id)}
            disabled={disabled}
            loading={disabled}
          >
            {isFolllowing ? (
              <>
                <FaUserCheck />
                Following
              </>
            ) : (
              <>
                <FaUserPlus />
                Follow
              </>
            )}
          </Button>
        )}
      </Flex>
    </Box>
  );
}