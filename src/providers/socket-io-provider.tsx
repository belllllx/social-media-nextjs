"use client";

import { IComment, IFollower, ILike, INotify, IPost, IUser } from "@/utils/types";
import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "react-toastify";
import { formatToastMessages } from "@/utils/helpers/format-toast-messages";
import { usePathname } from "next/navigation";

interface SocketIoProviderProps {
  children: React.ReactNode;
}

interface SocketIoCoxtentType {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  isConnected: boolean;
}

const SocketIoContext = createContext<SocketIoCoxtentType | undefined>(
  undefined
);

export interface ServerToClientEvents {
  notification: (notifications: INotify) => void;
  usersActive: (users: (IUser & { active: boolean })[]) => void;
  exception: (error: { success: boolean; message: string }) => void;
  newPost: (post: IPost) => void;
  updatePost: (post: IPost) => void;
  deletePost: (post: IPost) => void;
  toggleLikePost: (like: ILike) => void;
  newComment: (comment: IComment & { post: IPost }) => void;
  updateComment: (comment: IComment) => void;
  deleteComment: (comment: IComment & { post: IPost }) => void;
  toggleLikeComment: (like: ILike) => void;
  toggleFollow: (
    follower: IFollower & {
      following: IUser & { followers: IFollower[] };
      follower: IUser & { followers: IFollower[] };
    },
  ) => void;
}

export interface ClientToServerEvents {
  connected: (activeUser: IUser) => void;
}

export function SocketIoProvider({ children }: SocketIoProviderProps) {
  const pathname = usePathname()
  const [socket, setSocket] = useState<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (
      pathname !== "/feed" &&
      !pathname.startsWith("/post") &&
      !pathname.startsWith("/profile")
    ) {
      return;
    }

    const socketInstance: Socket<ServerToClientEvents, ClientToServerEvents> =
      io(process.env.NEXT_PUBLIC_WS_URL!, {
        withCredentials: true,
      });

    socketInstance.on("connect", () => {
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    socketInstance.on("connect_error", async (error) => {
      toast.error(formatToastMessages(error.message));
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [pathname]);

  return (
    <SocketIoContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketIoContext.Provider>
  );
}

export function useSocketIo() {
  const socket = useContext(SocketIoContext);
  if (!socket) {
    throw new Error(`useSocketIo must be used within SocketIoProvider`);
  }

  return socket;
}
