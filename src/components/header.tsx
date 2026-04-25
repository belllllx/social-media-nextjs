import { Box } from "@chakra-ui/react";
import { Logo } from "./logo";
import { SearchPeople } from "./search-people";
import { TopBarActions } from "./top-bar-actions";

export function Header() {
  return (
    <Box
      position="sticky"
      top="0"
      zIndex="40"
      backgroundColor="white"
      height="8vh"
      width="full"
      py="4"
      px="16"
      display="flex"
      alignItems="center"
      justifyContent="center"
      gapX="10"
      shadow="sm"
      mdDown={{
        justifyContent: "space-between",
        px: "4"
      }}
    >
      <Logo />
      <SearchPeople />
      <TopBarActions />
    </Box>
  );
}
