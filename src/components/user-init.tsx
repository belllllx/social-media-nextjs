"use client";

import { useFollowUserSocket } from "@/hooks/use-follow-user-socket";
import { useUser } from "@/hooks/use-user";
import { useUsersOnlineSocket } from "@/hooks/use-users-online-socket";
import { useSocketIo } from "@/providers/socket-io-provider";
import { useUserStore } from "@/providers/user-store-provider";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function UserInit() {
    const queryClient = useQueryClient();

    const { socket } = useSocketIo();
    const { data: user, isLoading } = useUser();
    const { setUser, setLoading } = useUserStore((state) => state);

    useFollowUserSocket(socket, queryClient);
    useUsersOnlineSocket(user?.id, queryClient);

    useEffect(() => {
        if (user) {
            setUser(user);
        }
    }, [user, setUser]);

    useEffect(() => {
        if (isLoading) {
            setLoading(true);
            return;
        }
        setLoading(false);
    }, [isLoading, setLoading]);

    useEffect(() => {
        if (user) {
            socket?.emit("connected", user);
        }
    }, [socket, user]);

    return null;
}
