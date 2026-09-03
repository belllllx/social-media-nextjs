"use client";

import { Badge, Circle, Portal } from "@chakra-ui/react";
import { Popover } from "@chakra-ui/react";
import { FaBell } from "react-icons/fa";
import { Notifies } from "./notifies";
import { useCallback, useState } from "react";
import { useReadNotify } from "@/hooks/use-read-notify";

export function NotifyAction() {
  const [_, setOpen] = useState(false);
  const [unReadNotifiesId, setUnReadNotifiesId] = useState<string[]>([]);

  const readNotify = useReadNotify();

  const handleNotifyCount = useCallback((unReadNotifiesId: string[]) => {
    setUnReadNotifiesId(unReadNotifiesId);
  }, []);

  const handleReadNotify = useCallback(() => {
    readNotify.mutate(unReadNotifiesId);
  }, [readNotify, unReadNotifiesId]);

  return (
    <Popover.Root
      onOpenChange={(e) => setOpen(e.open)}
      positioning={{ placement: "bottom-end" }}
    >
      <Popover.Trigger asChild>
        <Circle
          onClick={handleReadNotify}
          position="relative"
          size="11"
          bg="gray.200"
          color="black"
          cursor="pointer"
          _hover={{
            backgroundColor: "gray.300",
            transitionDuration: "slow",
          }}
        >
          <FaBell />
          {unReadNotifiesId && unReadNotifiesId.length > 0 ? (
            <Badge
              size="sm"
              colorPalette="red"
              position="absolute"
              top="-5px"
              right="-3px"
              variant="solid"
              borderRadius="full"
            >
              {unReadNotifiesId.length}
            </Badge>
          ) : null}
        </Circle>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Arrow />
            <Popover.Body overflowY="auto">
              <Popover.Title fontWeight="medium" fontSize="md" marginBottom="3">
                Notify:
              </Popover.Title>
              <Notifies onNotifyCount={handleNotifyCount} />
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
