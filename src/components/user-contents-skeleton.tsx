import { Box, Skeleton } from "@chakra-ui/react";
import React from "react";

export function UserContentsSkeleton() {
  return (
    <Box
      borderRadius="lg"
      width="400px"
      display="flex"
      flexDirection="column"
      gapY="4"
      backgroundColor="white"
      p="4"
    >
      <Skeleton height="5" width="15%" />
      <Skeleton height="5" width="70%" />
      <Skeleton height="5" width="35%" />
      <Skeleton height="5" width="35%" />
      <Skeleton height="5" width="85%" />
    </Box>
  );
}