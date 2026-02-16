"use server";

import { GetPlayer } from "@/db/players";
import { RoomPlayer } from "@/types/player";
import { cookies } from "next/headers";

export async function getPlayerWrapper(): Promise<RoomPlayer | undefined> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (session == undefined) return undefined;
  return await GetPlayer(session.value);
}
