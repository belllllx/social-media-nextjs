import React from "react";
import { Box } from "@chakra-ui/react";
import { FaArrowUp } from "react-icons/fa6";

interface ScrollBtnProps {
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

export function ScrollBtn({ scrollRef }: ScrollBtnProps) {
  return (
    <Box
      position="fixed"
      bottom="6"
      right="6"
      w="48px"
      h="48px"
      bg="white"
      color="black"
      rounded="full"
      display="flex"
      alignItems="center"
      justifyContent="center"
      cursor="pointer"
      boxShadow="lg"
      _hover={{ bg: "whiteAlpha.200" }}
      onClick={() =>
        scrollRef.current?.scrollTo({
          top: 0,
          behavior: "smooth",
        })
      }
    >
      <FaArrowUp />
    </Box>
  );
}
