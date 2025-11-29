"use client";

import { useCallback, useEffect, useState } from "react";
import { useWebSocket } from "@/websocket";
import { Player } from "@/types/player";
import { useParams } from "next/navigation";
import { Present } from "@/types/present";

export function usePlayers(url: () => string) {
  const socket = useWebSocket(url);
  const [players, setPlayers] = useState<Player[]>([]);

  const roomId = useParams().id as string;

  useEffect(() => {
    const controller = new AbortController();

    socket?.addEventListener("message", async (event) => {
      // New Player
      const payload =
        typeof event.data === "string" ? event.data : await event.data.text();
      const player = JSON.parse;
    });

    socket?.addEventListener(
      "error",
      () => {
        console.error("An error occured while connecting to the server");
      },
      controller,
    );

    socket?.addEventListener("close", (event) => {
      if (event.wasClean) return;
      console.error("The connection to the server was closed unexpectedly");
    });

    return () => controller.abort();
  }, [socket]);

  return [players] as const;
}

export function usePresents(url: () => string) {
  const socket = useWebSocket(url);
  const [presents, setPresents] = useState<Present[]>([]);

  const roomId = useParams().id as string;

  useEffect(() => {
    const controller = new AbortController();

    socket?.addEventListener("open", () => {
      console.log("roomid: " + roomId);
    });

    socket?.addEventListener(
      "error",
      () => {
        console.error("An error occured while connecting to the server");
      },
      controller,
    );

    socket?.addEventListener("close", (event) => {
      if (event.wasClean) return;
      console.error("The connection to the server was closed unexpectedly");
    });

    return () => controller.abort();
  }, [socket]);

  return [presents] as const;
}
