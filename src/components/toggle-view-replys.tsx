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

  const openReply = showReplyOnCommentId.find((showReply) => showReply.commentId === comment.id);
  const isOpen = openReply ? openReply.open : false;

  return (
    <>
      {comment.replysCount ? (
        <Text
          onClick={() => setShowReplyOnCommentId({ commentId: comment.id, open: false })}
          fontWeight="semibold"
          cursor="pointer"
          textStyle="sm"
        >
          {!showReplyOnCommentId.find((showReply) => showReply.commentId === comment.id)?.open ? (
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
