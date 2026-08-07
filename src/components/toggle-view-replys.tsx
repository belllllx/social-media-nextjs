"use client";

import { useActionStore } from "@/providers/action-store-provider";
import { IComment } from "@/utils/types";
import { Text } from "@chakra-ui/react";
import React, { useMemo } from "react";

interface ToggleViewReplysProps {
  comment: IComment;
}

export function ToggleViewReplys({ comment }: ToggleViewReplysProps) {
  const { showReplyOnCommentId, setShowReplyOnCommentId } = useActionStore(
    (state) => state,
  );

  const showReplyData = useMemo(
    () =>
      showReplyOnCommentId.find((showReply) => showReply.commentId === comment.id),
    [showReplyOnCommentId, comment.id],
  );

  return (
    <>
      {comment.repliesCount ? (
        <Text
          onClick={() =>
            setShowReplyOnCommentId({ commentId: comment.id, open: !showReplyData?.open })
          }
          fontWeight="semibold"
          cursor="pointer"
          textStyle="sm"
        >
          {!showReplyData?.open ? (
            <>
              View {comment.repliesCount} reply
              {comment.repliesCount > 1 ? "s" : ""}
            </>
          ) : (
            <>
              Hidden reply
              {comment.repliesCount > 1 ? "s" : ""}
            </>
          )}
        </Text>
      ) : null}
    </>
  );
}
