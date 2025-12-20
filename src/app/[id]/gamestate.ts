"use client";

import { useCallback, useEffect, useState } from "react";
import { useWebSocket } from "@/websocket";
import { Player } from "@/types/player";
import { Present } from "@/types/present";
import { PlayerAction, SendTakeAction } from "@/actions/player_actions";

export function useGameState(url: () => string, this_player: Player) {
  const socket = useWebSocket(url);
  const [players, setPlayers] = useState<Player[]>([]);
  const [presents, setPresents] = useState<Present[]>([]);
  const [turnIndex, setTurnIndex] = useState<number>(0);
  const [isStarted, setIsStarted] = useState<boolean>(false);

  useEffect(() => {
    const controller = new AbortController();

    socket?.addEventListener("message", async (event) => {
      const payload =
        typeof event.data === "string" ? event.data : await event.data.text();
      const action = JSON.parse(payload) as PlayerAction;
      setPlayers(action.players);
      setIsStarted(action.gameStarted);
      setTurnIndex(action.turnIndex);
      setPresents(action.presents);
      console.log(`gameStarted: ${action.gameStarted}`);
      console.log(`isStarted: ${isStarted}`);
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

  const takePresent = useCallback(
    (presentGifterId: string) => {
      console.log("hit");
      if (!socket || socket.readyState !== socket.OPEN) return;
      socket.send(
        JSON.stringify(
          ((): SendTakeAction => {
            return {
              senderId: this_player.id,
              gifterId: presentGifterId,
            };
          })(),
        ),
      );
    },
    [socket],
  );

  const startGame = useCallback(
    (sender: Player) => {
      // console.log(
      //   `sender.id: ${sender.id} - players[0]?.id: ${players[0]?.id}`,
      // );
      // if (sender.id !== players[0]?.id) return;
      if (!socket || socket.readyState !== socket.OPEN) return;
      socket.send("start game");
    },
    [socket],
  );

  return [
    players,
    presents,
    turnIndex,
    takePresent,
    isStarted,
    startGame,
  ] as const;
}
