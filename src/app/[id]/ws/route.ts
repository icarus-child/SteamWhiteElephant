"use server";

import { cookies } from "next/headers";
import {
  ActionTypes,
  JoinAction,
  OrderCorrectionAction,
  PlayerAction,
} from "@/actions/player_actions";
import { GetPlayer } from "@/db/players";
import { Game } from "@/types/room";

let game: Game = { turnOrder: [], turnIndex: 0 };

export async function GET() {
  const headers = new Headers();
  headers.set("Connection", "Upgrade");
  headers.set("Upgrade", "websocket");
  return new Response("Upgrade Required", { status: 426, headers });
}

export async function UPGRADE(
  client: import("ws").WebSocket,
  server: import("ws").WebSocketServer,
) {
  const cookieStore = await cookies();
  if (!cookieStore.has("session")) return;
  const session = cookieStore.get("session");
  if (session == undefined) return;
  const playerId = session.value;
  const player = await GetPlayer(playerId);
  if (player == undefined) {
    return;
  }
  const roomId = player.room;

  // on connection
  // tell clients to update players and presents
  const sourcePlayer = await GetPlayer(playerId);
  if (sourcePlayer == undefined) {
    console.error("Recieved a join request from a player that does not exist");
    return;
  }
  game.turnOrder.push(sourcePlayer);
  const join_action = new JoinAction(playerId, game.turnOrder, game.turnIndex);
  await join_action.SyncRoom(roomId);

  for (const client of server.clients) {
    if (client.readyState !== client.OPEN) continue;
    client.send(JSON.stringify(join_action));
  }

  // on client action
  // 1. parse  2. validate  3. propogate
  client.on("message", (message) => {
    const parsedMessage: PlayerAction = JSON.parse(
      message.toString(),
    ) as PlayerAction;
    // if (parsedMessage! instanceof PlayerAction) {
    //   console.error("Unknown Action Received from Client");
    //   return;
    // }

    if (parsedMessage.type == ActionTypes.Take) {
      if (parsedMessage.playerId != game.turnOrder[game.turnIndex].id) {
        console.error("client attempted turn out of order");
        client.send(
          JSON.stringify(
            new OrderCorrectionAction(game.turnOrder, game.turnIndex),
          ),
        );
        return;
      }
      game.turnIndex = (game.turnIndex + 1) % game.turnOrder.length;
    }

    for (const other of server.clients) {
      if (client !== other && other.readyState === other.OPEN) {
        other.send(message);
      }
    }
  });
}
