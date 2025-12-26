"use server";

import "server-only";
import { PlayerAction, SendTakeAction } from "@/actions/player_actions";
import { Game } from "@/types/room";
import {
  GetPresentStolenThisRound,
  GetRoomPresents,
  MarkPresentStolen,
  ResetRound,
} from "@/db/present";
import { getPlayerWrapper } from "@/actions/fetch_player";
import { GetOrderedRoomPlayers, TakeOrStealPresent } from "@/db/players";
import { Present } from "@/types/present";
import {
  GetRoomTurnIndex,
  IsRoomStarted,
  RandomizePlayerOrder,
  SetRoomTurnIndex,
  StartRoom,
} from "@/db/room";

let game: Game = {
  presents: [],
  roomId: "",
};

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
  game.roomId = sourcePlayer.room;

  // on connection
  // tell clients to update players and presents
  game.presents = reconcilePresents(
    game.presents,
    await GetRoomPresents(sourcePlayer.room),
  );
  const join_action = new PlayerAction(
    sourcePlayer.id,
    await GetOrderedRoomPlayers(game.roomId),
    await GetRoomTurnIndex(game.roomId),
    game.presents,
    (await IsRoomStarted(game.roomId)) ?? false,
  );

  for (const other of server.clients) {
    if (other.readyState !== other.OPEN) continue;
    other.send(JSON.stringify(join_action));
  }

  // on client action
  // 1. parse  2. validate  3. propogate
  client.on("message", async (message) => {
    const index = await GetRoomTurnIndex(game.roomId);
    if (message.toString() === "start game") {
      if ((await IsRoomStarted(game.roomId)) ?? false) return;
      StartRoom(game.roomId);
      await RandomizePlayerOrder(game.roomId);
      const players = await GetOrderedRoomPlayers(game.roomId);
      for (const other of server.clients) {
        if (other.readyState !== other.OPEN) continue;
        other.send(
          JSON.stringify(
            new PlayerAction("server", players, index, game.presents, true),
          ),
        );
      }
      return;
    }

    const parsedMessage: SendTakeAction = JSON.parse(
      message.toString(),
    ) as SendTakeAction;

    const turnOrder = await GetOrderedRoomPlayers(game.roomId);
    if (parsedMessage.senderId != turnOrder[index].id) {
      console.error("client attempted turn out of order");
      client.send(
        JSON.stringify(
          new PlayerAction(
            "server",
            turnOrder,
            index,
            game.presents,
            (await IsRoomStarted(game.roomId)) ?? false,
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
    if (targetPresent.timesTraded >= targetPresent.maxTags + 1) {
      console.error("client attempted to take frozen present");
      return;
    }
    const playerIndex = turnOrder.findIndex(
      (player) => player.id == sourcePlayer.id,
    );
    if (turnOrder[playerIndex].present !== undefined) {
      console.error(
        "client attempted to take present while already having one",
      );
      return;
    }
    if (await GetPresentStolenThisRound(targetPresent.gifterId)) {
      console.error(
        "client attempted to take present that was already stolen this round",
      );
      return;
    }

    const previousOwner = turnOrder.findIndex(
      (player) => player.present?.gifterId === targetPresent.gifterId,
    );

    await TakeOrStealPresent(turnOrder[playerIndex].id, targetPresent.gifterId);
    targetPresent.timesTraded += 1;

    if (previousOwner === -1) {
      let tempIndex = (await GetOrderedRoomPlayers(game.roomId)).findIndex(
        (player) => {
          return player.present === undefined;
        },
      );
      tempIndex = tempIndex === -1 ? 0 : tempIndex;
      await SetRoomTurnIndex(game.roomId, tempIndex);
    } else {
      await SetRoomTurnIndex(game.roomId, previousOwner);
    }

    if (previousOwner === -1) {
      await ResetRound(game.roomId);
    } else {
      await MarkPresentStolen(targetPresent.gifterId);
    }

    const players = await GetOrderedRoomPlayers(game.roomId);
    const indexNew = await GetRoomTurnIndex(game.roomId);
    const started = (await IsRoomStarted(game.roomId)) ?? false;
    for (const other of server.clients) {
      if (other.readyState === other.OPEN) {
        other.send(
          JSON.stringify(
            new PlayerAction(
              sourcePlayer.id,
              players,
              indexNew,
              game.presents,
              started,
            ),
          ),
        );
      }
    }
  });
}
