"use server";

import "server-only";
import { Player, SessionPlayer } from "@/types/player";
import { Present } from "@/types/present";
import { GetSteamGameInfo, ParseGameId, SteamInfo } from "./steam";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Inputs } from "@/app/signup/components/form";
import { CreatePresent } from "@/db/present";
import { CreatePlayer } from "@/db/players";

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

  const player: SessionPlayer = {
    name: (nameRaw as FormDataEntryValue).toString(),
    room: (roomRaw as FormDataEntryValue).toString(),
  };
  const { uuid: userId, ok: okPlayer } = await createPlayer(player);
  if (!okPlayer) {
    errors.push("Internal server error while creating player");
    return errors;
  }

  const present: Present = {
    gifter: player,
    items: gameIds as SteamInfo[],
  };

  const okPresent = await createPresent(present, userId);
  if (!okPresent) {
    errors.push("Internal server error while creating present");
    return errors;
  }
  createSessionCookie(userId);
  redirect("/");
}

async function createPlayer(player: SessionPlayer): Promise<{
  uuid: string;
  ok: boolean;
}> {
  const id = crypto.randomUUID();
  const ok = await CreatePlayer(player.room, id, player as Player);
  return { uuid: id, ok: ok };
}

export async function createPresent(
  present: Present,
  playerId: string,
): Promise<boolean> {
  return await CreatePresent(present, playerId);
}

async function createSessionCookie(userId: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = userId;
  const cookieStore = await cookies();

  cookieStore.set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}
