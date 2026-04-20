import { Box, HStack, Skeleton } from "@chakra-ui/react";
import React from "react";

export function UserContentsSkeleton() {
  return (
    <HStack gapX="4">
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
         <Skeleton height="5" width="60%" />
         <Skeleton height="5" width="30%" />
         <Skeleton height="5" width="30%" />
         <Skeleton height="5" width="40%" />
      </Box>
    </HStack>
  );
}