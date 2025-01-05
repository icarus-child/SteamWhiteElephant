"use server";

import "server-only";
import { dburl } from "@/constants";

type JsonRoom = {
  exists: boolean;
  error: string;
};

export async function CheckRoom(id: string): Promise<boolean | undefined> {
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
