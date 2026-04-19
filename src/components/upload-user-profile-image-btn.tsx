"use client";

import { useUserStore } from "@/providers/user-store-provider";
import { callApi } from "@/utils/helpers/call-api";
import { formatToastMessages } from "@/utils/helpers/format-toast-messages";
import { IComment, DeleteFilePayload, IPost, IUser } from "@/utils/types";
import { Box, Button, CloseButton, Dialog, Portal, Stack } from "@chakra-ui/react";
import React, { ChangeEvent, useCallback, useRef, useState } from "react";
import { MdAddAPhoto } from "react-icons/md";
import { SiGooglephotos } from "react-icons/si";
import { toast } from "react-toastify";
import { TbPhotoOff } from "react-icons/tb";
import Cropper from "react-easy-crop";
import { useFileObjectUrl } from "@/hooks/use-file-object-url";
import { getCroppedImg } from "@/utils/helpers/crop-image";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
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

  const { user: activeUser } = useUserStore((state) => state);

  const handleOpenDialog = useCallback((open: boolean) => {
    if (!open) {
      handleClearCropImage();
      handleClearImageSrc();
    }

    setOpenDialog(open);
  }, [handleClearImageSrc]);

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

      queryClient.setQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts"], (oldPosts) => {
        if (!oldPosts) {
          return undefined;
        }

        return {
          ...oldPosts,
          pages: oldPosts.pages.map((page) => {
            return {
              ...page,
              posts: page.posts.map((post) => {
                queryClient.setQueryData<
                  InfiniteData<{ comments: IComment[]; nextCursor: string | null }>
                >(["comments", post.id], (oldComments) => {
                  if (!oldComments) {
                    return undefined;
                  }

                  return {
                    ...oldComments,
                    pages: oldComments.pages.map((page) => {
                      return {
                        ...page,
                        comments: page.comments.map((comment) => {
                          // กรณีคอมเมนท์ของเรา
                          if (comment.userId === activeUser.id) {
                            return {
                              ...comment,
                              user: {
                                ...comment.user,
                                profileUrl: fileData,
                              },
                              likes: comment.likes.map((like) => {
                                // กรณีไลค์ของคอมเมนท์เป็นเรา
                                if (like.userId === activeUser.id) {
                                  return {
                                    ...like,
                                    user: {
                                      ...like.user,
                                      profileUrl: fileData,
                                    },
                                  }
                                }

                                return like;
                              }),
                              replies: comment.replies.map((reply) => {
                                // กรณีรีไพล์ของเรา
                                if (reply.userId === activeUser.id) {
                                  return {
                                    ...reply,
                                    user: {
                                      ...reply.user,
                                      profileUrl: fileData,
                                    },
                                    likes: reply.likes.map((like) => {
                                      // กรณีไลค์รีไพล์ไป็นเรา
                                      if (like.userId === activeUser.id) {
                                        return {
                                          ...like,
                                          user: {
                                            ...like.user,
                                            profileUrl: fileData,
                                          },
                                        }
                                      }

                                      return like;
                                    }),
                                  }
                                }

                                return reply;
                              }),
                            }
                          }

                          return {
                            ...comment,
                            likes: comment.likes.map((like) => {
                              // กรณีไลค์ของคอมเมนท์เป็นเรา
                              if (like.userId === activeUser.id) {
                                return {
                                  ...like,
                                  user: {
                                    ...like.user,
                                    profileUrl: fileData,
                                  },
                                }
                              }

                              return like;
                            }),
                            replies: comment.replies.map((reply) => {
                              // กรณีรีไพล์ของเรา
                              if (reply.userId === activeUser.id) {
                                return {
                                  ...reply,
                                  user: {
                                    ...reply.user,
                                    profileUrl: fileData,
                                  },
                                  likes: reply.likes.map((like) => {
                                    // กรณีไลค์รีไพล์ไป็นเรา
                                    if (like.userId === activeUser.id) {
                                      return {
                                        ...like,
                                        user: {
                                          ...like.user,
                                          profileUrl: fileData,
                                        },
                                      }
                                    }

                                    return like;
                                  }),
                                }
                              }

                              return reply;
                            }),
                          };
                        }),
                      }
                    }),
                  }
                });

                // กรณีแชร์โพสเป็นเรา และเป็นโพสที่แชร์มาจากโพสเรา
                if (
                  post.parent && post.parent.userId === activeUser.id
                  &&
                  post.userId === activeUser.id
                ) {
                  return {
                    ...post,
                    likes: post.likes.map((like) => {
                      // กรณีเรากดไลค์โพส
                      if (like.userId === activeUser.id) {
                        return {
                          ...like,
                          user: {
                            ...like.user,
                            profileUrl: fileData,
                          },
                        }
                      }

                      return like;
                    }),
                    user: {
                      ...post.user,
                      profileUrl: fileData,
                    },
                    parent: {
                      ...post.parent,
                      user: {
                        ...post.parent.user,
                        profileUrl: fileData,
                      },
                    },
                  }
                }

                // กรณีแชร์โพส และเป็นโพสที่แชร์มาจากโพสเรา
                if (post.parent && post.parent.userId === activeUser.id) {
                  return {
                    ...post,
                    likes: post.likes.map((like) => {
                      // กรณีเรากดไลค์โพส
                      if (like.userId === activeUser.id) {
                        return {
                          ...like,
                          user: {
                            ...like.user,
                            profileUrl: fileData,
                          },
                        }
                      }

                      return like;
                    }),
                    parent: {
                      ...post.parent,
                      user: {
                        ...post.parent.user,
                        profileUrl: fileData,
                      },
                    },
                  }
                }

                // กรณีโพสปกติ
                // แก้เฉพาะโพสที่เราเป็นเจ้าของ
                if (post.userId === activeUser.id) {
                  return {
                    ...post,
                    likes: post.likes.map((like) => {
                      // กรณีเรากดไลค์โพส
                      if (like.userId === activeUser.id) {
                        return {
                          ...like,
                          user: {
                            ...like.user,
                            profileUrl: fileData,
                          },
                        }
                      }

                      return like;
                    }),
                    user: {
                      ...post.user,
                      profileUrl: fileData,
                    },
                  }
                }

                return {
                  ...post,
                  likes: post.likes.map((like) => {
                    // กรณีเรากดไลค์โพส
                    if (like.userId === activeUser.id) {
                      return {
                        ...like,
                        user: {
                          ...like.user,
                          profileUrl: fileData,
                        },
                      }
                    }

                    return like;
                  }),
                };
              }),
            }
          }),
        }
      });

      toast.success(formatToastMessages(res.message));
    } catch (error) {
      toast.error("Failed to edit profile");
      console.error("Failed to edit profile", error);
    } finally {
      setDisabled(false);
    }
  }, [imageSrc, croppedAreaPixels, activeUser, queryClient, user.id, handleClearCropImage, handleClearImageSrc]);

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

      queryClient.setQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts"], (oldPosts) => {
        if (!oldPosts) {
          return undefined;
        }

        return {
          ...oldPosts,
          pages: oldPosts.pages.map((page) => {
            return {
              ...page,
              posts: page.posts.map((post) => {
                queryClient.setQueryData<
                  InfiniteData<{ comments: IComment[]; nextCursor: string | null }>
                >(["comments", post.id], (oldComments) => {
                  if (!oldComments) {
                    return undefined;
                  }

                  return {
                    ...oldComments,
                    pages: oldComments.pages.map((page) => {
                      return {
                        ...page,
                        comments: page.comments.map((comment) => {
                          // กรณีคอมเมนท์ของเรา
                          if (comment.userId === activeUser.id) {
                            return {
                              ...comment,
                              user: {
                                ...comment.user,
                                profileUrl: null,
                              },
                              likes: comment.likes.map((like) => {
                                // กรณีไลค์ของคอมเมนท์เป็นเรา
                                if (like.userId === activeUser.id) {
                                  return {
                                    ...like,
                                    user: {
                                      ...like.user,
                                      profileUrl: null,
                                    },
                                  }
                                }

                                return like;
                              }),
                              replies: comment.replies.map((reply) => {
                                // กรณีรีไพล์ของเรา
                                if (reply.userId === activeUser.id) {
                                  return {
                                    ...reply,
                                    user: {
                                      ...reply.user,
                                      profileUrl: null,
                                    },
                                    likes: reply.likes.map((like) => {
                                      // กรณีไลค์รีไพล์ไป็นเรา
                                      if (like.userId === activeUser.id) {
                                        return {
                                          ...like,
                                          user: {
                                            ...like.user,
                                            profileUrl: null,
                                          },
                                        }
                                      }

                                      return like;
                                    }),
                                  }
                                }

                                return reply;
                              }),
                            }
                          }

                          return {
                            ...comment,
                            likes: comment.likes.map((like) => {
                              // กรณีไลค์ของคอมเมนท์เป็นเรา
                              if (like.userId === activeUser.id) {
                                return {
                                  ...like,
                                  user: {
                                    ...like.user,
                                    profileUrl: null,
                                  },
                                }
                              }

                              return like;
                            }),
                            replies: comment.replies.map((reply) => {
                              // กรณีรีไพล์ของเรา
                              if (reply.userId === activeUser.id) {
                                return {
                                  ...reply,
                                  user: {
                                    ...reply.user,
                                    profileUrl: null,
                                  },
                                  likes: reply.likes.map((like) => {
                                    // กรณีไลค์รีไพล์ไป็นเรา
                                    if (like.userId === activeUser.id) {
                                      return {
                                        ...like,
                                        user: {
                                          ...like.user,
                                          profileUrl: null,
                                        },
                                      }
                                    }

                                    return like;
                                  }),
                                }
                              }

                              return reply;
                            }),
                          };
                        }),
                      }
                    }),
                  }
                });

                // กรณีแชร์โพสเป็นเรา และเป็นโพสที่แชร์มาจากโพสเรา
                if (
                  post.parent && post.parent.userId === activeUser.id
                  &&
                  post.userId === activeUser.id
                ) {
                  return {
                    ...post,
                    likes: post.likes.map((like) => {
                      // กรณีเรากดไลค์โพส
                      if (like.userId === activeUser.id) {
                        return {
                          ...like,
                          user: {
                            ...like.user,
                            profileUrl: null,
                          },
                        }
                      }

                      return like;
                    }),
                    user: {
                      ...post.user,
                      profileUrl: null,
                    },
                    parent: {
                      ...post.parent,
                      user: {
                        ...post.parent.user,
                        profileUrl: null,
                      },
                    },
                  }
                }

                // กรณีแชร์โพส และเป็นโพสที่แชร์มาจากโพสเรา
                if (post.parent && post.parent.userId === activeUser.id) {
                  return {
                    ...post,
                    likes: post.likes.map((like) => {
                      // กรณีเรากดไลค์โพส
                      if (like.userId === activeUser.id) {
                        return {
                          ...like,
                          user: {
                            ...like.user,
                            profileUrl: null,
                          },
                        }
                      }

                      return like;
                    }),
                    parent: {
                      ...post.parent,
                      user: {
                        ...post.parent.user,
                        profileUrl: null,
                      },
                    },
                  }
                }

                // กรณีโพสปกติ
                // แก้เฉพาะโพสที่เราเป็นเจ้าของ
                if (post.userId === activeUser.id) {
                  return {
                    ...post,
                    likes: post.likes.map((like) => {
                      // กรณีเรากดไลค์โพส
                      if (like.userId === activeUser.id) {
                        return {
                          ...like,
                          user: {
                            ...like.user,
                            profileUrl: null,
                          },
                        }
                      }

                      return like;
                    }),
                    user: {
                      ...post.user,
                      profileUrl: null,
                    },
                  }
                }

                return {
                  ...post,
                  likes: post.likes.map((like) => {
                    // กรณีเรากดไลค์โพส
                    if (like.userId === activeUser.id) {
                      return {
                        ...like,
                        user: {
                          ...like.user,
                          profileUrl: null,
                        },
                      }
                    }

                    return like;
                  }),
                };
              }),
            }
          }),
        }
      });

      handleClearCropImage();
      handleClearImageSrc();
      toast.success(formatToastMessages(res.message));
    } catch (error) {
      toast.error("Failed to delete file");
      console.error("Failed to delete file", error);
    } finally {
      setDisabled(false);
    }
  }, [activeUser, queryClient, user.id, handleClearCropImage, handleClearImageSrc]);

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