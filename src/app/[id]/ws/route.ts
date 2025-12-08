"use server";

import "server-only";
import { PlayerAction, SendTakeAction } from "@/actions/player_actions";
import { Game } from "@/types/room";
import { GetRoomPresents } from "@/db/present";
import { getPlayerWrapper } from "@/actions/fetch_player";
import { Player } from "@/types/player";
import { GetRoomPlayers } from "@/db/players";
import { Present } from "@/types/present";

let game: Game = { turnOrder: [], turnIndex: 0, presents: [] };

function reconcilePlayersWithOrder(
  existingOrder: Player[],
  dbPlayers: Player[],
): Player[] {
  const existingIds = new Set(existingOrder.map((p) => p.id));
  const missingPlayers = dbPlayers.filter((p) => !existingIds.has(p.id));
  return [...existingOrder, ...missingPlayers];
}

function reconcilePresents(
  existingPresents: Present[],
  dbPresents: Present[],
): Present[] {
  const existingIds = new Set(existingPresents.map((p) => p.gifterId));
  const missingPresents = dbPresents.filter(
    (p) => !existingIds.has(p.gifterId),
  );
  return [...existingPresents, ...missingPresents];
}

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
  const sourcePlayer = await getPlayerWrapper();
  if (sourcePlayer == undefined) {
    console.error("Recieved a join request from a player that does not exist");
    return;
  }

  // on connection
  // tell clients to update players and presents
  game.turnOrder = reconcilePlayersWithOrder(
    game.turnOrder,
    await GetRoomPlayers(sourcePlayer.room),
  );
  game.presents = reconcilePresents(
    game.presents,
    await GetRoomPresents(sourcePlayer.room),
  );
  const join_action = new PlayerAction(
    sourcePlayer.id,
    game.turnOrder,
    game.turnIndex,
    game.presents,
  );

  for (const client of server.clients) {
    if (client.readyState !== client.OPEN) continue;
    client.send(JSON.stringify(join_action));
  }

  // on client action
  // 1. parse  2. validate  3. propogate
  client.on("message", async (message) => {
    const parsedMessage: SendTakeAction = JSON.parse(
      message.toString(),
    ) as SendTakeAction;

    if (parsedMessage.senderId != game.turnOrder[game.turnIndex].id) {
      console.error("client attempted turn out of order");
      client.send(
        JSON.stringify(
          new PlayerAction(
            "server",
            game.turnOrder,
            game.turnIndex,
            game.presents,
          ),
        ),
      );
      return;
    }
    if (parsedMessage.senderId == parsedMessage.gifterId) {
      console.error("client attempted to take their own present");
      return;
    }
    const targetPresent = game.presents.find(
      (present) => present.gifterId === parsedMessage.gifterId,
    );
    if (targetPresent === undefined) {
      console.error("client attempted to take present that doesn't exist");
      return;
    }
    if (targetPresent.timesTraded >= targetPresent.maxTags) {
      console.error("client attempted to take frozen present");
      return;
    }
    const playerIndex = game.turnOrder.findIndex(
      (player) => player.id == sourcePlayer.id,
    );
    const previousOwner = game.turnOrder.findIndex(
      (player) => player.present?.gifterId === targetPresent.gifterId,
    );
    if (previousOwner === -1) {
      game.turnIndex = (game.turnIndex + 1) % game.turnOrder.length;
    } else {
      game.turnOrder[previousOwner].present = undefined;
      game.turnIndex = previousOwner;
    }
    game.turnOrder[playerIndex].present = targetPresent;
    targetPresent.timesTraded += 1;

    for (const other of server.clients) {
      if (other.readyState === other.OPEN) {
        other.send(
          JSON.stringify(
            new PlayerAction(
              sourcePlayer.id,
              game.turnOrder,
              game.turnIndex,
              game.presents,
            ),
          ),
        );
      }
    }
  });
}
