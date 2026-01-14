import React, { forwardRef } from "react";
import {
  Box,
  Carousel as ChakraCarousel,
  IconButton,
  IconButtonProps,
  Image,
} from "@chakra-ui/react";
import { LuArrowLeft, LuArrowRight } from "react-icons/lu";
import { SocialVideoPlayer } from "./social-video-player";
import { getFileDir } from "@/utils/helpers/get-file-dir";
import NextImage from "next/image";

interface CarouselProps {
  fileUrls: string[];
  inDialog: boolean;
}

export function Carousel({ fileUrls, inDialog }: CarouselProps) {
  return (
    <ChakraCarousel.Root
      allowMouseDrag
      slideCount={fileUrls.length}
      cursor="pointer"
      width="full"   
      mx="auto"
      gap="4"
      position="relative"
      colorPalette="white"
      rounded="2xl"
      overflow="hidden"
    >
      <ChakraCarousel.Control 
        gap="4" 
        width="full" 
        position="relative"
      >
        {inDialog && (
          <ChakraCarousel.PrevTrigger asChild>
            <ActionButton insetStart="4">
              <LuArrowLeft />
            </ActionButton>
          </ChakraCarousel.PrevTrigger>
        )}

        <ChakraCarousel.ItemGroup width="full">
          {fileUrls.map((file, index) => (
            <ChakraCarousel.Item key={file} index={index}>
              {getFileDir(file) === "image" ? (
                <Box
                  width="full"
                  height="450px"
                  position="relative"
                  rounded="2xl"
                  overflow="hidden"
                >
                  <Image asChild>
                    <NextImage
                      priority
                      src={file}
                      alt={file}
                      fill
                      style={{ objectFit: inDialog ? "fill" : "cover" }}
                    />
                  </Image>
                </Box>
              ) : (
                <Box width="full" height="450px">
                  <SocialVideoPlayer src={file} />
                </Box>
              )}
            </ChakraCarousel.Item>
          ))}
        </ChakraCarousel.ItemGroup>

        {inDialog && (
          <ChakraCarousel.NextTrigger asChild>
            <ActionButton insetEnd="4">
              <LuArrowRight />
            </ActionButton>
          </ChakraCarousel.NextTrigger>
        )}

        <Box position="absolute" bottom="6" width="full">
          <ChakraCarousel.Indicators
            transition="width 0.2s ease-in-out"
            transformOrigin="center"
            opacity="0.5"
            boxSize="2"
            _current={{
              width: "10",
              bg: "colorPalette.subtle",
              opacity: 1,
            }}
          />
        </Box>
      </ChakraCarousel.Control>
    </ChakraCarousel.Root>
  );
}

const ActionButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function ActionButton(props, ref) {
    return (
      <IconButton
        {...props}
        ref={ref}
        size="xs"
        variant="outline"
        rounded="full"
        position="absolute"
        zIndex="1"
        bg="bg"
      />
    );
  }
);
