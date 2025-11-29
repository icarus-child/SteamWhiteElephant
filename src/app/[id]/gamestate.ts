"use client";

import { useEffect, useState } from "react";
import { useWebSocket } from "@/websocket";
import { Player } from "@/types/player";
import { useParams } from "next/navigation";
import { Present } from "@/types/present";
import {
  ActionTypes,
  JoinAction,
  PlayerAction,
  RevealAction,
  TakeAction,
} from "@/actions/player_actions";

export function usePlayers(url: () => string) {
  const socket = useWebSocket(url);
  const [players, setPlayers] = useState<Player[]>([]);

  const roomId = useParams().id as string;

  useEffect(() => {
    const controller = new AbortController();

    socket?.addEventListener("message", async (event) => {
      const payload =
        typeof event.data === "string" ? event.data : await event.data.text();
      const action = JSON.parse(payload) as PlayerAction;
      switch (action.type) {
        case ActionTypes.Join:
          setPlayers((action as JoinAction).players);
          break;
        case ActionTypes.Reveal:
          break;
        case ActionTypes.Take:
          break;
        default:
          console.error("error parsing server message");
          break;
      }
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

    socket?.addEventListener("message", async (event) => {
      const payload =
        typeof event.data === "string" ? event.data : await event.data.text();
      const action = JSON.parse(payload) as PlayerAction;
      switch (action.type) {
        case ActionTypes.Join:
          setPresents((action as JoinAction).presents);
          break;
        case ActionTypes.Reveal:
          break;
        case ActionTypes.Take:
          break;
        default:
          console.error("error parsing server message");
          break;
      }
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
