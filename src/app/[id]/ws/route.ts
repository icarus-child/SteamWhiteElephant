"use server";

import { PlayerAction, SendTakeAction } from "@/actions/player_actions";
import { Game } from "@/types/room";
import { GetRoomPresents } from "@/db/present";
import { getPlayerWrapper } from "@/actions/fetch_player";
import { Player } from "@/types/player";
import { GetRoomPlayers } from "@/db/players";

let game: Game = { turnOrder: [], turnIndex: 0 };

function reconcilePlayersWithOrder(
  existingOrder: Player[],
  dbPlayers: Player[],
): Player[] {
  const existingIds = new Set(existingOrder.map((p) => p.id));
  const missingPlayers = dbPlayers.filter((p) => !existingIds.has(p.id));
  return [...existingOrder, ...missingPlayers];
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
  const join_action = new PlayerAction(
    sourcePlayer.id,
    game.turnOrder,
    game.turnIndex,
    await GetRoomPresents(sourcePlayer.room),
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

    const presents = await GetRoomPresents(sourcePlayer.room);

    if (parsedMessage.senderId != game.turnOrder[game.turnIndex].id) {
      console.error("client attempted turn out of order");
      client.send(
        JSON.stringify(
          new PlayerAction("server", game.turnOrder, game.turnIndex, presents),
        ),
      );
      return;
    }
    game.turnIndex = (game.turnIndex + 1) % game.turnOrder.length;
    const playerIndex = game.turnOrder.findIndex(
      (player) => player.id == sourcePlayer.id,
    );
    game.turnOrder[playerIndex].present = presents.find(
      (present) => (present.gifterId = parsedMessage.gifterId),
    );

    for (const other of server.clients) {
      if (other.readyState === other.OPEN) {
        other.send(
          JSON.stringify(
            new PlayerAction(
              sourcePlayer.id,
              game.turnOrder,
              game.turnIndex,
              presents,
            ),
          ),
        );
      }
    }
  });
}
