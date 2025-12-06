"use client";

import { useCallback, useEffect, useState } from "react";
import { useWebSocket } from "@/websocket";
import { Player } from "@/types/player";
import { useParams } from "next/navigation";
import { Present } from "@/types/present";
import {
  ActionTypes,
  OrderCorrectionAction,
  JoinAction,
  PlayerAction,
  TakeAction,
} from "@/actions/player_actions";

export function useGameState(url: () => string, this_player: Player) {
  const socket = useWebSocket(url);
  const roomId = useParams().id as string;

  const [players, setPlayers] = useState<Player[]>([]);
  const [presents, setPresents] = useState<Present[]>([]);
  const [turnIndex, setTurnIndex] = useState<number>(0);

  useEffect(() => {
    const controller = new AbortController();

    socket?.addEventListener("message", async (event) => {
      const payload =
        typeof event.data === "string" ? event.data : await event.data.text();
      const action = JSON.parse(payload) as PlayerAction;
      setTurnIndex(action.turnIndex);
      switch (action.type) {
        case ActionTypes.Join:
          setPlayers((action as JoinAction).players);
          setPresents((action as JoinAction).presents);
          break;
        case ActionTypes.Take:
          setPlayers((action as TakeAction).players);
          setPresents((action as TakeAction).presents);
          break;
        case ActionTypes.OrderCorrection:
          setPlayers((action as OrderCorrectionAction).players);
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

  const takePresent = useCallback((presentGifterId: string) => {
    if (!socket || socket.readyState !== socket.OPEN) return;
    console.log("Outgoing message:", message);
    socket.send(JSON.stringify(message));
  });

  return [players, presents, turnIndex, takePresent] as const;
}
