"use server";

import { Player, RoomPlayer } from "@/types/player";
import { dburl } from "@/constants";

export async function CreatePlayer(
  roomid: string,
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
      roomId: roomid,
      playerId: playerid,
      name: player.name,
    }),
  });
  if (res.status == 200) {
    return true;
  }
  return false;
}

type JsonPlayer = RoomPlayer & {
  error: string;
};

export async function GetPlayer(id: string): Promise<RoomPlayer | undefined> {
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
    room: json.room,
  };
}

type JsonPlayers = {
  error: string;
  players: RoomPlayer[];
};

export async function GetRoomPlayers(id: string): Promise<Player[]> {
  const response = await fetch(dburl + "room-players?id=" + id, {
    method: "GET",
  });
  let json: JsonPlayers;
  try {
    json = await response.json();
  } catch (error) {
    return [];
  }
  if (json.error != null) {
    return [];
  }
  return json.players;
}
