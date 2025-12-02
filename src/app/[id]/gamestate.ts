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

export function useGameState(url: () => string, this_player: Player) {
  const socket = useWebSocket(url);
  const roomId = useParams().id as string;

  const [players, setPlayers] = useState<Player[]>([]);
  const [presents, setPresents] = useState<Present[]>([]);

  console.log(`joining game as ${this_player.name} - ${this_player.id}`);

  useEffect(() => {
    const controller = new AbortController();

    socket?.addEventListener("message", async (event) => {
      const payload =
        typeof event.data === "string" ? event.data : await event.data.text();
      const action = JSON.parse(payload) as PlayerAction;
      switch (action.type) {
        case ActionTypes.Join:
          console.log(`player joined: ${(action as JoinAction).playerId}`);
          setPlayers((action as JoinAction).players);
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

  return [players, presents] as const;
}
