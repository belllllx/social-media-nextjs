import { IUser } from "@/utils/types";
import { Box, Flex, Text } from "@chakra-ui/react";
import { formatDateOfBirth } from "@/utils/helpers/format-date";
import React from "react";
import { ActiveUserFollower } from "./active-user-follower";
import { ActiveUserFollowing } from "./active-user-following";

interface UserInfosCardProps {
  user: IUser
}

export function UserInfosCard({ user }: UserInfosCardProps) {
  return (
    <Box
      borderRadius="lg"
      width="400px"
      display="flex"
      flexDirection="column"
      gapY="4"
      backgroundColor="white"
      p="4"
    >
      <Text textStyle="lg" fontWeight="bold">Info</Text>

      <Flex
        textStyle="md"
        fontWeight="semibold"
        display="flex"
        gapX="2"
      >
        Date of birth:
        <Text textStyle="md" fontWeight="bold">
          {formatDateOfBirth(user.dateOfBirth)}
        </Text>
      </Flex>

      <ActiveUserFollower user={user} />
      <ActiveUserFollowing user={user} />

      <Flex
        textStyle="md"
        fontWeight="semibold"
        display="flex"
        gapX="2"
      >
        Information:
        <Text
          textStyle="md"
          fontWeight="bold"
          truncate
        >
          {user.info ?? "-"}
        </Text>
      </Flex>
    </Box>
  );
}