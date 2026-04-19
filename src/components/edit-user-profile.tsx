"use client";

import React from "react";
import { Box, HStack, Skeleton, Text } from "@chakra-ui/react";
import { EditUserProfileImage } from "./edit-user-profile-image";
import { ringCss } from "@/utils/helpers/define-style";
import { toast } from "react-toastify";
import { ICommonResponse, IUser } from "@/utils/types";
import { UseQueryResult } from "@tanstack/react-query";

interface EditUserProfileProps {
  result: UseQueryResult<IUser, Error>;
}

export function EditUserProfile({ result }: EditUserProfileProps) {
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
    <HStack
      gapX="4"
      alignItems="center"
      position="absolute"
      top="50%"
      left="3%"
      transform="translate(-3%, -50%)"
      zIndex="39"
      mdDown={{
        flexDirection: "column",
        top: "20%",
        left: "50%",
        transform: "translate(-50%, -20%)",
        alignItems: "center",
        justifyContent: "center",
        gapY: "4",
      }}
    >
      <EditUserProfileImage result={result} />
      <Box
        width="300px"
        mdDown={{
          textAlign: "center",
        }}
      >
        {isLoading || !user ? (
          <Skeleton
            height="5"
            width="full"
            css={ringCss}
            mdDown={{
              height: "3",
            }}
          />
        ) : (
          <Text
            textStyle="2xl"
            fontWeight="bold"
            color="white"
            mdDown={{
              textStyle: "xl",
            }}
          >
            {user.fullname}
          </Text>
        )}
      </Box>
    </HStack>
  );
}