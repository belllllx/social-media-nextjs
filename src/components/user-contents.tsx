import { HStack, Stack } from "@chakra-ui/react";
import React from "react";
import { UserInfosCard } from "./user-infos-card";
import { IUser } from "@/utils/types";
import { PostsByUserOverview } from "./posts-by-user-overview";
import { UseQueryResult } from "@tanstack/react-query";
import { UserContentsSkeleton } from "./user-contents-skeleton";
import { PostsSkeleton } from "./posts-skeleton";

interface UserContentsProps {
  result: UseQueryResult<IUser, Error>;
}

export function UserContents({ result }: UserContentsProps) {
  const {
    data: user,
    isLoading,
  } = result;

  return (
    <HStack
      height="full"
      gapX="4"
      mdDown={{
        flexDirection: "column",
        flex: "1",
        gapY: "4",
      }}
      alignItems="flex-start"
    >
      {!user || isLoading ? (
        <>
          <UserContentsSkeleton />
          <Stack 
            gapY="4" 
            width="full" 
            flex="1"
          >
            <PostsSkeleton amount={3} />
          </Stack>
        </>
      ) : (
        <>
          <UserInfosCard user={user} />
          <PostsByUserOverview userId={user.id} />
        </>
      )}
    </HStack>
  );
}