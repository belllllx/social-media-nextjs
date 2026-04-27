"use client";

import { useUserStore } from "@/providers/user-store-provider";
import { callApi } from "@/utils/helpers/call-api";
import { formatToastMessages } from "@/utils/helpers/format-toast-messages";
import { DeleteFilePayload, IUser } from "@/utils/types";
import { Box, Button, CloseButton, Dialog, Portal, Stack } from "@chakra-ui/react";
import React, { ChangeEvent, useCallback, useRef, useState } from "react";
import { MdAddAPhoto } from "react-icons/md";
import { SiGooglephotos } from "react-icons/si";
import { toast } from "react-toastify";
import { TbPhotoOff } from "react-icons/tb";
import Cropper from "react-easy-crop";
import { useFileObjectUrl } from "@/hooks/use-file-object-url";
import { getCroppedImg } from "@/utils/helpers/crop-image";
import { useQueryClient } from "@tanstack/react-query";
import { useCropImage } from "@/hooks/use-crop-image";

interface UploadUserProfileImageBtnProps {
  user: IUser;
}

export function UploadUserProfileImageBtn({ user }: UploadUserProfileImageBtnProps) {
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

  const { user: activeUser, setUpdatedProfile } = useUserStore((state) => state);

  const handleOpenDialog = useCallback((open: boolean) => {
    if (!open) {
      handleClearCropImage();
      handleClearImageSrc();
    }

    setOpenDialog(open);
  }, [handleClearImageSrc, handleClearCropImage]);

  const handleSaveEditProfile = useCallback(async () => {
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

      const res = await callApi(
        "put",
        `user/profile/edit/${activeUser.id}`,
        formData,
      );
      if (!res.success) {
        toast.error(formatToastMessages(res.message));
        return;
      }

      setOpenDialog(false);
      handleClearCropImage();
      handleClearImageSrc();

      setUpdatedProfile("EDIT");

      const fileData = (res.data as { fileUrl: string }).fileUrl;

      queryClient.setQueryData<IUser>(["profile"], (oldUser) => {
        if (!oldUser) {
          return undefined;
        }

        return {
          ...oldUser,
          profileUrl: fileData,
        }
      });

      queryClient.setQueryData<IUser>(["user", user.id], (oldUser) => {
        if (!oldUser) {
          return undefined;
        }

        return {
          ...oldUser,
          profileUrl: fileData,
        }
      });

      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["comments"] });

      toast.success(formatToastMessages(res.message));
    } catch (error) {
      toast.error("Failed to edit profile");
      console.error("Failed to edit profile", error);
    } finally {
      setDisabled(false);
    }
  }, [imageSrc, croppedAreaPixels, activeUser, queryClient, user.id, handleClearCropImage, handleClearImageSrc, setUpdatedProfile]);

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
      const res = await callApi<{ data: DeleteFilePayload }>(
        "delete",
        `user/profile/delete/file/${activeUser.id}`,
        {
          data: {
            fileUrl,
          },
        },
      )
      if (!res.success) {
        toast.error(formatToastMessages(res.message));
        return;
      }

      setOpenDialog(false);
      setUpdatedProfile("DELETE");

      queryClient.setQueryData<IUser>(["profile"], (oldUser) => {
        if (!oldUser) {
          return undefined;
        }

        return {
          ...oldUser,
          profileUrl: null,
        }
      });

      queryClient.setQueryData<IUser>(["user", user.id], (oldUser) => {
        if (!oldUser) {
          return undefined;
        }

        return {
          ...oldUser,
          profileUrl: null,
        }
      });

      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["comments"] });

      handleClearCropImage();
      handleClearImageSrc();
      toast.success(formatToastMessages(res.message));
    } catch (error) {
      toast.error("Failed to delete file");
      console.error("Failed to delete file", error);
    } finally {
      setDisabled(false);
    }
  }, [activeUser, queryClient, user.id, handleClearCropImage, handleClearImageSrc, setUpdatedProfile]);

  return (
    <>
      {activeUser && activeUser.id === user.id && (
        <Dialog.Root
          open={openDialog}
          onOpenChange={(e) => handleOpenDialog(e.open)}
          placement="center"
          motionPreset="slide-in-bottom"
        >
          <Dialog.Trigger asChild>
            <Box
              position="absolute"
              bottom="5px"
              right="20px"
              rounded="full"
              p="2"
              backgroundColor="gray.200"
              boxShadow="md"
              cursor="pointer"
              _hover={{
                backgroundColor: "gray.300"
              }}
              mdDown={{
                bottom: "0",
                right: "0",
              }}
            >
              <MdAddAPhoto />
            </Box>
          </Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title textAlign="center" width="full">
                    Edit profile
                  </Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>
                  <Stack gapY="2" alignItems="center" width="full">
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

                    {user.profileUrl && (
                      <Button
                        onClick={() => handleDeleteFile(user.profileUrl)}
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
                      onClick={handleSaveEditProfile}
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
      )}
    </>
  );
}