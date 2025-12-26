"use server";

import { Player, RoomPlayer } from "@/types/player";
import { dburl } from "@/constants";
import { GetPlayerPresent } from "./present";

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
  presentId: string;
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
  const present = await GetPlayerPresent(id);
  return {
    name: json.name,
    id: id,
    room: json.roomId,
    present: present ?? undefined,
  };
}

type JsonPlayers = {
  error: string;
  players: JsonPlayer[];
};

async function sharedGetPlayers(response: Response) {
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
  return Promise.all(
    json.players.map(async (p): Promise<RoomPlayer> => {
      const present = await GetPlayerPresent(p.playerId);
      return {
        name: p.name,
        id: p.playerId,
        room: p.roomId,
        present: present ?? undefined,
      };
    }),
  );
}

export async function GetRoomPlayers(id: string): Promise<Player[]> {
  const response = await fetch(dburl + "room-players?id=" + id, {
    method: "GET",
  });
  return sharedGetPlayers(response);
}

export async function GetOrderedRoomPlayers(id: string): Promise<Player[]> {
  const response = await fetch(dburl + "room-ordered-players?id=" + id, {
    method: "GET",
  });
  return sharedGetPlayers(response);
}

export async function TakeOrStealPresent(
  playerId: string,
  presentId: string,
): Promise<boolean> {
  const res = await fetch(dburl + "take-or-steal-present", {
    method: "POST",
    body: JSON.stringify({
      playerId: playerId,
      presentId: presentId,
    }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  if (res.status == 200) {
    return true;
  }
  return false;
}
