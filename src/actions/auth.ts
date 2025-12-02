"use server";

import "server-only";
import { PartialRoomPlayer, Player, RoomPlayer } from "@/types/player";
import { Present } from "@/types/present";
import { GetSteamGameInfo, ParseGameId, SteamInfo } from "./steam";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Inputs } from "@/app/signup/components/form";
import { CreatePlayer } from "@/db/players";
import { CreatePresent } from "@/db/present";

export async function signup(inputs: Inputs): Promise<string[]> {
  const nameRaw = inputs.name;
  const roomRaw = inputs.room;
  const gameIdsRaw = inputs.games;

  const errors: string[] = [];

  if (nameRaw == null) {
    errors.push("Name not found");
  } else if (nameRaw == "") {
    errors.push("Name cannot be empty");
  }

  if (gameIdsRaw.length == 0) {
    errors.push("Game ID cannot be empty");
  }

  if (roomRaw == null) {
    errors.push("Room ID not found");
  } else if (roomRaw == "") {
    errors.push("Room ID cannot be empty");
  }

  if (errors.length > 0) {
    return errors;
  }

  const gameIds = await Promise.all(
    gameIdsRaw.map(async (v, i) => {
      const gameId = await ParseGameId(v);
      if (gameId == null) {
        errors.push("Game URL " + i + " is invalid");
      } else {
        const steamInfo = await GetSteamGameInfo(gameId);
        if (!steamInfo.ok || steamInfo.name == "") {
          errors.push("Could not find game " + i);
        } else {
          return steamInfo;
        }
      }
      return undefined;
    }),
  );

  if (errors.length > 0) {
    return errors;
  }

  const partial_player: PartialRoomPlayer = {
    name: (nameRaw as FormDataEntryValue).toString(),
    room: (roomRaw as FormDataEntryValue).toString(),
  };
  const { uuid: playerId, ok: okPlayer } = await createPlayer(partial_player);
  if (!okPlayer) {
    errors.push("Internal server error while creating player");
    return errors;
  }
  const player: RoomPlayer = {
    name: partial_player.name,
    id: playerId,
    room: partial_player.room,
  };

  const present: Present = {
    gifter: player,
    items: gameIds as SteamInfo[],
  };

  const okPresent = await createPresent(present, playerId);
  if (!okPresent) {
    errors.push("Internal server error while creating present");
    return errors;
  }
  await createSessionCookie(playerId);
  redirect("/" + player.room);
}

async function createPlayer(player: PartialRoomPlayer): Promise<{
  uuid: string;
  ok: boolean;
}> {
  const id = crypto.randomUUID();
  const ok = await CreatePlayer({
    name: player.name,
    room: player.room,
    id: id,
  });
  return { uuid: id, ok: ok };
}

export async function createPresent(
  present: Present,
  playerId: string,
): Promise<boolean> {
  return await CreatePresent(present, playerId);
}

async function createSessionCookie(playerId: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = playerId;
  const cookieStore = await cookies();

  cookieStore.set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}
