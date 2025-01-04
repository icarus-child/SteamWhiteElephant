import "server-only";
import { Player } from "@/types/player";
import { dburl } from "@/constants";

export async function CreatePlayer(
  sessionid: string,
  playerid: string,
  player: Player,
): Promise<boolean> {
  const res = await fetch(dburl + "player/", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sessionId: sessionid,
      playerId: playerid,
      name: player.name,
    }),
  });
  if (res.status == 200) {
    return true;
  }
  return false;
}

type JsonPlayer = {
  name: string;
  error: string;
};

export async function GetPlayer(id: string): Promise<Player | undefined> {
  const response = await fetch(dburl + "player?id=" + id, {
    method: "GET",
  });
  let json: JsonPlayer;
  try {
    json = await response.json();
  } catch (error) {
    return undefined;
  }
  if (json.error != null) {
    return undefined;
  }
  return {
    name: json.name,
  };
}
