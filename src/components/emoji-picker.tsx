"use client";

import { IconButton, Popover, Portal } from "@chakra-ui/react";
import { RefObject } from "react";
import { UseFormReturn } from "react-hook-form";
import { useHandleEmojiSelect } from "@/hooks/use-handle-emoji-select";
import { usePopoverControl } from "@/hooks/use-popover-control";
import dynamic from "next/dynamic";
import { BsEmojiSunglasses } from "react-icons/bs";

const Picker = dynamic(
  () => {
    return import("emoji-picker-react");
  },
  { ssr: false }
);

interface EmojiPickerProps {
  inputRef: RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  useFormReturn: UseFormReturn;
  valueKey: string;
}

export function EmojiPicker({
  inputRef,
  useFormReturn,
  valueKey,
}: EmojiPickerProps) {
  const { openEmojiPicker, handleOpenEmojiPicker } =
    usePopoverControl(inputRef);

  const handleEmojiSelect = useHandleEmojiSelect(
    inputRef,
    useFormReturn,
    valueKey
  );

  return (
    <Popover.Root
      open={openEmojiPicker}
      onOpenChange={(e) => handleOpenEmojiPicker(e.open)}
      positioning={{
        placement: "bottom-end",
      }}
    >
      <Popover.Trigger asChild>
        <IconButton 
          rounded="full" 
          variant="surface"
          color="red.500"
        >
          <BsEmojiSunglasses />
        </IconButton>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Arrow />
            <Picker onEmojiClick={(e) => handleEmojiSelect(e)} />
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
