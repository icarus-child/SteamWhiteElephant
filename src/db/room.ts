"use server";

import { dburl } from "@/constants";

type JsonRoom = {
  exists: boolean;
  error: string;
};

export async function RoomExists(id: string): Promise<boolean | undefined> {
  const response = await fetch(dburl + "room-exists?id=" + id, {
    method: "GET",
  });
  let json: JsonRoom;
  try {
    json = await response.json();
  } catch (error) {
    return undefined;
  }
  if (json.error != null) {
    return undefined;
  }
  return json.exists;
}

type JsonRoomStarted = {
  started: boolean;
  error: string;
};

export async function IsRoomStarted(id: string): Promise<boolean | undefined> {
  const response = await fetch(dburl + "room-started?id=" + id, {
    method: "GET",
  });
  let json: JsonRoomStarted;
  try {
    json = await response.json();
  } catch (error) {
    return undefined;
  }
  if (json.error != null) {
    return undefined;
  }
  return json.started;
}

export async function StartRoom(id: string): Promise<boolean> {
  const res = await fetch(dburl + "start-room?id=" + id, {
    method: "POST",
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

export async function GetRoomTurnIndex(id: string): Promise<number> {
  const response = await fetch(dburl + "room-turn-index?id=" + id, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  let json: { index: number; error: string };
  try {
    json = await response.json();
  } catch (error) {
    console.error("error parsing turn index: " + error);
    return 0;
  }
  if (json.error != null) {
    console.error("error from turn index: " + json.error);
    return 0;
  }
  return json.index;
}

export async function SetRoomTurnIndex(
  id: string,
  index: number,
): Promise<boolean> {
  const res = await fetch(dburl + "room-turn-index?id=" + id, {
    method: "POST",
    body: JSON.stringify({
      index: index,
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

export async function RandomizePlayerOrder(id: string): Promise<boolean> {
  const res = await fetch(dburl + "randomize-player-order?id=" + id, {
    method: "POST",
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
