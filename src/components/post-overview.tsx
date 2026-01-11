import { Stack } from "@chakra-ui/react";
import { CreatePost } from "./create-post";
import { Posts } from "./posts";

export function PostOverview() {
  return (
    <Stack
      height="full"
      width="full"
      gapY="4"
    >
      <CreatePost />
      <Posts />
    </Stack>
  );
}