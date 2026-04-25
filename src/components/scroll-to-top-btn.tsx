"use client";

import { useEffect, useState } from "react";
import { IconButton } from "@chakra-ui/react";
import { ArrowUpIcon } from "lucide-react";

export function ScrollToTopBtn() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!show) {
    return null;
  }

  return (
    <IconButton
      backgroundColor="gray.emphasized"
      variant="surface"
      aria-label="scroll to top"
      position="fixed"
      bottom="6"
      right="6"
      zIndex="1000"
      onClick={scrollToTop}
      borderRadius="full"
      _hover={{
        backgroundColor: "gray.border"
      }}
    >
      <ArrowUpIcon />
    </IconButton>
  );
}