"use client";

import { useActionStore } from "@/providers/action-store-provider";
import { IComment } from "@/utils/types";
import { Text } from "@chakra-ui/react";
import React from "react";

interface ToggleViewReplysProps {
  comment: IComment;
}

export function ToggleViewReplys({ comment }: ToggleViewReplysProps) {
  const { showReplyOnCommentId, setShowReplyOnCommentId } = useActionStore(
    (state) => state,
  );

  return (
    <>
      {comment.replysCount ? (
        <Text
          onClick={() => setShowReplyOnCommentId(comment.id)}
          fontWeight="semibold"
          cursor="pointer"
          textStyle="sm"
        >
          {!showReplyOnCommentId.includes(comment.id) ? (
            <>
              View {comment.replysCount} reply
              {comment.replysCount > 1 ? "s" : ""}
            </>
          ) : (
            <>
              Hidden reply
              {comment.replysCount > 1 ? "s" : ""}
            </>
          )}
        </Text>
      ) : null}
    </>
  );
}
