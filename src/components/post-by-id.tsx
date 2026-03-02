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
import { useCommentCountCreateSocket } from "@/hooks/use-comment-count-create-socket";
import { useCommentCountDeleteSocket } from "@/hooks/use-comment-count-delete-socket";
import { useCommentCreateSocket } from "@/hooks/use-comment-create-socket";
import { useCommentUpdateSocket } from "@/hooks/use-comment-update-socket";
import { useCommentDeleteSocket } from "@/hooks/use-comment-delete-socket";
import { useReplyCountDeleteSocket } from "@/hooks/use-reply-count-delete-socket";
import { useReplyDeleteSocket } from "@/hooks/use-reply-delete-socket";
import { Box } from "@chakra-ui/react";
import { usePost } from "@/hooks/use-post";
import { Error } from "./error";

interface PostByIdProps {
    id: string;
}

export function PostById({ id }: PostByIdProps) {
    const queryClient = useQueryClient();

    const { socket } = useSocketIo();

    usePostCreateSocket(socket, queryClient);
    usePostLikeSocket(socket, queryClient);
    usePostUpdateSocket(socket, queryClient);
    usePostDeleteSocket(socket, queryClient);

    useCommentCountCreateSocket(socket, queryClient);
    useCommentCountDeleteSocket(socket, queryClient);
    useCommentCreateSocket(socket, queryClient);
    useCommentUpdateSocket(socket, queryClient);
    useCommentDeleteSocket(socket, queryClient);

    useReplyCountDeleteSocket(socket, queryClient);
    useReplyDeleteSocket(socket, queryClient);

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
            overflowY="auto"
            pr="2"
        >
            <Post
                post={post}
                queryClient={queryClient}
                socket={socket}
            />
        </Box>
    );
}