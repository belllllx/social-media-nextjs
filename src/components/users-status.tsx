"use client";

import { Box, Flex } from "@chakra-ui/react";
import { ItemsNotFound } from "./items-not-found";
import { Spinner } from "./spinner";
import { UsersSkeleton } from "./users-skeleton";
import { UserStatus } from "./user-status";
import { Error } from "./error";
import { useUsersOnline } from "@/hooks/use-users-online";

export function UsersStatus() {
  const {
    data: users,
    isLoading,
    isError,
    status,
    error,
    refetch,
  } = useUsersOnline();

  if (status === "pending") {
    return <UsersSkeleton amount={8} height="68px" />;
  }

  if (isError) {
    return <Error error={error} refetch={refetch} />;
  }

  if (isLoading) {
    return (
      <Flex
        width="full"
        height="full"
        justifyContent="center"
        alignItems="center"
      >
        <Spinner />
      </Flex>
    );
  }

  return (
    <Box height="full">
      {users.length ? users.map((user) => (
        <UserStatus key={user.id} user={user} />
      )) :
        <ItemsNotFound title="people" />
      }
    </Box>
  );
}
