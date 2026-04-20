"use client";

import React from "react";
import { UserProfileSettings } from "./user-profile-settings";
import { UserContents } from "./user-contents";
import { useUserById } from "@/hooks/use-user-by-id";
import { toast } from "react-toastify";
import { ICommonResponse } from "@/utils/types";
import { UserContentsSkeleton } from "./user-contents-skeleton";

interface ProfileOverviewProps {
  id: string;
}

export function ProfileOverview({ id }: ProfileOverviewProps) {
  const result = useUserById(id);

  const {
    data: user,
    isLoading,
    isError,
    error,
  } = result;

  if (isError) {
    toast.error((error as unknown as ICommonResponse).message);
  }

  return (
    <>
      <UserProfileSettings id={id} result={result} />
      {!user || isLoading ? (
        <UserContentsSkeleton />
      ) : (
        <UserContents user={user} />
      )}
    </>
  );
}