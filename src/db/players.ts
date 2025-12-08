"use server";

import { Player, RoomPlayer } from "@/types/player";
import { dburl } from "@/constants";

export async function CreatePlayer(player: RoomPlayer): Promise<boolean> {
  const res = await fetch(dburl + "player/", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      roomId: player.room,
      playerId: player.id,
      name: player.name,
    }),
  });
  if (res.status == 200) {
    return true;
  }
  return false;
}

type JsonPlayer = {
  playerId: string;
  roomId: string;
  name: string;
};

export async function GetPlayer(id: string): Promise<RoomPlayer | undefined> {
  const response = await fetch(dburl + "player?id=" + id, {
    method: "GET",
  });
  let json: JsonPlayer & { error: string };
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
    id: id,
    room: json.roomId,
    present: undefined,
  };
}

type JsonPlayers = {
  error: string;
  players: JsonPlayer[];
};

export async function GetRoomPlayers(id: string): Promise<Player[]> {
  console.time("fetch-room-players");
  const response = await fetch(dburl + "room-players?id=" + id, {
    method: "GET",
  });
  console.timeEnd("fetch-room-players");
  let json: JsonPlayers;
  try {
    json = await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
  if (json.error != null) {
    console.error(json.error);
    return [];
  }
  return json.players.map((p): RoomPlayer => {
    return {
      name: p.name,
      id: p.playerId,
      room: p.roomId,
      present: undefined,
    };
  });
}
