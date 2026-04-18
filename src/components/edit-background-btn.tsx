"use client";

import React, { ChangeEvent, useCallback, useRef, useState } from "react";
import { Box, Button, CloseButton, Dialog, Portal, Stack } from "@chakra-ui/react";
import { SiGooglephotos } from "react-icons/si";
import { TbPhotoOff } from "react-icons/tb";
import { callApi } from "@/utils/helpers/call-api";
import { toast } from "react-toastify";
import { formatToastMessages } from "@/utils/helpers/format-toast-messages";
import { IDeleteFilePayload, IUser } from "@/utils/types";
import { useQueryClient } from "@tanstack/react-query";
import { useCropImage } from "@/hooks/use-crop-image";
import { useFileObjectUrl } from "@/hooks/use-file-object-url";
import { getCroppedImg } from "@/utils/helpers/crop-image";
import { useUserStore } from "@/providers/user-store-provider";
import Cropper from "react-easy-crop";

export function EditBackgroundBtn() {
  const queryClient = useQueryClient();

  const photoRef = useRef<HTMLInputElement>(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const {
    crop,
    zoom,
    croppedAreaPixels,
    file,
    handleClearCropImage,
    handleSetFile,
    handleSetCroppedAreaPixels,
    handleSetCrop,
    handleSetZoom,
  } = useCropImage();

  const { imageSrc, handleClearImageSrc } = useFileObjectUrl(file);

  const { user: activeUser } = useUserStore((state) => state);

  const handleOpenDialog = useCallback((open: boolean) => {
    if (!open) {
      handleClearCropImage();
      handleClearImageSrc();
    }

    setOpenDialog(open);
  }, [handleClearImageSrc]);

  const handleSaveEditBackground = useCallback(async () => {
    try {
      if (!imageSrc || !croppedAreaPixels || !activeUser) {
        return;
      }

      const cropFile = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!cropFile) {
        return;
      }

      setDisabled(true);

      const formData = new FormData();
      formData.append("file", cropFile);
      formData.append("activeUserId", activeUser.id);

      const res = await callApi(
        "put",
        "user/background/edit",
        formData,
      );
      if (!res.success) {
        toast.error(formatToastMessages(res.message));
        return;
      }

      const fileData = (res.data as { fileUrl: string }).fileUrl;

      queryClient.setQueryData<IUser>(["profile"], (oldUser) => {
        if (!oldUser) {
          return undefined;
        }

        return {
          ...oldUser,
          profileBackgroundUrl: fileData,
        }
      });
    } catch (error) {
      toast.error("Failed to edit background");
      console.error("Failed to edit background", error);
    } finally {
      setDisabled(false);
    }
  }, [imageSrc, croppedAreaPixels, queryClient]);

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files?.length) {
        return;
      }

      const selectedFile = event.target.files[0];
      handleSetFile(selectedFile);
    },
    [handleSetFile],
  );

  const handleDeleteFile = useCallback(async (fileUrl: string | null) => {
    try {
      if (!fileUrl || !activeUser) {
        return;
      }

      setDisabled(true);
      const res = await callApi<{ data: IDeleteFilePayload & { activeUserId: string; } }>(
        "delete",
        "user/background/delete/file",
        {
          data: {
            fileUrl,
            activeUserId: activeUser.id,
          },
        },
      )
      if (!res.success) {
        toast.error(formatToastMessages(res.message));
        return;
      }

      queryClient.setQueryData<IUser>(["profile"], (oldUser) => {
        if (!oldUser) {
          return undefined;
        }

        return {
          ...oldUser,
          profileBackgroundUrl: null,
        }
      });

      toast.success(formatToastMessages(res.message));
    } catch (error) {
      toast.error("Failed to delete file");
      console.error("Failed to delete file", error);
    } finally {
      setDisabled(false);
    }
  }, []);

  return (
    <Dialog.Root
      open={openDialog}
      onOpenChange={(e) => handleOpenDialog(e.open)}
      placement="center"
      motionPreset="slide-in-bottom"
    >
      <Dialog.Trigger asChild>
        <Button variant="subtle">
          <SiGooglephotos />
          Edit background
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title textAlign="center" width="full">
                Edit background
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gapY="2">
                <input
                  onChange={handleFileChange}
                  ref={photoRef}
                  type="file"
                  className="hidden"
                  name="photo"
                  accept=".jpg,.jpeg,.png,.webp"
                />

                {imageSrc && (
                  <Box
                    position="relative"
                    width="full"
                    height="300px"
                  >
                    <Cropper
                      image={imageSrc}
                      crop={crop}
                      zoom={zoom}
                      aspect={4 / 3}
                      onCropChange={handleSetCrop}
                      onCropComplete={(_, croppedAreaPixels) => {
                        handleSetCroppedAreaPixels(croppedAreaPixels);
                      }}
                      onZoomChange={handleSetZoom}
                    />
                  </Box>
                )}

                {activeUser && activeUser.profileBackgroundUrl && (
                  <Button
                    onClick={() => handleDeleteFile(activeUser.profileUrl)}
                    disabled={disabled}
                    backgroundColor="red.600"
                    width="full"
                  >
                    <TbPhotoOff />
                    Delete current photo
                  </Button>
                )}

                <Button
                  onClick={() => photoRef.current?.click()}
                  disabled={disabled}
                  variant="subtle"
                  width="full"
                >
                  <SiGooglephotos />
                  Upload photo
                </Button>

                <Button
                  onClick={handleSaveEditBackground}
                  disabled={disabled}
                  width="full"
                >
                  Save Edit
                </Button>
              </Stack>
            </Dialog.Body>
            <Dialog.CloseTrigger asChild rounded="full">
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
