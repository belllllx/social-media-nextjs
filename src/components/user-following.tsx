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

interface UserFollowingProps {
  user: IUser;
  followingOfUser: IUser & { followers: IFollower[] };
}

export function UserFollowing({ user, followingOfUser }: UserFollowingProps) {
  const { user: activeUser } = useUserStore((state) => state);

  const handleUserClick = useNavigateUser(followingOfUser);

  const { handleFollowUser, disabled } = useFollowUser();

  const isFollowing = useMemo(
    () => followingOfUser.followers.some((follower) => follower.followerId === activeUser?.id),
    [activeUser, followingOfUser]
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
      {followingOfUser.profileUrl ? (
        <Avatar.Root size="xl">
          <Avatar.Fallback name={followingOfUser.fullname} />
          <Avatar.Image src={followingOfUser.profileUrl} />
        </Avatar.Root>
      ) : (
        <Avatar.Root size="xl">
          <Avatar.Fallback name={followingOfUser.fullname} />
        </Avatar.Root>
      )}
      <Stack gap="0" flex="1" ml="3">
        <Text fontWeight="medium">{followingOfUser.fullname}</Text>
        <Text color="fg.muted" textStyle="sm">
          {followingOfUser.email}
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
              targetUser: followingOfUser,
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
