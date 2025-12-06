"use server";

import { getPlayerWrapper } from "@/actions/fetch_player";
import { redirect } from "next/navigation";
import ClientGame from "./clientpage";

export default async function ServerGame() {
  const player = await getPlayerWrapper();
  if (!player) redirect("/");

  return <ClientGame player={player} />;
}
