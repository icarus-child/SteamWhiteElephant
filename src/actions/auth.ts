"use server";

import { CreatePlayer } from "@/db/players";
import { Player } from "@/types/player";
import { Present } from "@/types/present";
import { GetSteamGameInfo, ParseGameId } from "./steam";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signup(
  formState: string[],
  formData: FormData,
): Promise<string[]> {
  const nameRaw = formData.get("name");
  const gameIdRaw = formData.get("game-id");

  const errors: string[] = [];

  if (nameRaw == null) {
    errors.push("Name not found");
  } else if (nameRaw == "") {
    errors.push("Name cannot be empty");
  }

  if (gameIdRaw == null) {
    errors.push("Game ID not found");
  } else if (nameRaw == "") {
    errors.push("Game ID cannot be empty");
  }

  if (errors.length > 0) {
    return errors;
  }

  const gameId = await ParseGameId(gameIdRaw as FormDataEntryValue);
  if (gameId == null) {
    errors.push("Game ID is invalid");
    return errors;
  }

  const steamInfo = await GetSteamGameInfo(gameId);
  if (!steamInfo.ok || steamInfo.name == "") {
    errors.push("Could not find that game");
    return errors;
  }

  const player: Player = {
    name: (nameRaw as FormDataEntryValue).toString(),
  };
  const { uuid: userId, ok: ok } = createPlayer(player);
  if (!ok) {
    errors.push("Internal server error while creating player");
    return errors;
  }

  const present: Present = {
    name: steamInfo.name,
    tags: steamInfo.tags,
    gameId: gameId,
    gifter: player,
  };
  createPresent(present);

  createSession(userId);
  redirect("/");
}

function createPlayer(
  sessionId: string,
  player: Player,
): { uuid: string; ok: boolean } {
  const id = crypto.randomUUID();
  CreatePlayer(sessionId, id, player);
  return { uuid: id, ok: true };
}

async function createSession(userId: string) {
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

function createPresent(present: Present) {
  return;
}
