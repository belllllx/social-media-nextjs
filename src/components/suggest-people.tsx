import { Box, Separator, Text } from "@chakra-ui/react";
import { PeoplesSuggest } from "./peoples-suggest";

export function SuggestPeople() {
  return (
    <Box
      position="fixed"
      top="calc(8vh + 16px)"
      bottom="16px"
      left="56"
      zIndex="40"
      borderRadius="lg"
      width="19.6vw"
      p="4"
      display="none"
      flexDirection="column"
      alignItems="center"
      gapY="3"
      className="2xl:flex"
    >
      <Text textStyle="lg" fontWeight="medium">
        Suggest people
      </Text>
      <Separator width="full" />
      <Box 
        overflowY="auto" 
        flex="1" 
        width="full"
      >
        <PeoplesSuggest />
      </Box>
    </Box>
  );
}
