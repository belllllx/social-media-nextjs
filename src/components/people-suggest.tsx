"use client";

import { Avatar, Flex, IconButton, Stack, Text } from "@chakra-ui/react";
import { FaUserPlus } from "react-icons/fa6";
import { Spinner } from "./spinner";
import React from "react";
import { IFollower, IUser } from "@/utils/types";
import { FaUserCheck } from "react-icons/fa";
import { useNavigateUser } from "@/hooks/use-navigate-user";
import { useFollowUser } from "@/hooks/use-follow-user";

interface PeopleSuggestProps {
  user: IUser & { followers: IFollower[] };
  activeUserId: string;
}

export function PeopleSuggest({ user, activeUserId }: PeopleSuggestProps) {
  const handleUserClick = useNavigateUser(user);

  const { handleFollowUser, disabled } = useFollowUser();

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
      <Stack gap="0" flex="1" ml="3">
        <Text fontWeight="medium">{user.fullname}</Text>
        <Text color="fg.muted" textStyle="sm">
          {user.email}
        </Text>
      </Stack>
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          handleFollowUser(activeUserId, user.id);
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
        {user.followers.some(
          (follower) => follower.followerId === activeUserId
        ) ? (
          <FaUserCheck color="black" />
        ) : (
          <FaUserPlus color="black" />
        )}
      </IconButton>
    </Flex>
  );
}
