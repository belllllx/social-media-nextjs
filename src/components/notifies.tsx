"use client";

import { useInView } from "react-intersection-observer";
import { useNotifies } from "@/hooks/use-notifies";
import { Box, Flex } from "@chakra-ui/react";
import { Spinner } from "./spinner";
import { Fragment, useEffect } from "react";
import { useUserStore } from "@/providers/user-store-provider";
import { useNotifySocket } from "@/hooks/use-notify-socket";
import { Notify } from "./notify";
import { ItemsNotFound } from "./items-not-found";
import { NotifiesSkeleton } from "./notifies-skeleton";
import { Error } from "./error";
import { useSocketIo } from "@/providers/socket-io-provider";
import { useQueryClient } from "@tanstack/react-query";

interface NotifiesProps {
  onNotifyCount: (notifiesId: string[]) => void;
}

export function Notifies({ onNotifyCount }: NotifiesProps) {
  const { socket } = useSocketIo();
  const queryClient = useQueryClient();

  const { user } = useUserStore((state) => state);
  const { ref, inView } = useInView();

  useNotifySocket(
    socket, 
    queryClient, 
    user?.id
  );

  const {
    data: notifies,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    status,
    error,
    refetch,
  } = useNotifies(10, user?.id);

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  useEffect(() => {
    if (notifies) {
      const unReadNotifies = notifies.pages
        .flatMap((page) => page.notifications)
        .filter((notification) => !notification.isRead);
      onNotifyCount(unReadNotifies.map((unReadNotify) => unReadNotify.id));
    }
  }, [notifies, onNotifyCount]);

  return (
    <Box maxH="400px" overflowY="auto">
      {status === "pending" ? (
        <NotifiesSkeleton amount={4} />
      ) : isError ? (
        <Error error={error} refetch={refetch} />
      ) : isLoading ? (
        <Flex
          width="full"
          height="full"
          justifyContent="center"
          alignItems="center"
        >
          <Spinner size="lg" />
        </Flex>
      ) : (
        notifies &&
        notifies.pages.map((group, i) => (
          <Fragment key={i}>
            {group.notifications.length ? (
              group.notifications.map((notification) => (
                <Notify key={notification.id} notification={notification} />
              ))
            ) : (
              <ItemsNotFound title="notify" />
            )}
          </Fragment>
        ))
      )}

      {isFetchingNextPage && <Spinner />}
      <Box ref={ref} />
    </Box>
  );
}
