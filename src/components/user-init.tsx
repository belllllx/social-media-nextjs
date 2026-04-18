"use client";

import { useUser } from "@/hooks/use-user";
import { useSocketIo } from "@/providers/socket-io-provider";
import { useUserStore } from "@/providers/user-store-provider";
import { useEffect } from "react";

export function UserInit() {
    const { socket } = useSocketIo();
    const { data: user, isLoading } = useUser();
    const { setUser, setLoading } = useUserStore((state) => state);

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
