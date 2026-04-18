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

interface UserProfileSettingsProps {
  id: string;
}

export function UserProfileSettings({ id }: UserProfileSettingsProps) {
  const { user, isLoading } = useUserStore((state) => state);

  const { handleFollowUser, disabled } = useFollowUser();

  const isFolllowing = useMemo(() =>
    user && user.followings.some((following) => following.followingId === id),
    [user, id]
  );

  return (
    <Box
      borderRadius="lg"
      width="full"
      display="flex"
      flexDirection="column"
      overflow="hidden"
      position="relative"
    >
      <EditUserProfile id={id} />
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
        {!user ? (
          <HStack gapX="3">
            <Skeleton width="150px" height="40px" />
            <Skeleton width="150px" height="40px" />
          </HStack>
        ) : user.id === id ? (
          <HStack gapX="3">
            <EditBackgroundBtn />
            <EditUserInfoBtn activeUser={user} />
          </HStack>
        ) : (
          <Button
            onClick={() => handleFollowUser(user.id, id)}
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