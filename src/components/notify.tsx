import { formatDate } from "@/utils/helpers/format-date";
import { INotify } from "@/utils/types";
import { Avatar, Flex, HStack, Link, Text, VStack } from "@chakra-ui/react";
import NextLink from "next/link";

interface NotifyPops {
  notification: INotify;
}

export function Notify({ notification }: NotifyPops) {
  return (
    <Link
      cursor="pointer"
      asChild
      _hover={{
        backgroundColor: "gray.100",
        transitionDuration: "slow",
        textDecoration: "none",
      }}
      _focus={{ boxShadow: "none", outline: "none" }}
      borderRadius="sm"
      display="block"
      borderY="0"
    >
      <NextLink
        href={
          notification.postId
            ? `/post/${notification.postId}`
            : `/profile/${notification.senderId}`
        }
      >
        <HStack alignItems="center" gapX="3" padding="2.5">
          {notification.sender.profileUrl ? (
            <Avatar.Root size="xl">
              <Avatar.Fallback name={notification.sender.fullname} />
              <Avatar.Image src={notification.sender.profileUrl} />
            </Avatar.Root>
          ) : (
            <Avatar.Root size="xl">
              <Avatar.Fallback name={notification.sender.fullname} />
            </Avatar.Root>
          )}
          <VStack alignItems="start" justifyContent="center" gap="0">
            <Text
              fontWeight="medium"
              maxW="150px"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            >
              {notification.sender.fullname}
            </Text>
            <Flex maxW="200px">
              <Text fontWeight="normal" truncate>
                {notification.message}
              </Text>
            </Flex>
            <Text color="fg.muted" textStyle="sm">
              {formatDate(notification.createdAt)}
            </Text>
          </VStack>
        </HStack>
      </NextLink>
    </Link>
  );
}
