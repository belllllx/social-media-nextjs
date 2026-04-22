"use client";

import { Avatar, Flex, IconButton, Stack, Text } from "@chakra-ui/react";
import { FaUserPlus } from "react-icons/fa6";
import { Spinner } from "./spinner";
import React, { useMemo } from "react";
import { IFollower, IUser } from "@/utils/types";
import { FaUserCheck } from "react-icons/fa";
import { useNavigateUser } from "@/hooks/use-navigate-user";
import { useFollowUser } from "@/hooks/use-follow-user";
import { useUserStore } from "@/providers/user-store-provider";

interface UserFollowerProps {
  user: IUser;
  followerOfUser: IUser & { followers: IFollower[] };
}

export function UserFollower({ user, followerOfUser }: UserFollowerProps) {
  const { user: activeUser } = useUserStore((state) => state);

  const handleUserClick = useNavigateUser(followerOfUser);

  const { handleFollowUser, disabled } = useFollowUser();

  const isFollowing = useMemo(
    () => followerOfUser.followers.some((follower) => follower.followerId === activeUser?.id),
    [activeUser, followerOfUser]
  );

  return (
    <Flex
      onClick={handleUserClick}
      width="full"
      height="80px"
      borderRadius="lg"
      alignItems="center"
      justifyContent="space-between"
      _hover={{
        backgroundColor: "gray.100",
        transitionDuration: "slow",
      }}
      px="2"
      mb="2"
      cursor="pointer"
    >
      {followerOfUser.profileUrl ? (
        <Avatar.Root size="xl">
          <Avatar.Fallback name={followerOfUser.fullname} />
          <Avatar.Image src={followerOfUser.profileUrl} />
        </Avatar.Root>
      ) : (
        <Avatar.Root size="xl">
          <Avatar.Fallback name={followerOfUser.fullname} />
        </Avatar.Root>
      )}
      <Stack gap="0" flex="1" ml="3">
        <Text fontWeight="medium">{followerOfUser.fullname}</Text>
        <Text color="fg.muted" textStyle="sm">
          {followerOfUser.email}
        </Text>
      </Stack>
      {activeUser && activeUser.id === user.id && (
        <IconButton
          onClick={(e) => {
            if (!activeUser) {
              return;
            }

            e.stopPropagation();
            handleFollowUser.mutate({
              activeUser,
              targetUser: followerOfUser,
            });
          }}
          loading={disabled}
          disabled={disabled}
          spinner={<Spinner size="md" />}
          bg="gray.200"
          _hover={{
            backgroundColor: "gray.300",
            transitionDuration: "slow",
          }}
          rounded="full"
          size="lg"
        >
          {isFollowing ? (
            <FaUserCheck color="black" />
          ) : (
            <FaUserPlus color="black" />
          )}
        </IconButton>
      )}
    </Flex>
  );
}
