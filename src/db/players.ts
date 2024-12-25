import "server-only";
import { Player } from "@/types/player";

export async function CreatePlayer(id: string, player: Player) {
  console.log(id);
  fetch("http://localhost:3333/player/", {
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

type JsonPlayer = {
  name: string;
  error: string;
};

export async function GetPlayer(id: string): Promise<Player | undefined> {
  console.log(id);
  const response = await fetch("http://localhost:3333/player?id=" + id, {
    method: "GET",
  });
  const json: JsonPlayer = await response.json();
  if (json.error != null) {
    return undefined;
  }
  return {
    name: json.name,
  };
}
