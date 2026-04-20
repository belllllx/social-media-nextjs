import { HStack } from "@chakra-ui/react";
import React from "react";
import { UserInfosCard } from "./user-infos-card";
import { IUser } from "@/utils/types";

interface UserContentsProps {
  user: IUser;
}

export function UserContents({ user }: UserContentsProps) {
  return (
    <HStack gapX="4">
      <UserInfosCard user={user} />
    </HStack>
  );
}