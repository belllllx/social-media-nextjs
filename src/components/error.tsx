"use client";

import { ICommonResponse } from "@/utils/types";
import { Button, Icon, Stack, Text } from "@chakra-ui/react";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { MdErrorOutline } from "react-icons/md";

interface ErrorProps {
  error: Error;
  refetch: (
    options?: RefetchOptions | undefined
  ) => Promise<QueryObserverResult<unknown, Error>>;
}

export function Error({ error, refetch }: ErrorProps) {
  return (
    <Stack
      height="full"
      width="full"
      justifyContent="center"
      alignItems="center"
    >
      <Icon fontSize="70px" color="red.500">
        <MdErrorOutline />
      </Icon>
      <Text textStyle="4xl" fontWeight="bold" color="red.500">
        {(error as unknown as ICommonResponse).status}
      </Text>
      <Text textStyle="lg" color="red.500" fontWeight="bold">
        Error something went wrong: {(error as unknown as ICommonResponse).message}
      </Text>
      <Button
        onClick={() => refetch()}
        type="button"
        variant="surface"
        fontSize="md"
      >
        Reset
      </Button>
    </Stack>
  );
}
