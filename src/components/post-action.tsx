"use client";

import React from "react";
import { Button, HStack, Separator, Stack } from "@chakra-ui/react";
import { BiLike, BiSolidLike } from "react-icons/bi";
import { FaRegComment } from "react-icons/fa6";
import { IoShareSocialOutline } from "react-icons/io5";

export function PostAction() {
  return (
    <Stack>
      <Separator />
      <HStack 
        alignItems="center" 
        justifyContent="space-between"
        px="8"
      >
        <Button
          type="button"
          variant="plain"
        >
          <BiLike /> Like
          {/* <BiSolidLike /> */}
        </Button>
        <Button
          type="button"
          variant="plain"
        >
          <FaRegComment /> Comment
        </Button>
        <Button
          type="button"
          variant="plain"
        >
          <IoShareSocialOutline /> Share
        </Button>
      </HStack>
      <Separator />
    </Stack>
  );
}
