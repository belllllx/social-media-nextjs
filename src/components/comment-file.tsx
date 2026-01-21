import { IComment } from "@/utils/types";
import { Box, Image } from "@chakra-ui/react";
import React from "react";
import NextImage from "next/image";

interface CommentFileProps {
  comment: IComment;
}

export function CommentFile({ comment }: CommentFileProps) {
  return (
    <>
      {comment.fileUrl && (
        <Box
          width="200px"
          height="200px"
          rounded="2xl"
          overflow="hidden"
          position="relative"
        >
          <Image asChild>
            <NextImage
              priority
              src={comment.fileUrl}
              alt={comment.fileUrl}
              fill
              unoptimized
              style={{ objectFit: "cover" }}
            />
          </Image>
        </Box>
      )}
    </>
  );
}
