"use client";

import React from "react";
import { Avatar, Box, SkeletonCircle } from "@chakra-ui/react";
import { UploadUserProfileImageBtn } from "./upload-user-profile-image-btn";
import { UseQueryResult } from "@tanstack/react-query";
import { IUser } from "@/utils/types";
import { ringCss } from "@/utils/helpers/define-style";

interface EditUserProfileImageProps {
  result: UseQueryResult<IUser, Error>;
}

export function EditUserProfileImage({ result }: EditUserProfileImageProps) {
  const {
    data: user,
    isLoading,
  } = result;

  if (isLoading || !user) {
    return (
      <Box
        width="180px"
        height="180px"
        rounded="full"
        backgroundColor="white"
        css={ringCss}
        mdDown={{
          width: "100px",
          height: "100px",
        }}
      >
        <SkeletonCircle width="full" height="full" />
      </Box>
    );
  }

  return (
    <Box position="relative">
      {user.profileUrl ? (
        <Avatar.Root
          css={ringCss}
          width="180px"
          height="180px"
          mdDown={{
            width: "100px",
            height: "100px",
          }}
        >
          <Avatar.Fallback name={user.fullname} />
          <Avatar.Image src={user.profileUrl} />
        </Avatar.Root>
      ) : (
        <Avatar.Root
          css={ringCss}
          width="180px"
          height="180px"
          mdDown={{
            width: "100px",
            height: "100px",
          }}
        >
          <Avatar.Fallback name={user.fullname} fontSize="5xl" />
        </Avatar.Root>
      )}
      <UploadUserProfileImageBtn user={user} />
    </Box >
  );
}
