"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { createSocket } from "@/lib/socket";
import { handleSocketEvent } from "@/lib/realtime/handleSocketEvent";
import { useToast } from "@/hooks/use-toast";
import { useSessionContext } from "@/context/SessionContext";

type SocketContextValue = {
  socket: Socket | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

export default function SocketProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const { session, loading } = useSessionContext();
  const toastRef = useRef(toast);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  useEffect(() => {
    // 1. If not logged in or still loading, don't connect
    if (loading || !session) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // 2. Already connecting/connected
    if (socketRef.current) return;

    // 3. Create new connection
    const newSocket = createSocket();
    socketRef.current = newSocket;
    setSocket(newSocket);

    const onConnect = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
    };

    const onDisconnect = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    };

    const onConnectError = (err: any) => {
      console.error("WebSocket connection error:", err.message);
      setIsConnected(false);
    };

    newSocket.on("connect", onConnect);
    newSocket.on("disconnect", onDisconnect);
    newSocket.on("connect_error", onConnectError);

    const handleEvent = (eventName: string, payload: unknown) => {
      handleSocketEvent(eventName, payload, toastRef.current);
    };

    newSocket.on("post:status_changed", (payload) =>
      handleEvent("post:status_changed", payload)
    );
    newSocket.on("notification", (payload) =>
      handleEvent("notification", payload)
    );

    return () => {
      console.log("Cleaning up WebSocket connection");
      newSocket.off("connect", onConnect);
      newSocket.off("disconnect", onDisconnect);
      newSocket.off("connect_error", onConnectError);
      newSocket.off("post:status_changed");
      newSocket.off("notification");
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    };
  }, [session, loading]); // No socket in dependency array

  const value = useMemo(() => ({ socket, isConnected }), [socket, isConnected]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return ctx;
}
