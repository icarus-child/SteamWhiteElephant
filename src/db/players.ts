import "server-only";
import { Player } from "@/types/player";

export async function CreatePlayer(id: string, player: Player) {
  console.log(id);
  fetch("localhost:3333/player", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: id,
      name: player.name,
    }),
  });
}

export async function GetPlayer(id: string): Player | undefined {
  console.log(id);
  const response = await fetch("localhost:3333/player?id=" + id, {
    method: "GET",
  });
  response.headers;
}
