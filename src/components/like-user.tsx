import { useNavigateUser } from "@/hooks/use-navigate-user";
import { ILike } from "@/utils/types";
import { Avatar, Flex, Stack, Text } from "@chakra-ui/react";
import React from "react";

interface LikeUserProps {
  like: ILike;
}

export function LikeUser({ like }: LikeUserProps) {
  const handleUserClick = useNavigateUser(like.user);

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
      cursor="pointer"
      px="2"
      mb="2"
    >
      {like.user.profileUrl ? (
        <Avatar.Root size="xl">
          <Avatar.Fallback name={like.user.fullname} />
          <Avatar.Image src={like.user.profileUrl} />
        </Avatar.Root>
      ) : (
        <Avatar.Root size="xl">
          <Avatar.Fallback name={like.user.fullname} />
        </Avatar.Root>
      )}
      <Stack gap="0" flex="1" ml="3">
        <Text fontWeight="medium">{like.user.fullname}</Text>
        <Text color="fg.muted" textStyle="sm">
          {like.user.email}
        </Text>
      </Stack>
    </Flex>
  );
}
