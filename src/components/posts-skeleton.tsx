import {
  For,
  HStack,
  Separator,
  Skeleton,
  SkeletonCircle,
  Stack,
} from "@chakra-ui/react";
import React from "react";

interface PostsSkeletonProps {
  amount?: number;
}

export function PostsSkeleton({ amount = 1 }: PostsSkeletonProps) {
  return (
    <For each={[...Array(amount).keys()]}>
      {(item) => (
        <Stack
          key={item}
          gapY="3"
          borderRadius="lg"
          width="full"
          backgroundColor="white"
          p="4"
          mb="4"
        >
          <HStack key={item} >
            <SkeletonCircle size="12" />
            <Stack flex="1">
              <Skeleton height="4" width="35%" />
              <Skeleton height="4" width="20%" />
            </Stack>
          </HStack>

          <Skeleton height="4" width="50%" />

          <Skeleton height="450px" borderRadius="2xl" />

          <HStack 
            alignItems="center" 
            justifyContent="space-between" 
            px="8"
          >
            <Skeleton height="4" width="20%" />
            <Skeleton height="4" width="20%" />
            <Skeleton height="4" width="20%" />
          </HStack>
        </Stack>
      )}
    </For>
  );
}
