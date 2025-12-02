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

// async function checkForSession(roomId: string) {
//   const playerId = cookieStore.get("session");
//   if (playerId == undefined) redirect("/");
//   const player = await GetPlayer(playerId);
//   if (player == undefined) redirect("/");
//   if (roomId != player.room) redirect(`/${player.room}`);
//   return player;
// }

// async function checkForSession2() {
//   const cookieStore = await cookies();
//   if (!cookieStore.has("session")) return;
//   const session = cookieStore.get("session");
//   if (session == undefined) return;
//   const playerId = session.value;
//   const player = await GetPlayer(playerId);
//   if (player == undefined) {
//     return;
//   }
//
//   return redirect(`/${player.room}`);
// }
