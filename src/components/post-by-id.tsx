"use client";

import { useSocketIo } from "@/providers/socket-io-provider";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { Post } from "./post";
import { PostsSkeleton } from "./posts-skeleton";
import { usePostCreateSocket } from "@/hooks/use-post-create-socket";
import { usePostLikeSocket } from "@/hooks/use-post-like-socket";
import { usePostUpdateSocket } from "@/hooks/use-post-update-socket";
import { usePostDeleteSocket } from "@/hooks/use-post-delete-socket";
import { useCommentCreateSocket } from "@/hooks/use-comment-create-socket";
import { useCommentUpdateSocket } from "@/hooks/use-comment-update-socket";
import { useCommentDeleteSocket } from "@/hooks/use-comment-delete-socket";
import { Box } from "@chakra-ui/react";
import { usePost } from "@/hooks/use-post";
import { Error } from "./error";
import { useUserStore } from "@/providers/user-store-provider";
import { useUpdatePostEditProfile } from "@/hooks/use-update-post-edit-profile";

interface PostByIdProps {
    id: string;
}

export function PostById({ id }: PostByIdProps) {
    const queryClient = useQueryClient();

    const { socket } = useSocketIo();

    const { user: activeUser, isUpdatedProfileStatus } = useUserStore((state) => state);

    useUpdatePostEditProfile(
        queryClient,
        id,
        isUpdatedProfileStatus,
    );

    usePostCreateSocket(socket, queryClient);
    usePostLikeSocket(socket, queryClient, activeUser?.id);
    usePostUpdateSocket(socket, queryClient);
    usePostDeleteSocket(socket, queryClient);

    useCommentCreateSocket(socket, queryClient);
    useCommentUpdateSocket(socket, queryClient);
    useCommentDeleteSocket(socket, queryClient);

    const {
        data: post,
        isError,
        status,
        error,
        refetch,
    } = usePost(id);

    if (isError) {
        return <Error error={error} refetch={refetch} />;
    }

    if (status === "pending") {
        return <PostsSkeleton amount={1} />
    }

    return (
        <Box
            height="full"
        >
            <Post
                post={post}
                queryClient={queryClient}
                socket={socket}
            />
        </Box>
    );
}