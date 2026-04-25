import { Stack } from "@chakra-ui/react";
import { ActiveUserCard } from "./active-user-card";
import { PeopleStatus } from "./people-status";

export function UserStatusOverview() {
  return (
    <Stack
      position="fixed"
      top="calc(8vh + 16px)"
      bottom="16px"
      right="56"
      zIndex="40"
      width="19.6vw"
      display="none"
      flexDirection="column"
      alignItems="center"
      gapY="4"
      className="2xl:flex"
    >
      <ActiveUserCard />
      <PeopleStatus />
    </Stack>
  );
}
